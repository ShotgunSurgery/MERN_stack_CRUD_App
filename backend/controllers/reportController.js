import db from "../config/db.js";

export const ensureProductStationLogsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS product_station_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT NOT NULL,
      station_id INT NOT NULL,
      worker_id INT NULL,
      in_time DATETIME NOT NULL,
      out_time DATETIME NULL,
      status ENUM('in_progress','completed') DEFAULT 'in_progress',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_psl_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT fk_psl_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
      CONSTRAINT fk_psl_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_psl_times (in_time, out_time),
      INDEX idx_psl_status (status)
    )
  `);
};

export const getStationCompletions = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "Missing required query params: from, to (YYYY-MM-DD)" });
    }
    const [rows] = await db.query(
      `SELECT l.station_id, s.station_name, COUNT(*) AS completed_count
       FROM product_station_logs l
       JOIN stations s ON s.id = l.station_id
       WHERE l.status = 'completed' AND l.out_time BETWEEN ? AND ?
       GROUP BY l.station_id, s.station_name
       ORDER BY completed_count DESC`,
      [from + ' 00:00:00', to + ' 23:59:59']
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching station completions:", err);
    res.status(500).json({ error: "Failed to fetch station completions" });
  }
};

export const getEmployeeCompletions = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "Missing required query params: from, to (YYYY-MM-DD)" });
    }
    const [rows] = await db.query(
      `SELECT l.worker_id, u.first_name, u.last_name, COUNT(*) AS completed_count
       FROM product_station_logs l
       JOIN users u ON u.id = l.worker_id
       WHERE l.status = 'completed' AND l.out_time BETWEEN ? AND ?
       GROUP BY l.worker_id, u.first_name, u.last_name
       ORDER BY completed_count DESC`,
      [from + ' 00:00:00', to + ' 23:59:59']
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employee completions:", err);
    res.status(500).json({ error: "Failed to fetch employee completions" });
  }
};

export const getProductDetailsFlow = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ error: "Missing required query param: productId" });
    }
    const [rows] = await db.query(
      `SELECT l.station_id, s.station_name, l.in_time, l.out_time,
              TIMESTAMPDIFF(DAY, l.in_time, COALESCE(l.out_time, NOW())) AS days_spent,
              l.worker_id
       FROM product_station_logs l
       JOIN stations s ON s.id = l.station_id
       WHERE l.product_id = ?
       ORDER BY l.in_time ASC`,
      [productId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching product flow details:", err);
    res.status(500).json({ error: "Failed to fetch product flow details" });
  }
};

export const getWeeklyCompletions = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "Missing required query params: from, to (YYYY-MM-DD)" });
    }
    const [rows] = await db.query(
      `SELECT DAYNAME(l.out_time) AS weekday, s.station_name, COUNT(*) AS completed_count
       FROM product_station_logs l
       JOIN stations s ON s.id = l.station_id
       WHERE l.status = 'completed' AND l.out_time BETWEEN ? AND ?
       GROUP BY weekday, s.station_name
       ORDER BY FIELD(weekday,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), s.station_name`,
      [from + ' 00:00:00', to + ' 23:59:59']
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching weekly completions:", err);
    res.status(500).json({ error: "Failed to fetch weekly completions" });
  }
};


