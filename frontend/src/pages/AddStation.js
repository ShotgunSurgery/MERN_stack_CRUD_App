import React, { useEffect, useState } from "react";
import "../styles/AddStation.css";

const AddStation = () => {
  const [products, setProducts] = useState([]);    
  const [error, setError] = useState(null);        
  const [search, setSearch] = useState("");        
  const [selected, setSelected] = useState("");    
  const [open, setOpen] = useState(false);         
  const [Typeselected, setTypeSelected] = useState("");

  const [stationNumber, setStationNumber] = useState("");
  const [stationName, setStationName] = useState("");
  const [cycleTime, setCycleTime] = useState("");
  const [dailyCount, setDailyCount] = useState("");
  const [productsPerHour, setProductsPerHour] = useState("");

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/products/all-with-details"
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const productsList = await res.json();
        if (Array.isArray(productsList)) {
          setProducts(productsList.map((p) => p.name)); // adjust if API shape differs
        } else {
          setError("Invalid data format received from server");
          setProducts([]);
        }
      } catch (err) {
        setError(err.message);
        setProducts([]);
      }
    };
    fetchAllProducts();
  }, []);

  // Filter products for dropdown search
  const filteredProducts = products.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  // handle save
  // ... existing code ...

const handleSave = async () => {
  // Validate required fields
  if (!selected || !stationNumber || !stationName || !cycleTime || !dailyCount || !productsPerHour || !Typeselected) {
    alert("Please fill in all fields before saving!");
    return;
  }

  const stationData = {
    product_name: selected,                    // Use selected product
    station_number: parseInt(stationNumber),   // Use station number input
    station_name: stationName,                 // Use station name input
    cycle_time: parseInt(cycleTime),          // Use cycle time input
    daily_count: parseInt(dailyCount),        // Use daily count input
    products_per_hour: parseInt(productsPerHour), // Use products per hour input
    report_type: Typeselected                  // Use selected report type
  };

  try {
    const res = await fetch("http://localhost:5000/api/stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stationData),
    });

    if (!res.ok) throw new Error("Failed to save station");

    const result = await res.json();
    alert("Station saved successfully!");
    console.log("Saved:", result);
    
    // Clear form after successful save
    setSelected("");
    setStationNumber("");
    setStationName("");
    setCycleTime("");
    setDailyCount("");
    setProductsPerHour("");
    setTypeSelected("");
    
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// ... existing code ...
  return (
    <div>
      <h1 className="header">Add Station</h1>

      {/* Product Dropdown */}
      <div style={{ position: "relative", width: "250px", marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search || selected}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {open && (
          <ul
            style={{
              position: "absolute",
              top: "40px",
              left: 0,
              width: "100%",
              maxHeight: "150px",
              overflowY: "auto",
              listStyle: "none",
              margin: 0,
              padding: 0,
              border: "1px solid #ccc",
              background: "white",
              borderRadius: "4px",
              zIndex: 1000,
            }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSelected(product);
                    setSearch("");
                    setOpen(false);
                  }}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {product}
                </li>
              ))
            ) : (
              <li style={{ padding: "10px", color: "#888" }}>No results</li>
            )}
          </ul>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {selected && <p>Selected Product: {selected}</p>}

      {/* Inputs */}
      <input
        type="number"
        placeholder="Enter Station Number"
        value={stationNumber}
        onChange={(e) => setStationNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Station Name"
        value={stationName}
        onChange={(e) => setStationName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Cycle time"
        value={cycleTime}
        onChange={(e) => setCycleTime(e.target.value)}
      />
      <input
        type="number"
        placeholder="Daily Count"
        value={dailyCount}
        onChange={(e) => setDailyCount(e.target.value)}
      />
      <input
        type="number"
        placeholder="Products/Hour"
        value={productsPerHour}
        onChange={(e) => setProductsPerHour(e.target.value)}
      />

      {/* Report Type Dropdown */}
      <div>
        <h3>Select a Report Type</h3>
        <select
          value={Typeselected}
          onChange={(e) => setTypeSelected(e.target.value)}
        >
          <option value="">-- Choose one --</option>
          <option value="Done">Done</option>
          <option value="Pending">Pending</option>
          <option value="In process">In process</option>
        </select>
        {Typeselected && <p>You selected: {Typeselected}</p>}
      </div>

      {/* Save button */}
      <button onClick={handleSave}>Save Station</button>
    </div>
  );
};

export default AddStation;
