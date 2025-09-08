import React, { useEffect, useState } from "react";
import "../styles/shared.css";

const AllocateWorker = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [products, setProducts] = useState([]);
  const [stations, setStations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [allocations, setAllocations] = useState({}); // Track worker allocations per station {stationId: [workerIds]}
  const [existingAllocations, setExistingAllocations] = useState({}); // Load existing allocations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stations");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setStations(data);
        } else {
          setStations([]);
        }
      } catch (err) {
        console.error("Error fetching stations:", err);
        setStations([]);
      }
    };
    fetchStations();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          "http://localhost:5000/api/products/all-with-details"
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setError("Invalid data format received from server");
          setProducts([]);
        }
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        console.log("Fetching workers...");
        const res = await fetch("http://localhost:5000/api/users");
        console.log("Workers response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Workers data received:", data);
        if (Array.isArray(data)) {
          setWorkers(data);
          console.log("Workers set successfully:", data.length, "workers");
        } else {
          console.log("Workers data is not an array:", data);
          setWorkers([]);
        }
      } catch (err) {
        console.error("Error fetching workers:", err);
        setWorkers([]);
      }
    };
    fetchWorkers();
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      loadExistingAllocations(date);
    } else {
      setExistingAllocations({});
      setAllocations({});
    }
  };

  // Load existing allocations for a specific date
  const loadExistingAllocations = async (date) => {
    try {
      const res = await fetch(`http://localhost:5000/api/worker-allocations?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Existing allocations loaded:", data);
        
        // Group allocations by station_id
        const groupedAllocations = {};
        data.forEach(allocation => {
          if (!groupedAllocations[allocation.station_id]) {
            groupedAllocations[allocation.station_id] = [];
          }
          groupedAllocations[allocation.station_id].push(allocation.user_id);
        });
        
        setExistingAllocations(groupedAllocations);
        setAllocations(groupedAllocations);
      } else {
        console.log("No existing allocations found for date:", date);
        setExistingAllocations({});
        setAllocations({});
      }
    } catch (err) {
      console.error("Error loading existing allocations:", err);
      setExistingAllocations({});
      setAllocations({});
    }
  };

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const handleWorkerAllocation = (stationId, workerId, isChecked) => {
    setAllocations(prev => {
      const currentWorkers = prev[stationId] || [];
      let updatedWorkers;
      
      if (isChecked) {
        // Add worker if not already present
        updatedWorkers = [...currentWorkers, workerId];
      } else {
        // Remove worker
        updatedWorkers = currentWorkers.filter(id => id !== workerId);
      }
      
      return {
        ...prev,
        [stationId]: updatedWorkers
      };
    });
  };

  const saveAllocations = async () => {
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }

    // First, delete existing allocations for this date
    try {
      const deleteRes = await fetch(`http://localhost:5000/api/worker-allocations?date=${selectedDate}`, {
        method: "DELETE"
      });
      console.log("Delete existing allocations response:", deleteRes.status);
    } catch (err) {
      console.log("No existing allocations to delete or error:", err);
    }

    // Prepare new allocation data
    const allocationData = [];
    Object.entries(allocations).forEach(([stationId, workerIds]) => {
      workerIds.forEach(workerId => {
        allocationData.push({
          station_id: parseInt(stationId),
          user_id: parseInt(workerId),
          allocation_date: selectedDate,
          start_time: "08:00:00", // Default start time
          end_time: "16:00:00",   // Default end time
          notes: `Allocated on ${selectedDate}`
        });
      });
    });

    if (allocationData.length === 0) {
      alert("No workers selected for allocation");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("http://localhost:5000/api/worker-allocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allocations: allocationData }),
      });

      const result = await res.json();
      
      if (res.ok) {
        alert("Worker allocations saved successfully!");
        setExistingAllocations(allocations); // Update existing allocations
      } else {
        alert("Error saving allocations: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving allocations:", err);
      alert("Error saving allocations: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content">
      <div className="allocate-worker-header">
        <h1 className="allocate-worker-title">Allocate Station to Worker</h1>
      </div>

      <div className="date-input-section">
        <label className="date-input-label">Select Date</label>
        <input
          type="date"
          className="date-input"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>

       {loading && <p>Loading products...</p>}
       {error && <p style={{ color: "red" }}>{error}</p>}
       
       <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
         <p><strong>Debug Info:</strong></p>
         <p>Workers loaded: {workers.length}</p>
         <p>Stations loaded: {stations.length}</p>
         <p>Selected date: {selectedDate || "Not selected"}</p>
       </div>

      <div>
        <label htmlFor="product_dropdown">Select Product:</label>
        <select
          id="product_dropdown"
          value={selectedValue}
          onChange={handleChange}
        >
          <option value="">-- Select a product --</option>
          {products.map((product, index) => (
            <option key={index} value={product.id || product.name}>
              {product.name || JSON.stringify(product)}
            </option>
          ))}
        </select>
      </div>

       <div className="allocations-table-container">
         <table className="allocations-table">
           <thead>
             <tr>
               <th>Sr no.</th>
               <th>Station Name</th>
               <th>Available Workers</th>
             </tr>
           </thead>
           <tbody>
             {stations.map((station, index) => (
               <tr key={station.id}>
                 <td>{index + 1}</td>
                 <td>{station.station_name}</td>
                 <td>
                   <div className="workers-checkbox-container">
                     {workers.length > 0 ? (
                       workers.map((worker) => (
                         <label key={worker.id} className="worker-checkbox-label">
                           <input
                             type="checkbox"
                             className="worker-checkbox"
                             checked={allocations[station.id]?.includes(worker.id) || false}
                             onChange={(e) => handleWorkerAllocation(station.id, worker.id, e.target.checked)}
                           />
                           <span className="worker-name">
                             {worker.first_name} {worker.last_name} ({worker.designation})
                           </span>
                         </label>
                       ))
                     ) : (
                       <p>No workers available</p>
                     )}
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>

       <div className="save-allocations-section">
         <button 
           className="btn-save-allocations" 
           onClick={saveAllocations}
           disabled={saving || !selectedDate}
         >
           {saving ? "Saving..." : "Save Allocations"}
         </button>
       </div>
    </div>
  );
};

export default AllocateWorker;
