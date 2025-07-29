import { Request, Response } from 'express';
import { PointModel } from '../models/Point.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getPoints = async (req: Request, res: Response) => {
  try {
    const points = await PointModel.findAll();
    res.json({ data: points });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ error: 'Failed to fetch points' });
  }
};

export const getPoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const point = await PointModel.findById(id);
    
    if (!point) {
      return res.status(404).json({ error: 'Point not found' });
    }
    
    res.json({ data: point });
  } catch (error) {
    console.error('Error fetching point:', error);
    res.status(500).json({ error: 'Failed to fetch point' });
  }
};

export const createPoint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pointData = req.body;
    const point = await PointModel.create(pointData);
    res.status(201).json({ data: point, message: 'Point created successfully' });
  } catch (error) {
    console.error('Error creating point:', error);
    res.status(500).json({ error: 'Failed to create point' });
  }
};

export const updatePoint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const point = await PointModel.update(id, updates);
    res.json({ data: point, message: 'Point updated successfully' });
  } catch (error) {
    console.error('Error updating point:', error);
    res.status(500).json({ error: 'Failed to update point' });
  }
};

export const deletePoint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await PointModel.delete(id);
    res.json({ message: 'Point deleted successfully' });
  } catch (error) {
    console.error('Error deleting point:', error);
    res.status(500).json({ error: 'Failed to delete point' });
  }
};