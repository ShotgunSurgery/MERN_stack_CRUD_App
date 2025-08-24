import db from "../config/db.js"; // assuming you use a db.js for mysql connection

// CREATE a station
export const createStation = async (req, res) => {
  try {
    const { product_name, station_number, station_name, cycle_time, daily_count, products_per_hour, report_type, parameters } = req.body;

    const query = `
      INSERT INTO stations 
      (product_name, station_number, station_name, cycle_time, daily_count, products_per_hour, report_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(
      query,
      [product_name, station_number, station_name, cycle_time, daily_count, products_per_hour, report_type]
    );

    res.status(201).json({ message: "Station created successfully", stationId: result.insertId });
  } catch (err) {
    console.error("Error inserting station:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// GET all stations
export const getStations = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM stations ORDER BY product_name, station_number");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching stations:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// GET stations by product name with their parameters
export const getStationsByProduct = async (req, res) => {
  try {
    const { productName } = req.params;
    
    console.log("Fetching stations for product:", productName);
    
    // First get all stations for the product
    const stationsQuery = "SELECT * FROM stations WHERE product_name = ? ORDER BY station_number ASC";
    const [stations] = await db.query(stationsQuery, [productName]);
    
    // Then get parameters for each station
    const stationsWithParams = await Promise.all(
      stations.map(async (station) => {
        const paramsQuery = `
          SELECT sp.id, sp.name, sp.description, sp.unit 
          FROM station_parameter_assignments spa
          JOIN station_parameters sp ON spa.parameter_id = sp.id
          WHERE spa.station_id = ?
        `;
        const [params] = await db.query(paramsQuery, [station.id]);
        
        return {
          ...station,
          parameters: params
        };
      })
    );
    
    console.log(`Found ${stationsWithParams.length} stations for product: ${productName}`);
    res.json(stationsWithParams);
  } catch (err) {
    console.error("Error fetching stations by product:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// GET all parameters
export const getParameters = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM station_parameters ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching parameters:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// UPDATE station order
export const updateStationOrder = async (req, res) => {
  try {
    const { stations } = req.body;
    
    console.log("Updating station order for:", stations.length, "stations");
    
    // Update each station's order
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      await db.query(
        "UPDATE stations SET station_number = ? WHERE id = ?",
        [i + 1, station.id]
      );
    }
    
    console.log("Station order updated successfully");
    res.json({ message: "Station order updated successfully" });
  } catch (err) {
    console.error("Error updating station order:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// UPDATE a station
export const updateStation = async (req, res) => {
  try {
    const { id } = req.params;
    const { station_number, station_name, cycle_time, daily_count, products_per_hour, report_type } = req.body;

    const query = `
      UPDATE stations 
      SET station_number = ?, station_name = ?, cycle_time = ?, daily_count = ?, 
          products_per_hour = ?, report_type = ?
      WHERE id = ?
    `;

    await db.query(
      query,
      [station_number, station_name, cycle_time, daily_count, products_per_hour, report_type, id]
    );

    res.json({ message: "Station updated successfully" });
  } catch (err) {
    console.error("Error updating station:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// ADD parameter to station
export const addParameterToStation = async (req, res) => {
  try {
    const { stationId, parameterId } = req.params;
    
    const query = "INSERT INTO station_parameter_assignments (station_id, parameter_id) VALUES (?, ?)";
    await db.query(query, [stationId, parameterId]);
    
    res.json({ message: "Parameter added to station successfully" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "Parameter already assigned to this station" });
    } else {
      console.error("Error adding parameter to station:", err);
      res.status(500).json({ error: "Database error" });
    }
  }
};

// REMOVE parameter from station
export const removeParameterFromStation = async (req, res) => {
  try {
    const { stationId, parameterId } = req.params;
    
    const query = "DELETE FROM station_parameter_assignments WHERE station_id = ? AND parameter_id = ?";
    await db.query(query, [stationId, parameterId]);
    
    res.json({ message: "Parameter removed from station successfully" });
  } catch (err) {
    console.error("Error removing parameter from station:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// GET parameters for a specific station
export const getStationParameters = async (req, res) => {
  try {
    const { stationId } = req.params;
    
    const query = `
      SELECT sp.id, sp.name, sp.description, sp.unit 
      FROM station_parameter_assignments spa
      JOIN station_parameters sp ON spa.parameter_id = sp.id
      WHERE spa.station_id = ?
    `;
    
    const [rows] = await db.query(query, [stationId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching station parameters:", err);
    res.status(500).json({ error: "Database error" });
  }
};
