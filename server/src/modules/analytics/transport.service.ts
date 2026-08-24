import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransportService {
  // ============================================
  // DASHBOARD
  // ============================================

  static async getDashboard(institutionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      totalDrivers,
      driversOnLeave,
      studentsUsingTransport,
      totalRoutes,
      activeComplaints,
      expiringDocuments,
      scheduledMaintenance,
      pendingRequests,
      todayInspections,
      recentMaintenances,
      driverAttendanceToday,
      vehicleRoutes,
    ] = await Promise.all([
      prisma.vehicle.count({ where: { institutionId } }),
      prisma.vehicle.count({ where: { institutionId, status: 'ACTIVE', isActive: true } }),
      prisma.vehicle.count({ where: { institutionId, status: 'MAINTENANCE' } }),
      prisma.employee.count({ where: { institutionId, designation: 'Driver' } }),
      prisma.driverAttendance.count({
        where: { institutionId, date: { gte: today, lt: tomorrow }, status: 'ABSENT' },
      }),
      prisma.student.count({ where: { institutionId, usesTransport: true } }),
      prisma.route.count({ where: { institutionId } }),
      prisma.complaint.count({
        where: { category: 'TRANSPORT', status: { in: ['open', 'in_progress'] } },
      }),
      prisma.vehicle.count({
        where: {
          institutionId,
          OR: [
            { insuranceExpiry: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
            { fitnessExpiry: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
            { permitExpiry: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
            { pollutionExpiry: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
          ],
        },
      }),
      prisma.vehicleMaintenance.count({
        where: { vehicle: { institutionId }, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
      }),
      0,
      prisma.vehicleInspection.count({
        where: { vehicle: { institutionId }, inspectionDate: { gte: today, lt: tomorrow } },
      }),
      prisma.vehicleMaintenance.findMany({
        where: { vehicle: { institutionId } },
        include: { vehicle: { select: { registrationNumber: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.driverAttendance.findMany({
        where: { institutionId, date: { gte: today, lt: tomorrow } },
        take: 10,
      }),
      prisma.vehicleRoute.findMany({
        where: { vehicle: { institutionId } },
        include: { vehicle: true, route: true },
      }),
    ]);

    const routeUtilization = vehicleRoutes.map((vr) => {
      const studentCount = 0;
      return {
        routeId: vr.routeId,
        routeName: vr.route.name,
        routeCode: vr.route.code,
        vehicleRegistration: vr.vehicle.registrationNumber,
        shift: vr.shift,
        departureTime: vr.departureTime,
        arrivalTime: vr.arrivalTime,
        studentCount,
      };
    });

    const fleetUtilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
    const driverAvailabilityRate = totalDrivers > 0 ? Math.round(((totalDrivers - driversOnLeave) / totalDrivers) * 100) : 0;

    return {
      summary: {
        totalVehicles,
        activeVehicles,
        maintenanceVehicles,
        inactiveVehicles: totalVehicles - activeVehicles - maintenanceVehicles,
        totalDrivers,
        driversAvailable: totalDrivers - driversOnLeave,
        driversOnLeave,
        studentsUsingTransport,
        totalRoutes,
        activeComplaints,
        expiringDocuments,
        scheduledMaintenance,
        todayInspections,
        fleetUtilizationRate,
        driverAvailabilityRate,
      },
      routeUtilization,
      driverAttendanceToday,
      recentMaintenances,
      alerts: await this.getAlerts(institutionId),
    };
  }

  static async getAlerts(institutionId: string) {
    const alerts = [];
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const fifteenDays = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringInsurance = await prisma.vehicle.findMany({
      where: { institutionId, insuranceExpiry: { lte: thirtyDays }, isActive: true },
      select: { registrationNumber: true, insuranceExpiry: true },
    });
    expiringInsurance.forEach((v) => {
      alerts.push({
        type: 'warning',
        title: 'Insurance expiring',
        message: `${v.registrationNumber} insurance expires on ${v.insuranceExpiry?.toLocaleDateString()}`,
        category: 'document',
      });
    });

    const expiringFitness = await prisma.vehicle.findMany({
      where: { institutionId, fitnessExpiry: { lte: fifteenDays }, isActive: true },
      select: { registrationNumber: true, fitnessExpiry: true },
    });
    expiringFitness.forEach((v) => {
      alerts.push({
        type: 'warning',
        title: 'Fitness certificate expiring',
        message: `${v.registrationNumber} fitness expires on ${v.fitnessExpiry?.toLocaleDateString()}`,
        category: 'document',
      });
    });

    const pendingComplaints = await prisma.complaint.count({
      where: { category: 'TRANSPORT', status: 'open' },
    });
    if (pendingComplaints > 0) {
      alerts.push({
        type: 'error',
        title: 'Pending complaints',
        message: `${pendingComplaints} transport complaint(s) pending resolution`,
        category: 'complaint',
      });
    }

    const scheduledMaint = await prisma.vehicleMaintenance.count({
      where: { vehicle: { institutionId }, status: 'SCHEDULED', scheduledDate: { lte: sevenDays } },
    });
    if (scheduledMaint > 0) {
      alerts.push({
        type: 'info',
        title: 'Upcoming maintenance',
        message: `${scheduledMaint} maintenance task(s) due within 7 days`,
        category: 'maintenance',
      });
    }

    return alerts;
  }

  // ============================================
  // VEHICLES
  // ============================================

  static async getVehicles(institutionId: string, filters?: { status?: string; type?: string }) {
    const where: any = { institutionId };
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    return prisma.vehicle.findMany({
      where,
      include: {
        driver: { include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
        routes: { include: { route: { select: { name: true, code: true } } } },
        maintenances: { orderBy: { createdAt: 'desc' }, take: 3 },
        inspections: { orderBy: { inspectionDate: 'desc' }, take: 3 },
      },
      orderBy: { registrationNumber: 'asc' },
    });
  }

  static async getVehicle(institutionId: string, vehicleId: string) {
    return prisma.vehicle.findFirst({
      where: { id: vehicleId, institutionId },
      include: {
        driver: { include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
        routes: { include: { route: true } },
        maintenances: { orderBy: { createdAt: 'desc' } },
        inspections: { orderBy: { inspectionDate: 'desc' } },
      },
    });
  }

  static async createVehicle(institutionId: string, data: any) {
    return prisma.vehicle.create({
      data: { ...data, institutionId, status: data.status || 'ACTIVE' },
    });
  }

  static async updateVehicle(institutionId: string, vehicleId: string, data: any) {
    return prisma.vehicle.update({
      where: { id: vehicleId },
      data,
    });
  }

  static async toggleVehicleStatus(institutionId: string, vehicleId: string) {
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, institutionId } });
    if (!vehicle) throw new Error('Vehicle not found');
    return prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isActive: !vehicle.isActive, status: vehicle.isActive ? 'INACTIVE' : 'ACTIVE' },
    });
  }

  static async getVehicleStats(institutionId: string) {
    const byType = await prisma.vehicle.groupBy({ by: ['type'], where: { institutionId }, _count: true });
    const byStatus = await prisma.vehicle.groupBy({ by: ['status'], where: { institutionId }, _count: true });
    return { byType, byStatus };
  }

  // ============================================
  // DRIVERS
  // ============================================

  static async getDrivers(institutionId: string) {
    return prisma.employee.findMany({
      where: { institutionId, designation: 'Driver' },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, email: true, avatar: true } },
      },
      orderBy: { employeeCode: 'asc' },
    });
  }

  static async getDriver(institutionId: string, driverId: string) {
    return prisma.employee.findFirst({
      where: { id: driverId, institutionId, designation: 'Driver' },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, email: true, avatar: true } },
      },
    });
  }

  static async getDriverAttendance(institutionId: string, date?: string) {
    const d = date ? new Date(date) : new Date();
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendance = await prisma.driverAttendance.findMany({
      where: { institutionId, date: { gte: d, lt: nextDay } },
    });

    const allDrivers = await prisma.employee.findMany({
      where: { institutionId, designation: 'Driver' },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    return { attendance, drivers: allDrivers };
  }

  static async markDriverAttendance(institutionId: string, data: any) {
    const d = new Date(data.date);
    d.setHours(0, 0, 0, 0);

    const existing = await prisma.driverAttendance.findFirst({
      where: { institutionId, driverId: data.driverId, date: d },
    });

    if (existing) {
      return prisma.driverAttendance.update({
        where: { id: existing.id },
        data: { status: data.status, notes: data.notes },
      });
    }

    return prisma.driverAttendance.create({
      data: { institutionId, driverId: data.driverId, date: d, status: data.status, notes: data.notes },
    });
  }

  static async getDriverAttendanceSummary(institutionId: string, driverId: string, startDate?: string, endDate?: string) {
    const where: any = { institutionId, driverId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const records = await prisma.driverAttendance.findMany({ where, orderBy: { date: 'desc' } });
    const summary = {
      present: records.filter((r) => r.status === 'PRESENT').length,
      absent: records.filter((r) => r.status === 'ABSENT').length,
      leave: records.filter((r) => r.status === 'LEAVE').length,
      total: records.length,
    };
    return { records, summary };
  }

  // ============================================
  // ROUTES
  // ============================================

  static async getRoutes(institutionId: string) {
    return prisma.route.findMany({
      where: { institutionId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        vehicles: { include: { vehicle: { select: { registrationNumber: true, type: true, capacity: true, status: true } } } },
        students: { select: { id: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  static async getRoute(institutionId: string, routeId: string) {
    return prisma.route.findFirst({
      where: { id: routeId, institutionId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        vehicles: { include: { vehicle: true } },
        students: { include: { user: { select: { firstName: true, lastName: true } }, department: { select: { name: true } } } },
      },
    });
  }

  static async createRoute(institutionId: string, data: any) {
    const route = await prisma.route.create({
      data: { institutionId, name: data.name, code: data.code, description: data.description, managerId: data.managerId },
    });
    if (data.stops?.length) {
      for (let i = 0; i < data.stops.length; i++) {
        await prisma.routeStop.create({
          data: { routeId: route.id, name: data.stops[i].name, address: data.stops[i].address, sequence: i + 1, estimatedTime: data.stops[i].estimatedTime },
        });
      }
    }
    return route;
  }

  static async updateRoute(institutionId: string, routeId: string, data: any) {
    return prisma.route.update({ where: { id: routeId }, data });
  }

  static async deleteRoute(institutionId: string, routeId: string) {
    await prisma.vehicleRoute.deleteMany({ where: { routeId } });
    await prisma.routeStop.deleteMany({ where: { routeId } });
    return prisma.route.delete({ where: { id: routeId } });
  }

  static async assignVehicleToRoute(institutionId: string, routeId: string, data: any) {
    const existing = await prisma.vehicleRoute.findFirst({ where: { vehicleId: data.vehicleId, routeId } });
    if (existing) {
      return prisma.vehicleRoute.update({ where: { id: existing.id }, data });
    }
    return prisma.vehicleRoute.create({ data: { vehicleId: data.vehicleId, routeId, shift: data.shift, departureTime: data.departureTime, arrivalTime: data.arrivalTime } });
  }

  static async removeVehicleFromRoute(routeId: string, vehicleRouteId: string) {
    return prisma.vehicleRoute.delete({ where: { id: vehicleRouteId } });
  }

  // ============================================
  // STUDENT TRANSPORT ALLOCATION
  // ============================================

  static async getStudentAllocations(institutionId: string) {
    return prisma.student.findMany({
      where: { institutionId, usesTransport: true },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        department: { select: { name: true } },
        course: { select: { name: true } },
        transportRoute: { select: { name: true, code: true } },
      },
      orderBy: { admissionNumber: 'asc' },
    });
  }

  static async allocateStudent(institutionId: string, studentId: string, routeId: string) {
    return prisma.student.update({
      where: { id: studentId },
      data: { transportRouteId: routeId, usesTransport: true },
    });
  }

  static async deallocateStudent(studentId: string) {
    return prisma.student.update({
      where: { id: studentId },
      data: { transportRouteId: null, usesTransport: false },
    });
  }

  static async getUnallocatedStudents(institutionId: string) {
    return prisma.student.findMany({
      where: { institutionId, usesTransport: false },
      include: {
        user: { select: { firstName: true, lastName: true } },
        department: { select: { name: true } },
        course: { select: { name: true } },
      },
      take: 50,
    });
  }

  // ============================================
  // VEHICLE MAINTENANCE
  // ============================================

  static async getMaintenance(institutionId: string, filters?: { status?: string }) {
    const where: any = { vehicle: { institutionId } };
    if (filters?.status) where.status = filters.status;
    return prisma.vehicleMaintenance.findMany({
      where,
      include: { vehicle: { select: { registrationNumber: true, type: true } } },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  static async createMaintenance(institutionId: string, data: any) {
    return prisma.vehicleMaintenance.create({ data });
  }

  static async updateMaintenance(maintenanceId: string, data: any) {
    return prisma.vehicleMaintenance.update({ where: { id: maintenanceId }, data });
  }

  static async getMaintenanceStats(institutionId: string) {
    const byStatus = await prisma.vehicleMaintenance.groupBy({
      by: ['status'],
      where: { vehicle: { institutionId } },
      _count: true,
    });
    const byType = await prisma.vehicleMaintenance.groupBy({
      by: ['type'],
      where: { vehicle: { institutionId } },
      _count: true,
      _sum: { cost: true },
    });
    return { byStatus, byType };
  }

  // ============================================
  // VEHICLE INSPECTIONS
  // ============================================

  static async getInspections(institutionId: string, filters?: { vehicleId?: string; status?: string }) {
    const where: any = { vehicle: { institutionId } };
    if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters?.status) where.status = filters.status;
    return prisma.vehicleInspection.findMany({
      where,
      include: { vehicle: { select: { registrationNumber: true, type: true } } },
      orderBy: { inspectionDate: 'desc' },
    });
  }

  static async createInspection(institutionId: string, data: any) {
    return prisma.vehicleInspection.create({ data });
  }

  // ============================================
  // COMPLAINTS
  // ============================================

  static async getComplaints(institutionId: string, filters?: { status?: string }) {
    const where: any = { category: 'TRANSPORT' };
    if (filters?.status) where.status = filters.status;
    return prisma.complaint.findMany({
      where,
      include: { student: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateComplaint(complaintId: string, data: any) {
    const updateData: any = { status: data.status };
    if (data.status === 'resolved') updateData.resolvedAt = new Date();
    return prisma.complaint.update({ where: { id: complaintId }, data: updateData });
  }

  // ============================================
  // REPORTS & ANALYTICS
  // ============================================

  static async getReports(institutionId: string) {
    const [vehicleStats, routeStats, maintenanceStats, complaintStats] = await Promise.all([
      prisma.vehicle.groupBy({ by: ['type', 'status'], where: { institutionId }, _count: true }),
      prisma.route.findMany({
        where: { institutionId },
        include: { stops: true, students: { select: { id: true } }, vehicles: { include: { vehicle: { select: { capacity: true } } } } },
      }),
      prisma.vehicleMaintenance.groupBy({
        by: ['type', 'status'],
        where: { vehicle: { institutionId } },
        _count: true,
        _sum: { cost: true },
      }),
      prisma.complaint.groupBy({
        by: ['status'],
        where: { category: 'TRANSPORT' },
        _count: true,
      }),
    ]);

    return { vehicleStats, routeStats, maintenanceStats, complaintStats };
  }

  static async getAnalytics(institutionId: string) {
    const [totalCapacity, usedSeats, totalMaintenanceCost] = await Promise.all([
      prisma.vehicle.aggregate({ where: { institutionId, isActive: true }, _sum: { capacity: true } }),
      prisma.student.count({ where: { institutionId, usesTransport: true } }),
      prisma.vehicleMaintenance.aggregate({ where: { vehicle: { institutionId }, status: 'COMPLETED' }, _sum: { cost: true } }),
    ]);

    const capacityUtilization = totalCapacity._sum.capacity
      ? Math.round((usedSeats / Number(totalCapacity._sum.capacity)) * 100)
      : 0;

    const monthlyMaintenanceCost = await prisma.vehicleMaintenance.aggregate({
      where: {
        vehicle: { institutionId },
        status: 'COMPLETED',
        completedDate: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      },
      _sum: { cost: true },
    });

    return {
      capacityUtilization,
      totalCapacity: Number(totalCapacity._sum.capacity || 0),
      usedSeats,
      totalMaintenanceCost: Number(totalMaintenanceCost._sum.cost || 0),
      monthlyMaintenanceCost: Number(monthlyMaintenanceCost._sum.cost || 0),
    };
  }

  static async getDailySchedule(institutionId: string) {
    const vr = await prisma.vehicleRoute.findMany({
      where: { vehicle: { institutionId } },
      include: {
        vehicle: { select: { registrationNumber: true, type: true, status: true } },
        route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
      },
    });

    return vr.map((v) => ({
      vehicleRegistration: v.vehicle.registrationNumber,
      vehicleType: v.vehicle.type,
      vehicleStatus: v.vehicle.status,
      routeName: v.route.name,
      routeCode: v.route.code,
      shift: v.shift,
      departureTime: v.departureTime,
      arrivalTime: v.arrivalTime,
      stops: v.route.stops.map((s) => s.name),
      studentCount: 0,
    }));
  }

  static async getActivities(institutionId: string) {
    const [recentMaint, recentInspections, recentComplaints] = await Promise.all([
      prisma.vehicleMaintenance.findMany({
        where: { vehicle: { institutionId } },
        include: { vehicle: { select: { registrationNumber: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.vehicleInspection.findMany({
        where: { vehicle: { institutionId } },
        include: { vehicle: { select: { registrationNumber: true } } },
        orderBy: { inspectionDate: 'desc' },
        take: 5,
      }),
      prisma.complaint.findMany({
        where: { category: 'TRANSPORT' },
        include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const activities = [
      ...recentMaint.map((m) => ({
        type: 'maintenance',
        title: m.title,
        detail: `${m.vehicle.registrationNumber} - ${m.status}`,
        date: m.scheduledDate || m.completedDate || m.createdAt,
      })),
      ...recentInspections.map((i) => ({
        type: 'inspection',
        title: `Vehicle Inspection`,
        detail: `${i.vehicle.registrationNumber} - ${i.status}`,
        date: i.inspectionDate,
      })),
      ...recentComplaints.map((c) => ({
        type: 'complaint',
        title: c.title,
        detail: `${c.student.user.firstName} ${c.student.user.lastName} - ${c.status}`,
        date: c.createdAt,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return activities.slice(0, 10);
  }

  static async getStats(institutionId: string) {
    const [totalVehicles, activeVehicles, totalRoutes, studentsAllocated] = await Promise.all([
      prisma.vehicle.count({ where: { institutionId } }),
      prisma.vehicle.count({ where: { institutionId, status: 'active' } }),
      prisma.route.count({ where: { institutionId } }),
      prisma.student.count({ where: { institutionId, transportRouteId: { not: null } } }),
    ]);
    return { totalVehicles, activeVehicles, totalRoutes, studentsAllocated, maintenanceVehicles: totalVehicles - activeVehicles };
  }

  static async getRouteOccupancy(institutionId: string) {
    const routes = await prisma.route.findMany({
      where: { institutionId },
      include: { _count: { select: { students: true } }, vehicles: true },
    });
    return routes.map(r => ({
      name: r.name,
      code: r.code,
      students: r._count.students,
      vehicles: r.vehicles.length,
    }));
  }

  static async getVehicleTypes(institutionId: string) {
    const vehicles = await prisma.vehicle.findMany({ where: { institutionId } });
    const typeMap: Record<string, number> = {};
    vehicles.forEach(v => { typeMap[v.type] = (typeMap[v.type] || 0) + 1; });
    return Object.entries(typeMap).map(([type, count]) => ({ type, count }));
  }

  static async getFuelExpenses(institutionId: string) {
    const vehicles = await prisma.vehicle.findMany({
      where: { institutionId },
      include: { maintenances: { select: { cost: true, createdAt: true } } },
    });
    return vehicles.map(v => ({
      vehicleId: v.id,
      registrationNumber: v.registrationNumber,
      totalExpenses: v.maintenances.reduce((sum: number, m: any) => sum + Number(m.cost || 0), 0),
      maintenanceCount: v.maintenances.length,
    }));
  }
}
