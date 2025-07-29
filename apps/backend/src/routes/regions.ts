import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getRegions,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion
} from '../controllers/regionController';

const router = Router();

router.get('/', getRegions);
router.get('/:id', getRegion);
router.post('/', authenticateToken, createRegion);
router.put('/:id', authenticateToken, updateRegion);
router.delete('/:id', authenticateToken, deleteRegion);

export default router;