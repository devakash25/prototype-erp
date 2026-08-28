import { Router, Request, Response } from 'express';
import { TransportService } from './transport.service';
import { authenticate, authorize } from '../../middleware/auth';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authenticate);

const allRoles: string[] = ['CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'HOD', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'ADMISSION_COUNSELLOR', 'TRANSPORT_MANAGER'];
const tmOnly: string[] = ['TRANSPORT_MANAGER'];

// ============================================
// DASHBOARD
// ============================================

router.get('/dashboard', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getDashboard(institutionId!);
    res.json(data);
  } catch (error: any) {
    logger.error({ err: error }, 'Transport dashboard error');
    res.status(500).json({ error: error.message });
  }
});

router.get('/activities', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getActivities(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// VEHICLES
// ============================================

router.get('/vehicles', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const { status, type } = req.query;
    const data = await TransportService.getVehicles(institutionId!, { status: status as string, type: type as string });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vehicles/stats', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getVehicleStats(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vehicles/:id', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getVehicle(institutionId!, req.params.id as string);
    if (!data) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vehicles', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.createVehicle(institutionId!, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/vehicles/:id', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const data = await TransportService.updateVehicle(req.user!.institutionId!, req.params.id as string, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/vehicles/:id/toggle', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.toggleVehicleStatus(institutionId!, req.params.id as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DRIVERS
// ============================================

router.get('/drivers', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getDrivers(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/drivers/attendance', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const { date } = req.query;
    const data = await TransportService.getDriverAttendance(institutionId!, date as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/drivers/attendance', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.markDriverAttendance(institutionId!, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/drivers/:id', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getDriver(institutionId!, req.params.id as string);
    if (!data) return res.status(404).json({ error: 'Driver not found' });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/drivers/:id/attendance', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const { startDate, endDate } = req.query;
    const data = await TransportService.getDriverAttendanceSummary(institutionId!, req.params.id as string, startDate as string, endDate as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ROUTES
// ============================================

router.get('/routes', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getRoutes(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/routes/:id', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getRoute(institutionId!, req.params.id as string);
    if (!data) return res.status(404).json({ error: 'Route not found' });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/routes', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.createRoute(institutionId!, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/routes/:id', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.updateRoute(institutionId!, req.params.id as string, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/routes/:id', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    await TransportService.deleteRoute(institutionId!, req.params.id as string);
    res.json({ message: 'Route deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/routes/:id/assign-vehicle', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const data = await TransportService.assignVehicleToRoute(req.user!.institutionId!, req.params.id as string, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/routes/:id/remove-vehicle/:vrId', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    await TransportService.removeVehicleFromRoute(req.params.id as string, req.params.vrId as string);
    res.json({ message: 'Vehicle removed from route' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// STUDENT TRANSPORT ALLOCATION
// ============================================

router.get('/students', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getStudentAllocations(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/students/unallocated', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getUnallocatedStudents(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/students/:studentId/allocate', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const { routeId } = req.body;
    const data = await TransportService.allocateStudent(req.user!.institutionId!, req.params.studentId as string, routeId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/students/:studentId/deallocate', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const data = await TransportService.deallocateStudent(req.params.studentId as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MAINTENANCE
// ============================================

router.get('/maintenance', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const { status } = req.query;
    const data = await TransportService.getMaintenance(institutionId!, { status: status as string });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/maintenance/stats', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getMaintenanceStats(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/maintenance', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const data = await TransportService.createMaintenance(req.user!.institutionId!, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/maintenance/:id', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const data = await TransportService.updateMaintenance(req.params.id as string, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// INSPECTIONS
// ============================================

router.get('/inspections', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const { vehicleId, status } = req.query;
    const data = await TransportService.getInspections(institutionId!, { vehicleId: vehicleId as string, status: status as string });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/inspections', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const data = await TransportService.createInspection(req.user!.institutionId!, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// COMPLAINTS
// ============================================

router.get('/complaints', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const data = await TransportService.getComplaints(req.user!.institutionId!, { status: status as string });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/complaints/:id', authorize(...tmOnly), async (req: Request, res: Response) => {
  try {
    const data = await TransportService.updateComplaint(req.params.id as string, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REPORTS & ANALYTICS
// ============================================

router.get('/reports', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getReports(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getAnalytics(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/schedule', authorize(...allRoles), async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await TransportService.getDailySchedule(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
