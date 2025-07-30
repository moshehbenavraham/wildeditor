import { Request, Response } from 'express';
import { RegionModel } from '../models/Region';
import { AuthenticatedRequest } from '../middleware/auth';

export const getRegions = async (req: Request, res: Response) => {
  try {
    const regions = await RegionModel.findAll();
    res.json({ data: regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
};

export const getRegion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const region = await RegionModel.findById(id);
    
    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }
    
    res.json({ data: region });
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({ error: 'Failed to fetch region' });
  }
};

export const createRegion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const regionData = req.body;
    
    // Basic validation
    if (!regionData.name || !regionData.type || !regionData.coordinates || !Array.isArray(regionData.coordinates)) {
      return res.status(400).json({ error: 'Missing required fields: name, type, coordinates' });
    }
    const region = await RegionModel.create(regionData);
    res.status(201).json({ data: region, message: 'Region created successfully' });
  } catch (error) {
    console.error('Error creating region:', error);
    res.status(500).json({ error: 'Failed to create region' });
  }
};

export const updateRegion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Basic validation - ensure we have something to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }
    const region = await RegionModel.update(id, updates);
    res.json({ data: region, message: 'Region updated successfully' });
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ error: 'Failed to update region' });
  }
};

export const deleteRegion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await RegionModel.delete(id);
    res.json({ message: 'Region deleted successfully' });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({ error: 'Failed to delete region' });
  }
};