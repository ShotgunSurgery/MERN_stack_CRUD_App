import express from 'express';
import {
  createAllocations,
  getAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
  getAvailableWorkers,
  deleteAllocationsByDate
} from '../controllers/workerAllocationController.js';

const router = express.Router();

// Create multiple worker allocations
router.post('/', createAllocations);

// Get all allocations (with optional filters)
router.get('/', getAllocations);

// Get available workers for a specific date and station
router.get('/available-workers', getAvailableWorkers);

// Get allocation by ID
router.get('/:id', getAllocationById);

// Update allocation
router.put('/:id', updateAllocation);

// Delete allocation
router.delete('/:id', deleteAllocation);

// Delete allocations by date
router.delete('/', deleteAllocationsByDate);

export default router;
