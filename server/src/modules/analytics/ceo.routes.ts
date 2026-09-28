import { Router, Request, Response } from 'express';
import { ceoService } from './ceo.service';
import { authenticate, authorize } from '../../middleware/auth';
import { institutionAdminService } from '../institution/institution-admin.service';

const router = Router();
router.use(authenticate, authorize('CEO'));

// ========== User Management ==========

router.get('/dashboard-stats', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.getDashboardStats();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/user-stats', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.getUserStats();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  try {
    const { search, role, status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await ceoService.getUsers({
      search: search as string | undefined,
      role: role as string | undefined,
      status: status as string | undefined,
      page, limit,
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/users/:id/toggle-status', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.toggleUserStatus(String(req.params.id));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/deactivate-all', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.deactivateAllUsers();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/reactivate-all', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.reactivateAllUsers();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Plans ==========

router.post('/plans', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.createPlan(req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.getPlans();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans/active', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.getActivePlan();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans/active-features', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.getActiveFeatures();
    res.json({ features: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/plans/:id/activate', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.activatePlan(String(req.params.id));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/plans/:id/summary', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.getPlanSummary(String(req.params.id));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/plans/:id', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.updatePlan(String(req.params.id), req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/plans/:id/role-pricing', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.updateRolePricing(String(req.params.id), req.body.rolePricing);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/plans/:id', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.deletePlan(String(req.params.id));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Feature Registry ==========

router.get('/features', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.getFeatureRegistry();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Initialize Defaults ==========

router.post('/initialize-plans', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.initializePlans();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Charges ==========

router.get('/charges', async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;
    const data = await ceoService.getCharges({ status: status as string, type: type as string });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/charges/stats', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.getChargeStats();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/charges', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.createCharge(req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/charges/:id/status', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.updateChargeStatus(String(req.params.id), req.body.status, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/charges/:id', async (req: Request, res: Response) => {
  try {
    const data = await ceoService.deleteCharge(String(req.params.id));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Institutions (tenant management) ==========

function sendError(res: Response, error: any): void {
  res.status(error.statusCode || error.status || 500).json({ error: error.message || 'Internal server error' });
}

router.get('/institutions', async (_req: Request, res: Response) => {
  try {
    const data = await institutionAdminService.list();
    res.json(data);
  } catch (error: any) {
    sendError(res, error);
  }
});

router.post('/institutions', async (req: Request, res: Response) => {
  try {
    const data = await institutionAdminService.create(req.body);
    res.status(201).json(data);
  } catch (error: any) {
    sendError(res, error);
  }
});

router.patch('/institutions/:id', async (req: Request, res: Response) => {
  try {
    const data = await institutionAdminService.update(String(req.params.id), req.body);
    res.json(data);
  } catch (error: any) {
    sendError(res, error);
  }
});

router.patch('/institutions/:id/status', async (req: Request, res: Response) => {
  try {
    const data = await institutionAdminService.setStatus(String(req.params.id), !!req.body.isActive);
    res.json(data);
  } catch (error: any) {
    sendError(res, error);
  }
});

router.get('/institutions/:id/subscriptions', async (req: Request, res: Response) => {
  try {
    const data = await institutionAdminService.getSubscriptions(String(req.params.id));
    res.json(data);
  } catch (error: any) {
    sendError(res, error);
  }
});

router.post('/institutions/:id/subscriptions', async (req: Request, res: Response) => {
  try {
    const data = await institutionAdminService.assignSubscription(String(req.params.id), req.body);
    res.status(201).json(data);
  } catch (error: any) {
    sendError(res, error);
  }
});

router.patch('/subscriptions/:id', async (req: Request, res: Response) => {
  try {
    const data = await institutionAdminService.updateSubscription(String(req.params.id), req.body);
    res.json(data);
  } catch (error: any) {
    sendError(res, error);
  }
});

export default router;
