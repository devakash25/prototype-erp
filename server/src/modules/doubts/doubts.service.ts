import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';

class DoubtService {
  private async resolve(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, institutionId: true },
    });
    if (!user) throw new NotFoundError('User not found');
    if (!user.institutionId) throw new NotFoundError('Institution not found');

    let employeeId: string | null = null;
    let studentId: string | null = null;

    if (user.role === 'TEACHER' || user.role === 'HOD') {
      const emp = await prisma.employee.findFirst({
        where: { userId, isActive: true },
        select: { id: true },
      });
      employeeId = emp?.id || null;
    }

    if (user.role === 'STUDENT') {
      const stu = await prisma.student.findFirst({
        where: { userId, isActive: true },
        select: { id: true },
      });
      studentId = stu?.id || null;
    }

    return { userId, role: user.role, institutionId: user.institutionId!, employeeId, studentId };
  }

  async getStudentConversations(userId: string) {
    const { studentId, institutionId } = await this.resolve(userId);
    if (!studentId) throw new ForbiddenError('Only students can access this');

    const conversations = await prisma.doubtConversation.findMany({
      where: { studentId, institutionId },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { fullName: true, avatar: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { fullName: true } } },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return (conversations as any[]).map(c => ({
      id: c.id,
      subject: c.subject.name,
      subjectCode: c.subject.code,
      teacher: c.teacher.user.fullName,
      teacherAvatar: c.teacher.user.avatar,
      status: c.status,
      lastMessage: c.messages[0]?.message || null,
      lastMessageTime: c.messages[0]?.createdAt || c.createdAt,
      messageCount: c._count.messages,
      createdAt: c.createdAt,
    }));
  }

  async getStudentChat(userId: string, conversationId: string) {
    const { studentId } = await this.resolve(userId);
    if (!studentId) throw new ForbiddenError('Only students can access this');

    const conversation = await prisma.doubtConversation.findFirst({
      where: { id: conversationId, studentId },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { fullName: true, avatar: true } } } },
        course: { select: { name: true, code: true } },
      },
    }) as any;

    if (!conversation) throw new NotFoundError('Conversation');

    const messages = await prisma.doubtMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    }) as any[];

    await prisma.doubtMessage.updateMany({
      where: { conversationId, senderRole: 'TEACHER', read: false },
      data: { read: true },
    });

    return {
      conversation: {
        id: conversation.id,
        subject: conversation.subject.name,
        subjectCode: conversation.subject.code,
        teacher: conversation.teacher.user.fullName,
        teacherAvatar: conversation.teacher.user.avatar,
        className: conversation.course.name,
        status: conversation.status,
      },
      messages: messages.map((m: any) => ({
        id: m.id,
        text: m.message,
        senderId: m.senderId,
        senderName: m.sender.fullName,
        senderAvatar: m.sender.avatar,
        senderRole: m.senderRole,
        attachmentUrl: m.attachmentUrl,
        attachmentType: m.attachmentType,
        read: m.read,
        createdAt: m.createdAt,
      })),
    };
  }

  async sendMessage(userId: string, conversationId: string, message: string, attachmentUrl?: string, attachmentType?: string) {
    const { userId: uid, role, employeeId, studentId } = await this.resolve(userId);

    const conversation = await prisma.doubtConversation.findFirst({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.status === 'RESOLVED') throw new ConflictError('Doubt is resolved. Create a new doubt.');

    let senderRole: 'STUDENT' | 'TEACHER';
    if (role === 'STUDENT') {
      if (conversation.studentId !== studentId) throw new ForbiddenError('Access denied');
      senderRole = 'STUDENT';
    } else {
      if (conversation.teacherId !== employeeId) throw new ForbiddenError('Access denied');
      senderRole = 'TEACHER';
    }

    const msg = await prisma.doubtMessage.create({
      data: {
        conversationId,
        senderId: uid,
        senderRole,
        message,
        attachmentUrl: attachmentUrl || null,
        attachmentType: (attachmentType as any) || null,
      },
      include: { sender: { select: { id: true, fullName: true, avatar: true } } },
    });

    const newStatus = senderRole === 'TEACHER' ? 'REPLIED' : 'NEW';
    await prisma.doubtConversation.update({
      where: { id: conversationId },
      data: { status: newStatus as any, updatedAt: new Date() },
    });

    if (senderRole === 'TEACHER') {
      const student = await prisma.student.findFirst({
        where: { id: conversation.studentId },
        include: { user: { select: { id: true } } },
      });
      if (student) {
        await this.sendNotification(
          uid, conversation.institutionId,
          'Teacher replied to your doubt',
          `Your teacher replied to your doubt in the conversation.`,
          [student.user.id]
        );
      }
    }

    logger.info({ conversationId, senderId: uid, senderRole }, 'Doubt message sent');

    return {
      id: msg.id,
      text: msg.message,
      senderId: msg.senderId,
      senderName: msg.sender.fullName,
      senderAvatar: msg.sender.avatar,
      senderRole: msg.senderRole,
      attachmentUrl: msg.attachmentUrl,
      attachmentType: msg.attachmentType,
      read: msg.read,
      createdAt: msg.createdAt,
    };
  }

  async createConversation(userId: string, subjectId: string, classId: string, message: string) {
    const { studentId, institutionId } = await this.resolve(userId);
    if (!studentId) throw new ForbiddenError('Only students can create doubts');

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, institutionId },
    });
    if (!subject) throw new NotFoundError('Subject');

    const allocation = await prisma.subjectAllocation.findFirst({
      where: { subjectId },
      include: { employee: true },
    });
    if (!allocation) throw new NotFoundError('No teacher assigned to this subject');

    const existing = await prisma.doubtConversation.findFirst({
      where: { studentId, teacherId: allocation.employeeId, subjectId, classId },
    });

    let conversation;
    if (existing) {
      if (existing.status === 'RESOLVED') {
        conversation = await prisma.doubtConversation.update({
          where: { id: existing.id },
          data: { status: 'NEW' },
        });
      } else {
        conversation = existing;
      }
    } else {
      conversation = await prisma.doubtConversation.create({
        data: {
          institutionId,
          classId,
          subjectId,
          teacherId: allocation.employeeId,
          studentId,
          status: 'NEW',
        },
      });
    }

    const msg = await prisma.doubtMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        senderRole: 'STUDENT',
        message,
      },
      include: { sender: { select: { id: true, fullName: true, avatar: true } } },
    });

    await prisma.doubtConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    const teacher = await prisma.employee.findFirst({
      where: { id: allocation.employeeId },
      include: { user: { select: { id: true } } },
    }) as any;
    if (teacher) {
      await this.sendNotification(
        userId, institutionId,
        'New doubt received',
        `A student has raised a new doubt in ${subject.name}.`,
        [teacher.user.id]
      );
    }

    logger.info({ conversationId: conversation.id, studentId }, 'Doubt conversation created');

    return {
      conversationId: conversation.id,
      message: {
        id: msg.id,
        text: msg.message,
        senderId: msg.senderId,
        senderName: msg.sender.fullName,
        senderAvatar: msg.sender.avatar,
        senderRole: msg.senderRole,
        attachmentUrl: msg.attachmentUrl,
        attachmentType: msg.attachmentType,
        read: msg.read,
        createdAt: msg.createdAt,
      },
    };
  }

  async getTeacherConversations(userId: string, classId?: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    const where: any = { teacherId: employeeId, institutionId };
    if (classId) where.classId = classId;

    const conversations = await prisma.doubtConversation.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
        student: { include: { user: { select: { fullName: true, avatar: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { fullName: true } } },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }) as any[];

    return (conversations as any[]).map(c => ({
      id: c.id,
      subject: c.subject.name,
      subjectCode: c.subject.code,
      className: c.course.name,
      classCode: c.course.code,
      classId: c.classId,
      student: c.student.user.fullName,
      studentAvatar: c.student.user.avatar,
      rollNumber: c.student.rollNumber,
      status: c.status,
      lastMessage: c.messages[0]?.message || null,
      lastMessageTime: c.messages[0]?.createdAt || c.createdAt,
      unreadCount: (c._count as any).messages || 0,
      messageCount: c._count.messages,
      createdAt: c.createdAt,
    }));
  }

  async getTeacherClassStats(userId: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    const classes = await prisma.course.findMany({
      where: {
        institutionId,
        subjects: { some: { subjectAllocations: { some: { employeeId } } } },
      },
      include: {
        subjects: {
          where: { subjectAllocations: { some: { employeeId } } },
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            doubtConversations: {
              where: { teacherId: employeeId, status: { in: ['NEW', 'SEEN', 'REPLIED'] } },
            },
          },
        },
      },
    });

    return classes.map(c => ({
      classId: c.id,
      className: c.name,
      classCode: c.code,
      subjects: c.subjects,
      pendingDoubts: c._count.doubtConversations,
    }));
  }

  async getTeacherChat(userId: string, conversationId: string) {
    const { employeeId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    const conversation = await prisma.doubtConversation.findFirst({
      where: { id: conversationId, teacherId: employeeId },
      include: {
        subject: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
        student: { include: { user: { select: { fullName: true, avatar: true } } } },
      },
    }) as any;

    if (!conversation) throw new NotFoundError('Conversation');

    if (conversation.status === 'NEW') {
      await prisma.doubtConversation.update({
        where: { id: conversationId },
        data: { status: 'SEEN' },
      });
    }

    const messages = await prisma.doubtMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    }) as any[];

    await prisma.doubtMessage.updateMany({
      where: { conversationId, senderRole: 'STUDENT', read: false },
      data: { read: true },
    });

    return {
      conversation: {
        id: conversation.id,
        subject: conversation.subject.name,
        subjectCode: conversation.subject.code,
        className: conversation.course.name,
        classCode: conversation.course.code,
        student: conversation.student.user.fullName,
        studentAvatar: conversation.student.user.avatar,
        rollNumber: conversation.student.rollNumber,
        status: conversation.status,
      },
      messages: messages.map((m: any) => ({
        id: m.id,
        text: m.message,
        senderId: m.senderId,
        senderName: m.sender.fullName,
        senderAvatar: m.sender.avatar,
        senderRole: m.senderRole,
        attachmentUrl: m.attachmentUrl,
        attachmentType: m.attachmentType,
        read: m.read,
        createdAt: m.createdAt,
      })),
    };
  }

  async resolveDoubt(userId: string, conversationId: string) {
    const { role, employeeId, studentId } = await this.resolve(userId);

    const conversation = await prisma.doubtConversation.findFirst({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundError('Conversation');

    if (role === 'STUDENT' && conversation.studentId !== studentId) throw new ForbiddenError('Access denied');
    if ((role === 'TEACHER' || role === 'HOD') && conversation.teacherId !== employeeId) throw new ForbiddenError('Access denied');

    const updated = await prisma.doubtConversation.update({
      where: { id: conversationId },
      data: { status: 'RESOLVED' },
    });

    logger.info({ conversationId, resolvedBy: role }, 'Doubt resolved');
    return updated;
  }

  async openSubjectChat(userId: string, subjectId: string) {
    const { studentId, institutionId } = await this.resolve(userId);
    if (!studentId) throw new ForbiddenError('Only students can access this');

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, institutionId },
    });
    if (!subject) throw new NotFoundError('Subject');

    const student = await prisma.student.findFirst({
      where: { id: studentId },
      select: { courseId: true },
    });
    if (!student) throw new NotFoundError('Student');

    const allocation = await prisma.subjectAllocation.findFirst({
      where: { subjectId },
      include: { employee: true },
    });
    if (!allocation) throw new NotFoundError('No teacher assigned to this subject');

    const existing = await prisma.doubtConversation.findFirst({
      where: { studentId, teacherId: allocation.employeeId, subjectId, classId: student.courseId },
    });

    let conversation;
    if (existing) {
      if (existing.status === 'RESOLVED') {
        conversation = await prisma.doubtConversation.update({
          where: { id: existing.id },
          data: { status: 'NEW' },
        });
      } else {
        conversation = existing;
      }
    } else {
      conversation = await prisma.doubtConversation.create({
        data: {
          institutionId,
          classId: student.courseId,
          subjectId,
          teacherId: allocation.employeeId,
          studentId,
          status: 'NEW',
        },
      });
    }

    const teacher = await prisma.employee.findFirst({
      where: { id: allocation.employeeId },
      include: { user: { select: { fullName: true, avatar: true } } },
    }) as any;

    return {
      conversationId: conversation.id,
      subject: subject.name,
      subjectCode: subject.code,
      teacherName: teacher?.user.fullName || 'Not assigned',
      teacherAvatar: teacher?.user.avatar || null,
    };
  }

  async getStudentSubjectList(userId: string) {
    const { studentId, institutionId } = await this.resolve(userId);
    if (!studentId) throw new ForbiddenError('Only students can access this');

    const student = await prisma.student.findFirst({
      where: { id: studentId },
      select: { courseId: true },
    });
    if (!student) throw new NotFoundError('Student');

    const subjects = await prisma.subject.findMany({
      where: { courseId: student.courseId, isActive: true },
      include: {
        subjectAllocations: {
          include: {
            employee: {
              include: { user: { select: { fullName: true, avatar: true } } },
            },
          },
        },
      },
    });

    const conversations = await prisma.doubtConversation.findMany({
      where: { studentId },
      select: { subjectId: true, status: true },
    });

    return subjects.map(s => {
      const teacher = s.subjectAllocations[0]?.employee;
      const conv = conversations.find(c => c.subjectId === s.id);
      return {
        subjectId: s.id,
        subjectName: s.name,
        subjectCode: s.code,
        teacherName: teacher?.user.fullName || 'Not assigned',
        teacherAvatar: teacher?.user.avatar || null,
        hasConversation: !!conv,
        conversationStatus: conv?.status || null,
        unresolvedDoubts: conversations.filter(c => c.subjectId === s.id && c.status !== 'RESOLVED').length,
      };
    });
  }

  private async sendNotification(senderId: string, institutionId: string, title: string, message: string, targetUserIds: string[]) {
    if (targetUserIds.length === 0) return;
    await prisma.notification.create({
      data: {
        institutionId,
        senderId,
        title,
        message,
        type: 'INFO',
        target: 'SPECIFIC_USERS',
        priority: 'NORMAL',
        isSent: true,
        sentAt: new Date(),
        recipients: { create: targetUserIds.map(id => ({ userId: id })) },
      },
    });
  }
}

export const doubtService = new DoubtService();
