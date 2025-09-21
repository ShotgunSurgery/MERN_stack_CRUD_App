import db from "../config/db.js";

export const listUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users ORDER BY created_at DESC");
    // Fetch permissions and attach per user
    const userIds = users.map(u => u.id);
    if (userIds.length === 0) return res.json([]);
    const [perms] = await db.query(
      `SELECT user_id, module_name, can_view, can_add, can_update, can_delete
       FROM user_permissions
       WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
      userIds
    );
    const byUser = new Map();
    users.forEach(u => byUser.set(u.id, { ...u, permissions: {} }));
    for (const p of perms) {
      const user = byUser.get(p.user_id);
      if (user) {
        user.permissions[p.module_name] = {
          view: !!p.can_view,
          add: !!p.can_add,
          update: !!p.can_update,
          delete: !!p.can_delete,
        };
      }
    }
    res.json(Array.from(byUser.values()));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
};

export const createUser = async (req, res) => {
  const { first_name, last_name, email, phone, role, status } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone ?? null, role ?? null, status ?? "Active"]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user", details: err.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Read columns that actually exist in the users table
    const [cols] = await db.query(`SHOW COLUMNS FROM users`);
    const existingColumns = new Set(cols.map(c => c.Field));

    // Allow only known scalar fields from body
    const candidate = {
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      nickname: req.body.nickname,
      mobile_number: req.body.mobile_number,
      designation: req.body.designation,
      joining_date: req.body.joining_date,
      user_type: req.body.user_type,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      status: req.body.status,
    };

    const setClauses = [];
    const values = [];
    for (const [key, val] of Object.entries(candidate)) {
      if (!existingColumns.has(key)) continue; // skip unknown columns
      if (typeof val === 'undefined') continue; // only update provided fields
      setClauses.push(`${key} = ?`);
      values.push(val);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
    values.push(id);
    console.log('[users.update] sql:', sql);
    console.log('[users.update] values:', values);
    await db.query(sql, values);
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('[users.update] error:', err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM users WHERE id=?`, [id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
};

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const registerUser = async (req, res) => {
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

  const conn = await db.getConnection();
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

export const getUserPermissions = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT module_name, can_view, can_add, can_update, can_delete
       FROM user_permissions WHERE user_id = ? ORDER BY module_name`,
      [id]
    );
    const permissions = {};
    rows.forEach(r => {
      permissions[r.module_name] = {
        view: !!r.can_view,
        add: !!r.can_add,
        update: !!r.can_update,
        delete: !!r.can_delete,
      };
    });
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch permissions", details: err.message });
  }
};

export const updateUserPermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body; // { moduleName: {view, add, update, delete}, ... }
  if (!permissions || typeof permissions !== 'object') {
    return res.status(400).json({ error: 'permissions object is required' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const [moduleName, perms] of Object.entries(permissions)) {
      // Upsert
      const [existing] = await conn.query(
        `SELECT id FROM user_permissions WHERE user_id=? AND module_name=?`,
        [id, moduleName]
      );
      if (existing.length > 0) {
        await conn.query(
          `UPDATE user_permissions SET can_view=?, can_add=?, can_update=?, can_delete=?
           WHERE user_id=? AND module_name=?`,
          [perms.view ? 1 : 0, perms.add ? 1 : 0, perms.update ? 1 : 0, perms.delete ? 1 : 0, id, moduleName]
        );
      } else {
        await conn.query(
          `INSERT INTO user_permissions (user_id, module_name, can_view, can_add, can_update, can_delete)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, moduleName, perms.view ? 1 : 0, perms.add ? 1 : 0, perms.update ? 1 : 0, perms.delete ? 1 : 0]
        );
      }
    }
    await conn.commit();
    res.json({ message: 'Permissions updated' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Failed to update permissions', details: err.message });
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
