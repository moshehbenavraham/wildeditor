import { Request, Response } from 'express';
import { PathModel } from '../models/Path.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getPaths = async (req: Request, res: Response) => {
  try {
    const paths = await PathModel.findAll();
    res.json({ data: paths });
  } catch (error) {
    console.error('Error fetching paths:', error);
    res.status(500).json({ error: 'Failed to fetch paths' });
  }
};

export const getPath = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const path = await PathModel.findById(id);
    
    if (!path) {
      return res.status(404).json({ error: 'Path not found' });
    }
    
    res.json({ data: path });
  } catch (error) {
    console.error('Error fetching path:', error);
    res.status(500).json({ error: 'Failed to fetch path' });
  }
};

export const createPath = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pathData = req.body;
    const path = await PathModel.create(pathData);
    res.status(201).json({ data: path, message: 'Path created successfully' });
  } catch (error) {
    console.error('Error creating path:', error);
    res.status(500).json({ error: 'Failed to create path' });
  }
};

export const updatePath = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const path = await PathModel.update(id, updates);
    res.json({ data: path, message: 'Path updated successfully' });
  } catch (error) {
    console.error('Error updating path:', error);
    res.status(500).json({ error: 'Failed to update path' });
  }
};

export const deletePath = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await PathModel.delete(id);
    res.json({ message: 'Path deleted successfully' });
  } catch (error) {
    console.error('Error deleting path:', error);
    res.status(500).json({ error: 'Failed to delete path' });
  }
};