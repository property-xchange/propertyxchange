import express from 'express';
import {
  getAllAgents,
  getSingleAgent,
} from '../controllers/agent.controller.js';

const router = express.Router();

router.get('/', getAllAgents);
router.get('/:id', getSingleAgent);

export default router;
