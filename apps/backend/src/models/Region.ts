import { supabase } from '../config/database';
import { Region, RegionEntity, Coordinate } from '@wildeditor/shared/types';

export class RegionModel {
  static async findAll(): Promise<RegionEntity[]> {
    if (!supabase) {
      console.warn('Supabase not configured - returning mock data');
      return [];
    }

    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('vnum');

    if (error) throw error;
    return data || [];
  }

  static async findById(id: string): Promise<RegionEntity | null> {
    if (!supabase) {
      console.warn('Supabase not configured - returning null');
      return null;
    }

    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async create(region: Omit<Region, 'id'>): Promise<RegionEntity> {
    if (!supabase) {
      throw new Error('Supabase not configured - cannot create region');
    }

    const { data, error } = await supabase
      .from('regions')
      .insert({
        vnum: region.vnum,
        name: region.name,
        type: region.type,
        coordinates: region.coordinates,
        properties: region.properties,
        color: region.color
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<Region>): Promise<RegionEntity> {
    if (!supabase) {
      throw new Error('Supabase not configured - cannot update region');
    }

    const { data, error } = await supabase
      .from('regions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured - cannot delete region');
    }

    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}