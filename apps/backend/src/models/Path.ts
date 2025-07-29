import { supabase } from '../config/database.js';
import { Path, PathEntity } from '@wildeditor/shared/types';

export class PathModel {
  static async findAll(): Promise<PathEntity[]> {
    const { data, error } = await supabase
      .from('paths')
      .select('*')
      .order('vnum');

    if (error) throw error;
    return data || [];
  }

  static async findById(id: string): Promise<PathEntity | null> {
    const { data, error } = await supabase
      .from('paths')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async create(path: Omit<Path, 'id'>): Promise<PathEntity> {
    const { data, error } = await supabase
      .from('paths')
      .insert({
        vnum: path.vnum,
        name: path.name,
        type: path.type,
        coordinates: path.coordinates,
        color: path.color
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Path>): Promise<PathEntity> {
    const { data, error } = await supabase
      .from('paths')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('paths')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}