import db from "../config/db.js";

// Controller to add machines for a product
export const addMachines = async (req, res) => {
  const { product_id, product_name, machines } = req.body;

  if ((!product_id && !product_name) || !Array.isArray(machines) || machines.length === 0) {
    return res.status(400).json({ error: "Missing product_id/product_name or machines data" });
  }

  try {
    let resolvedProductId = product_id;
    if (!resolvedProductId && product_name) {
      const [rows] = await db.query("SELECT id FROM products WHERE name = ? LIMIT 1", [product_name]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      resolvedProductId = rows[0].id;
    }

    for (const machine of machines) {
      const machineName = machine.machine || machine.machineName || null;
      const cycleTime = Number(machine.cycleTime ?? machine.cycle_time ?? 0);
      const dailyCount = Number(machine.dailyCount ?? machine.daily_count ?? 0);
      const productsPerHour = Number(machine.perHour ?? machine.productsPerHour ?? machine.products_per_hour ?? 0);

      if (!machineName) {
        return res.status(400).json({ error: "Each machine requires a name" });
      }

      await db.query(
        `INSERT INTO machines 
          (product_id, machine_name, cycle_time, daily_count, products_per_hour)
         VALUES (?, ?, ?, ?, ?)`,
        [resolvedProductId, machineName, cycleTime, dailyCount, productsPerHour]
      );
    }

    res.json({ message: "Machines inserted successfully" });
  } catch (err) {
    console.error("Error inserting machines:", err);
    res.status(500).json({ error: "Failed to insert machines" });
  }
};

export const deleteMachine = async (req, res) => {
  const { product_id, product_name, machine_name } = req.body;

  if ((!product_id && !product_name) || !machine_name) {
    return res.status(400).json({ error: "Missing product_id/product_name or machine_name" });
  }

  try {
    let resolvedProductId = product_id;
    if (!resolvedProductId && product_name) {
      const [rows] = await db.query("SELECT id FROM products WHERE name = ? LIMIT 1", [product_name]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      resolvedProductId = rows[0].id;
    }

    const [result] = await db.query(
      "DELETE FROM machines WHERE product_id = ? AND machine_name = ?",
      [resolvedProductId, machine_name]
    );

    return res.json({ deleted: result.affectedRows });
  } catch (err) {
    console.error("Error deleting machine:", err);
    return res.status(500).json({ error: "Failed to delete machine" });
  }
};

export const getMachinesByProduct = async (req, res) => {
  const { productName } = req.params;
  if (!productName) {
    return res.status(400).json({ error: "Missing product name" });
  }

  try {
    const [productRows] = await db.query(
      "SELECT id FROM products WHERE name = ? LIMIT 1",
      [productName]
    );
    if (!productRows || productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const productId = productRows[0].id;

    const [rows] = await db.query(
      `SELECT id, machine_name, cycle_time, daily_count, products_per_hour, created_at
       FROM machines WHERE product_id = ? ORDER BY id ASC`,
      [productId]
    );

    return res.json(
      rows.map((r, index) => ({
        id: r.id ?? index + 1,
        machine: r.machine_name,
        cycleTime: r.cycle_time,
        dailyCount: r.daily_count,
        perHour: r.products_per_hour,
        created_at: r.created_at,
      }))
    );
  } catch (err) {
    console.error("Error fetching machines:", err);
    return res.status(500).json({ error: "Failed to fetch machines" });
  }
};
