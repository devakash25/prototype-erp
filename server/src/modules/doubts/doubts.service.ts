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
    let courseId: string | null = null;

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
        select: { id: true, courseId: true },
      });
      studentId = stu?.id || null;
      courseId = stu?.courseId || null;
    }

    return { userId, role: user.role, institutionId: user.institutionId!, employeeId, studentId, courseId };
  }

  async getStudentSubjectList(userId: string) {
    const { studentId, institutionId, courseId } = await this.resolve(userId);
    if (!studentId || !courseId) throw new ForbiddenError('Only students can access this');

    const subjects = await prisma.subject.findMany({
      where: { courseId, isActive: true },
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

    // Get group conversations for this class
    const conversations = await prisma.doubtConversation.findMany({
      where: { classId: courseId },
      select: { subjectId: true, status: true, id: true },
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
        hasGroup: !!conv,
        groupId: conv?.id || null,
        status: conv?.status || null,
      };
    });
  }

  async openSubjectChat(userId: string, subjectId: string) {
    const { studentId, institutionId, courseId } = await this.resolve(userId);
    if (!studentId || !courseId) throw new ForbiddenError('Only students can access this');

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, institutionId, courseId },
    });
    if (!subject) throw new NotFoundError('Subject');

    const allocation = await prisma.subjectAllocation.findFirst({
      where: { subjectId },
      include: { employee: true },
    });
    if (!allocation) throw new NotFoundError('No teacher assigned to this subject');

    // Find or create group conversation (one per teacher-subject-class)
    let conversation = await prisma.doubtConversation.findFirst({
      where: { teacherId: allocation.employeeId, subjectId, classId: courseId },
    });

    if (!conversation) {
      conversation = await prisma.doubtConversation.create({
        data: {
          institutionId,
          classId: courseId,
          subjectId,
          teacherId: allocation.employeeId,
          status: 'NEW',
        },
      });
    }

    const teacher = await prisma.employee.findFirst({
      where: { id: allocation.employeeId },
      include: { user: { select: { fullName: true, avatar: true } } },
    }) as any;

    return {
      groupId: conversation.id,
      subject: subject.name,
      subjectCode: subject.code,
      teacherName: teacher?.user.fullName || 'Not assigned',
      teacherAvatar: teacher?.user.avatar || null,
    };
  }

  async getStudentConversations(userId: string) {
    const { studentId, institutionId, courseId } = await this.resolve(userId);
    if (!studentId || !courseId) throw new ForbiddenError('Only students can access this');

    const conversations = await prisma.doubtConversation.findMany({
      where: { classId: courseId },
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
    const { studentId, courseId } = await this.resolve(userId);
    if (!studentId) throw new ForbiddenError('Only students can access this');

    const conversation = await prisma.doubtConversation.findFirst({
      where: { id: conversationId, classId: courseId ?? undefined },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { fullName: true, avatar: true } } } },
        course: { select: { name: true, code: true } },
      },
    }) as any;

    if (!conversation) throw new NotFoundError('Conversation');

    const messages = await prisma.doubtMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, fullName: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    }) as any[];

    // Mark teacher messages as read for this student
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
        senderUserRole: m.sender.role,
        attachmentUrl: m.attachmentUrl,
        attachmentType: m.attachmentType,
        read: m.read,
        createdAt: m.createdAt,
      })),
    };
  }

  async sendMessage(userId: string, conversationId: string, message: string, attachmentUrl?: string, attachmentType?: string) {
    const { userId: uid, role, employeeId, studentId, courseId } = await this.resolve(userId);

    const conversation = await prisma.doubtConversation.findFirst({
      where: { id: conversationId },
      include: { course: { select: { classCoordinatorId: true } } },
    });
    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.status === 'RESOLVED') throw new ConflictError('Doubt is resolved. Create a new doubt.');

    // Access control: teacher of the group, coordinator, or student in the class
    let senderRole: 'STUDENT' | 'TEACHER';
    if (role === 'STUDENT') {
      if (conversation.classId !== courseId) throw new ForbiddenError('Access denied');
      senderRole = 'STUDENT';
    } else {
      const isTeacher = conversation.teacherId === employeeId;
      const isCoordinator = conversation.course.classCoordinatorId === employeeId;
      if (!isTeacher && !isCoordinator) throw new ForbiddenError('Access denied');
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
      include: { sender: { select: { id: true, fullName: true, avatar: true, role: true } } },
    });

    const newStatus = senderRole === 'TEACHER' ? 'REPLIED' : 'NEW';
    await prisma.doubtConversation.update({
      where: { id: conversationId },
      data: { status: newStatus as any, updatedAt: new Date() },
    });

    // Notify all students in the class about teacher reply
    if (senderRole === 'TEACHER') {
      const students = await prisma.student.findMany({
        where: { courseId: conversation.classId, isActive: true },
        include: { user: { select: { id: true } } },
      });
      const studentUserIds = students.map(s => s.user.id);
      if (studentUserIds.length > 0) {
        await this.sendNotification(
          uid, conversation.institutionId,
          'Teacher replied to your doubt',
          `Your teacher replied in the group chat.`,
          studentUserIds
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
      senderUserRole: msg.sender.role,
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

    // Find or create group conversation
    let conversation = await prisma.doubtConversation.findFirst({
      where: { teacherId: allocation.employeeId, subjectId, classId },
    });

    if (!conversation) {
      conversation = await prisma.doubtConversation.create({
        data: {
          institutionId,
          classId,
          subjectId,
          teacherId: allocation.employeeId,
          status: 'NEW',
        },
      });
    } else if (conversation.status === 'RESOLVED') {
      conversation = await prisma.doubtConversation.update({
        where: { id: conversation.id },
        data: { status: 'NEW' },
      });
    }

    const msg = await prisma.doubtMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        senderRole: 'STUDENT',
        message,
      },
      include: { sender: { select: { id: true, fullName: true, avatar: true, role: true } } },
    });

    await prisma.doubtConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Notify teacher
    const teacher = await prisma.employee.findFirst({
      where: { id: allocation.employeeId },
      include: { user: { select: { id: true } } },
    }) as any;
    if (teacher) {
      await this.sendNotification(
        userId, institutionId,
        'New doubt in group',
        `A student raised a new doubt in ${subject.name}.`,
        [teacher.user.id]
      );
    }

    logger.info({ conversationId: conversation.id, studentId }, 'Doubt group message created');

    return {
      groupId: conversation.id,
      message: {
        id: msg.id,
        text: msg.message,
        senderId: msg.senderId,
        senderName: msg.sender.fullName,
        senderAvatar: msg.sender.avatar,
        senderRole: msg.senderRole,
        senderUserRole: msg.sender.role,
        attachmentUrl: msg.attachmentUrl,
        attachmentType: msg.attachmentType,
        read: msg.read,
        createdAt: msg.createdAt,
      },
    };
  }

  async getTeacherClassStats(userId: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    // Classes where teacher teaches subjects
    const teachingCourses = await prisma.course.findMany({
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

    // Classes where teacher is coordinator
    const coordinatorCourses = await prisma.course.findMany({
      where: { institutionId, classCoordinatorId: employeeId },
      include: {
        subjects: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            doubtConversations: { where: { status: { in: ['NEW', 'SEEN', 'REPLIED'] } } },
          },
        },
      },
    });

    const classMap = new Map<string, any>();

    for (const c of teachingCourses) {
      classMap.set(c.id, {
        classId: c.id,
        className: c.name,
        classCode: c.code,
        subjects: c.subjects,
        pendingDoubts: c._count.doubtConversations,
        totalStudents: 0,
        role: 'teacher',
      });
    }

    for (const c of coordinatorCourses) {
      if (classMap.has(c.id)) {
        const existing = classMap.get(c.id);
        existing.role = 'both';
        existing.pendingDoubts = Math.max(existing.pendingDoubts, c._count.doubtConversations);
      } else {
        classMap.set(c.id, {
          classId: c.id,
          className: c.name,
          classCode: c.code,
          subjects: c.subjects,
          pendingDoubts: c._count.doubtConversations,
          totalStudents: 0,
          role: 'coordinator',
        });
      }
    }

    const courseIds = Array.from(classMap.keys());
    const studentCounts = await prisma.student.groupBy({
      by: ['courseId'],
      where: { courseId: { in: courseIds }, isActive: true },
      _count: { id: true },
    });
    const countMap = new Map(studentCounts.map(s => [s.courseId, s._count.id]));
    for (const [id, cls] of classMap) {
      cls.totalStudents = countMap.get(id) || 0;
    }

    return Array.from(classMap.values());
  }

  async getTeacherConversations(userId: string, classId?: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    const coordinatorCourses = await prisma.course.findMany({
      where: { institutionId, classCoordinatorId: employeeId },
      select: { id: true },
    });
    const coordinatorClassIds = coordinatorCourses.map(c => c.id);

    const where: any = {
      institutionId,
      OR: [
        { teacherId: employeeId },
        ...(coordinatorClassIds.length > 0 ? [{ classId: { in: coordinatorClassIds } }] : []),
      ],
    };
    if (classId) where.classId = classId;

    const conversations = await prisma.doubtConversation.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { fullName: true, role: true } } },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }) as any[];

    // Count students per class for last message sender
    const classIds = [...new Set(conversations.map((c: any) => c.classId))];
    const studentCounts = await prisma.student.groupBy({
      by: ['courseId'],
      where: { courseId: { in: classIds }, isActive: true },
      _count: { id: true },
    });
    const countMap = new Map(studentCounts.map(s => [s.courseId, s._count.id]));

    return (conversations as any[]).map(c => ({
      id: c.id,
      subject: c.subject.name,
      subjectCode: c.subject.code,
      className: c.course.name,
      classCode: c.course.code,
      classId: c.classId,
      studentCount: countMap.get(c.classId) || 0,
      lastMessage: c.messages[0]?.message || null,
      lastMessageSender: c.messages[0]?.sender?.fullName || null,
      lastMessageSenderRole: c.messages[0]?.sender?.role || null,
      lastMessageTime: c.messages[0]?.createdAt || c.createdAt,
      status: c.status === 'NEW' ? 'new' : c.status === 'SEEN' ? 'unread' : c.status === 'REPLIED' ? 'answered' : 'resolved',
      unreadCount: c.messages.filter((m: any) => m.senderRole === 'STUDENT' && !m.read).length,
      messageCount: c._count.messages,
      createdAt: c.createdAt,
    }));
  }

  async getTeacherChat(userId: string, conversationId: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    const conversation = await prisma.doubtConversation.findFirst({
      where: { id: conversationId },
      include: {
        subject: { select: { name: true, code: true } },
        course: { select: { name: true, code: true, classCoordinatorId: true } },
      },
    }) as any;

    if (!conversation) throw new NotFoundError('Conversation');

    const isTeacher = conversation.teacherId === employeeId;
    const isCoordinator = conversation.course.classCoordinatorId === employeeId;
    if (!isTeacher && !isCoordinator) throw new ForbiddenError('Access denied');

    if (conversation.status === 'NEW') {
      await prisma.doubtConversation.update({
        where: { id: conversationId },
        data: { status: 'SEEN' },
      });
    }

    const messages = await prisma.doubtMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, fullName: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    }) as any[];

    await prisma.doubtMessage.updateMany({
      where: { conversationId, senderRole: 'STUDENT', read: false },
      data: { read: true },
    });

    // Get student count in class
    const studentCount = await prisma.student.count({
      where: { courseId: conversation.classId, isActive: true },
    });

    return {
      conversation: {
        id: conversation.id,
        subject: conversation.subject.name,
        subjectCode: conversation.subject.code,
        className: conversation.course.name,
        classCode: conversation.course.code,
        classId: conversation.classId,
        studentCount,
        status: conversation.status,
      },
      messages: messages.map((m: any) => ({
        id: m.id,
        text: m.message,
        senderId: m.senderId,
        senderName: m.sender.fullName,
        senderAvatar: m.sender.avatar,
        senderRole: m.senderRole,
        senderUserRole: m.sender.role,
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
      include: { course: { select: { classCoordinatorId: true } } },
    });
    if (!conversation) throw new NotFoundError('Conversation');

    if (role === 'STUDENT') throw new ForbiddenError('Only teachers can resolve doubts');
    if (role === 'TEACHER' || role === 'HOD') {
      const isTeacher = conversation.teacherId === employeeId;
      const isCoordinator = conversation.course.classCoordinatorId === employeeId;
      if (!isTeacher && !isCoordinator) throw new ForbiddenError('Access denied');
    }

    const updated = await prisma.doubtConversation.update({
      where: { id: conversationId },
      data: { status: 'RESOLVED' },
    });

    logger.info({ conversationId, resolvedBy: role }, 'Doubt resolved');
    return updated;
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
