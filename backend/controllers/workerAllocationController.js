import db from "../config/db.js";

// Ensure table exists (called from server too, but safe here for direct imports/tests)
export const ensureWorkerAllocationsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS worker_allocations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      allocation_date DATE NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      station_id INT NOT NULL,
      worker_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_allocation (allocation_date, product_name, station_id, worker_id)
    )
  `);
};

export const getAllocations = async (req, res) => {
  try {
    const { date, product } = req.query;
    if (!date || !product) {
      return res.status(400).json({ error: "Missing required query params: date, product" });
    }

    const [rows] = await db.query(
      `SELECT station_id, worker_id 
       FROM worker_allocations 
       WHERE allocation_date = ? AND product_name = ?`,
      [date, product]
    );

    // Group by station_id -> [worker_id]
    const byStation = {};
    for (const row of rows) {
      if (!byStation[row.station_id]) byStation[row.station_id] = [];
      byStation[row.station_id].push(row.worker_id);
    }

    res.json(byStation);
  } catch (err) {
    console.error("Error fetching allocations:", err);
    res.status(500).json({ error: "Failed to fetch allocations" });
  }
};

// Upsert/replace allocations for provided date+product.
// Expected body: { date: 'YYYY-MM-DD', product: 'ProductName', allocations: { [stationId]: number[] } }
export const saveAllocations = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { date, product, allocations } = req.body || {};
    if (!date || !product || !allocations || typeof allocations !== 'object') {
      return res.status(400).json({ error: "Missing required body: date, product, allocations" });
    }

    await conn.beginTransaction();

    // Delete existing allocations for this date+product for all stations referenced
    const stationIds = Object.keys(allocations).map((id) => parseInt(id, 10)).filter((n) => Number.isInteger(n));
    if (stationIds.length > 0) {
      await conn.query(
        `DELETE FROM worker_allocations WHERE allocation_date = ? AND product_name = ? AND station_id IN (${stationIds.map(() => '?').join(',')})`,
        [date, product, ...stationIds]
      );
    } else {
      // If no stations provided, it is effectively a clear operation for none; continue
    }

    // Insert new allocations
    for (const [stationIdStr, workerIds] of Object.entries(allocations)) {
      const stationId = parseInt(stationIdStr, 10);
      if (!Number.isInteger(stationId)) continue;
      const workerIdList = Array.isArray(workerIds) ? workerIds : [];
      for (const workerId of workerIdList) {
        await conn.query(
          `INSERT INTO worker_allocations (allocation_date, product_name, station_id, worker_id) VALUES (?, ?, ?, ?)`,
          [date, product, stationId, workerId]
        );
      }
    }

    await conn.commit();
    res.json({ message: "Allocations saved" });
  } catch (err) {
    await conn.rollback();
    console.error("Error saving allocations:", err);
    res.status(500).json({ error: "Failed to save allocations" });
  } finally {
    conn.release();
  }
};


