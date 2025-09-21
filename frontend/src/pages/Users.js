import React, { useEffect, useState } from "react";

// No inline registration on Users page per requirement

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [openPermsUserId, setOpenPermsUserId] = useState(null);
  const [permsLoading, setPermsLoading] = useState(false);
  const [permsDraft, setPermsDraft] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const loadPermissions = async (userId) => {
    setPermsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/permissions`);
      const data = await res.json();
      setPermsDraft(data);
    } catch (e) {
      setError("Failed to load permissions");
    } finally {
      setPermsLoading(false);
    }
  };

  const onChangeField = (id, field, value) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const onSave = async (user) => {
    setSavingId(user.id);
    setError("");
    try {
      // Only send editable scalar fields (exclude nested objects like permissions)
      const normalize = (v) => (v === "" ? null : v);
      const dateOnly = (v) => {
        if (!v) return null;
        if (typeof v === 'string') return v.slice(0, 10); // handles ISO like 2025-09-26T...
        try {
          const d = new Date(v);
          if (isNaN(d.getTime())) return null;
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        } catch { return null; }
      };
      const allowedUserTypes = new Set(["Operator", "Supervisor", "Admin"]);
      const allowedStatus = new Set(["Active", "Inactive", "Locked"]);
      const payload = {
        username: normalize(user.username),
        first_name: normalize(user.first_name),
        last_name: normalize(user.last_name),
        nickname: normalize(user.nickname),
        mobile_number: normalize(user.mobile_number),
        designation: normalize(user.designation),
        joining_date: dateOnly(user.joining_date),
        user_type: allowedUserTypes.has(user.user_type) ? user.user_type : null,
        email: normalize(user.email),
        phone: normalize(user.phone),
        role: normalize(user.role),
        status: allowedStatus.has(user.status) ? user.status : null,
      };
      const userSave = fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const promises = [userSave];

      if (openPermsUserId === user.id) {
        const permsSave = fetch(`http://localhost:5000/api/users/${user.id}/permissions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: permsDraft })
        });
        promises.push(permsSave);
      }

      const responses = await Promise.all(promises);

      for (const res of responses) {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'An unknown error occurred' }));
          throw new Error(errorData.message || 'A request failed');
        }
      }

      setEditingId(null);
      setOpenPermsUserId(null); // Close permissions on save
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const togglePermission = (moduleName, key) => {
    setPermsDraft(prev => ({
      ...prev,
      [moduleName]: {
        view: !!(prev[moduleName]?.view),
        add: !!(prev[moduleName]?.add),
        update: !!(prev[moduleName]?.update),
        delete: !!(prev[moduleName]?.delete),
        [key]: !(prev[moduleName]?.[key])
      }
    }));
  };

  

  // Registration removed from Users page

  const headerStyle = { background: "#f7f7f7", fontWeight: 600 };
  const actionBtn = { padding: "6px 10px", marginRight: 8 };
  const inputStyle = { width: "100%", padding: 6, boxSizing: "border-box" };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Users</h1>
      {error && (
        <div style={{ background: "#ffe8e8", color: "#b00020", padding: 10, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Registration section removed as requested */}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Username</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>First Name</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Last Name</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Joining Date</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Designation</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Mobile</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>User Type</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Status</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 16 }}>Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 16 }}>No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <React.Fragment key={u.id}>
                <tr>
                  <td style={{ padding: 6 }}>
                    <input value={u.username ?? ""} onChange={(e) => onChangeField(u.id, "username", e.target.value)} style={inputStyle} disabled={editingId !== u.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <input value={u.first_name ?? ""} onChange={(e) => onChangeField(u.id, "first_name", e.target.value)} style={inputStyle} disabled={editingId !== u.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <input value={u.last_name ?? ""} onChange={(e) => onChangeField(u.id, "last_name", e.target.value)} style={inputStyle} disabled={editingId !== u.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <input type="date" value={(u.joining_date ?? "").slice(0,10)} onChange={(e) => onChangeField(u.id, "joining_date", e.target.value)} style={inputStyle} disabled={editingId !== u.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <input value={u.designation ?? ""} onChange={(e) => onChangeField(u.id, "designation", e.target.value)} style={inputStyle} disabled={editingId !== u.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <input value={u.mobile_number ?? ""} onChange={(e) => onChangeField(u.id, "mobile_number", e.target.value)} style={inputStyle} disabled={editingId !== u.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <select value={u.user_type ?? "Operator"} onChange={(e) => onChangeField(u.id, "user_type", e.target.value)} style={inputStyle} disabled={editingId !== u.id}>
                      <option>Operator</option>
                      <option>Supervisor</option>
                      <option>Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: 6 }}>
                    <select value={u.status ?? "Active"} onChange={(e) => onChangeField(u.id, "status", e.target.value)} style={inputStyle} disabled={editingId !== u.id}>
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Locked</option>
                    </select>
                  </td>
                  <td style={{ padding: 6, whiteSpace: "nowrap" }}>
                    <button style={{ ...actionBtn }} onClick={async () => {
                      if (openPermsUserId === u.id) { setOpenPermsUserId(null); return; }
                      setOpenPermsUserId(u.id);
                      await loadPermissions(u.id);
                    }}>
                      {openPermsUserId === u.id ? "Hide Permissions" : "Permissions"}
                    </button>
                    {editingId === u.id ? (
                      <>
                        <button style={{ ...actionBtn, background: "#007bff", color: "white" }} disabled={savingId === u.id} onClick={() => onSave(u)}>
                          {savingId === u.id ? "Saving..." : "Save"}
                        </button>
                        <button style={{ ...actionBtn }} onClick={async () => { setEditingId(null); await fetchUsers(); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button style={{ ...actionBtn, background: "#007bff", color: "white" }} onClick={() => setEditingId(u.id)}>Edit</button>
                        <button style={{ ...actionBtn, background: "#dc3545", color: "white" }} disabled={deletingId === u.id} onClick={() => onDelete(u.id)}>
                          {deletingId === u.id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                {openPermsUserId === u.id && (
                  <tr>
                    <td colSpan={7} style={{ padding: 10, background: "#fafafa" }}>
                      {permsLoading ? (
                        <div>Loading permissions...</div>
                      ) : (
                        <div>
                          <div style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(4, 1fr)", gap: 8, padding: 8, fontWeight: 600, background: "#f2f2f2" }}>
                            <div>Module</div>
                            <div>View</div>
                            <div>Add</div>
                            <div>Update</div>
                            <div>Delete</div>
                          </div>
                          {Object.keys(permsDraft).concat(["Products","Stations","Shifts","Users"]).filter((v,i,self)=>self.indexOf(v)===i).map(moduleName => (
                            <div key={moduleName} style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(4, 1fr)", gap: 8, padding: 8, borderBottom: "1px solid #eee" }}>
                              <div>{moduleName}</div>
                              {(["view","add","update","delete"]).map(key => (
                                <div key={key} style={{ opacity: editingId !== u.id ? 0.5 : 1 }}>
                                  <input type="checkbox" checked={!!(permsDraft[moduleName]?.[key])} onChange={() => togglePermission(moduleName, key)} disabled={editingId !== u.id} />
                                </div>
                              ))}
                            </div>
                          ))}
                          
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


