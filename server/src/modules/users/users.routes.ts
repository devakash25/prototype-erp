import { Router } from 'express';
import { userController } from './users.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createAuthoritySchema,
  updateUserSchema,
  resetPasswordSchema,
} from './users.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Only Chief Head can manage users
router.post(
  '/authority',
  authorize('CHIEF_HEAD'),
  validate(createAuthoritySchema),
  userController.createAuthority
);

router.get('/', userController.getUsers);
router.get('/stats', userController.getUserStats);
router.get('/:id', userController.getUserById);

router.put(
  '/:id',
  authorize('CHIEF_HEAD'),
  validate(updateUserSchema),
  userController.updateUser
);

router.patch(
  '/:id/toggle-status',
  authorize('CHIEF_HEAD'),
  userController.toggleUserStatus
);

router.post(
  '/:id/reset-password',
  authorize('CHIEF_HEAD'),
  validate(resetPasswordSchema),
  userController.resetPassword
);

export default router;
