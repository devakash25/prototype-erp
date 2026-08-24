import { PrismaClient, UserRole, Gender, AdmissionStatus, PaymentStatus, ExamType, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('Seeding database...');

  // Create Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'DEV ERP Academy',
      code: 'DEVERP001',
      type: 'university',
      address: '123 Education Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      phone: '+91 22 1234 5678',
      email: 'admin@dev-erp.com',
      website: 'https://dev-erp.com',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      academicYearStart: 4,
    },
  });
  console.log('Institution created:', institution.id);

  // Create Academic Session
  const session = await prisma.academicSession.create({
    data: {
      institutionId: institution.id,
      name: '2024-2025',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      isActive: true,
      isCurrent: true,
    },
  });

  const prevSession = await prisma.academicSession.create({
    data: {
      institutionId: institution.id,
      name: '2023-2024',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      isActive: false,
      isCurrent: false,
    },
  });

  // Create Chief Head (Super Admin)
  const chiefHeadPassword = await hashPassword('Admin@123');
  const chiefHead = await prisma.user.create({
    data: {
      institutionId: institution.id,
      email: 'admin@dev-erp.com',
      password: chiefHeadPassword,
      role: 'CHIEF_HEAD',
      firstName: 'Chief',
      lastName: 'Head',
      fullName: 'Chief Head',
      phone: '+91 98765 43210',
      gender: 'MALE',
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create Director
  const directorPassword = await hashPassword('Director@123');
  const director = await prisma.user.create({
    data: {
      institutionId: institution.id,
      email: 'director@dev-erp.com',
      password: directorPassword,
      role: 'DIRECTOR',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      fullName: 'Rajesh Kumar',
      phone: '+91 98765 43211',
      gender: 'MALE',
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { institutionId: institution.id, name: 'Computer Science', code: 'CS', description: 'Computer Science & Engineering' } }),
    prisma.department.create({ data: { institutionId: institution.id, name: 'Electronics', code: 'EC', description: 'Electronics & Communication' } }),
    prisma.department.create({ data: { institutionId: institution.id, name: 'Mechanical', code: 'ME', description: 'Mechanical Engineering' } }),
    prisma.department.create({ data: { institutionId: institution.id, name: 'Civil', code: 'CE', description: 'Civil Engineering' } }),
    prisma.department.create({ data: { institutionId: institution.id, name: 'Business', code: 'BA', description: 'Business Administration' } }),
    prisma.department.create({ data: { institutionId: institution.id, name: 'Mathematics', code: 'MA', description: 'Mathematics Department' } }),
    prisma.department.create({ data: { institutionId: institution.id, name: 'Physics', code: 'PH', description: 'Physics Department' } }),
    prisma.department.create({ data: { institutionId: institution.id, name: 'Chemistry', code: 'CH', description: 'Chemistry Department' } }),
  ]);

  // Create Courses
  const courses = await Promise.all([
    prisma.course.create({ data: { institutionId: institution.id, departmentId: departments[0].id, name: 'B.Tech Computer Science', code: 'BTECH-CS', duration: 48, totalSemesters: 8, type: 'regular', level: 'undergraduate', maxStudents: 120 } }),
    prisma.course.create({ data: { institutionId: institution.id, departmentId: departments[0].id, name: 'M.Tech Computer Science', code: 'MTECH-CS', duration: 24, totalSemesters: 4, type: 'regular', level: 'postgraduate', maxStudents: 60 } }),
    prisma.course.create({ data: { institutionId: institution.id, departmentId: departments[1].id, name: 'B.Tech Electronics', code: 'BTECH-EC', duration: 48, totalSemesters: 8, type: 'regular', level: 'undergraduate', maxStudents: 100 } }),
    prisma.course.create({ data: { institutionId: institution.id, departmentId: departments[2].id, name: 'B.Tech Mechanical', code: 'BTECH-ME', duration: 48, totalSemesters: 8, type: 'regular', level: 'undergraduate', maxStudents: 100 } }),
    prisma.course.create({ data: { institutionId: institution.id, departmentId: departments[4].id, name: 'MBA', code: 'MBA', duration: 24, totalSemesters: 4, type: 'regular', level: 'postgraduate', maxStudents: 80 } }),
  ]);

  // Create Subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { institutionId: institution.id, departmentId: departments[0].id, courseId: courses[0].id, name: 'Data Structures', code: 'CS101', credits: 4, type: 'theory', totalMarks: 100, passingMarks: 33 } }),
    prisma.subject.create({ data: { institutionId: institution.id, departmentId: departments[0].id, courseId: courses[0].id, name: 'Algorithms', code: 'CS102', credits: 4, type: 'theory', totalMarks: 100, passingMarks: 33 } }),
    prisma.subject.create({ data: { institutionId: institution.id, departmentId: departments[0].id, courseId: courses[0].id, name: 'Database Systems', code: 'CS103', credits: 3, type: 'theory', totalMarks: 100, passingMarks: 33 } }),
    prisma.subject.create({ data: { institutionId: institution.id, departmentId: departments[0].id, courseId: courses[0].id, name: 'Operating Systems', code: 'CS104', credits: 4, type: 'theory', totalMarks: 100, passingMarks: 33 } }),
    prisma.subject.create({ data: { institutionId: institution.id, departmentId: departments[0].id, courseId: courses[0].id, name: 'Computer Networks', code: 'CS105', credits: 3, type: 'theory', totalMarks: 100, passingMarks: 33 } }),
    prisma.subject.create({ data: { institutionId: institution.id, departmentId: departments[1].id, courseId: courses[2].id, name: 'Digital Electronics', code: 'EC101', credits: 4, type: 'theory', totalMarks: 100, passingMarks: 33 } }),
    prisma.subject.create({ data: { institutionId: institution.id, departmentId: departments[2].id, courseId: courses[3].id, name: 'Thermodynamics', code: 'ME101', credits: 4, type: 'theory', totalMarks: 100, passingMarks: 33 } }),
    prisma.subject.create({ data: { institutionId: institution.id, departmentId: departments[4].id, courseId: courses[4].id, name: 'Marketing Management', code: 'MBA101', credits: 3, type: 'theory', totalMarks: 100, passingMarks: 33 } }),
  ]);

  // Create Employees (Teachers, HOD, Principal, etc.)
  const employeePassword = await hashPassword('Teacher@123');
  const employees: any[] = [];

  // Principal
  const principalUser = await prisma.user.create({
    data: {
      institutionId: institution.id, email: 'principal@dev-erp.com', password: employeePassword,
      role: 'PRINCIPAL', firstName: 'Prof. Meena', lastName: 'Sharma', fullName: 'Prof. Meena Sharma',
      phone: '+91 98765 43211', gender: 'FEMALE', isActive: true,
    },
  });
  const principal = await prisma.employee.create({
    data: {
      institutionId: institution.id, departmentId: departments[0].id, userId: principalUser.id,
      employeeCode: 'EMP001', designation: 'Principal', department: 'ADMINISTRATION',
      dateOfJoining: new Date('2020-01-15'), qualification: 'Ph.D.',
    },
  });
  employees.push(principal);

  // HODs
  const hodData = [
    { email: 'hod.cs@dev-erp.com', name: 'Dr. Rajesh Kumar', dept: departments[0].id, code: 'EMP002' },
    { email: 'hod.ec@dev-erp.com', name: 'Dr. Sunita Patel', dept: departments[1].id, code: 'EMP003' },
    { email: 'hod.me@dev-erp.com', name: 'Dr. Amit Verma', dept: departments[2].id, code: 'EMP004' },
  ];

  for (const hod of hodData) {
    const user = await prisma.user.create({
      data: {
        institutionId: institution.id, email: hod.email, password: employeePassword,
        role: 'HOD', firstName: hod.name.split(' ').slice(0, -1).join(' '),
        lastName: hod.name.split(' ').pop()!, fullName: hod.name,
        gender: 'MALE', isActive: true,
      },
    });
    const emp = await prisma.employee.create({
      data: {
        institutionId: institution.id, departmentId: hod.dept, userId: user.id,
        employeeCode: hod.code, designation: 'Head of Department', department: 'ACADEMIC',
        dateOfJoining: new Date('2019-06-01'), qualification: 'Ph.D.',
      },
    });
    employees.push(emp);
  }

  // Teachers
  const teacherData = [
    { email: 'teacher1@dev-erp.com', name: 'Mr. Suresh Reddy', dept: departments[0].id, code: 'EMP005' },
    { email: 'teacher2@dev-erp.com', name: 'Ms. Kavitha Nair', dept: departments[0].id, code: 'EMP006' },
    { email: 'teacher3@dev-erp.com', name: 'Mr. Vikram Joshi', dept: departments[1].id, code: 'EMP007' },
    { email: 'teacher4@dev-erp.com', name: 'Mrs. Priya Gupta', dept: departments[2].id, code: 'EMP008' },
    { email: 'teacher5@dev-erp.com', name: 'Mr. Arun Singh', dept: departments[4].id, code: 'EMP009' },
  ];

  for (const t of teacherData) {
    const user = await prisma.user.create({
      data: {
        institutionId: institution.id, email: t.email, password: employeePassword,
        role: 'TEACHER', firstName: t.name.split(' ').slice(0, -1).join(' '),
        lastName: t.name.split(' ').pop()!, fullName: t.name,
        gender: 'MALE', isActive: true,
      },
    });
    const emp = await prisma.employee.create({
      data: {
        institutionId: institution.id, departmentId: t.dept, userId: user.id,
        employeeCode: t.code, designation: 'Assistant Professor', department: 'ACADEMIC',
        dateOfJoining: new Date('2021-07-01'), qualification: 'M.Tech',
      },
    });
    employees.push(emp);
  }

  // Accountant
  const accountantUser = await prisma.user.create({
    data: {
      institutionId: institution.id, email: 'accountant@dev-erp.com', password: employeePassword,
      role: 'ACCOUNTANT', firstName: 'Amit', lastName: 'Patel', fullName: 'Amit Patel',
      phone: '+91 98765 43212', gender: 'MALE', isActive: true,
    },
  });
  await prisma.employee.create({
    data: {
      institutionId: institution.id, departmentId: departments[0].id, userId: accountantUser.id,
      employeeCode: 'EMP010', designation: 'Senior Accountant', department: 'FINANCE',
      dateOfJoining: new Date('2020-03-01'), qualification: 'M.Com',
    },
  });

  // Admission Counsellor
  const admissionUser = await prisma.user.create({
    data: {
      institutionId: institution.id, email: 'admission@dev-erp.com', password: employeePassword,
      role: 'ADMISSION_COUNSELLOR', firstName: 'Priya', lastName: 'Singh', fullName: 'Priya Singh',
      phone: '+91 98765 43213', gender: 'FEMALE', isActive: true,
    },
  });
  await prisma.employee.create({
    data: {
      institutionId: institution.id, departmentId: departments[0].id, userId: admissionUser.id,
      employeeCode: 'EMP011', designation: 'Admission Counsellor', department: 'ADMINISTRATION',
      dateOfJoining: new Date('2022-02-15'), qualification: 'MBA',
    },
  });

  // Librarian
  const librarianUser = await prisma.user.create({
    data: {
      institutionId: institution.id, email: 'librarian@dev-erp.com', password: employeePassword,
      role: 'LIBRARIAN', firstName: 'Sushma', lastName: 'Reddy', fullName: 'Sushma Reddy',
      gender: 'FEMALE', isActive: true,
    },
  });
  await prisma.employee.create({
    data: {
      institutionId: institution.id, departmentId: departments[0].id, userId: librarianUser.id,
      employeeCode: 'EMP012', designation: 'Chief Librarian', department: 'LIBRARY',
      dateOfJoining: new Date('2019-04-01'), qualification: 'MLIS',
    },
  });

  // Hostel Wardens
  const wardenData = [
    { email: 'warden.boys@dev-erp.com', name: 'Ravi Shankar', gender: 'MALE' },
    { email: 'warden.girls@dev-erp.com', name: 'Lakshmi Devi', gender: 'FEMALE' },
  ];
  for (const w of wardenData) {
    const user = await prisma.user.create({
      data: {
        institutionId: institution.id, email: w.email, password: employeePassword,
        role: 'HOSTEL_WARDEN', firstName: w.name.split(' ')[0], lastName: w.name.split(' ').pop()!,
        fullName: w.name, gender: w.gender as Gender, isActive: true,
      },
    });
    await prisma.employee.create({
      data: {
        institutionId: institution.id, departmentId: departments[0].id, userId: user.id,
        employeeCode: `EMP${Date.now().toString(36).toUpperCase()}`, designation: 'Hostel Warden',
        department: 'HOSTEL', dateOfJoining: new Date('2021-01-01'), qualification: 'B.A.',
      },
    });
  }

  // Transport Manager
  const transportUser = await prisma.user.create({
    data: {
      institutionId: institution.id, email: 'transport@dev-erp.com', password: employeePassword,
      role: 'TRANSPORT_MANAGER', firstName: 'Manoj', lastName: 'Kumar', fullName: 'Manoj Kumar',
      gender: 'MALE', isActive: true,
    },
  });
  await prisma.employee.create({
    data: {
      institutionId: institution.id, departmentId: departments[0].id, userId: transportUser.id,
      employeeCode: `EMP${Date.now().toString(36).toUpperCase()}`, designation: 'Transport Manager',
      department: 'TRANSPORT', dateOfJoining: new Date('2020-06-01'), qualification: 'B.Tech',
    },
  });

  // Create Students
  const studentPassword = await hashPassword('Student@123');
  const studentNames = [
    'Aarav Sharma', 'Vivaan Patel', 'Aditya Singh', 'Vihaan Kumar', 'Arjun Reddy',
    'Sai Krishnan', 'Reyansh Gupta', 'Ayaan Shah', 'Krishna Nair', 'Ishaan Verma',
    'Ananya Sharma', 'Diya Patel', 'Saanvi Singh', 'Myra Gupta', 'Sara Reddy',
    'Aadhya Nair', 'Aarna Verma', 'Pari Shah', 'Anvi Kumar', 'Nisha Joshi',
  ];

  const students: any[] = [];
  for (let i = 0; i < studentNames.length; i++) {
    const [first, last] = studentNames[i].split(' ');
    const user = await prisma.user.create({
      data: {
        institutionId: institution.id, email: `student${i + 1}@dev-erp.com`, password: studentPassword,
        role: 'STUDENT', firstName: first, lastName: last, fullName: studentNames[i],
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE', isActive: true,
      },
    });
    const student = await prisma.student.create({
      data: {
        institutionId: institution.id, userId: user.id, departmentId: departments[i % 5].id,
        courseId: courses[i % 5].id, academicSessionId: session.id,
        admissionNumber: `ADM${(2024000 + i + 1).toString()}`,
        enrollmentDate: new Date('2024-07-01'), admissionType: 'regular',
        category: 'general', isHostelStudent: i < 5, usesTransport: i >= 5 && i < 10,
      },
    });
    students.push(student);
  }

  // Create Fee Structures
  const feeStructure = await prisma.feeStructure.create({
    data: {
      institutionId: institution.id, departmentId: departments[0].id, courseId: courses[0].id,
      academicSessionId: session.id, name: 'B.Tech CS - Tuition Fee 2024-25',
      totalAmount: 150000, isActive: true,
    },
  });

  const feeComponents = [
    { name: 'Tuition Fee', amount: 120000, type: 'tuition' },
    { name: 'Admission Fee', amount: 10000, type: 'admission' },
    { name: 'Exam Fee', amount: 5000, type: 'exam' },
    { name: 'Library Fee', amount: 3000, type: 'library' },
    { name: 'Lab Fee', amount: 12000, type: 'misc' },
  ];

  for (const comp of feeComponents) {
    await prisma.feeComponent.create({
      data: { feeStructureId: feeStructure.id, ...comp, isRefundable: false },
    });
  }

  // Create Fee Payments
  for (let i = 0; i < students.length; i++) {
    const statuses: PaymentStatus[] = ['PAID', 'PAID', 'PAID', 'PARTIAL', 'PENDING'];
    const status = statuses[i % 5];
    const paidAmount = status === 'PAID' ? 150000 : status === 'PARTIAL' ? 75000 : 0;

    await prisma.feePayment.create({
      data: {
        studentId: students[i].id, feeStructureId: feeStructure.id,
        amount: 150000, paidAmount, dueAmount: 150000 - paidAmount,
        status, paymentMethod: status !== 'PENDING' ? 'ONLINE' : null,
        paidAt: status !== 'PENDING' ? new Date() : null,
        receiptNumber: status !== 'PENDING' ? `REC${(2024000 + i + 1).toString()}` : null,
      },
    });
  }

  // Create Attendance (30 days)
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    for (const student of students) {
      const statuses: AttendanceStatus[] = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE'];
      await prisma.attendance.create({
        data: {
          studentId: student.id, subjectId: subjects[0].id,
          academicSessionId: session.id, date,
          status: statuses[Math.floor(Math.random() * 5)],
        },
      });
    }
  }

  // Create Examinations
  const exam = await prisma.examination.create({
    data: {
      institutionId: institution.id, departmentId: departments[0].id,
      academicSessionId: session.id, name: 'Mid-Term Exam 2024',
      type: 'MIDTERM', startDate: new Date('2024-10-15'),
      endDate: new Date('2024-10-25'), maxMarks: 100, passingMarks: 33,
    },
  });

  // Create Exam Results
  for (const student of students.slice(0, 10)) {
    for (const subject of subjects.slice(0, 5)) {
      const marks = Math.floor(Math.random() * 50) + 50;
      await prisma.examResult.create({
        data: {
          examinationId: exam.id, studentId: student.id, subjectId: subject.id,
          marksObtained: marks, grade: marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B+' : marks >= 60 ? 'B' : 'C',
          isPassed: marks >= 33,
        },
      });
    }
  }

  // Create Library Books
  const books = [
    { title: 'Introduction to Algorithms', author: 'Thomas Cormen', isbn: '978-0262033848', category: 'Computer Science' },
    { title: 'Clean Code', author: 'Robert Martin', isbn: '978-0132350884', category: 'Computer Science' },
    { title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', category: 'Computer Science' },
    { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', category: 'Computer Science' },
    { title: 'Engineering Physics', author: 'H.C. Verma', isbn: '978-8174091758', category: 'Physics' },
  ];

  const libraryBooks: any[] = [];
  for (const book of books) {
    const b = await prisma.libraryBook.create({
      data: {
        institutionId: institution.id, ...book,
        totalCopies: 10, availableCopies: 7, isActive: true,
      },
    });
    libraryBooks.push(b);
  }

  // Create Hostels
  const hostels = await Promise.all([
    prisma.hostel.create({ data: { institutionId: institution.id, name: 'Boys Hostel A', type: 'BOYS', capacity: 500 } }),
    prisma.hostel.create({ data: { institutionId: institution.id, name: 'Boys Hostel B', type: 'BOYS', capacity: 500 } }),
    prisma.hostel.create({ data: { institutionId: institution.id, name: 'Girls Hostel A', type: 'GIRLS', capacity: 500 } }),
    prisma.hostel.create({ data: { institutionId: institution.id, name: 'Girls Hostel B', type: 'GIRLS', capacity: 500 } }),
  ]);

  // Create Rooms
  for (const hostel of hostels) {
    for (let floor = 1; floor <= 5; floor++) {
      for (let room = 1; room <= 20; room++) {
        const capacity = Math.random() > 0.5 ? 2 : 3;
        const occupied = Math.floor(Math.random() * capacity);
        await prisma.hostelRoom.create({
          data: {
            hostelId: hostel.id, roomNumber: `${floor}${room.toString().padStart(2, '0')}`,
            floor, capacity, occupied, type: capacity === 2 ? 'double' : 'triple',
          },
        });
      }
    }
  }

  // Create Routes & Vehicles
  const routes = await Promise.all([
    prisma.route.create({ data: { institutionId: institution.id, name: 'Route A - North', code: 'RT001' } }),
    prisma.route.create({ data: { institutionId: institution.id, name: 'Route B - South', code: 'RT002' } }),
    prisma.route.create({ data: { institutionId: institution.id, name: 'Route C - East', code: 'RT003' } }),
  ]);

  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { institutionId: institution.id, registrationNumber: 'MH01AB1234', type: 'bus', capacity: 50 } }),
    prisma.vehicle.create({ data: { institutionId: institution.id, registrationNumber: 'MH01AB1235', type: 'bus', capacity: 50 } }),
    prisma.vehicle.create({ data: { institutionId: institution.id, registrationNumber: 'MH01CD5678', type: 'van', capacity: 20 } }),
  ]);

  // Create Notifications
  await prisma.notification.create({
    data: {
      institutionId: institution.id, senderId: chiefHead.id,
      title: 'Welcome to DEV ERP', message: 'The institution ERP system is now live. Please explore the platform.',
      type: 'INFO', target: 'ALL', priority: 'NORMAL', isSent: true, sentAt: new Date(),
    },
  });

  // Create Announcements
  await prisma.announcement.create({
    data: {
      institutionId: institution.id, authorId: chiefHead.id,
      title: 'Annual Day Celebration', content: 'The annual day celebration will be held on January 15, 2025.',
      type: 'EVENT', target: 'ALL', priority: 'HIGH', isPublished: true, publishedAt: new Date(),
    },
  });

  // Create Helpdesk Tickets
  const ticketData = [
    { title: 'Fee receipt not generated', category: 'finance', priority: 'HIGH' as const },
    { title: 'Hostel room change request', category: 'hostel', priority: 'NORMAL' as const },
    { title: 'Library book not found', category: 'library', priority: 'LOW' as const },
    { title: 'Timetable clash reported', category: 'academic', priority: 'URGENT' as const },
  ];

  for (const t of ticketData) {
    await prisma.helpdeskTicket.create({
      data: {
        institutionId: institution.id, creatorId: students[0].userId,
        title: t.title, description: t.title, category: t.category,
        priority: t.priority, status: 'OPEN',
      },
    });
  }

  // Create Workflows
  const workflowData = [
    { type: 'ADMISSION' as const, title: 'New student admission approval' },
    { type: 'FEE_WAIVER' as const, title: 'Scholarship fee waiver request' },
    { type: 'REFUND' as const, title: 'Fee refund request - Rs 15,000' },
  ];

  for (const w of workflowData) {
    await prisma.workflow.create({
      data: {
        institutionId: institution.id, creatorId: chiefHead.id,
        type: w.type, title: w.title, status: 'PENDING', priority: 'NORMAL',
      },
    });
  }

  // Create Audit Logs
  await prisma.auditLog.create({
    data: {
      institutionId: institution.id, userId: chiefHead.id,
      action: 'CREATE', entity: 'Institution', entityId: institution.id,
      newValues: { name: institution.name },
    },
  });

  console.log('Seed completed!');
  console.log('---');
  console.log('Login credentials:');
  console.log('Chief Head: admin@dev-erp.com / Admin@123');
  console.log('Director: director@dev-erp.com / Director@123');
  console.log('Principal: principal@dev-erp.com / Teacher@123');
  console.log('HOD CS: hod.cs@dev-erp.com / Teacher@123');
  console.log('Teacher: teacher1@dev-erp.com / Teacher@123');
  console.log('Accountant: accountant@dev-erp.com / Teacher@123');
  console.log('Student: student1@dev-erp.com / Student@123');

  // ========== Subscription Plans ==========
  console.log('\nSeeding subscription plans...');

  const basicFeatures = [
    'chief_head.dashboard', 'chief_head.authority_management', 'chief_head.fee_structure', 'chief_head.system_settings',
    'director.dashboard', 'director.department_performance', 'director.faculty_monitoring',
    'principal.dashboard', 'principal.departments', 'principal.attendance', 'principal.faculty_status', 'principal.students',
    'hod.dashboard', 'hod.department_overview', 'hod.teachers', 'hod.students',
    'teacher.dashboard', 'teacher.todays_schedule', 'teacher.take_attendance', 'teacher.student_list',
    'student.dashboard', 'student.my_subjects', 'student.timetable', 'student.attendance', 'student.fee_status',
    'parent.dashboard', 'parent.children', 'parent.attendance', 'parent.fees',
    'accountant.dashboard', 'accountant.collect_fees', 'accountant.student_ledger', 'accountant.outstanding_dues',
    'admission.dashboard', 'admission.all_applications', 'admission.new_application',
    'transport.dashboard', 'transport.vehicles', 'transport.drivers', 'transport.routes',
    'administrative.dashboard', 'administrative.student_requests', 'administrative.certificates',
    'librarian.dashboard', 'librarian.books', 'librarian.issue_book',
    'hostel.dashboard', 'hostel.buildings', 'hostel.rooms', 'hostel.students',
  ];

  const proFeatures = [
    'chief_head.dashboard', 'chief_head.authority_management', 'chief_head.fee_structure', 'chief_head.send_notification', 'chief_head.announcements',
    'chief_head.analytics_examinations', 'chief_head.analytics_faculty', 'chief_head.analytics_hostel', 'chief_head.analytics_transport',
    'chief_head.analytics_library', 'chief_head.analytics_helpdesk', 'chief_head.analytics_workflow', 'chief_head.analytics_notifications', 'chief_head.analytics_calendar',
    'chief_head.report_center', 'chief_head.custom_report_builder', 'chief_head.global_search', 'chief_head.student_analytics', 'chief_head.financial_dashboard',
    'chief_head.template_manager', 'chief_head.realtime_notifications', 'chief_head.system_settings', 'chief_head.permission_manager', 'chief_head.bulk_operations',
    'chief_head.data_backup_export', 'chief_head.audit_log', 'chief_head.appearance',
    'director.dashboard', 'director.department_performance', 'director.faculty_monitoring', 'director.student_analytics', 'director.examinations',
    'director.admissions', 'director.finance_view', 'director.hr_overview', 'director.campus_services', 'director.pending_approvals',
    'director.notifications', 'director.calendar', 'director.reports',
    'principal.dashboard', 'principal.departments', 'principal.timetable', 'principal.attendance', 'principal.lms',
    'principal.faculty_status', 'principal.class_coordinators', 'principal.subject_allocation', 'principal.leave_management', 'principal.performance',
    'principal.students', 'principal.admissions', 'principal.exam_dashboard', 'principal.finance_view', 'principal.discipline',
    'principal.hostel', 'principal.library', 'principal.transport', 'principal.approvals', 'principal.notifications',
    'principal.calendar', 'principal.helpdesk', 'principal.reports',
    'hod.dashboard', 'hod.department_overview', 'hod.timetable', 'hod.teachers', 'hod.workload', 'hod.faculty_attendance', 'hod.faculty_performance',
    'hod.students', 'hod.student_performance', 'hod.student_attendance', 'hod.courses', 'hod.subjects', 'hod.lms', 'hod.assignments',
    'hod.exams', 'hod.marks_entry', 'hod.notices', 'hod.approvals', 'hod.helpdesk', 'hod.calendar', 'hod.reports',
    'teacher.dashboard', 'teacher.todays_schedule', 'teacher.my_classes', 'teacher.subjects', 'teacher.take_attendance',
    'teacher.student_list', 'teacher.student_performance', 'teacher.assignments', 'teacher.lms_overview', 'teacher.exams',
    'teacher.marks_entry', 'teacher.leave', 'teacher.calendar', 'teacher.my_class', 'teacher.notifications', 'teacher.reports',
    'student.dashboard', 'student.my_subjects', 'student.timetable', 'student.attendance', 'student.performance',
    'student.assignments', 'student.study_materials', 'student.exam_schedule', 'student.results', 'student.fee_status',
    'student.library', 'student.hostel', 'student.transport', 'student.calendar', 'student.notices', 'student.documents', 'student.requests', 'student.profile',
    'parent.dashboard', 'parent.children', 'parent.attendance', 'parent.timetable', 'parent.performance', 'parent.assignments',
    'parent.exams', 'parent.fees', 'parent.transport', 'parent.hostel', 'parent.library', 'parent.notices', 'parent.ptm',
    'parent.leave', 'parent.complaints', 'parent.documents', 'parent.activity',
    'accountant.dashboard', 'accountant.collect_fees', 'accountant.student_ledger', 'accountant.outstanding_dues',
    'accountant.payment_verification', 'accountant.receipts', 'accountant.refunds', 'accountant.daily_reports', 'accountant.analytics', 'accountant.profile',
    'admission.dashboard', 'admission.all_applications', 'admission.new_application', 'admission.waiting_list',
    'admission.follow_ups', 'admission.reports', 'admission.analytics', 'admission.profile',
    'transport.dashboard', 'transport.vehicles', 'transport.drivers', 'transport.driver_attendance', 'transport.routes',
    'transport.student_allocation', 'transport.daily_schedule', 'transport.maintenance', 'transport.inspections',
    'transport.complaints', 'transport.reports', 'transport.profile',
    'administrative.dashboard', 'administrative.student_requests', 'administrative.certificates', 'administrative.notices',
    'administrative.meetings', 'administrative.documents', 'administrative.approval_tracking', 'administrative.complaints',
    'administrative.reports', 'administrative.profile',
    'librarian.dashboard', 'librarian.books', 'librarian.issue_book', 'librarian.returns_renewals',
    'librarian.overdue_books', 'librarian.fines', 'librarian.members', 'librarian.analytics',
    'hostel.dashboard', 'hostel.buildings', 'hostel.rooms', 'hostel.students', 'hostel.complaints', 'hostel.analytics', 'hostel.activity',
  ];

  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Free',
      code: 'free',
      description: 'Essential features for small institutions - limited access',
      planType: 'basic',
      modules: basicFeatures,
      monthlyPrice: 0,
      annualPrice: 0,
      userLimit: 50,
      storageLimitGB: 5,
      isActive: false,
      isDefault: true,
      sortOrder: 1,
      rolePricing: {
        create: [
          { role: 'CHIEF_HEAD', pricePerSeat: 0, isEnabled: true },
          { role: 'DIRECTOR', pricePerSeat: 0, isEnabled: true },
          { role: 'PRINCIPAL', pricePerSeat: 0, isEnabled: true },
          { role: 'HOD', pricePerSeat: 0, isEnabled: true },
          { role: 'TEACHER', pricePerSeat: 0, isEnabled: true },
          { role: 'STUDENT', pricePerSeat: 0, isEnabled: true },
          { role: 'PARENT', pricePerSeat: 0, isEnabled: true },
          { role: 'ACCOUNTANT', pricePerSeat: 0, isEnabled: true },
          { role: 'ADMISSION_COUNSELLOR', pricePerSeat: 0, isEnabled: true },
          { role: 'TRANSPORT_MANAGER', pricePerSeat: 0, isEnabled: true },
          { role: 'ADMINISTRATIVE_STAFF', pricePerSeat: 0, isEnabled: true },
          { role: 'LIBRARIAN', pricePerSeat: 0, isEnabled: true },
          { role: 'HOSTEL_WARDEN', pricePerSeat: 0, isEnabled: true },
        ],
      },
    },
  });
  console.log('Free plan created:', basicPlan.id);

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Pro',
      code: 'pro',
      description: 'All features unlocked - full access to the entire ERP system',
      planType: 'pro',
      modules: proFeatures,
      monthlyPrice: 14999,
      annualPrice: 149990,
      userLimit: 500,
      storageLimitGB: 50,
      isActive: true,
      isDefault: true,
      sortOrder: 2,
      rolePricing: {
        create: [
          { role: 'CHIEF_HEAD', pricePerSeat: 800, isEnabled: true },
          { role: 'DIRECTOR', pricePerSeat: 600, isEnabled: true },
          { role: 'PRINCIPAL', pricePerSeat: 500, isEnabled: true },
          { role: 'HOD', pricePerSeat: 400, isEnabled: true },
          { role: 'TEACHER', pricePerSeat: 300, isEnabled: true },
          { role: 'STUDENT', pricePerSeat: 75, isEnabled: true },
          { role: 'PARENT', pricePerSeat: 0, isEnabled: true },
          { role: 'ACCOUNTANT', pricePerSeat: 350, isEnabled: true },
          { role: 'ADMISSION_COUNSELLOR', pricePerSeat: 300, isEnabled: true },
          { role: 'TRANSPORT_MANAGER', pricePerSeat: 300, isEnabled: true },
          { role: 'ADMINISTRATIVE_STAFF', pricePerSeat: 250, isEnabled: true },
          { role: 'LIBRARIAN', pricePerSeat: 200, isEnabled: true },
          { role: 'HOSTEL_WARDEN', pricePerSeat: 200, isEnabled: true },
        ],
      },
    },
  });
  console.log('Pro plan created:', proPlan.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
