import { PrismaClient, Prisma, LibraryBookStatus, IssueStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBookData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publishYear?: number;
  edition?: string;
  language?: string;
  totalCopies: number;
  location?: string;
  rack?: string;
}

interface UpdateBookData {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  publisher?: string;
  publishYear?: number;
  edition?: string;
  language?: string;
  totalCopies?: number;
  availableCopies?: number;
  location?: string;
  rack?: string;
}

interface IssueBookData {
  bookId: string;
  studentId?: string;
  employeeId?: string;
  issuedBy?: string;
  remarks?: string;
}

interface ReturnBookData {
  remarks?: string;
}

interface BookFilters {
  search?: string;
  category?: string;
  availability?: 'available' | 'unavailable';
}

interface IssueFilters {
  status?: IssueStatus;
}

export class LibrarianService {
  static async getDashboard(institutionId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      totalBooks,
      booksAgg,
      issuedBooks,
      overdueBooks,
      lostBooks,
      finesAgg,
      todayIssues,
      todayReturns,
      recentIssues,
      categoryBreakdown,
    ] = await Promise.all([
      prisma.libraryBook.findMany({
        where: { institutionId, isActive: true },
        select: { id: true },
      }),
      prisma.libraryBook.aggregate({
        where: { institutionId, isActive: true },
        _sum: { totalCopies: true, availableCopies: true },
      }),
      prisma.libraryIssue.count({
        where: {
          book: { institutionId },
          status: 'issued',
        },
      }),
      prisma.libraryIssue.count({
        where: {
          book: { institutionId },
          status: 'overdue',
        },
      }),
      prisma.libraryIssue.count({
        where: {
          book: { institutionId },
          status: 'lost',
        },
      }),
      prisma.libraryIssue.aggregate({
        where: {
          book: { institutionId },
          fine: { not: null },
        },
        _sum: { fine: true },
        _count: { fine: true },
      }),
      prisma.libraryIssue.count({
        where: {
          book: { institutionId },
          issueDate: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.libraryIssue.count({
        where: {
          book: { institutionId },
          returnDate: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.libraryIssue.findMany({
        where: { book: { institutionId } },
        include: {
          book: { select: { id: true, title: true, author: true } },
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          employee: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.libraryBook.groupBy({
        by: ['category'],
        where: { institutionId, isActive: true },
        _count: { id: true },
        _sum: { totalCopies: true },
      }),
    ]);

    const totalFine = Number(finesAgg._sum.fine ?? 0);
    const pendingFines = await prisma.libraryIssue.aggregate({
      where: {
        book: { institutionId },
        fine: { not: null },
        finePaid: false,
      },
      _sum: { fine: true },
    });
    const pendingFineAmount = Number(pendingFines._sum.fine ?? 0);

    const activeMembers = await prisma.libraryIssue.groupBy({
      by: ['studentId', 'employeeId'],
      where: {
        book: { institutionId },
        status: { in: ['issued', 'overdue'] },
        OR: [
          { studentId: { not: null } },
          { employeeId: { not: null } },
        ],
      },
      _count: { id: true },
    });

    return {
      totalBooks: totalBooks.length,
      totalCopies: Number(booksAgg._sum.totalCopies ?? 0),
      availableCopies: Number(booksAgg._sum.availableCopies ?? 0),
      issuedBooks,
      overdueBooks,
      lostBooks,
      totalFines: totalFine,
      pendingFines: pendingFineAmount,
      collectedFines: totalFine - pendingFineAmount,
      activeMembers: activeMembers.length,
      todayIssues,
      todayReturns,
      recentIssues,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        count: c._count.id,
        copies: Number(c._sum.totalCopies ?? 0),
      })),
    };
  }

  static async getBooks(institutionId: string, filters?: BookFilters) {
    const where: Prisma.LibraryBookWhereInput = {
      institutionId,
      isActive: true,
    };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } },
        { isbn: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.availability === 'available') {
      where.availableCopies = { gt: 0 };
    } else if (filters?.availability === 'unavailable') {
      where.availableCopies = 0;
    }

    const books = await prisma.libraryBook.findMany({
      where,
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    return books;
  }

  static async getBookDetail(id: string) {
    const book = await prisma.libraryBook.findUnique({
      where: { id },
      include: {
        issues: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
            employee: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    return book;
  }

  static async createBook(institutionId: string, data: CreateBookData) {
    const book = await prisma.libraryBook.create({
      data: {
        institutionId,
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        category: data.category,
        publisher: data.publisher,
        publishYear: data.publishYear,
        edition: data.edition,
        language: data.language,
        totalCopies: data.totalCopies,
        availableCopies: data.totalCopies,
        location: data.location,
        rack: data.rack,
        isActive: true,
      },
    });

    return book;
  }

  static async updateBook(id: string, data: UpdateBookData) {
    const existing = await prisma.libraryBook.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Book not found');
    }

    if (data.totalCopies !== undefined && data.totalCopies !== existing.totalCopies) {
      const difference = data.totalCopies - existing.totalCopies;
      data.availableCopies = existing.availableCopies + difference;
    }

    const book = await prisma.libraryBook.update({
      where: { id },
      data,
    });

    return book;
  }

  static async deleteBook(id: string) {
    const existing = await prisma.libraryBook.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Book not found');
    }

    await prisma.libraryBook.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Book deleted successfully' };
  }

  static async issueBook(institutionId: string, data: IssueBookData) {
    const book = await prisma.libraryBook.findUnique({
      where: { id: data.bookId },
    });

    if (!book || book.institutionId !== institutionId) {
      throw new Error('Book not found');
    }

    if (book.availableCopies <= 0) {
      throw new Error('No copies available for issue');
    }

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);

    const issue = await prisma.libraryIssue.create({
      data: {
        bookId: data.bookId,
        studentId: data.studentId,
        employeeId: data.employeeId,
        issueDate,
        dueDate,
        status: 'issued',
        issuedBy: data.issuedBy,
        remarks: data.remarks,
      },
      include: {
        book: { select: { id: true, title: true, author: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    await prisma.libraryBook.update({
      where: { id: data.bookId },
      data: { availableCopies: { decrement: 1 } },
    });

    return issue;
  }

  static async returnBook(issueId: string, data?: ReturnBookData) {
    const issue = await prisma.libraryIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new Error('Issue record not found');
    }

    if (issue.status === 'returned') {
      throw new Error('Book already returned');
    }

    const returnDate = new Date();
    let fine: number | null = null;

    if (returnDate > issue.dueDate) {
      const overdueDays = Math.ceil(
        (returnDate.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      fine = overdueDays * 5;
    }

    const updated = await prisma.libraryIssue.update({
      where: { id: issueId },
      data: {
        returnDate,
        status: 'returned',
        fine,
        finePaid: false,
        remarks: data?.remarks,
      },
      include: {
        book: { select: { id: true, title: true, author: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    await prisma.libraryBook.update({
      where: { id: issue.bookId },
      data: { availableCopies: { increment: 1 } },
    });

    return updated;
  }

  static async renewBook(issueId: string) {
    const issue = await prisma.libraryIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new Error('Issue record not found');
    }

    if (issue.status !== 'issued') {
      throw new Error('Only issued books can be renewed');
    }

    const newDueDate = new Date(issue.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);

    const updated = await prisma.libraryIssue.update({
      where: { id: issueId },
      data: { dueDate: newDueDate },
      include: {
        book: { select: { id: true, title: true, author: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return updated;
  }

  static async getIssues(institutionId: string, filters?: IssueFilters) {
    const where: Prisma.LibraryIssueWhereInput = {
      book: { institutionId },
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    const issues = await prisma.libraryIssue.findMany({
      where,
      include: {
        book: { select: { id: true, title: true, author: true, isbn: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            department: { select: { name: true } },
            course: { select: { name: true } },
          },
        },
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return issues;
  }

  static async getOverdueBooks(institutionId: string) {
    const issues = await prisma.libraryIssue.findMany({
      where: {
        book: { institutionId },
        status: { in: ['issued', 'overdue'] },
        returnDate: null,
      },
      include: {
        book: { select: { id: true, title: true, author: true, isbn: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    const now = new Date();
    const overdueWithFine = issues
      .filter((issue) => now > issue.dueDate)
      .map((issue) => {
        const overdueDays = Math.ceil(
          (now.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const calculatedFine = overdueDays * 5;
        return {
          ...issue,
          overdueDays,
          calculatedFine,
        };
      });

    return overdueWithFine;
  }

  static async collectFine(issueId: string, data?: { remarks?: string }) {
    const issue = await prisma.libraryIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new Error('Issue record not found');
    }

    if (issue.fine === null || issue.fine === 0) {
      throw new Error('No fine to collect');
    }

    if (issue.finePaid) {
      throw new Error('Fine already paid');
    }

    const updated = await prisma.libraryIssue.update({
      where: { id: issueId },
      data: {
        finePaid: true,
        remarks: data?.remarks,
      },
      include: {
        book: { select: { id: true, title: true, author: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return updated;
  }

  static async getFines(institutionId: string) {
    const fines = await prisma.libraryIssue.findMany({
      where: {
        book: { institutionId },
        fine: { not: null },
      },
      include: {
        book: { select: { id: true, title: true, author: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalPending = fines
      .filter((f) => !f.finePaid)
      .reduce((sum, f) => sum + Number(f.fine ?? 0), 0);

    const totalCollected = fines
      .filter((f) => f.finePaid)
      .reduce((sum, f) => sum + Number(f.fine ?? 0), 0);

    return {
      fines,
      totalPending,
      totalCollected,
      totalFines: totalPending + totalCollected,
    };
  }

  static async getMembers(institutionId: string) {
    const activeIssues = await prisma.libraryIssue.findMany({
      where: {
        book: { institutionId },
        status: { in: ['issued', 'overdue'] },
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            department: { select: { name: true } },
            course: { select: { name: true } },
          },
        },
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            department: { select: { name: true } },
          },
        },
      },
    });

    const memberMap = new Map<
      string,
      {
        type: 'student' | 'employee';
        id: string;
        name: string;
        email: string;
        department?: string;
        course?: string;
        issueCount: number;
        totalFines: number;
      }
    >();

    for (const issue of activeIssues) {
      if (issue.student) {
        const key = `student-${issue.studentId}`;
        if (!memberMap.has(key)) {
          memberMap.set(key, {
            type: 'student',
            id: issue.studentId!,
            name: `${issue.student.user.firstName} ${issue.student.user.lastName}`,
            email: issue.student.user.email,
            department: issue.student.department?.name,
            course: issue.student.course?.name,
            issueCount: 0,
            totalFines: 0,
          });
        }
        const member = memberMap.get(key)!;
        member.issueCount += 1;
      } else if (issue.employee) {
        const key = `employee-${issue.employeeId}`;
        if (!memberMap.has(key)) {
          memberMap.set(key, {
            type: 'employee',
            id: issue.employeeId!,
            name: `${issue.employee.user.firstName} ${issue.employee.user.lastName}`,
            email: issue.employee.user.email,
            department: issue.employee.department?.name,
            issueCount: 0,
            totalFines: 0,
          });
        }
        const member = memberMap.get(key)!;
        member.issueCount += 1;
      }
    }

    const memberIds = Array.from(memberMap.values());
    const memberIdsList = memberIds.map((m) => m.id);

    const allFines = await prisma.libraryIssue.groupBy({
      by: ['studentId', 'employeeId'],
      where: {
        book: { institutionId },
        fine: { not: null },
        OR: [
          { studentId: { in: memberIdsList } },
          { employeeId: { in: memberIdsList } },
        ],
      },
      _sum: { fine: true },
    });

    for (const fineGroup of allFines) {
      const studentId = fineGroup.studentId;
      const employeeId = fineGroup.employeeId;
      if (studentId) {
        const key = `student-${studentId}`;
        if (memberMap.has(key)) {
          memberMap.get(key)!.totalFines = Number(fineGroup._sum.fine ?? 0);
        }
      }
      if (employeeId) {
        const key = `employee-${employeeId}`;
        if (memberMap.has(key)) {
          memberMap.get(key)!.totalFines = Number(fineGroup._sum.fine ?? 0);
        }
      }
    }

    return Array.from(memberMap.values());
  }

  static async getCategories(institutionId: string) {
    const categories = await prisma.libraryBook.groupBy({
      by: ['category'],
      where: { institutionId, isActive: true },
      _count: { id: true },
      _sum: { totalCopies: true, availableCopies: true },
    });

    return categories.map((c) => ({
      category: c.category,
      count: c._count.id,
      totalCopies: Number(c._sum.totalCopies ?? 0),
      availableCopies: Number(c._sum.availableCopies ?? 0),
    }));
  }

  static async getAnalytics(institutionId: string) {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [issues, returns, popularBooks, categoryDistribution, fines] =
      await Promise.all([
        prisma.libraryIssue.findMany({
          where: {
            book: { institutionId },
            issueDate: { gte: twelveMonthsAgo },
          },
          select: { issueDate: true },
        }),
        prisma.libraryIssue.findMany({
          where: {
            book: { institutionId },
            returnDate: { gte: twelveMonthsAgo },
            returnDate: { not: null },
          },
          select: { returnDate: true },
        }),
        prisma.libraryBook.findMany({
          where: { institutionId, isActive: true },
          select: {
            id: true,
            title: true,
            author: true,
            _count: { select: { issues: true } },
          },
          orderBy: { issues: { _count: 'desc' } },
          take: 10,
        }),
        prisma.libraryBook.groupBy({
          by: ['category'],
          where: { institutionId, isActive: true },
          _count: { id: true },
          _sum: { totalCopies: true },
        }),
        prisma.libraryIssue.findMany({
          where: {
            book: { institutionId },
            fine: { not: null },
            createdAt: { gte: twelveMonthsAgo },
          },
          select: { fine: true, finePaid: true, createdAt: true },
        }),
      ]);

    const issuesByMonth: { month: string; count: number }[] = [];
    const returnsByMonth: { month: string; count: number }[] = [];
    const fineCollection: { month: string; pending: number; collected: number }[] =
      [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });

      const monthIssues = issues.filter((issue) => {
        const d = new Date(issue.issueDate);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth()
        );
      });

      const monthReturns = returns.filter((ret) => {
        const d = new Date(ret.returnDate!);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth()
        );
      });

      const monthFines = fines.filter((f) => {
        const d = new Date(f.createdAt);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth()
        );
      });

      issuesByMonth.push({ month: monthLabel, count: monthIssues.length });
      returnsByMonth.push({ month: monthLabel, count: monthReturns.length });
      fineCollection.push({
        month: monthLabel,
        pending: monthFines
          .filter((f) => !f.finePaid)
          .reduce((sum, f) => sum + Number(f.fine ?? 0), 0),
        collected: monthFines
          .filter((f) => f.finePaid)
          .reduce((sum, f) => sum + Number(f.fine ?? 0), 0),
      });
    }

    return {
      issuesByMonth,
      returnsByMonth,
      popularBooks: popularBooks.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        issueCount: b._count.issues,
      })),
      categoryDistribution: categoryDistribution.map((c) => ({
        category: c.category,
        count: c._count.id,
        copies: Number(c._sum.totalCopies ?? 0),
      })),
      fineCollection,
    };
  }

  static async getActivities(institutionId: string) {
    const [issues, returns, fines] = await Promise.all([
      prisma.libraryIssue.findMany({
        where: { book: { institutionId } },
        include: {
          book: { select: { id: true, title: true } },
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          employee: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.libraryIssue.findMany({
        where: {
          book: { institutionId },
          returnDate: { not: null },
        },
        include: {
          book: { select: { id: true, title: true } },
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          employee: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { returnDate: 'desc' },
        take: 20,
      }),
      prisma.libraryIssue.findMany({
        where: {
          book: { institutionId },
          finePaid: true,
        },
        include: {
          book: { select: { id: true, title: true } },
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          employee: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
    ]);

    const activities: {
      type: string;
      date: Date | string | null;
      description: string;
      book: string;
      member: string;
      details: Record<string, unknown>;
    }[] = [];

    for (const issue of issues) {
      const memberName = issue.student
        ? `${issue.student.user.firstName} ${issue.student.user.lastName}`
        : issue.employee
          ? `${issue.employee.user.firstName} ${issue.employee.user.lastName}`
          : 'Unknown';

      activities.push({
        type: 'issue',
        date: issue.issueDate,
        description: `Book issued to ${memberName}`,
        book: issue.book.title,
        member: memberName,
        details: {
          issueId: issue.id,
          dueDate: issue.dueDate,
          status: issue.status,
        },
      });
    }

    for (const ret of returns) {
      const memberName = ret.student
        ? `${ret.student.user.firstName} ${ret.student.user.lastName}`
        : ret.employee
          ? `${ret.employee.user.firstName} ${ret.employee.user.lastName}`
          : 'Unknown';

      activities.push({
        type: 'return',
        date: ret.returnDate,
        description: `Book returned by ${memberName}`,
        book: ret.book.title,
        member: memberName,
        details: {
          issueId: ret.id,
          fine: ret.fine,
          finePaid: ret.finePaid,
        },
      });
    }

    for (const fine of fines) {
      const memberName = fine.student
        ? `${fine.student.user.firstName} ${fine.student.user.lastName}`
        : fine.employee
          ? `${fine.employee.user.firstName} ${fine.employee.user.lastName}`
          : 'Unknown';

      activities.push({
        type: 'fine',
        date: fine.updatedAt,
        description: `Fine of ₹${fine.fine} collected from ${memberName}`,
        book: fine.book.title,
        member: memberName,
        details: {
          issueId: fine.id,
          fine: fine.fine,
          finePaid: fine.finePaid,
        },
      });
    }

    activities.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    return activities.slice(0, 50);
  }
}
