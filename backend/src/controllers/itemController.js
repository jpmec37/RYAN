import { LostFoundItem } from '../models/LostFoundItem.js';

export class ItemController {
  static async list(req, res) {
    try {
      const { status, category, search, limit, offset } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (category) filters.category = category;
      if (search) filters.search = search;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const result = await LostFoundItem.findAll(filters);

      res.json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          limit: filters.limit || result.items.length,
          offset: filters.offset || 0
        }
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: error.errors
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await LostFoundItem.findById(id);

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  static async create(req, res) {
    try {
      const item = await LostFoundItem.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Item cadastrado com sucesso',
        data: item
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: error.errors
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const item = await LostFoundItem.update(id, req.body);

      res.json({
        success: true,
        message: 'Item atualizado com sucesso',
        data: item
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: error.errors
      });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status é obrigatório'
        });
      }

      const item = await LostFoundItem.update(id, { status });

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: item
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await LostFoundItem.delete(id);

      res.json({
        success: true,
        message: 'Item excluído com sucesso'
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await LostFoundItem.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}