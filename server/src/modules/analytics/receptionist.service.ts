import { prisma } from '../../config/database';

export class ReceptionistService {
  static async getDashboard(userId: string, institutionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayVisitors,
      pendingEnquiries,
      pendingRegistrations,
      certificatesReady,
      totalPhoneCalls,
    ] = await Promise.all([
      // Today's visitors - mock count since no Visitor model
      Promise.resolve(0),
      // Pending admission enquiries (APPLIED or UNDER_REVIEW)
      prisma.admission.count({
        where: {
          institutionId,
          status: { in: ['APPLIED', 'UNDER_REVIEW'] },
        },
      }),
      // Pending registrations (approved but not enrolled)
      prisma.admission.count({
        where: {
          institutionId,
          status: 'APPROVED',
        },
      }),
      // Certificates ready to issue
      prisma.certificate.count({
        where: {
          institutionId,
          status: { in: ['APPROVED', 'ISSUED'] },
        },
      }),
      // Total phone calls today - mock count since no PhoneLog model
      Promise.resolve(0),
    ]);

    return {
      todayVisitors,
      pendingEnquiries,
      pendingRegistrations,
      certificatesReady,
      totalPhoneCalls,
    };
  }

  static async getVisitors(userId: string, institutionId: string) {
    // No Visitor model in schema - return empty array with expected structure
    const visitors: {
      id: string;
      visitorName: string;
      purpose: string;
      personToMeet: string;
      inTime: Date;
      outTime: Date | null;
      status: string;
      phone: string;
    }[] = [];

    return visitors;
  }

  static async logVisitor(
    userId: string,
    institutionId: string,
    data: {
      visitorName: string;
      purpose: string;
      personToMeet: string;
      phone: string;
      inTime?: Date;
    }
  ) {
    // No Visitor model - return mock created entry
    return {
      id: `VIS-${Date.now()}`,
      visitorName: data.visitorName,
      purpose: data.purpose,
      personToMeet: data.personToMeet,
      phone: data.phone,
      inTime: data.inTime || new Date(),
      outTime: null,
      status: 'IN',
      institutionId,
      createdBy: userId,
      createdAt: new Date(),
    };
  }

  static async getAdmissionEnquiries(userId: string, institutionId: string) {
    const enquiries = await prisma.admission.findMany({
      where: {
        institutionId,
        status: { in: ['APPLIED', 'UNDER_REVIEW'] },
      },
      include: {
        course: { select: { name: true, code: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return enquiries.map((e) => ({
      id: e.id,
      applicationNumber: e.applicationNumber,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      phone: e.phone,
      courseId: e.courseId,
      courseName: e.course?.name,
      departmentName: e.department?.name,
      status: e.status,
      source: e.source,
      priority: e.priority,
      followUpDate: e.followUpDate,
      counselorNotes: e.counselorNotes,
      createdAt: e.createdAt,
    }));
  }

  static async getPhoneEnquiryLogs(userId: string, institutionId: string) {
    // No PhoneEnquiry model in schema - return empty array with expected structure
    const logs: {
      id: string;
      callerName: string;
      phone: string;
      purpose: string;
      calledPerson: string;
      notes: string;
      createdAt: Date;
    }[] = [];

    return logs;
  }

  static async logPhoneEnquiry(
    userId: string,
    institutionId: string,
    data: {
      callerName: string;
      phone: string;
      purpose: string;
      calledPerson: string;
      notes: string;
    }
  ) {
    // No PhoneEnquiry model - return mock created entry
    return {
      id: `PH-${Date.now()}`,
      callerName: data.callerName,
      phone: data.phone,
      purpose: data.purpose,
      calledPerson: data.calledPerson,
      notes: data.notes,
      institutionId,
      createdBy: userId,
      createdAt: new Date(),
    };
  }

  static async getCertificates(userId: string, institutionId: string) {
    const certificates = await prisma.certificate.findMany({
      where: { institutionId },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return certificates.map((c) => ({
      id: c.id,
      type: c.type,
      title: c.title,
      status: c.status,
      requestDate: c.requestDate,
      issuedDate: c.issuedDate,
      purpose: c.purpose,
      remarks: c.remarks,
      studentName: c.student.user.fullName,
      admissionNumber: c.student.admissionNumber,
      createdAt: c.createdAt,
    }));
  }

  static async generateCertificate(
    userId: string,
    institutionId: string,
    data: {
      studentId: string;
      type: string;
      title: string;
      purpose?: string;
      remarks?: string;
    }
  ) {
    const certificate = await prisma.certificate.create({
      data: {
        institutionId,
        studentId: data.studentId,
        type: data.type,
        title: data.title,
        purpose: data.purpose,
        remarks: data.remarks,
        status: 'PENDING',
        requestDate: new Date(),
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, fullName: true },
            },
          },
        },
      },
    });

    return {
      id: certificate.id,
      type: certificate.type,
      title: certificate.title,
      status: certificate.status,
      requestDate: certificate.requestDate,
      purpose: certificate.purpose,
      remarks: certificate.remarks,
      studentName: certificate.student.user.fullName,
      createdAt: certificate.createdAt,
    };
  }

  static async getIDCards(userId: string, institutionId: string) {
    const students = await prisma.student.findMany({
      where: { institutionId, isActive: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        department: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
      },
      orderBy: { admissionNumber: 'asc' },
    });

    return students.map((s) => ({
      id: s.id,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber,
      name: s.user.fullName,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      phone: s.user.phone,
      avatar: s.user.avatar,
      department: s.department?.name,
      departmentCode: s.department?.code,
      course: s.course?.name,
      courseCode: s.course?.code,
      enrollmentDate: s.enrollmentDate,
    }));
  }
}
