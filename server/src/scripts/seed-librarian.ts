import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting librarian seeding...\n');

  const institution = await prisma.institution.findFirst();
  if (!institution) {
    throw new Error('No institution found. Please seed institutions first.');
  }
  console.log(`Using institution: ${institution.name} (${institution.id})`);

  // ========================================
  // 1. Librarian User
  // ========================================
  console.log('1. Seeding librarian user...');
  const hashedPassword = await bcrypt.hash('Librarian@123', 10);

  const librarianUser = await prisma.user.upsert({
    where: { email: 'librarian@dev-erp.com' },
    update: {},
    create: {
      email: 'librarian@dev-erp.com',
      password: hashedPassword,
      role: 'LIBRARIAN',
      firstName: 'Priya',
      lastName: 'Sharma',
      fullName: 'Priya Sharma',
      phone: '9876543300',
      institutionId: institution.id,
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`   Librarian user: ${librarianUser.id}`);

  // ========================================
  // 2. Employee Record for Librarian
  // ========================================
  console.log('\n2. Seeding librarian employee record...');

  const department = await prisma.department.findFirst({
    where: { institutionId: institution.id, name: 'Library' },
  });

  let departmentId = department?.id;
  if (!departmentId) {
    const libDept = await prisma.department.create({
      data: {
        institutionId: institution.id,
        name: 'Library',
        code: 'LIB',
        description: 'Library and Information Services',
        isActive: true,
      },
    });
    departmentId = libDept.id;
    console.log('   Created Library department');
  }

  const existingEmployee = await prisma.employee.findFirst({
    where: { userId: librarianUser.id },
  });

  const employeeCode = 'EMP-LIB-001';
  let librarianEmployee;
  if (existingEmployee) {
    librarianEmployee = existingEmployee;
    console.log(`   Employee record already exists: ${librarianEmployee.id}`);
  } else {
    librarianEmployee = await prisma.employee.create({
      data: {
        institutionId: institution.id,
        departmentId,
        userId: librarianUser.id,
        employeeCode,
        designation: 'Senior Librarian',
        department: 'LIBRARY',
        qualification: 'MLIS, Bachelor of Arts',
        experience: 8,
        dateOfJoining: new Date('2018-07-01'),
        employmentType: 'full_time',
        salary: new Prisma.Decimal(55000),
        isActive: true,
      },
    });
    console.log(`   Librarian employee: ${librarianEmployee.id}`);
  }

  // ========================================
  // 3. Library Books (15 books)
  // ========================================
  console.log('\n3. Seeding library books...');

  const booksData = [
    {
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      isbn: '978-0262033848',
      category: 'Computer Science',
      publisher: 'MIT Press',
      publishYear: 2009,
      edition: '3rd',
      totalCopies: 5,
      availableCopies: 3,
      location: 'CS Shelf A1',
      rack: 'R1',
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0553380163',
      category: 'Physics',
      publisher: 'Bantam Books',
      publishYear: 1998,
      edition: '10th Anniversary',
      totalCopies: 4,
      availableCopies: 2,
      location: 'Science Shelf B2',
      rack: 'R3',
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      category: 'Fiction',
      publisher: 'Scribner',
      publishYear: 2004,
      edition: 'Reprint',
      totalCopies: 3,
      availableCopies: 2,
      location: 'Fiction Shelf C1',
      rack: 'R5',
    },
    {
      title: 'Principles of Economics',
      author: 'N. Gregory Mankiw',
      isbn: '978-1305585126',
      category: 'Economics',
      publisher: 'Cengage Learning',
      publishYear: 2015,
      edition: '7th',
      totalCopies: 4,
      availableCopies: 3,
      location: 'Commerce Shelf D1',
      rack: 'R7',
    },
    {
      title: 'Campbell Biology',
      author: 'Lisa A. Urry, Michael L. Cain, Steven A. Wasserman',
      isbn: '978-0135188743',
      category: 'Biology',
      publisher: 'Pearson',
      publishYear: 2016,
      edition: '11th',
      totalCopies: 5,
      availableCopies: 3,
      location: 'Science Shelf B3',
      rack: 'R4',
    },
    {
      title: 'Organic Chemistry',
      author: 'Clayden, Greeves, Warren',
      isbn: '978-0199270286',
      category: 'Chemistry',
      publisher: 'Oxford University Press',
      publishYear: 2012,
      edition: '2nd',
      totalCopies: 4,
      availableCopies: 2,
      location: 'Science Shelf B4',
      rack: 'R4',
    },
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      category: 'History',
      publisher: 'Harper Perennial',
      publishYear: 2015,
      edition: 'Reprint',
      totalCopies: 3,
      availableCopies: 3,
      location: 'History Shelf E1',
      rack: 'R8',
    },
    {
      title: 'Linear Algebra and Its Applications',
      author: 'Gilbert Strang',
      isbn: '978-0030105678',
      category: 'Mathematics',
      publisher: 'Cengage Learning',
      publishYear: 2005,
      edition: '4th',
      totalCopies: 4,
      availableCopies: 2,
      location: 'Math Shelf F1',
      rack: 'R9',
    },
    {
      title: 'Fundamentals of Physics',
      author: 'David Halliday, Robert Resnick, Jearl Walker',
      isbn: '978-1118230718',
      category: 'Physics',
      publisher: 'Wiley',
      publishYear: 2013,
      edition: '10th',
      totalCopies: 5,
      availableCopies: 4,
      location: 'Science Shelf B1',
      rack: 'R3',
    },
    {
      title: 'Modern Computer Architecture',
      author: 'David A. Patterson, John L. Hennessy',
      isbn: '978-0124077263',
      category: 'Computer Science',
      publisher: 'Morgan Kaufmann',
      publishYear: 2017,
      edition: '5th',
      totalCopies: 4,
      availableCopies: 3,
      location: 'CS Shelf A2',
      rack: 'R2',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '978-0141439518',
      category: 'Literature',
      publisher: 'Penguin Classics',
      publishYear: 2003,
      edition: 'Revised',
      totalCopies: 3,
      availableCopies: 2,
      location: 'Literature Shelf G1',
      rack: 'R6',
    },
    {
      title: 'Microeconomics',
      author: 'Paul Krugman, Robin Wells',
      isbn: '978-1319040581',
      category: 'Economics',
      publisher: 'Worth Publishers',
      publishYear: 2018,
      edition: '5th',
      totalCopies: 3,
      availableCopies: 2,
      location: 'Commerce Shelf D2',
      rack: 'R7',
    },
    {
      title: 'Advanced Engineering Mathematics',
      author: 'Erwin Kreyszig',
      isbn: '978-0470458365',
      category: 'Mathematics',
      publisher: 'Wiley',
      publishYear: 2010,
      edition: '10th',
      totalCopies: 4,
      availableCopies: 3,
      location: 'Math Shelf F2',
      rack: 'R9',
    },
    {
      title: 'Molecular Biology of the Cell',
      author: 'Bruce Alberts, Rebecca Heald, Alexander Johnson',
      isbn: '978-0393884821',
      category: 'Biology',
      publisher: 'W. W. Norton',
      publishYear: 2022,
      edition: '7th',
      totalCopies: 4,
      availableCopies: 2,
      location: 'Science Shelf B5',
      rack: 'R5',
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      category: 'Fiction',
      publisher: 'Signet Classics',
      publishYear: 2003,
      edition: 'Reprint',
      totalCopies: 3,
      availableCopies: 2,
      location: 'Fiction Shelf C2',
      rack: 'R5',
    },
  ];

  let booksCreated = 0;
  const createdBooks: any[] = [];

  for (const bd of booksData) {
    try {
      const existingBook = await prisma.libraryBook.findUnique({
        where: { isbn: bd.isbn },
      });

      if (existingBook) {
        console.log(`   Book "${bd.title}" already exists, skipping`);
        createdBooks.push(existingBook);
        continue;
      }

      const book = await prisma.libraryBook.create({
        data: {
          institutionId: institution.id,
          title: bd.title,
          author: bd.author,
          isbn: bd.isbn,
          category: bd.category,
          publisher: bd.publisher,
          publishYear: bd.publishYear,
          edition: bd.edition,
          language: 'English',
          totalCopies: bd.totalCopies,
          availableCopies: bd.availableCopies,
          location: bd.location,
          rack: bd.rack,
          isActive: true,
        },
      });
      createdBooks.push(book);
      booksCreated++;
      console.log(`   Book: "${bd.title}" (${bd.category}) - ${bd.totalCopies} copies`);
    } catch (e: any) {
      console.log(`   Error creating book "${bd.title}": ${e.message}`);
    }
  }
  console.log(`   Total books created: ${booksCreated}`);

  // ========================================
  // 4. Library Issues (10 issues)
  // ========================================
  console.log('\n4. Seeding library issues...');

  const students = await prisma.student.findMany({
    where: { institutionId: institution.id },
    take: 10,
  });

  if (students.length === 0) {
    console.log('   No students found. Skipping library issues.');
    console.log('\n========================================');
    console.log('Librarian seeding completed!');
    console.log('========================================');
    console.log(`Login: librarian@dev-erp.com / Librarian@123`);
    console.log(`Books created: ${booksCreated}`);
    return;
  }

  console.log(`   Found ${students.length} students`);

  const now = new Date();

  // Helper to create dates
  const daysAgo = (days: number): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };
  const daysFromNow = (days: number): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  const issuesData = [
    // 6 ACTIVE (issued) - issued in last 10 days, due in next 4-10 days
    { bookIdx: 0, studentIdx: 0, issueDaysAgo: 3, dueDaysFromNow: 7, status: 'issued', returnDate: null, fine: 0 },
    { bookIdx: 1, studentIdx: 1, issueDaysAgo: 5, dueDaysFromNow: 6, status: 'issued', returnDate: null, fine: 0 },
    { bookIdx: 2, studentIdx: 2, issueDaysAgo: 2, dueDaysFromNow: 9, status: 'issued', returnDate: null, fine: 0 },
    { bookIdx: 3, studentIdx: 3, issueDaysAgo: 7, dueDaysFromNow: 5, status: 'issued', returnDate: null, fine: 0 },
    { bookIdx: 4, studentIdx: 4, issueDaysAgo: 1, dueDaysFromNow: 10, status: 'issued', returnDate: null, fine: 0 },
    { bookIdx: 5, studentIdx: 5, issueDaysAgo: 8, dueDaysFromNow: 4, status: 'issued', returnDate: null, fine: 0 },

    // 2 RETURNED - issued 20-30 days ago
    { bookIdx: 6, studentIdx: 6, issueDaysAgo: 25, dueDaysFromNow: -11, status: 'returned', returnDateOffset: -2, fine: 0 },
    { bookIdx: 7, studentIdx: 7, issueDaysAgo: 30, dueDaysFromNow: -16, status: 'returned', returnDateOffset: -1, fine: 0 },

    // 2 OVERDUE - issued 30+ days ago, due dates passed
    { bookIdx: 8, studentIdx: 0, issueDaysAgo: 35, dueDaysFromNow: -21, status: 'overdue', returnDate: null, fine: 50 },
    { bookIdx: 9, studentIdx: 1, issueDaysAgo: 40, dueDaysFromNow: -26, status: 'overdue', returnDate: null, fine: 100 },
  ];

  let issuesCreated = 0;

  for (const issue of issuesData) {
    const book = createdBooks[issue.bookIdx];
    const student = students[issue.studentIdx];

    if (!book || !student) continue;

    // Check for existing issue to avoid duplicates
    const existingIssue = await prisma.libraryIssue.findFirst({
      where: {
        bookId: book.id,
        studentId: student.id,
        status: issue.status as any,
      },
    });

    if (existingIssue) {
      console.log(`   Issue for "${book.title}" -> student ${student.id} already exists, skipping`);
      continue;
    }

    try {
      const issueDate = daysAgo(issue.issueDaysAgo);
      const dueDate = daysFromNow(issue.dueDaysFromNow);

      const returnDate = issue.returnDate !== undefined && issue.returnDate !== null
        ? daysAgo(Math.abs(issue.returnDate as number))
        : issue.returnDateOffset !== undefined
          ? daysAgo(Math.abs(issue.returnDateOffset))
          : null;

      await prisma.libraryIssue.create({
        data: {
          bookId: book.id,
          studentId: student.id,
          employeeId: librarianEmployee.id,
          issueDate,
          dueDate,
          returnDate,
          status: issue.status,
          fine: new Prisma.Decimal(issue.fine),
          finePaid: issue.fine > 0 ? false : false,
          issuedBy: librarianUser.id,
          remarks: issue.status === 'overdue'
            ? `Overdue by ${Math.abs(issue.dueDaysFromNow)} days`
            : issue.status === 'returned'
              ? 'Returned on time'
              : null,
        },
      });

      // Decrement availableCopies for active/overdue books
      if (issue.status === 'issued' || issue.status === 'overdue') {
        await prisma.libraryBook.update({
          where: { id: book.id },
          data: { availableCopies: Math.max(0, book.availableCopies - 1) },
        });
      }

      issuesCreated++;
      const studentUser = await prisma.user.findUnique({ where: { id: student.userId } });
      console.log(`   Issue: "${book.title}" -> ${studentUser?.firstName} ${studentUser?.lastName} [${issue.status}]`);
    } catch (e: any) {
      console.log(`   Error creating issue for "${book.title}": ${e.message}`);
    }
  }
  console.log(`   Total issues created: ${issuesCreated}`);

  console.log('\n========================================');
  console.log('Librarian seeding completed!');
  console.log('========================================');
  console.log(`Login: librarian@dev-erp.com / Librarian@123`);
  console.log(`Books created: ${booksCreated}`);
  console.log(`Issues created: ${issuesCreated}`);
  console.log(`Overdue fines: ₹50 + ₹100 = ₹150`);
}

main()
  .catch((e) => {
    console.error('Error during librarian seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
