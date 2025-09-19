import React, { useState } from "react";

const ShiftConfig = () => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({
    id: null,
    shiftName: "",
    startTime: "",
    endTime: "",
    active: false,
  });

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditData({ ...shifts[index] });
  };

  const [formData, setFormData] = useState({
    id: null,
    shiftName: "",
    startTime: "",
    endTime: "",
    active: false,
  });

  const [shifts, setShifts] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // arrow function stored in normalizeTime, can be called like -> normalizetime(09:30) 5 chars, mysql expects in the formate -> 09:30:00
    // check if t exists and has 5 char lenght 
    const normalizeTime = (t) => (t && t.length === 5 ? t + ":00" : t || null);

    // != -> loose inequality performs type correction i.e 5 != "5" returns false
    // !== -> strict inequality type and value must match i.e. 5 != "5" returns true
    if (editingIndex !== null) {
      // UPDATE existing row (idempotent [same result if repeated])
      const payload = {
        name: editData.shiftName,
        start_time: normalizeTime(editData.startTime),
        end_time: normalizeTime(editData.endTime),
        is_active: editData.active ? 1 : 0,
      };

      try {
        const res = await fetch(`/api/shifts/${editData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // throw statement raises an exception, control leaves current execution and looks for catch, here the promise is thus rejected
        // create a new instance of error, and set the message to the input param 
        if (!res.ok) throw new Error("Update failed");

        await res.json().catch(() => null);

        // setShifts(shifts.map((s, i) => (i === editingIndex ? editData : s)));

        // react state setters can take value or function as input below function is input where prev means previous state
        // if function is called then react gives it the current(prevoius) state as first argument
        setShifts((prev) =>
          // s is current element and i is index of that element 
          prev.map((s, i) =>
            i === editingIndex
              ? {
                  id: editData.id,
                  shiftName: editData.shiftName,
                  startTime: editData.startTime,
                  endTime: editData.endTime,
                  active: !!editData.active,
                }
              : s
          )
        );

        setEditingIndex(null);
        setEditData({ id: null, shiftName: "", startTime: "", endTime: "", active: false });
      } catch (err) {
        console.error(err);
        // optionally show user-facing error
      }
    } else {
      // CREATE new row
      const payload = {
        name: formData.shiftName,
        start_time: normalizeTime(formData.startTime),
        end_time: normalizeTime(formData.endTime),
        is_active: formData.active ? 1 : 0,
      };

      try {
        const res = await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");

        // server may return created row or { insertId }
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
              // fallback if server returns nothing useful
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
      }
    }
  };

  const handleDelete = (index) => {
    const updatedShifts = shifts.filter((_, i) => i !== index);
    setShifts(updatedShifts);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Shift Configuration</h1>

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

      {shifts.length > 0 && (
        <table
          border="1"
          cellPadding="10"
          style={{ borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Shift Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Active</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift, index) => (
              <tr key={index}>
                <td>{index + 1}</td>

                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.shiftName}
                      onChange={(e) =>
                        setEditData({ ...editData, shiftName: e.target.value })
                      }
                    />
                  ) : (
                    shift.shiftName
                  )}
                </td>

                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.startTime}
                      onChange={(e) =>
                        setEditData({ ...editData, startTime: e.target.value })
                      }
                    />
                  ) : (
                    shift.startTime
                  )}
                </td>

                <td>
                  {editingIndex === index ? (
                    <input
                      value={editData.endTime}
                      onChange={(e) =>
                        setEditData({ ...editData, endTime: e.target.value })
                      }
                    />
                  ) : (
                    shift.endTime
                  )}
                </td>

                <td>
                  {editingIndex === index ? (
                    <input
                      type = "checkbox"
                      // double not is used to force convert anything to boolean 
                      checked={!!editData.active}
                      onChange={(e) =>
                        setEditData({ ...editData, active: e.target.checked })
                      }
                    />
                  ) : shift.active ? (
                    "Yes"
                  ) : (
                    "No"
                  )}
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => handleEditClick(index)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ShiftConfig;
