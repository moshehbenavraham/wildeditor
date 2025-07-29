import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getPoints,
  getPoint,
  createPoint,
  updatePoint,
  deletePoint
} from '../controllers/pointController.js';

const router = Router();

router.get('/', getPoints);
router.get('/:id', getPoint);
router.post('/', authenticateToken, createPoint);
router.put('/:id', authenticateToken, updatePoint);
router.delete('/:id', authenticateToken, deletePoint);

export default router;