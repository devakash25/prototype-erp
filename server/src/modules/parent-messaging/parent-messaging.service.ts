import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../utils/logger';

class ParentMessagingService {
  private async resolve(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, institutionId: true },
    });
    if (!user) throw new NotFoundError('User');
    if (!user.institutionId) throw new NotFoundError('Institution');

    let parentId: string | null = null;
    let employeeId: string | null = null;

    if (user.role === 'PARENT') {
      const parent = await prisma.parent.findFirst({ where: { userId, isActive: true }, select: { id: true } });
      parentId = parent?.id || null;
    }
    if (user.role === 'TEACHER' || user.role === 'HOD') {
      const emp = await prisma.employee.findFirst({ where: { userId, isActive: true }, select: { id: true } });
      employeeId = emp?.id || null;
    }
    return { user, parentId, employeeId };
  }

  async getParentRecipientList(userId: string) {
    const { parentId } = await this.resolve(userId);
    if (!parentId) throw new ForbiddenError('Only parents can access this');

    const children = await prisma.parentStudent.findMany({
      where: { parentId },
      include: {
        student: {
          select: {
            id: true, courseId: true,
            user: { select: { firstName: true, lastName: true } },
            course: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    const results: any[] = [];
    for (const cs of children) {
      const student = cs.student;
      const studentName = `${student.user.firstName} ${student.user.lastName}`;

      const course = await prisma.course.findUnique({
        where: { id: student.courseId },
        select: { id: true, name: true, code: true, classCoordinatorId: true },
      });

      if (course?.classCoordinatorId) {
        const coordinator = await prisma.employee.findUnique({
          where: { id: course.classCoordinatorId },
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, lastLoginAt: true } } },
        });
        if (coordinator) {
          const existingConv = await prisma.parentConversation.findFirst({
            where: { parentId, teacherId: coordinator.id, studentId: student.id },
            include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
          });
          const unreadCount = existingConv
            ? await prisma.parentMessage.count({ where: { conversationId: existingConv.id, isRead: false, senderRole: 'TEACHER' } })
            : 0;
          results.push({
            teacherId: coordinator.id, teacherName: `${coordinator.user.firstName} ${coordinator.user.lastName}`,
            teacherAvatar: coordinator.user.avatar, role: 'Class Coordinator', subject: null,
            studentId: student.id, studentName, className: `${course.name} (${course.code})`,
            lastMessage: existingConv?.messages[0]?.message || null,
            lastMessageTime: existingConv?.messages[0]?.createdAt || null,
            unreadCount,
            online: coordinator.user.lastLoginAt ? Date.now() - new Date(coordinator.user.lastLoginAt).getTime() < 15 * 60 * 1000 : false,
            conversationId: existingConv?.id || null,
          });
        }
      }

      const subjects = await prisma.subject.findMany({
        where: { courseId: student.courseId, isActive: true },
        include: { subjectAllocations: { include: { employee: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, lastLoginAt: true } } } } } } },
      });
      for (const subject of subjects) {
        for (const alloc of subject.subjectAllocations) {
          const teacher = alloc.employee;
          const existingConv = await prisma.parentConversation.findFirst({
            where: { parentId, teacherId: teacher.id, studentId: student.id },
            include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
          });
          const unreadCount = existingConv
            ? await prisma.parentMessage.count({ where: { conversationId: existingConv.id, isRead: false, senderRole: 'TEACHER' } })
            : 0;
          results.push({
            teacherId: teacher.id, teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
            teacherAvatar: teacher.user.avatar, role: 'Subject Teacher', subject: subject.name,
            studentId: student.id, studentName, className: `${course?.name} (${course?.code})`,
            lastMessage: existingConv?.messages[0]?.message || null,
            lastMessageTime: existingConv?.messages[0]?.createdAt || null,
            unreadCount,
            online: teacher.user.lastLoginAt ? Date.now() - new Date(teacher.user.lastLoginAt).getTime() < 15 * 60 * 1000 : false,
            conversationId: existingConv?.id || null,
          });
        }
      }
    }
    return results;
  }

  async startConversation(userId: string, data: { studentId: string; teacherId: string; recipientType: string; message: string }) {
    const { user, parentId } = await this.resolve(userId);
    const institutionId = user.institutionId!;
    if (!parentId) throw new ForbiddenError('Only parents can access this');

    const parentStudent = await prisma.parentStudent.findFirst({ where: { parentId, studentId: data.studentId } });
    if (!parentStudent) throw new ForbiddenError('You do not have access to this student');

    const existing = await prisma.parentConversation.findFirst({ where: { parentId, teacherId: data.teacherId, studentId: data.studentId } });
    let conversation;
    if (existing) {
      conversation = existing;
    } else {
      conversation = await prisma.parentConversation.create({
        data: { institutionId, parentId, studentId: data.studentId, teacherId: data.teacherId, recipientType: data.recipientType as any },
      });
    }

    await prisma.parentMessage.create({ data: { conversationId: conversation.id, senderId: user.id, senderRole: 'PARENT', message: data.message } });
    return conversation;
  }

  async getParentConversations(userId: string) {
    const { parentId } = await this.resolve(userId);
    if (!parentId) throw new ForbiddenError('Only parents can access this');

    const conversations = await prisma.parentConversation.findMany({
      where: { parentId },
      include: {
        student: { select: { id: true, user: { select: { firstName: true, lastName: true } }, course: { select: { name: true, code: true } } } },
        teacher: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, lastLoginAt: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c) => {
      const t = (c.teacher as any).user;
      const s = (c.student as any).user;
      return {
        id: c.id, recipientType: c.recipientType,
        teacherName: `${t.firstName} ${t.lastName}`, teacherAvatar: t.avatar, teacherId: c.teacherId,
        studentName: `${s.firstName} ${s.lastName}`, studentId: c.studentId,
        className: `${(c.student as any).course?.name || ''} (${(c.student as any).course?.code || ''})`,
        lastMessage: c.messages[0]?.message || null, lastMessageTime: c.messages[0]?.createdAt || c.createdAt,
        unreadCount: 0,
        online: t.lastLoginAt ? Date.now() - new Date(t.lastLoginAt).getTime() < 15 * 60 * 1000 : false,
      };
    });
  }

  async getParentChat(userId: string, conversationId: string) {
    const { parentId } = await this.resolve(userId);
    if (!parentId) throw new ForbiddenError('Only parents can access this');

    const conversation = await prisma.parentConversation.findUnique({
      where: { id: conversationId },
      include: {
        teacher: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, lastLoginAt: true } } } },
        student: { select: { id: true, admissionNumber: true, rollNumber: true, user: { select: { firstName: true, lastName: true } }, course: { select: { name: true, code: true } } } },
      },
    });
    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.parentId !== parentId) throw new ForbiddenError('Access denied');

    const messages = await prisma.parentMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.parentMessage.updateMany({ where: { conversationId, senderRole: 'TEACHER', isRead: false }, data: { isRead: true } });

    const t = (conversation.teacher as any).user;
    const s = (conversation.student as any).user;
    return {
      conversation: { id: conversation.id, recipientType: conversation.recipientType, teacherName: `${t.firstName} ${t.lastName}`, teacherAvatar: t.avatar, teacherId: conversation.teacherId, online: t.lastLoginAt ? Date.now() - new Date(t.lastLoginAt).getTime() < 15 * 60 * 1000 : false },
      student: { id: conversation.student.id, name: `${s.firstName} ${s.lastName}`, admissionNumber: conversation.student.admissionNumber, rollNumber: conversation.student.rollNumber, className: `${(conversation.student as any).course?.name || ''} (${(conversation.student as any).course?.code || ''})` },
      messages: messages.map((m) => ({ id: m.id, senderId: m.senderId, senderRole: m.senderRole, senderName: `${(m.sender as any).firstName} ${(m.sender as any).lastName}`, senderAvatar: (m.sender as any).avatar, message: m.message, attachmentUrl: m.attachmentUrl, attachmentType: m.attachmentType, isRead: m.isRead, createdAt: m.createdAt })),
    };
  }

  async sendParentMessage(userId: string, data: { conversationId: string; message: string; attachmentUrl?: string; attachmentType?: string }) {
    const { user, parentId } = await this.resolve(userId);
    if (!parentId) throw new ForbiddenError('Only parents can access this');

    const conversation = await prisma.parentConversation.findUnique({ where: { id: data.conversationId } });
    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.parentId !== parentId) throw new ForbiddenError('Access denied');

    const message = await prisma.parentMessage.create({
      data: { conversationId: data.conversationId, senderId: user.id, senderRole: 'PARENT', message: data.message, attachmentUrl: data.attachmentUrl, attachmentType: data.attachmentType as any },
    });
    await prisma.parentConversation.update({ where: { id: data.conversationId }, data: { updatedAt: new Date() } });
    return message;
  }

  async getTeacherInbox(userId: string) {
    const { employeeId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    const conversations = await prisma.parentConversation.findMany({
      where: { teacherId: employeeId },
      include: {
        parent: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, lastLoginAt: true } } } },
        student: { select: { id: true, admissionNumber: true, rollNumber: true, user: { select: { firstName: true, lastName: true } }, course: { select: { name: true, code: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c) => {
      const p = (c.parent as any).user;
      const s = (c.student as any).user;
      return {
        id: c.id, parentName: `${p.firstName} ${p.lastName}`, parentAvatar: p.avatar, parentId: c.parentId,
        studentName: `${s.firstName} ${s.lastName}`, studentId: c.studentId,
        className: `${(c.student as any).course?.name || ''} (${(c.student as any).course?.code || ''})`,
        rollNumber: (c.student as any).rollNumber, admissionNumber: (c.student as any).admissionNumber,
        recipientType: c.recipientType, lastMessage: c.messages[0]?.message || null,
        lastMessageTime: c.messages[0]?.createdAt || c.createdAt, unreadCount: 0,
        parentOnline: p.lastLoginAt ? Date.now() - new Date(p.lastLoginAt).getTime() < 15 * 60 * 1000 : false,
      };
    });
  }

  async getTeacherChat(userId: string, conversationId: string) {
    const { employeeId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    const conversation = await prisma.parentConversation.findUnique({
      where: { id: conversationId },
      include: {
        parent: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, lastLoginAt: true } } } },
        student: { select: { id: true, admissionNumber: true, rollNumber: true, user: { select: { firstName: true, lastName: true } }, course: { select: { name: true, code: true } } } },
      },
    });
    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.teacherId !== employeeId) throw new ForbiddenError('Access denied');

    const messages = await prisma.parentMessage.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.parentMessage.updateMany({ where: { conversationId, senderRole: 'PARENT', isRead: false }, data: { isRead: true } });

    const studentAttendance = await prisma.attendance.findMany({ where: { studentId: conversation.studentId }, select: { status: true } });
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter((a) => a.status === 'PRESENT').length;

    const p = (conversation.parent as any).user;
    const s = (conversation.student as any).user;
    return {
      conversation: { id: conversation.id, recipientType: conversation.recipientType, parentName: `${p.firstName} ${p.lastName}`, parentAvatar: p.avatar, parentId: conversation.parentId, parentOnline: p.lastLoginAt ? Date.now() - new Date(p.lastLoginAt).getTime() < 15 * 60 * 1000 : false },
      student: { id: conversation.student.id, name: `${s.firstName} ${s.lastName}`, admissionNumber: conversation.student.admissionNumber, rollNumber: conversation.student.rollNumber, className: `${(conversation.student as any).course?.name || ''} (${(conversation.student as any).course?.code || ''})`, attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null },
      messages: messages.map((m) => ({ id: m.id, senderId: m.senderId, senderRole: m.senderRole, senderName: `${(m.sender as any).firstName} ${(m.sender as any).lastName}`, senderAvatar: (m.sender as any).avatar, message: m.message, attachmentUrl: m.attachmentUrl, attachmentType: m.attachmentType, isRead: m.isRead, createdAt: m.createdAt })),
    };
  }

  async sendTeacherMessage(userId: string, data: { conversationId: string; message: string; attachmentUrl?: string; attachmentType?: string }) {
    const { user, employeeId } = await this.resolve(userId);
    if (!employeeId) throw new ForbiddenError('Only teachers can access this');

    const conversation = await prisma.parentConversation.findUnique({ where: { id: data.conversationId } });
    if (!conversation) throw new NotFoundError('Conversation');
    if (conversation.teacherId !== employeeId) throw new ForbiddenError('Access denied');

    const message = await prisma.parentMessage.create({
      data: { conversationId: data.conversationId, senderId: user.id, senderRole: 'TEACHER', message: data.message, attachmentUrl: data.attachmentUrl, attachmentType: data.attachmentType as any },
    });
    await prisma.parentConversation.update({ where: { id: data.conversationId }, data: { updatedAt: new Date() } });
    return message;
  }
}

export const parentMessagingService = new ParentMessagingService();
