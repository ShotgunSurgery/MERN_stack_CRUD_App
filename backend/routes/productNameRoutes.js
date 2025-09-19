import express from 'express';
import { getProductNames } from '../controllers/productNamesController.js';

const router = express.Router();

router.get('/', getProductNames);

export default router;