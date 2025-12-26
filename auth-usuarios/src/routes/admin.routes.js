import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';
import { adminDashboard } from '../controllers/admin.controller.js';

const router = Router();

router.get('/dashboard', requireAuth, requireAdmin, adminDashboard);

export default router;