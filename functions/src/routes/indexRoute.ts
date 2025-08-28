import { Router, Request, Response } from 'express';
const router = Router();
import * as controller from '../controllers/indexController';

// Define your routes here
router.get('/', controller.home);

export default router;
