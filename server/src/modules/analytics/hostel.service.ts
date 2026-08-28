import { prisma } from '../../config/database';

class HostelService {
  async getDashboard(institutionId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [hostels, rooms, hostelStudents, complaints, todayCheckIns, todayCheckOuts, recentComplaints] = await Promise.all([
      prisma.hostel.findMany({
        where: { institutionId },
        select: { id: true, name: true, type: true, capacity: true },
      }),
      prisma.hostelRoom.findMany({
        where: { hostel: { institutionId } },
        select: { capacity: true, occupied: true },
      }),
      prisma.student.count({
        where: { institutionId, isHostelStudent: true },
      }),
      prisma.helpdeskTicket.findMany({
        where: { institutionId, category: 'hostel' },
        select: { status: true },
      }),
      prisma.student.count({
        where: {
          institutionId,
          isHostelStudent: true,
          hostelId: { not: null },
          updatedAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      prisma.student.count({
        where: {
          institutionId,
          isHostelStudent: false,
          hostelId: null,
          updatedAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      prisma.helpdeskTicket.findMany({
        where: { institutionId, category: 'hostel' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          creator: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    const totalHostels = hostels.length;
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.occupied > 0).length;
    const vacantRooms = totalRooms - occupiedRooms;
    const totalRoomCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
    const totalOccupied = rooms.reduce((sum, r) => sum + r.occupied, 0);
    const occupancyRate = totalRoomCapacity > 0 ? Math.round((totalOccupied / totalRoomCapacity) * 100) : 0;
    const pendingComplaints = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
    const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

    const hostelWiseStats = hostels.map((h) => {
      const hostelRooms = rooms;
      const capacity = h.capacity;
      const occupied = totalOccupied;
      return {
        name: h.name,
        type: h.type,
        capacity,
        occupied,
        rate: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0,
      };
    });

    // Compute per-hostel stats properly
    const allHostelRooms = await prisma.hostelRoom.findMany({
      where: { hostel: { institutionId } },
      select: { hostelId: true, capacity: true, occupied: true },
    });

    const hostelRoomMap = new Map<string, { capacity: number; occupied: number }>();
    for (const r of allHostelRooms) {
      const existing = hostelRoomMap.get(r.hostelId) || { capacity: 0, occupied: 0 };
      existing.capacity += r.capacity;
      existing.occupied += r.occupied;
      hostelRoomMap.set(r.hostelId, existing);
    }

    const hostelStats = hostels.map((h) => {
      const stats = hostelRoomMap.get(h.id) || { capacity: 0, occupied: 0 };
      return {
        name: h.name,
        type: h.type,
        capacity: stats.capacity,
        occupied: stats.occupied,
        rate: stats.capacity > 0 ? Math.round((stats.occupied / stats.capacity) * 100) : 0,
      };
    });

    return {
      totalHostels,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      occupancyRate,
      totalStudents: hostelStudents,
      pendingComplaints,
      resolvedComplaints,
      todayCheckIns,
      todayCheckOuts,
      recentComplaints: recentComplaints.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        status: c.status,
        priority: c.priority,
        creator: c.creator ? `${c.creator.firstName} ${c.creator.lastName}` : null,
        createdAt: c.createdAt,
      })),
      hostelWiseStats: hostelStats,
    };
  }

  async getHostels(institutionId: string) {
    const hostels = await prisma.hostel.findMany({
      where: { institutionId },
      include: {
        rooms: {
          select: { id: true, capacity: true, occupied: true, type: true, isActive: true },
        },
        warden: {
          include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return hostels.map((h) => {
      const totalCapacity = h.rooms.filter((r) => r.isActive).reduce((sum, r) => sum + r.capacity, 0);
      const totalOccupied = h.rooms.filter((r) => r.isActive).reduce((sum, r) => sum + r.occupied, 0);
      return {
        id: h.id,
        name: h.name,
        type: h.type,
        address: h.address,
        phone: h.phone,
        isActive: h.isActive,
        capacity: h.capacity,
        totalRoomCapacity: totalCapacity,
        occupied: totalOccupied,
        totalRooms: h.rooms.length,
        activeRooms: h.rooms.filter((r) => r.isActive).length,
        occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
        warden: h.warden
          ? {
              id: h.warden.id,
              name: `${h.warden.user.firstName} ${h.warden.user.lastName}`,
              email: h.warden.user.email,
              phone: h.warden.user.phone,
            }
          : null,
      };
    });
  }

  async getHostelDetail(id: string) {
    const hostel = await prisma.hostel.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            allocations: {
              include: {
                student: {
                  include: {
                    user: { select: { firstName: true, lastName: true, email: true, phone: true } },
                  },
                },
              },
            },
          },
          orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        },
        warden: {
          include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
        },
      },
    });

    if (!hostel) throw new Error('Hostel not found');

    const totalCapacity = hostel.rooms.filter((r) => r.isActive).reduce((sum, r) => sum + r.capacity, 0);
    const totalOccupied = hostel.rooms.filter((r) => r.isActive).reduce((sum, r) => sum + r.occupied, 0);

    return {
      id: hostel.id,
      name: hostel.name,
      type: hostel.type,
      address: hostel.address,
      phone: hostel.phone,
      capacity: hostel.capacity,
      isActive: hostel.isActive,
      totalRoomCapacity: totalCapacity,
      occupied: totalOccupied,
      occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
      warden: hostel.warden
        ? {
            id: hostel.warden.id,
            name: `${hostel.warden.user.firstName} ${hostel.warden.user.lastName}`,
            email: hostel.warden.user.email,
            phone: hostel.warden.user.phone,
          }
        : null,
      rooms: hostel.rooms.map((r) => ({
        id: r.id,
        roomNumber: r.roomNumber,
        floor: r.floor,
        type: r.type,
        capacity: r.capacity,
        occupied: r.occupied,
        vacant: r.capacity - r.occupied,
        amenities: r.amenities,
        isActive: r.isActive,
        students: r.allocations.map((a) => ({
          id: a.student.id,
          name: `${a.student.user.firstName} ${a.student.user.lastName}`,
          email: a.student.user.email,
          phone: a.student.user.phone,
          admissionNumber: a.student.admissionNumber,
          allocatedAt: a.createdAt,
        })),
      })),
    };
  }

  async createHostel(institutionId: string, data: {
    name: string;
    type: string;
    capacity: number;
    address?: string;
    phone?: string;
    wardenId?: string;
  }) {
    return prisma.hostel.create({
      data: {
        institutionId,
        name: data.name,
        type: data.type as any,
        capacity: data.capacity,
        address: data.address,
        phone: data.phone,
        wardenId: data.wardenId,
        isActive: true,
      },
    });
  }

  async updateHostel(id: string, data: {
    name?: string;
    type?: string;
    capacity?: number;
    address?: string;
    phone?: string;
    wardenId?: string;
    isActive?: boolean;
  }) {
    const hostel = await prisma.hostel.findUnique({ where: { id } });
    if (!hostel) throw new Error('Hostel not found');

    return prisma.hostel.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type as any }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.wardenId !== undefined && { wardenId: data.wardenId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async getRooms(hostelId: string, filters?: { type?: string; floor?: number; availability?: string }) {
    const where: any = { hostelId, isActive: true };
    if (filters?.type) where.type = filters.type;
    if (filters?.floor !== undefined) where.floor = filters.floor;
    if (filters?.availability === 'available') where.occupied = { lt: prisma.hostelRoom.fields.capacity as any };
    if (filters?.availability === 'full') where.occupied = { gte: prisma.hostelRoom.fields.capacity as any };

    // Since we can't reference fields.capacity dynamically, handle availability manually
    let rooms = await prisma.hostelRoom.findMany({
      where: { hostelId, isActive: true, ...(filters?.type && { type: filters.type }), ...(filters?.floor !== undefined && { floor: filters.floor }) },
      include: {
        allocations: {
          include: {
            student: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    if (filters?.availability === 'available') {
      rooms = rooms.filter((r) => r.occupied < r.capacity);
    } else if (filters?.availability === 'full') {
      rooms = rooms.filter((r) => r.occupied >= r.capacity);
    }

    return rooms.map((r) => ({
      id: r.id,
      roomNumber: r.roomNumber,
      floor: r.floor,
      type: r.type,
      capacity: r.capacity,
      occupied: r.occupied,
      vacant: r.capacity - r.occupied,
      amenities: r.amenities,
      isActive: r.isActive,
      students: r.allocations.map((a) => ({
        id: a.student.id,
        name: `${a.student.user.firstName} ${a.student.user.lastName}`,
      })),
    }));
  }

  async getRoomDetail(id: string) {
    const room = await prisma.hostelRoom.findUnique({
      where: { id },
      include: {
        hostel: { select: { id: true, name: true, type: true } },
        allocations: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true, phone: true } },
                course: { select: { name: true } },
                department: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!room) throw new Error('Room not found');

    return {
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      type: room.type,
      capacity: room.capacity,
      occupied: room.occupied,
      vacant: room.capacity - room.occupied,
      amenities: room.amenities,
      isActive: room.isActive,
      hostel: {
        id: room.hostel.id,
        name: room.hostel.name,
        type: room.hostel.type,
      },
      students: room.allocations.map((a) => ({
        id: a.student.id,
        name: `${a.student.user.firstName} ${a.student.user.lastName}`,
        email: a.student.user.email,
        phone: a.student.user.phone,
        admissionNumber: a.student.admissionNumber,
        course: a.student.course?.name,
        department: a.student.department?.name,
        allocatedAt: a.createdAt,
      })),
    };
  }

  async createRoom(hostelId: string, data: {
    roomNumber: string;
    floor?: number;
    capacity: number;
    type: string;
    amenities?: string;
    buildingId?: string;
  }) {
    const hostel = await prisma.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel) throw new Error('Hostel not found');

    return prisma.hostelRoom.create({
      data: {
        hostelId,
        roomNumber: data.roomNumber,
        floor: data.floor,
        capacity: data.capacity,
        occupied: 0,
        type: data.type as any,
        amenities: data.amenities,
        buildingId: data.buildingId,
        isActive: true,
      },
    });
  }

  async updateRoom(id: string, data: {
    roomNumber?: string;
    floor?: number;
    capacity?: number;
    type?: string;
    amenities?: string;
    isActive?: boolean;
  }) {
    const room = await prisma.hostelRoom.findUnique({ where: { id } });
    if (!room) throw new Error('Room not found');

    return prisma.hostelRoom.update({
      where: { id },
      data: {
        ...(data.roomNumber !== undefined && { roomNumber: data.roomNumber }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.type !== undefined && { type: data.type as any }),
        ...(data.amenities !== undefined && { amenities: data.amenities }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async allocateRoom(data: { studentId: string; roomId: string }) {
    const [student, room] = await Promise.all([
      prisma.student.findUnique({ where: { id: data.studentId } }),
      prisma.hostelRoom.findUnique({ where: { id: data.roomId } }),
    ]);

    if (!student) throw new Error('Student not found');
    if (!room) throw new Error('Room not found');
    if (!room.isActive) throw new Error('Room is not active');
    if (room.occupied >= room.capacity) throw new Error('Room is already full');

    const existingAllocation = await prisma.hostelRoomAllocation.findFirst({
      where: { studentId: data.studentId },
    });
    if (existingAllocation) throw new Error('Student is already allocated to a room');

    const [allocation] = await prisma.$transaction([
      prisma.hostelRoomAllocation.create({
        data: {
          studentId: data.studentId,
          roomId: data.roomId,
        },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          room: { select: { roomNumber: true, type: true } },
        },
      }),
      prisma.hostelRoom.update({
        where: { id: data.roomId },
        data: { occupied: { increment: 1 } },
      }),
      prisma.student.update({
        where: { id: data.studentId },
        data: { hostelId: room.hostelId, isHostelStudent: true },
      }),
    ]);

    return allocation;
  }

  async deallocateRoom(studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error('Student not found');

    const allocation = await prisma.hostelRoomAllocation.findFirst({
      where: { studentId },
      include: { room: { select: { id: true } } },
    });
    if (!allocation) throw new Error('Student is not allocated to any room');

    const [updatedAllocation] = await prisma.$transaction([
      prisma.hostelRoomAllocation.delete({
        where: { id: allocation.id },
      }),
      prisma.hostelRoom.update({
        where: { id: allocation.room.id },
        data: { occupied: { decrement: 1 } },
      }),
      prisma.student.update({
        where: { id: studentId },
        data: { hostelId: null, isHostelStudent: false },
      }),
    ]);

    return { message: 'Student deallocated successfully', allocation: updatedAllocation };
  }

  async getStudents(hostelId?: string) {
    const where: any = { isHostelStudent: true };
    if (hostelId) where.hostelId = hostelId;

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        hostel: { select: { id: true, name: true, type: true } },
        course: { select: { name: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const studentIds = students.map((s) => s.id);
    const allocations = await prisma.hostelRoomAllocation.findMany({
      where: { studentId: { in: studentIds } },
      include: { room: { select: { id: true, roomNumber: true, floor: true, type: true } } },
    });

    const allocationMap = new Map(allocations.map((a) => [a.studentId, a]));

    return students.map((s) => {
      const allocation = allocationMap.get(s.id);
      return {
        id: s.id,
        name: `${s.user.firstName} ${s.user.lastName}`,
        email: s.user.email,
        phone: s.user.phone,
        admissionNumber: s.admissionNumber,
        course: s.course?.name,
        department: s.department?.name,
        hostel: s.hostel
          ? { id: s.hostel.id, name: s.hostel.name, type: s.hostel.type }
          : null,
        room: allocation
          ? { id: allocation.room.id, roomNumber: allocation.room.roomNumber, floor: allocation.room.floor, type: allocation.room.type }
          : null,
        allocatedAt: allocation?.createdAt || null,
      };
    });
  }

  async getComplaints(institutionId: string, filters?: { status?: string; priority?: string }) {
    const where: any = { institutionId, category: 'hostel' };
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;

    const complaints = await prisma.helpdeskTicket.findMany({
      where,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return complaints.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      priority: c.priority,
      status: c.status,
      creator: c.creator
        ? { id: c.creator.id, name: `${c.creator.firstName} ${c.creator.lastName}`, email: c.creator.email }
        : null,
      assignee: c.assignee
        ? { id: c.assignee.id, name: `${c.assignee.firstName} ${c.assignee.lastName}` }
        : null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      resolvedAt: c.resolvedAt,
    }));
  }

  async raiseComplaint(institutionId: string, data: {
    creatorId: string;
    title: string;
    description: string;
    priority?: string;
    assigneeId?: string;
  }) {
    return prisma.helpdeskTicket.create({
      data: {
        institutionId,
        creatorId: data.creatorId,
        assigneeId: data.assigneeId,
        title: data.title,
        description: data.description,
        category: 'hostel',
        priority: (data.priority || 'MEDIUM') as any,
        status: 'OPEN',
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async updateComplaint(id: string, data: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    description?: string;
  }) {
    const complaint = await prisma.helpdeskTicket.findUnique({ where: { id } });
    if (!complaint) throw new Error('Complaint not found');

    const updateData: any = {};
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.description !== undefined) updateData.description = data.description;

    return prisma.helpdeskTicket.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async getAnalytics(institutionId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [hostels, allRooms, complaints, recentStudents] = await Promise.all([
      prisma.hostel.findMany({
        where: { institutionId },
        select: { id: true, name: true, type: true },
      }),
      prisma.hostelRoom.findMany({
        where: { hostel: { institutionId } },
        select: { hostelId: true, floor: true, capacity: true, occupied: true, type: true },
      }),
      prisma.helpdeskTicket.findMany({
        where: { institutionId, category: 'hostel' },
        select: { category: true, status: true, createdAt: true, priority: true },
      }),
      prisma.student.findMany({
        where: {
          institutionId,
          isHostelStudent: true,
          updatedAt: { gte: thirtyDaysAgo },
        },
        select: { updatedAt: true, isHostelStudent: true, hostelId: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Occupancy by hostel
    const hostelRoomMap = new Map<string, { capacity: number; occupied: number }>();
    for (const r of allRooms) {
      const existing = hostelRoomMap.get(r.hostelId) || { capacity: 0, occupied: 0 };
      existing.capacity += r.capacity;
      existing.occupied += r.occupied;
      hostelRoomMap.set(r.hostelId, existing);
    }

    const occupancyByHostel = hostels.map((h) => {
      const stats = hostelRoomMap.get(h.id) || { capacity: 0, occupied: 0 };
      return {
        name: h.name,
        capacity: stats.capacity,
        occupied: stats.occupied,
        vacant: stats.capacity - stats.occupied,
      };
    });

    // Occupancy by floor
    const floorMap = new Map<number, { capacity: number; occupied: number }>();
    for (const r of allRooms) {
      const floor = r.floor || 0;
      const existing = floorMap.get(floor) || { capacity: 0, occupied: 0 };
      existing.capacity += r.capacity;
      existing.occupied += r.occupied;
      floorMap.set(floor, existing);
    }

    const occupancyByFloor = Array.from(floorMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([floor, stats]) => ({
        floor: `Floor ${floor}`,
        capacity: stats.capacity,
        occupied: stats.occupied,
        vacant: stats.capacity - stats.occupied,
      }));

    // Complaints by category (all are hostel, so breakdown by subcategory/status)
    const complaintsByCategory = complaints.reduce((acc, c) => {
      const existing = acc.find((a) => a.category === c.priority);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ category: c.priority, count: 1 });
      }
      return acc;
    }, [] as { category: string; count: number }[]);

    // Complaints by month (last 6 months)
    const complaintsByMonth: { month: string; total: number; resolved: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });

      const total = complaints.filter(
        (c) => c.createdAt >= date && c.createdAt <= monthEnd
      ).length;
      const resolved = complaints.filter(
        (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
      ).filter(
        (c) => c.createdAt >= date && c.createdAt <= monthEnd
      ).length;

      complaintsByMonth.push({ month: monthLabel, total, resolved });
    }

    // Check-in/check-out trend (last 30 days)
    const checkInCheckOutTrend: { date: string; checkIns: number; checkOuts: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dateStr = dayStart.toISOString().split('T')[0];

      const dayCheckIns = recentStudents.filter(
        (s) => s.isHostelStudent && s.hostelId && s.updatedAt >= dayStart && s.updatedAt < dayEnd
      ).length;

      const dayCheckOuts = recentStudents.filter(
        (s) => !s.isHostelStudent && !s.hostelId && s.updatedAt >= dayStart && s.updatedAt < dayEnd
      ).length;

      checkInCheckOutTrend.push({ date: dateStr, checkIns: dayCheckIns, checkOuts: dayCheckOuts });
    }

    return {
      occupancyByHostel,
      occupancyByFloor,
      complaintsByCategory,
      complaintsByMonth,
      checkInCheckOutTrend,
    };
  }

  async getActivities(institutionId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [students, complaints, rooms] = await Promise.all([
      prisma.student.findMany({
        where: {
          institutionId,
          isHostelStudent: true,
          updatedAt: { gte: thirtyDaysAgo },
        },
        include: {
          user: { select: { firstName: true, lastName: true } },
          hostel: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      prisma.helpdeskTicket.findMany({
        where: { institutionId, category: 'hostel', updatedAt: { gte: thirtyDaysAgo } },
        include: {
          creator: { select: { firstName: true, lastName: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      prisma.hostelRoomAllocation.findMany({
        where: {
          room: { hostel: { institutionId } },
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          room: { select: { roomNumber: true, hostel: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const activities: any[] = [];

    students.forEach((s) => {
      activities.push({
        type: 'student_update',
        description: `Student ${s.user.firstName} ${s.user.lastName} - ${s.isHostelStudent ? 'checked in to' : 'checked out from'} ${s.hostel?.name || 'hostel'}`,
        date: s.updatedAt,
        meta: { studentId: s.id, hostelName: s.hostel?.name },
      });
    });

    complaints.forEach((c) => {
      activities.push({
        type: 'complaint',
        description: `Complaint "${c.title}" - ${c.status.toLowerCase().replace('_', ' ')}`,
        date: c.updatedAt,
        meta: { complaintId: c.id, status: c.status, creator: `${c.creator.firstName} ${c.creator.lastName}` },
      });
    });

    rooms.forEach((a) => {
      activities.push({
        type: 'room_change',
        description: `${a.student.user.firstName} ${a.student.user.lastName} allocated to Room ${a.room.roomNumber} in ${a.room.hostel.name}`,
        date: a.createdAt,
        meta: { studentId: a.student.id, roomId: a.room.roomNumber },
      });
    });

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return activities.slice(0, 50);
  }

  async getStats(institutionId: string) {
    const [totalHostels, totalRooms, occupiedRooms, totalStudents] = await Promise.all([
      prisma.hostel.count({ where: { institutionId } }),
      prisma.hostelRoom.count({ where: { hostel: { institutionId } } }),
      prisma.hostelRoom.findMany({ where: { hostel: { institutionId } }, select: { occupied: true, capacity: true } }),
      prisma.student.count({ where: { institutionId, hostelId: { not: null } } }),
    ]);
    const totalCapacity = occupiedRooms.reduce((sum: number, r: any) => sum + r.capacity, 0);
    const totalOccupied = occupiedRooms.reduce((sum: number, r: any) => sum + r.occupied, 0);
    return { totalHostels, totalRooms, totalCapacity, totalOccupied, occupancyRate: totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0, totalStudents };
  }

  async getHostelWise(institutionId: string) {
    const hostels = await prisma.hostel.findMany({
      where: { institutionId },
      include: { rooms: true },
    });
    return hostels.map((h: any) => ({
      name: h.name,
      type: h.type,
      capacity: h.rooms.reduce((sum: number, r: any) => sum + r.capacity, 0),
      occupied: h.rooms.reduce((sum: number, r: any) => sum + r.occupied, 0),
      rooms: h.rooms.length,
    }));
  }

  async getRoomTypes(institutionId: string) {
    const rooms = await prisma.hostelRoom.findMany({ where: { hostel: { institutionId } } });
    const typeMap: Record<string, { count: number; capacity: number; occupied: number }> = {};
    rooms.forEach((r: any) => {
      if (!typeMap[r.type]) typeMap[r.type] = { count: 0, capacity: 0, occupied: 0 };
      typeMap[r.type].count++;
      typeMap[r.type].capacity += r.capacity;
      typeMap[r.type].occupied += r.occupied;
    });
    return Object.entries(typeMap).map(([type, data]) => ({ type, ...data }));
  }

  async getMaintenanceTrend(institutionId: string) {
    const complaints = await prisma.helpdeskTicket.findMany({
      where: { institutionId, category: 'hostel' },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });
    const monthly: Record<string, { total: number; resolved: number }> = {};
    complaints.forEach((c: any) => {
      const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { total: 0, resolved: 0 };
      monthly[key].total++;
      if (c.status === 'RESOLVED') monthly[key].resolved++;
    });
    return Object.entries(monthly).map(([month, data]) => ({ month, ...data }));
  }
}

export const hostelService = new HostelService();
