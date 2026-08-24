import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
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

router.post('/enable-subject-mode', validate(modeToggleSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.body;
  const data = await attendanceService.enableSubjectMode(user.userId, courseId, date);
  res.json({ success: true, data, message: 'Subject-wise attendance enabled' });
}));

router.post('/disable-subject-mode', validate(modeToggleSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.body;
  const data = await attendanceService.disableSubjectMode(user.userId, courseId, date);
  res.json({ success: true, data, message: 'Coordinator attendance mode restored' });
}));

router.post('/mark-daily', validate(markDailyAttendanceSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date, session, records } = req.body;
  const data = await attendanceService.markDailyAttendance(user.userId, courseId, date, session, records);
  res.json({ success: true, data, message: `${session} attendance saved` });
}));

router.post('/lock', validate(lockSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.body;
  const data = await attendanceService.lockAttendance(user.userId, courseId, date);
  res.json({ success: true, data, message: 'Attendance locked' });
}));

router.post('/unlock', validate(lockSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, date } = req.body;
  const data = await attendanceService.unlockAttendance(user.userId, courseId, date);
  res.json({ success: true, data, message: 'Attendance unlocked' });
}));

router.get('/teacher/timetable', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await attendanceService.getTimetableForTeacher(user.userId);
  res.json({ success: true, data });
}));

router.get('/teacher/status', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await attendanceService.getTeacherAttendanceStatus(user.userId);
  res.json({ success: true, data });
}));

router.get('/teacher/period-students', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const entryId = req.query.entryId as string;
  const date = req.query.date as string;
  const data = await attendanceService.getStudentsForPeriod(user.userId, entryId, date);
  res.json({ success: true, data });
}));

router.post('/teacher/mark-period', validate(markSubjectAttendanceSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { timetableEntryId, date, records } = req.body;
  const data = await attendanceService.markSubjectAttendance(user.userId, timetableEntryId, date, records);
  res.json({ success: true, data, message: 'Period attendance saved' });
}));

export default router;
