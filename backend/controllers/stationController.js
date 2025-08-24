import db from "../config/db.js"; // assuming you use a db.js for mysql connection

// CREATE a station
export const createStation = (req, res) => {
  const { product_name, station_number, station_name, cycle_time, daily_count, products_per_hour, report_type } = req.body;

  const query = `
    INSERT INTO stations 
    (product_name, station_number, station_name, cycle_time, daily_count, products_per_hour, report_type) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [product_name, station_number, station_name, cycle_time, daily_count, products_per_hour, report_type],
    (err, result) => {
      if (err) {
        console.error("Error inserting station:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Station created successfully", stationId: result.insertId });
    }
  );
};


// GET all stations
export const getStations = (req, res) => {
  db.query("SELECT * FROM stations", (err, rows) => {
    if (err) {
      console.error("Error fetching stations:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
};
