import React, { useEffect, useState } from "react";

export default function ShiftConfig() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    id: null,
    shiftName: "",
    startTime: "",
    endTime: "",
    active: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizeTime = (t) => (t && t.length === 5 ? t + ":00" : t || null);

    const payload = {
      name: formData.shiftName,
      start_time: normalizeTime(formData.startTime),
      end_time: normalizeTime(formData.endTime),
      is_active: formData.active ? 1 : 0,
    };

    try {
      const res = await fetch("http://localhost:5000/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Create failed");

      const created = await res.json().catch(() => null);

      const newShift = created && created.id
        ? {
            id: created.id,
            shiftName: created.name ?? formData.shiftName,
            startTime: (created.start_time || formData.startTime || "").slice(0,5),
            endTime: (created.end_time || formData.endTime || "").slice(0,5),
            active: !!(created.is_active ?? formData.active),
          }
        : {
            id: null,
            shiftName: formData.shiftName,
            startTime: formData.startTime,
            endTime: formData.endTime,
            active: formData.active,
          };

      setShifts((prev) => [...prev, newShift]);
      setFormData({ id: null, shiftName: "", startTime: "", endTime: "", active: false });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/shifts");
      const data = await res.json();
      setShifts(data.map(s => ({
        id: s.id,
        shiftName: s.name,
        startTime: (s.start_time || "").slice(0, 5),
        endTime: (s.end_time || "").slice(0, 5),
        active: !!s.is_active,
      })));
    } catch (err) {
      setError("Failed to load shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const onChangeField = (id, field, value) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const onSave = async (shift) => {
    setSavingId(shift.id);
    setError("");
    try {
      const normalizeTime = (t) => (t && t.length === 5 ? t + ":00" : t || null);
      const payload = {
        name: shift.shiftName,
        start_time: normalizeTime(shift.startTime),
        end_time: normalizeTime(shift.endTime),
        is_active: shift.active ? 1 : 0,
      };
      const res = await fetch(`http://localhost:5000/api/shifts/${shift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'A request failed');
      }

      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this shift?")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/shifts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setShifts((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const headerStyle = { background: "#f7f7f7", fontWeight: 600 };
  const actionBtn = { padding: "6px 10px", marginRight: 8 };
  const inputStyle = { width: "100%", padding: 6, boxSizing: "border-box" };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginTop: 0 }}>Shift Configuration</h1>
      {error && (
        <div style={{ background: "#ffe8e8", color: "#b00020", padding: 10, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <label htmlFor="shift_name">Shift Name</label>
          <input
            type="text"
            id="shift_name"
            name="shiftName"
            value={formData.shiftName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="start_time">Start Time</label>
          <input
            type="time"
            id="start_time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="end_time">End Time</label>
          <input
            type="time"
            id="end_time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="active">Active</label>
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Save</button>
      </form>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Shift Name</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Start Time</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>End Time</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Active</th>
              <th style={{ ...headerStyle, textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 16 }}>Loading...</td>
              </tr>
            ) : shifts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 16 }}>No shifts found</td>
              </tr>
            ) : (
              shifts.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: 6 }}>
                    <input value={s.shiftName ?? ""} onChange={(e) => onChangeField(s.id, "shiftName", e.target.value)} style={inputStyle} disabled={editingId !== s.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <input type="time" value={s.startTime ?? ""} onChange={(e) => onChangeField(s.id, "startTime", e.target.value)} style={inputStyle} disabled={editingId !== s.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <input type="time" value={s.endTime ?? ""} onChange={(e) => onChangeField(s.id, "endTime", e.target.value)} style={inputStyle} disabled={editingId !== s.id} />
                  </td>
                  <td style={{ padding: 6 }}>
                    <input type="checkbox" checked={s.active} onChange={(e) => onChangeField(s.id, "active", e.target.checked)} style={{ ...inputStyle, width: 'auto' }} disabled={editingId !== s.id} />
                  </td>
                  <td style={{ padding: 6, whiteSpace: "nowrap" }}>
                    {editingId === s.id ? (
                      <>
                        <button style={{ ...actionBtn, background: "#007bff", color: "white" }} disabled={savingId === s.id} onClick={() => onSave(s)}>
                          {savingId === s.id ? "Saving..." : "Save"}
                        </button>
                        <button style={{ ...actionBtn }} onClick={async () => { setEditingId(null); await fetchShifts(); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button style={{ ...actionBtn, background: "#007bff", color: "white" }} onClick={() => setEditingId(s.id)}>Edit</button>
                        <button style={{ ...actionBtn, background: "#dc3545", color: "white" }} disabled={deletingId === s.id} onClick={() => onDelete(s.id)}>
                          {deletingId === s.id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}