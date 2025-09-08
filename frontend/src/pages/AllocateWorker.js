import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000/api";

const AllocateWorker = () => {
  const [date, setDate] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [stations, setStations] = useState([]);
  const [workers, setWorkers] = useState([]);
  // allocations state: { [stationId]: number[] }
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch products and workers on mount
  useEffect(() => {
    const fetchInit = async () => {
      try {
        setError("");
        const [prodRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/productNames`),
          fetch(`${API_BASE}/users`)
        ]);

        const prodOk = prodRes.ok ? await prodRes.json() : [];
        const usersOk = usersRes.ok ? await usersRes.json() : [];
        setProducts(Array.isArray(prodOk) ? prodOk : []);
        // Map workers to id and full name (no nickname)
        const mappedUsers = Array.isArray(usersOk)
          ? usersOk.map((u) => ({ id: u.id, name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() }))
          : [];
        setWorkers(mappedUsers);
      } catch (e) {
        setError("Failed to load products or users");
      }
    };
    fetchInit();
  }, []);

  // Fetch stations when product changes
  useEffect(() => {
    const fetchStations = async () => {
      if (!selectedProduct) { setStations([]); return; }
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/stations/by-product/${encodeURIComponent(selectedProduct)}`);
        const data = res.ok ? await res.json() : [];
        setStations(Array.isArray(data) ? data : []);
      } catch (e) {
        setStations([]);
        setError("Failed to load stations");
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, [selectedProduct]);

  // Prefill allocations from server for selected date + product
  useEffect(() => {
    const fetchAllocations = async () => {
      if (!date || !selectedProduct) { setAllocations({}); return; }
      try {
        const res = await fetch(`${API_BASE}/worker-allocations?date=${encodeURIComponent(date)}&product=${encodeURIComponent(selectedProduct)}`);
        const data = res.ok ? await res.json() : {};
        setAllocations(typeof data === 'object' && data !== null ? data : {});
      } catch (e) {
        // ignore
      }
    };
    fetchAllocations();
  }, [date, selectedProduct]);

  const handleWorkerToggle = (stationId, workerId) => {
    setAllocations((prev) => {
      const current = Array.isArray(prev[stationId]) ? prev[stationId] : [];
      const next = current.includes(workerId)
        ? current.filter((id) => id !== workerId)
        : [...current, workerId];
      return { ...prev, [stationId]: next };
    });
  };

  const saveAllocations = async () => {
    if (!date || !selectedProduct) { alert("Please select date and product"); return; }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/worker-allocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, product: selectedProduct, allocations })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save allocations");
      }
      alert("Allocations saved successfully");
    } catch (e) {
      console.error(e);
      setError(e.message);
      alert(`Error saving allocations: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const productOptions = useMemo(() => products.map((p) => p.name), [products]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Allocate Stations to Workers</h1>

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
        <div>
          <label htmlFor="alloc-date" style={{ display: "block", marginBottom: 4 }}>Date</label>
          <input id="alloc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="product" style={{ display: "block", marginBottom: 4 }}>Product</label>
          <select id="product" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">Select product</option>
            {productOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <button onClick={saveAllocations} disabled={loading || !date || !selectedProduct}>
          {loading ? "Saving..." : "Save Allocations"}
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {stations.length === 0 && selectedProduct && (
        <div>No stations found for this product.</div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {stations.map((st) => (
          <StationAllocationRow
            key={st.id}
            station={st}
            workers={workers}
            selectedWorkerIds={Array.isArray(allocations[st.id]) ? allocations[st.id] : []}
            onToggle={(workerId) => handleWorkerToggle(st.id, workerId)}
          />
        ))}
      </div>
    </div>
  );
};

const StationAllocationRow = ({ station, workers, selectedWorkerIds, onToggle }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 6, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600 }}>{station.station_name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>Station #{station.station_number}</div>
        </div>
        <div className="relative inline-block">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setOpen(!open)}>
            Select Workers
          </button>
          {open && (
            <div className="absolute mt-2 w-64 bg-white border rounded shadow z-10" style={{ maxHeight: 240, overflowY: "auto" }}>
              {workers.map((w) => (
                <label key={w.id} className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedWorkerIds.includes(w.id)}
                    onChange={() => onToggle(w.id)}
                  />
                  {w.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedWorkerIds.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 14 }}>
          Selected: {workers.filter(w => selectedWorkerIds.includes(w.id)).map(w => w.name).join(", ")}
        </div>
      )}
    </div>
  );
};

export default AllocateWorker;
