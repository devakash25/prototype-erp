import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { attendanceService } from './attendance.service';
import {
  markDailyAttendanceSchema,
  markSubjectAttendanceSchema,
  attendanceQuerySchema,
  modeToggleSchema,
  lockSchema,
} from './attendance.validation';

function wrap(fn: (req: Request, res: Response) => Promise<any>) {
  return (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      if (err instanceof Error && 'statusCode' in err) {
        res.status((err as any).statusCode).json({
          success: false,
          error: { message: err.message, statusCode: (err as any).statusCode },
        });
      } else {
        res.status(500).json({
          success: false,
          error: { message: 'Internal server error', statusCode: 500 },
        });
      }
    });
  };
}

const router = Router();
router.use(authenticate);

// Read endpoints — all authenticated roles
router.get('/monthly-overview', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const courseId = req.query.courseId as string;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const data = await attendanceService.getMonthlyOverview(user.userId, courseId, year, month);
  res.json({ success: true, data });
}));

router.get('/courses', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await attendanceService.getCourses(user.userId);
  res.json({ success: true, data });
}));

router.get('/class-status', validate(attendanceQuerySchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.query as { courseId: string; date: string };
  const data = await attendanceService.getClassStatus(user.userId, courseId, date);
  res.json({ success: true, data });
}));

router.get('/class-students', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const courseId = req.query.courseId as string;
  const data = await attendanceService.getStudentsForCourse(user.userId, courseId);
  res.json({ success: true, data });
}));

router.get('/daily', validate(attendanceQuerySchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.query as { courseId: string; date: string };
  const session = (req.query.session as string)?.toUpperCase() as 'MORNING' | 'EVENING';
  const data = await attendanceService.getDailyAttendance(user.userId, courseId, date, session);
  res.json({ success: true, data });
}));

// Write endpoints — TEACHER, HOD, PRINCIPAL, CHIEF_HEAD only
const ATTENDANCE_WRITE_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'CHIEF_HEAD', 'COORDINATOR'];

router.post('/enable-subject-mode', authorize(...ATTENDANCE_WRITE_ROLES), validate(modeToggleSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.body;
  const data = await attendanceService.enableSubjectMode(user.userId, courseId, date);
  res.json({ success: true, data, message: 'Subject-wise attendance enabled' });
}));

router.post('/disable-subject-mode', authorize(...ATTENDANCE_WRITE_ROLES), validate(modeToggleSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.body;
  const data = await attendanceService.disableSubjectMode(user.userId, courseId, date);
  res.json({ success: true, data, message: 'Coordinator attendance mode restored' });
}));

router.post('/mark-daily', authorize(...ATTENDANCE_WRITE_ROLES), validate(markDailyAttendanceSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date, session: rawSession, records } = req.body;
  const session = (rawSession as string).toUpperCase() as 'MORNING' | 'EVENING';
  const data = await attendanceService.markDailyAttendance(user.userId, courseId, date, session, records);
  res.json({ success: true, data, message: `${session} attendance saved` });
}));

router.post('/lock', authorize(...ATTENDANCE_WRITE_ROLES), validate(lockSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.body;
  const data = await attendanceService.lockAttendance(user.userId, courseId, date);
  res.json({ success: true, data, message: 'Attendance locked' });
}));

router.post('/unlock', authorize(...ATTENDANCE_WRITE_ROLES), validate(lockSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.body;
  const data = await attendanceService.unlockAttendance(user.userId, courseId, date);
  res.json({ success: true, data, message: 'Attendance unlocked' });
}));

// Teacher-specific endpoints — TEACHER, HOD, PRINCIPAL only
router.get('/teacher/timetable', authorize('TEACHER', 'HOD', 'PRINCIPAL'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await attendanceService.getTimetableForTeacher(user.userId);
  res.json({ success: true, data });
}));

router.get('/teacher/status', authorize('TEACHER', 'HOD', 'PRINCIPAL'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await attendanceService.getTeacherAttendanceStatus(user.userId);
  res.json({ success: true, data });
}));

router.get('/teacher/period-students', authorize('TEACHER', 'HOD', 'PRINCIPAL'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const entryId = req.query.entryId as string;
  const date = req.query.date as string;
  const data = await attendanceService.getStudentsForPeriod(user.userId, entryId, date);
  res.json({ success: true, data });
}));

router.post('/teacher/mark-period', authorize('TEACHER', 'HOD', 'PRINCIPAL'), validate(markSubjectAttendanceSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { timetableEntryId, date, records } = req.body;
  const data = await attendanceService.markSubjectAttendance(user.userId, timetableEntryId, date, records);
  res.json({ success: true, data, message: 'Period attendance saved' });
}));

export default router;
