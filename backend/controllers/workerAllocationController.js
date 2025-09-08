import db from '../config/db.js';

// Create multiple worker allocations
const createAllocations = async (req, res) => {
  try {
    const { allocations } = req.body;

    if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
      return res.status(400).json({ error: 'Allocations array is required' });
    }

    // Validate required fields
    for (const allocation of allocations) {
      if (!allocation.station_id || !allocation.user_id || !allocation.allocation_date) {
        return res.status(400).json({ 
          error: 'Each allocation must have station_id, user_id, and allocation_date' 
        });
      }
    }

    // Check for existing allocations on the same date and station
    const stationIds = allocations.map(a => a.station_id);
    const allocationDate = allocations[0].allocation_date;

    const existingAllocations = await db.query(
      'SELECT station_id FROM station_allocations WHERE allocation_date = ? AND station_id IN (?)',
      [allocationDate, stationIds]
    );

    if (existingAllocations.length > 0) {
      const existingStations = existingAllocations.map(a => a.station_id);
      return res.status(400).json({ 
        error: `Stations ${existingStations.join(', ')} already have allocations for ${allocationDate}` 
      });
    }

    // Insert allocations
    const insertPromises = allocations.map(allocation => {
      return db.query(
        `INSERT INTO station_allocations 
         (user_id, station_id, allocation_date, start_time, end_time, notes, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          allocation.user_id,
          allocation.station_id,
          allocation.allocation_date,
          allocation.start_time || '08:00:00',
          allocation.end_time || '16:00:00',
          allocation.notes || '',
          allocation.created_by || 1 // Default admin user
        ]
      );
    });

    await Promise.all(insertPromises);

    // Log to audit table
    const auditPromises = allocations.map(allocation => {
      return db.query(
        `INSERT INTO allocation_audit (user_id, action, action_by, details) 
         VALUES (?, 'assigned', ?, ?)`,
        [
          allocation.user_id,
          allocation.created_by || 1,
          `Worker assigned to station ${allocation.station_id} on ${allocation.allocation_date}`
        ]
      );
    });

    await Promise.all(auditPromises);

    res.status(201).json({ 
      message: 'Worker allocations created successfully',
      count: allocations.length 
    });

  } catch (error) {
    console.error('Error creating allocations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all allocations
const getAllocations = async (req, res) => {
  try {
    const { date, station_id, user_id } = req.query;
    
    let query = `
      SELECT 
        sa.*,
        u.first_name,
        u.last_name,
        u.designation,
        s.station_name,
        sh.name as shift_name
      FROM station_allocations sa
      LEFT JOIN users u ON sa.user_id = u.id
      LEFT JOIN stations s ON sa.station_id = s.id
      LEFT JOIN shifts sh ON sa.shift_id = sh.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (date) {
      query += ' AND sa.allocation_date = ?';
      params.push(date);
    }
    
    if (station_id) {
      query += ' AND sa.station_id = ?';
      params.push(station_id);
    }
    
    if (user_id) {
      query += ' AND sa.user_id = ?';
      params.push(user_id);
    }
    
    query += ' ORDER BY sa.allocation_date DESC, s.station_name';

    const [allocations] = await db.query(query, params);
    
    res.json(allocations);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get allocation by ID
const getAllocationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [allocations] = await db.query(
      `SELECT 
        sa.*,
        u.first_name,
        u.last_name,
        u.designation,
        s.station_name,
        sh.name as shift_name
      FROM station_allocations sa
      LEFT JOIN users u ON sa.user_id = u.id
      LEFT JOIN stations s ON sa.station_id = s.id
      LEFT JOIN shifts sh ON sa.shift_id = sh.id
      WHERE sa.id = ?`,
      [id]
    );
    
    if (allocations.length === 0) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    
    res.json(allocations[0]);
  } catch (error) {
    console.error('Error fetching allocation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update allocation
const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, station_id, allocation_date, start_time, end_time, notes, shift_id } = req.body;
    
    // Check if allocation exists
    const [existing] = await db.query('SELECT * FROM station_allocations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    
    // Update allocation
    await db.query(
      `UPDATE station_allocations 
       SET user_id = ?, station_id = ?, allocation_date = ?, start_time = ?, 
           end_time = ?, notes = ?, shift_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [user_id, station_id, allocation_date, start_time, end_time, notes, shift_id, id]
    );
    
    // Log to audit table
    await db.query(
      `INSERT INTO allocation_audit (allocation_id, user_id, action, action_by, details) 
       VALUES (?, ?, 'assigned', ?, ?)`,
      [id, user_id, 1, `Allocation updated for station ${station_id} on ${allocation_date}`]
    );
    
    res.json({ message: 'Allocation updated successfully' });
  } catch (error) {
    console.error('Error updating allocation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete allocation
const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if allocation exists
    const [existing] = await db.query('SELECT * FROM station_allocations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Allocation not found' });
    }
    
    // Delete allocation
    await db.query('DELETE FROM station_allocations WHERE id = ?', [id]);
    
    // Log to audit table
    await db.query(
      `INSERT INTO allocation_audit (allocation_id, user_id, action, action_by, details) 
       VALUES (?, ?, 'revoked', ?, ?)`,
      [id, existing[0].user_id, 1, `Allocation deleted for station ${existing[0].station_id}`]
    );
    
    res.json({ message: 'Allocation deleted successfully' });
  } catch (error) {
    console.error('Error deleting allocation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available workers for a specific date and station
const getAvailableWorkers = async (req, res) => {
  try {
    const { date, station_id } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    // Get workers who are not already allocated on this date
    const [workers] = await db.query(
      `SELECT u.* FROM users u 
       WHERE u.status = 'Active' 
       AND u.id NOT IN (
         SELECT user_id FROM station_allocations 
         WHERE allocation_date = ?
       )
       ORDER BY u.first_name, u.last_name`,
      [date]
    );
    
    res.json(workers);
  } catch (error) {
    console.error('Error fetching available workers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete allocations by date
const deleteAllocationsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    // Get allocations to be deleted for audit
    const [existingAllocations] = await db.query(
      'SELECT * FROM station_allocations WHERE allocation_date = ?',
      [date]
    );
    
    // Delete allocations
    const [result] = await db.query(
      'DELETE FROM station_allocations WHERE allocation_date = ?',
      [date]
    );
    
    // Log to audit table
    for (const allocation of existingAllocations) {
      await db.query(
        `INSERT INTO allocation_audit (allocation_id, user_id, action, action_by, details) 
         VALUES (?, ?, 'revoked', ?, ?)`,
        [allocation.id, allocation.user_id, 1, `All allocations deleted for date ${date}`]
      );
    }
    
    res.json({ 
      message: 'Allocations deleted successfully',
      deletedCount: result.affectedRows 
    });
  } catch (error) {
    console.error('Error deleting allocations by date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  createAllocations,
  getAllocations,
  getAllocationById,
  updateAllocation,
  deleteAllocation,
  getAvailableWorkers,
  deleteAllocationsByDate
};
