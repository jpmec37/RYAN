import express from 'express';
import { ItemController } from '../controllers/itemController.js';

const router = express.Router();

// Middleware de validação de UUID
const validateUUID = (req, res, next) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'ID inválido. Deve ser um UUID válido.'
    });
  }
  next();
};

// Rotas
router.get('/stats', ItemController.getStats);
router.get('/', ItemController.list);
router.get('/:id', validateUUID, ItemController.getById);
router.post('/', ItemController.create);
router.put('/:id', validateUUID, ItemController.update);
router.patch('/:id', validateUUID, ItemController.update);
router.patch('/:id/status', validateUUID, ItemController.updateStatus);
router.delete('/:id', validateUUID, ItemController.delete);

export default router;