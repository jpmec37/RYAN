import { supabase } from '../config/supabase.js';

export const TABLE_NAME = 'lost_found_items';

export class LostFoundItem {
  static async create(data) {
    const { description, category, location_found, status = 'disponivel' } = data;

    const errors = this.validate(data);
    if (errors.length > 0) {
      const error = new Error('Dados inválidos');
      error.status = 400;
      error.errors = errors;
      throw error;
    }

    const { data: item, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          description: description.trim(),
          category: category.trim(),
          location_found: location_found.trim(),
          status,
          registration_date: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      const err = new Error('Erro ao criar item');
      err.status = 500;
      err.details = error.message;
      throw err;
    }

    return item;
  }

  static async findAll(filters = {}) {
    let query = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('registration_date', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.ilike('category', `%${filters.category}%`);
    if (filters.search) query = query.or(`description.ilike.%${filters.search}%,location_found.ilike.%${filters.search}%`);
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset !== undefined) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

    const { data, error, count } = await query;

    if (error) {
      const err = new Error('Erro ao buscar itens');
      err.status = 500;
      err.details = error.message;
      throw err;
    }

    return { items: data || [], total: count || data?.length || 0 };
  }

  static async findById(id) {
    const { data: item, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const err = new Error('Item não encontrado');
        err.status = 404;
        throw err;
      }
      const err = new Error('Erro ao buscar item');
      err.status = 500;
      err.details = error.message;
      throw err;
    }

    return item;
  }

  static async update(id, data) {
    const { status, description, category, location_found } = data;

    if (status && !['disponivel', 'devolvido'].includes(status)) {
      const err = new Error('Status inválido. Use "disponivel" ou "devolvido"');
      err.status = 400;
      throw err;
    }

    const updateData = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (description) updateData.description = description.trim();
    if (category) updateData.category = category.trim();
    if (location_found) updateData.location_found = location_found.trim();

    const { data: item, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const err = new Error('Item não encontrado');
        err.status = 404;
        throw err;
      }
      const err = new Error('Erro ao atualizar item');
      err.status = 500;
      err.details = error.message;
      throw err;
    }

    return item;
  }

  static async delete(id) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      const err = new Error('Erro ao excluir item');
      err.status = 500;
      err.details = error.message;
      throw err;
    }

    return { success: true, message: 'Item excluído com sucesso' };
  }

  static validate(data) {
    const errors = [];

    if (!data.description || data.description.trim().length < 3) {
      errors.push({ field: 'description', message: 'Descrição deve ter pelo menos 3 caracteres' });
    }
    if (!data.category || data.category.trim().length < 2) {
      errors.push({ field: 'category', message: 'Categoria deve ter pelo menos 2 caracteres' });
    }
    if (!data.location_found || data.location_found.trim().length < 2) {
      errors.push({ field: 'location_found', message: 'Local deve ter pelo menos 2 caracteres' });
    }
    if (data.status && !['disponivel', 'devolvido'].includes(data.status)) {
      errors.push({ field: 'status', message: 'Status deve ser "disponivel" ou "devolvido"' });
    }

    return errors;
  }

  static async getStats() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('status', { count: 'exact' });

    if (error) {
      const err = new Error('Erro ao buscar estatísticas');
      err.status = 500;
      err.details = error.message;
      throw err;
    }

    const stats = {
      total: data?.length || 0,
      disponivel: 0,
      devolvido: 0
    };

    data?.forEach(item => {
      if (item.status === 'disponivel') stats.disponivel++;
      if (item.status === 'devolvido') stats.devolvido++;
    });

    return stats;
  }
}