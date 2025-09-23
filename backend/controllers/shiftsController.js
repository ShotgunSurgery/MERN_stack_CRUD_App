import db from "../config/db.js"; // this should be your MySQL connection pool or client

// CREATE new shift
export const createShift = async (req, res) => {
  const { name, start_time, end_time, is_active } = req.body;

  const sql = `
    INSERT INTO shifts (name, start_time, end_time, is_active)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const [result] = await db.execute(sql, [name, start_time, end_time, is_active]);
    // send back the inserted row id (auto_increment)
    res.json({ id: result.insertId, name, start_time, end_time, is_active });
  } catch (err) {
    console.error("Error inserting shift:", err);
    return res.status(500).json({ error: "Database insert failed" });
  }
};

// UPDATE existing shift
export const updateShift = async (req, res) => {
  const { id } = req.params;
  const { name, start_time, end_time, is_active } = req.body;

  const sql = `
    UPDATE shifts
    SET name = ?, start_time = ?, end_time = ?, is_active = ?
    WHERE id = ?
  `;

  try {
    const [result] = await db.execute(sql, [name, start_time, end_time, is_active, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Shift not found" });
    }

    // send back updated data
    res.json({ id, name, start_time, end_time, is_active });
  } catch (err) {
    console.error("Error updating shift:", err);
    return res.status(500).json({ error: "Database update failed" });
  }
};

// GET all shifts
export const getShifts = async (req, res) => {
  const sql = `SELECT * FROM shifts`;

  try {
    const [rows] = await db.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching shifts:", err);
    return res.status(500).json({ error: "Database query failed" });
  }
};

// DELETE shift
export const deleteShift = async (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM shifts WHERE id = ?`;

  try {
    const [result] = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Shift not found" });
    }

    res.status(204).send(); // No content
  } catch (err) {
    console.error("Error deleting shift:", err);
    return res.status(500).json({ error: "Database delete failed" });
  }
};
