import { useEffect, useMemo, useState } from "react";

const formatDateInput = (d) => d.toISOString().slice(0, 10);

export default function Reports() {
  const today = useMemo(() => new Date(), []);
  const weekAgo = useMemo(() => new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), []);

  const [from, setFrom] = useState(formatDateInput(weekAgo));
  const [to, setTo] = useState(formatDateInput(today));

  const [stationsData, setStationsData] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productFlow, setProductFlow] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const base = "/api/reports";
      const qs = `?from=${from}&to=${to}`;
      const [sRes, eRes, wRes] = await Promise.all([
        fetch(`${base}/station-completions${qs}`),
        fetch(`${base}/employee-completions${qs}`),
        fetch(`${base}/weekly-completions${qs}`),
      ]);
      if (!sRes.ok || !eRes.ok || !wRes.ok) throw new Error("Failed to load report data");
      setStationsData(await sRes.json());
      setEmployeesData(await eRes.json());
      setWeeklyData(await wRes.json());
    } catch (e) {
      setError(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products/allProducts");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      // silent product fetch error; page still usable
    }
  };

  const fetchProductFlow = async () => {
    if (!selectedProductId) {
      setProductFlow([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reports/product-details?productId=${selectedProductId}`);
      if (!res.ok) throw new Error("Failed to load product details");
      setProductFlow(await res.json());
    } catch (e) {
      setError(e.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  useEffect(() => {
    fetchProductFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  const weekdayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  return (
    <div style={{ padding: "16px" }}>
      <h2>Reports</h2>

      <section style={{ marginBottom: 24 }}>
        <h3>Date Range</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label>
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      </section>

      {error ? <div style={{ color: "red", marginBottom: 16 }}>{error}</div> : null}
      {loading ? <div>Loading…</div> : null}

      <section style={{ marginBottom: 24 }}>
        <h3>Completed products per station</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {stationsData.map((r) => (
                <tr key={r.station_id}>
                  <td>{r.station_name}</td>
                  <td>{r.completed_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Employees who completed work</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {employeesData.map((r) => (
                <tr key={r.worker_id}>
                  <td>{[r.first_name, r.last_name].filter(Boolean).join(" ") || r.worker_id}</td>
                  <td>{r.completed_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Completions by weekday (sortable)</h3>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Weekday</th>
                <th>Station</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {[...weeklyData]
                .sort((a, b) => weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday))
                .map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.weekday}</td>
                    <td>{r.station_name}</td>
                    <td>{r.completed_count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Product flow details</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <label>
            Product
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Days at Station</th>
                <th>Worker ID</th>
              </tr>
            </thead>
            <tbody>
              {productFlow.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.station_name}</td>
                  <td>{row.in_time ? new Date(row.in_time).toLocaleString() : "-"}</td>
                  <td>{row.out_time ? new Date(row.out_time).toLocaleString() : "-"}</td>
                  <td>{row.days_spent}</td>
                  <td>{row.worker_id ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


