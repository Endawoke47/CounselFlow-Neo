/**
 * 🔗 REAL SERVICES INTEGRATION
 * ===========================
 * Integration file for our new real services with the existing API
 */

import { Router } from 'express';
import realAuthRoutes from './routes/auth-real.routes';
import realContractRoutes from './routes/real-contract.routes';
import realClientRoutes from './routes/real-client.routes';

const router = Router();

// Mount real service routes
router.use('/auth', realAuthRoutes);
router.use('/contracts', realContractRoutes);
router.use('/clients', realClientRoutes);

// Health check for real services
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Real services are operational',
    timestamp: new Date().toISOString(),
    services: {
      authentication: 'operational',
      contracts: 'operational',
      clients: 'operational',
    },
  });
});

export default router;
