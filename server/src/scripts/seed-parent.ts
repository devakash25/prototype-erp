import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting parent seeding...');

  const hashedPassword = await bcrypt.hash('Parent@123', 10);

  const institution = await prisma.institution.findFirst();
  if (!institution) {
    throw new Error('No institution found. Please seed institutions first.');
  }
  console.log(`Using institution: ${institution.name} (${institution.id})`);

  // Get or create department, course, academic session
  const department = await prisma.department.findFirst({ where: { institutionId: institution.id } });
  const course = await prisma.course.findFirst({ where: { institutionId: institution.id } });
  const session = await prisma.academicSession.findFirst({ where: { institutionId: institution.id } });

  if (!department || !course || !session) {
    throw new Error('Missing department, course, or academic session. Seed base data first.');
  }

  // Create Father user
  const fatherUser = await prisma.user.upsert({
    where: { email: 'father@dev-erp.com' },
    update: {},
    create: {
      email: 'father@dev-erp.com',
      password: hashedPassword,
      role: 'PARENT',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      fullName: 'Rajesh Kumar',
      phone: '9876543210',
      institutionId: institution.id,
      isActive: true,
    },
  });
  console.log(`Father user: ${fatherUser.id}`);

  const fatherParent = await prisma.parent.upsert({
    where: { userId: fatherUser.id },
    update: {},
    create: {
      userId: fatherUser.id,
      institutionId: institution.id,
      occupation: 'Software Engineer',
      relationship: 'father',
    },
  });
  console.log(`Father parent record: ${fatherParent.id}`);

  // Create Mother user
  const motherUser = await prisma.user.upsert({
    where: { email: 'mother@dev-erp.com' },
    update: {},
    create: {
      email: 'mother@dev-erp.com',
      password: hashedPassword,
      role: 'PARENT',
      firstName: 'Sunita',
      lastName: 'Kumar',
      fullName: 'Sunita Kumar',
      phone: '9876543211',
      institutionId: institution.id,
      isActive: true,
    },
  });
  console.log(`Mother user: ${motherUser.id}`);

  const motherParent = await prisma.parent.upsert({
    where: { userId: motherUser.id },
    update: {},
    create: {
      userId: motherUser.id,
      institutionId: institution.id,
      occupation: 'Teacher',
      relationship: 'mother',
    },
  });
  console.log(`Mother parent record: ${motherParent.id}`);

  // Find existing students
  const students = await prisma.student.findMany({
    where: { institutionId: institution.id },
    take: 5,
    include: { user: true },
  });

  if (students.length === 0) {
    console.log('No students found. Creating sample students...');

    const s1User = await prisma.user.create({
      data: {
        email: 'student1@dev-erp.com',
        password: await bcrypt.hash('Student@123', 10),
        role: 'STUDENT',
        firstName: 'Aarav',
        lastName: 'Kumar',
        fullName: 'Aarav Kumar',
        phone: '9876543220',
        institutionId: institution.id,
        isActive: true,
      },
    });

    const s1 = await prisma.student.create({
      data: {
        userId: s1User.id,
        institutionId: institution.id,
        departmentId: department.id,
        courseId: course.id,
        academicSessionId: session.id,
        admissionNumber: 'STU-2024-001',
        rollNumber: '10A001',
        enrollmentDate: new Date('2024-04-01'),
        admissionType: 'regular',
        guardianName: 'Rajesh Kumar',
        guardianPhone: '9876543210',
        guardianRelation: 'father',
      },
    });

    const s2User = await prisma.user.create({
      data: {
        email: 'student2@dev-erp.com',
        password: await bcrypt.hash('Student@123', 10),
        role: 'STUDENT',
        firstName: 'Ananya',
        lastName: 'Kumar',
        fullName: 'Ananya Kumar',
        phone: '9876543221',
        institutionId: institution.id,
        isActive: true,
      },
    });

    const s2 = await prisma.student.create({
      data: {
        userId: s2User.id,
        institutionId: institution.id,
        departmentId: department.id,
        courseId: course.id,
        academicSessionId: session.id,
        admissionNumber: 'STU-2024-002',
        rollNumber: '10A002',
        enrollmentDate: new Date('2024-04-01'),
        admissionType: 'regular',
        guardianName: 'Rajesh Kumar',
        guardianPhone: '9876543210',
        guardianRelation: 'father',
      },
    });

    students.push(s1, s2);
    console.log('Created 2 sample students');
  }

  console.log(`Found ${students.length} students`);

  // Link parents to first 2 students via ParentStudent junction
  for (const student of students.slice(0, 2)) {
    const existingFatherLink = await prisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: fatherParent.id, studentId: student.id } },
    });
    if (!existingFatherLink) {
      await prisma.parentStudent.create({
        data: { parentId: fatherParent.id, studentId: student.id },
      });
      console.log(`Linked father -> student ${student.id}`);
    }

    const existingMotherLink = await prisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: motherParent.id, studentId: student.id } },
    });
    if (!existingMotherLink) {
      await prisma.parentStudent.create({
        data: { parentId: motherParent.id, studentId: student.id },
      });
      console.log(`Linked mother -> student ${student.id}`);
    }

    // Set parentId on student for backward compat
    await prisma.student.update({
      where: { id: student.id },
      data: { parentId: fatherParent.id },
    });
  }

  const targetStudent = students[0];
  console.log(`\nSeeding extra data for student: ${targetStudent.id}`);

  // Find subjects for this student's course
  const subjects = await prisma.subject.findMany({
    where: { institutionId: institution.id, courseId: course.id },
    take: 5,
  });

  // Find a teacher employee for marking attendance
  const teacher = await prisma.employee.findFirst({
    where: { institutionId: institution.id },
  });

  // ATTENDANCE (last 30 weekdays)
  console.log('\nCreating attendance...');
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'PRESENT'];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    const status = statuses[i % statuses.length] as any;

    if (subjects.length > 0) {
      const subject = subjects[i % subjects.length];
      try {
        await prisma.attendance.create({
          data: {
            studentId: targetStudent.id,
            subjectId: subject.id,
            academicSessionId: session.id,
            date: date,
            status,
            markedBy: teacher?.id,
            remarks: status === 'ABSENT' ? 'Absent without notice' : status === 'LATE' ? 'Arrived late' : null,
          },
        });
      } catch (e: any) {
        // Skip duplicate
      }
    }
  }
  console.log('Attendance created');

  // EXAM RESULTS
  if (subjects.length > 0) {
    console.log('\nCreating exam results...');
    const exam = await prisma.examination.create({
      data: {
        institutionId: institution.id,
        departmentId: department.id,
        academicSessionId: session.id,
        name: 'Mid-Term Examination 2024',
        type: 'MIDTERM',
        startDate: new Date('2024-09-15'),
        endDate: new Date('2024-09-25'),
        maxMarks: 100,
        passingMarks: 33,
      },
    });

    const marks = [
      { idx: 0, m: 85, g: 'A', gp: '4.0' },
      { idx: 1, m: 78, g: 'B+', gp: '3.5' },
      { idx: 2, m: 92, g: 'A+', gp: '4.5' },
      { idx: 3, m: 65, g: 'B', gp: '3.0' },
      { idx: 4, m: 88, g: 'A', gp: '4.0' },
    ];

    for (const mark of marks) {
      if (subjects[mark.idx]) {
        try {
          await prisma.examResult.create({
            data: {
              examinationId: exam.id,
              studentId: targetStudent.id,
              subjectId: subjects[mark.idx].id,
              marksObtained: new Prisma.Decimal(mark.m),
              grade: mark.g,
              gradePoints: new Prisma.Decimal(mark.gp),
              isPassed: mark.m >= 33,
              remarks: mark.m >= 90 ? 'Excellent' : mark.m >= 80 ? 'Good' : null,
            },
          });
        } catch (e: any) { /* skip dup */ }
      }
    }
    console.log('Exam results created');
  }

  // FEE PAYMENTS
  console.log('\nCreating fee payments...');
  const feeStructures = await prisma.feeStructure.findMany({
    where: { institutionId: institution.id },
    take: 3,
  });

  for (let i = 0; i < Math.min(2, feeStructures.length); i++) {
    try {
      await prisma.feePayment.create({
        data: {
          studentId: targetStudent.id,
          feeStructureId: feeStructures[i].id,
          amount: new Prisma.Decimal(12500),
          paidAmount: new Prisma.Decimal(12500),
          dueAmount: new Prisma.Decimal(0),
          status: 'PAID',
          paymentMethod: 'ONLINE',
          transactionId: `TXN${Date.now()}${i}`,
          receiptNumber: `RCP-2024-${String(i + 1).padStart(4, '0')}`,
          paidAt: new Date('2024-09-01'),
        },
      });
    } catch (e: any) { /* skip */ }
  }

  if (feeStructures.length > 2) {
    try {
      await prisma.feePayment.create({
        data: {
          studentId: targetStudent.id,
          feeStructureId: feeStructures[2].id,
          amount: new Prisma.Decimal(8500),
          paidAmount: new Prisma.Decimal(0),
          dueAmount: new Prisma.Decimal(8500),
          status: 'PENDING',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (e: any) { /* skip */ }
  }
  console.log('Fee payments created');

  // LIBRARY ISSUES
  console.log('\nCreating library issues...');
  const books = await prisma.libraryBook.findMany({
    where: { institutionId: institution.id },
    take: 3,
  });

  for (let i = 0; i < Math.min(3, books.length); i++) {
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - (15 + i * 5));
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);

    try {
      await prisma.libraryIssue.create({
        data: {
          bookId: books[i].id,
          studentId: targetStudent.id,
          issueDate,
          dueDate,
          returnDate: i < 2 ? new Date(dueDate.getTime() - 2 * 86400000) : null,
          status: i < 2 ? 'returned' : 'issued',
          fine: i === 0 ? new Prisma.Decimal(50) : new Prisma.Decimal(0),
          finePaid: i === 0,
        },
      });
    } catch (e: any) { /* skip */ }
  }
  console.log('Library issues created');

  // ANNOUNCEMENTS
  console.log('\nCreating announcements...');
  const adminUser = await prisma.user.findFirst({
    where: { institutionId: institution.id, role: 'CHIEF_HEAD' },
  });

  if (adminUser) {
    const anncs = [
      { title: 'Parent-Teacher Meeting Scheduled', content: 'PTM scheduled for next Friday. All parents requested to attend.', type: 'MEETING' as any, target: 'PARENTS' as any, priority: 'HIGH' as any },
      { title: 'Annual Day Celebration', content: 'Annual day on 15th November. Students will perform cultural programs.', type: 'EVENT' as any, target: 'ALL' as any, priority: 'NORMAL' as any },
      { title: 'Holiday Notice - Diwali', content: 'School closed from 1st to 5th November for Diwali vacation.', type: 'HOLIDAY' as any, target: 'ALL' as any, priority: 'HIGH' as any },
    ];

    for (const a of anncs) {
      try {
        await prisma.announcement.create({
          data: {
            institutionId: institution.id,
            authorId: adminUser.id,
            title: a.title,
            content: a.content,
            type: a.type,
            target: a.target,
            priority: a.priority,
            isPublished: true,
            publishedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 86400000),
          },
        });
      } catch (e: any) { /* skip */ }
    }
  }
  console.log('Announcements created');

  // HELPDESK TICKETS (complaints)
  console.log('\nCreating complaints...');
  try {
    const ticket = await prisma.helpdeskTicket.create({
      data: {
        institutionId: institution.id,
        creatorId: fatherUser.id,
        title: 'Bullying incident in school bus',
        description: 'My child reported being bullied by older students during the bus ride home.',
        category: 'transport',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
      },
    });

    await prisma.complaint.create({
      data: {
        studentId: targetStudent.id,
        ticketId: ticket.id,
        title: 'Bullying incident in school bus',
        description: 'My child reported being bullied by older students during the bus ride home.',
        category: 'transport',
        status: 'in_progress',
      },
    });
  } catch (e: any) { /* skip */ }

  try {
    const ticket2 = await prisma.helpdeskTicket.create({
      data: {
        institutionId: institution.id,
        creatorId: fatherUser.id,
        title: 'Canteen food quality concern',
        description: 'Food quality has deteriorated. Many students falling sick.',
        category: 'general',
        priority: 'NORMAL',
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });

    await prisma.complaint.create({
      data: {
        studentId: targetStudent.id,
        ticketId: ticket2.id,
        title: 'Canteen food quality concern',
        description: 'Food quality has deteriorated.',
        category: 'general',
        status: 'resolved',
        resolvedAt: new Date(),
      },
    });
  } catch (e: any) { /* skip */ }
  console.log('Complaints created');

  // STUDENT REQUESTS (leave requests)
  console.log('\nCreating leave requests...');
  const leaveRequests = [
    { title: 'Leave for family function', description: 'Request leave for family wedding', status: 'APPROVED', type: 'LEAVE_DOCUMENT' },
    { title: 'Medical leave', description: 'Doctor appointment', status: 'APPROVED', type: 'LEAVE_DOCUMENT' },
    { title: 'Personal leave request', description: 'Family emergency', status: 'SUBMITTED', type: 'LEAVE_DOCUMENT' },
  ];

  for (const lr of leaveRequests) {
    try {
      await prisma.studentRequest.create({
        data: {
          institutionId: institution.id,
          studentId: targetStudent.id,
          type: lr.type,
          title: lr.title,
          description: lr.description,
          status: lr.status,
          priority: 'NORMAL',
        },
      });
    } catch (e: any) { /* skip */ }
  }
  console.log('Leave requests created');

  console.log('\n========================================');
  console.log('Parent seeding completed!');
  console.log('========================================');
  console.log('Father: father@dev-erp.com / Parent@123');
  console.log('Mother: mother@dev-erp.com / Parent@123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
