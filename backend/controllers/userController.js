import pool from "../config/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const createUser = async (req, res) => {
  const {
    username,
    password,
    first_name,
    last_name,
    nickname,
    mobile_number,
    designation,
    joining_date,
    user_type,
    permissions,
  } = req.body;

  if (!username || !password || !first_name || !last_name || !joining_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if username already exists
    const [existingUsers] = await conn.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (existingUsers.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const [result] = await conn.query(
      `INSERT INTO users 
      (username, password_hash, first_name, last_name, nickname, mobile_number, designation, joining_date, user_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        password_hash,
        first_name,
        last_name,
        nickname || null,
        mobile_number || null,
        designation || null,
        joining_date,
        user_type || "Operator",
      ]
    );

    const userId = result.insertId;

    // Insert permissions
    if (permissions && typeof permissions === "object") {
      for (const [moduleName, perms] of Object.entries(permissions)) {
        await conn.query(
          `INSERT INTO user_permissions 
          (user_id, module_name, can_view, can_add, can_update, can_delete) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            moduleName,
            perms.view ? 1 : 0,
            perms.add ? 1 : 0,
            perms.update ? 1 : 0,
            perms.delete ? 1 : 0,
          ]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ message: "User created successfully", userId });
  } catch (error) {
    await conn.rollback();
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  } finally {
    conn.release();
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, username, first_name, last_name, nickname, mobile_number, 
              designation, joining_date, user_type, status, created_at 
       FROM users 
       WHERE status = 'Active' 
       ORDER BY first_name, last_name`
    );
    
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};