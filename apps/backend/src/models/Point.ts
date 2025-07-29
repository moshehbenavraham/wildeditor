import { supabase } from '../config/database.js';
import { Point, PointEntity } from '@wildeditor/shared/types';

export class PointModel {
  static async findAll(): Promise<PointEntity[]> {
    const { data, error } = await supabase
      .from('points')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async findById(id: string): Promise<PointEntity | null> {
    const { data, error } = await supabase
      .from('points')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async create(point: Omit<Point, 'id'>): Promise<PointEntity> {
    const { data, error } = await supabase
      .from('points')
      .insert({
        name: point.name,
        type: point.type,
        coordinate: point.coordinate
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Point>): Promise<PointEntity> {
    const { data, error } = await supabase
      .from('points')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('points')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}