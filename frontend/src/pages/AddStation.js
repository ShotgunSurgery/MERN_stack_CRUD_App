import React, { useEffect, useState } from "react";
import "../styles/AddStation.css";

const AddStation = () => {
  const [products, setProducts] = useState([]);    
  const [parameters, setParameters] = useState([]);
  const [error, setError] = useState(null);        
  const [search, setSearch] = useState("");        
  const [selected, setSelected] = useState("");    
  const [open, setOpen] = useState(false);         
  const [Typeselected, setTypeSelected] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [parametersDebug, setParametersDebug] = useState("");

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
          setProducts(productsList.map((p) => p.name));
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

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        console.log("Fetching parameters...");
        setParametersDebug("Fetching parameters...");
        
        const res = await fetch("http://localhost:5000/api/stations/parameters");
        console.log("Parameters response status:", res.status);
        setParametersDebug(`Response status: ${res.status}`);
        
        if (res.ok) {
          const paramsList = await res.json();
          console.log("Received parameters:", paramsList);
          setParametersDebug(`Received ${paramsList.length} parameters: ${JSON.stringify(paramsList)}`);
          setParameters(paramsList);
        } else {
          const errorText = await res.text();
          console.error("Failed to fetch parameters:", res.status, errorText);
          setParametersDebug(`Error: ${res.status} - ${errorText}`);
        }
      } catch (err) {
        console.error("Error fetching parameters:", err);
        setParametersDebug(`Exception: ${err.message}`);
      }
    };
    fetchParameters();
  }, []);

  // Fetch stations when product is selected
  useEffect(() => {
    if (selected) {
      console.log("Product selected, fetching stations for:", selected);
      setDebugInfo(`Product selected: ${selected}`);
      fetchStationsByProduct(selected);
    } else {
      setStations([]);
      setDebugInfo("");
    }
  }, [selected]);

  const fetchStationsByProduct = async (productName) => {
    console.log("Starting to fetch stations for:", productName);
    setLoadingStations(true);
    setStations([]);
    setDebugInfo(`Fetching stations for: ${productName}`);
    
    try {
      const url = `http://localhost:5000/api/stations/by-product/${encodeURIComponent(productName)}`;
      console.log("Fetching from URL:", url);
      setDebugInfo(`Fetching from: ${url}`);
      
      const res = await fetch(url);
      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);
      setDebugInfo(`Response status: ${res.status}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        setDebugInfo(`Error: ${res.status} - ${errorText}`);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const stationsList = await res.json();
      console.log("Received stations data:", stationsList);
      setDebugInfo(`Received ${stationsList.length} stations`);
      
      if (Array.isArray(stationsList)) {
        setStations(stationsList);
        console.log(`Successfully set ${stationsList.length} stations`);
        setDebugInfo(`Successfully loaded ${stationsList.length} stations`);
      } else {
        console.error("Invalid stations data format:", stationsList);
        setStations([]);
        setDebugInfo(`Invalid data format: ${typeof stationsList}`);
      }
    } catch (err) {
      console.error("Error fetching stations:", err);
      setError(`Failed to fetch stations: ${err.message}`);
      setStations([]);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoadingStations(false);
      console.log("Finished loading stations");
    }
  };

  // Filter products for dropdown search
  const filteredProducts = products.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

const handleSave = async () => {
  // Validate required fields
  if (!selected || !stationNumber || !stationName || !cycleTime || !dailyCount || !productsPerHour || !Typeselected) {
    alert("Please fill in all fields before saving!");
    return;
  }

    setIsLoading(true);
    setError(null);

  const stationData = {
      product_name: selected,
      station_number: parseInt(stationNumber),
      station_name: stationName,
      cycle_time: parseInt(cycleTime),
      daily_count: parseInt(dailyCount),
      products_per_hour: parseInt(productsPerHour),
      report_type: Typeselected,
      parameters: null // Will be updated when parameters are selected
  };

  try {
      console.log("Sending station data:", stationData);
      
    const res = await fetch("http://localhost:5000/api/stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stationData),
    });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.text();
        console.error("Error response:", errorData);
        throw new Error(`Failed to save station: ${res.status} ${res.statusText}`);
      }

    const result = await res.json();
      console.log("Success response:", result);
      
    alert("Station saved successfully!");
      
      // Refresh stations list after successful save
      await fetchStationsByProduct(selected);
    
      // Clear form after successful save (but keep selected product)
    setStationNumber("");
    setStationName("");
    setCycleTime("");
    setDailyCount("");
    setProductsPerHour("");
    setTypeSelected("");
    
  } catch (err) {
      console.error("Error saving station:", err);
      setError(err.message);
    alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and Drop functionality
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
    e.dataTransfer.effectAllowed = "move";
    console.log("Drag started for index:", index);
    
    // Visual feedback
    e.target.style.cursor = "grabbing";
    e.target.style.opacity = "0.5";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    
    console.log("Drop event:", { dragIndex, dropIndex });
    
    if (dragIndex === dropIndex) {
      console.log("Same index, no change needed");
      return;
    }

    // Create new array with reordered stations
    const newStations = [...stations];
    const draggedStation = newStations[dragIndex];
    
    // Remove from old position
    newStations.splice(dragIndex, 1);
    // Insert at new position
    newStations.splice(dropIndex, 0, draggedStation);

    // Update station numbers based on new order (starting from 1)
    const updatedStations = newStations.map((station, index) => ({
      ...station,
      station_number: index + 1
    }));

    console.log("Updated stations order:", updatedStations.map(s => ({ id: s.id, number: s.station_number })));

    // Update local state immediately for smooth UX
    setStations(updatedStations);

    // Send update to backend
    try {
      console.log("Sending order update to backend...");
      const res = await fetch("http://localhost:5000/api/stations/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stations: updatedStations })
      });

      if (res.ok) {
        console.log("Station order updated successfully in backend");
        const result = await res.json();
        console.log("Backend response:", result);
      } else {
        const errorText = await res.text();
        console.error("Failed to update station order:", res.status, errorText);
        throw new Error(`Failed to update station order: ${res.status}`);
      }
    } catch (err) {
      console.error("Error updating station order:", err);
      // Revert to original order on error
      console.log("Reverting to original order due to error");
      await fetchStationsByProduct(selected);
    }
  };

  const handleDragEnd = (e) => {
    console.log("Drag ended");
    // Reset visual feedback
    e.target.style.cursor = "grab";
    e.target.style.opacity = "1";
  };

  // Parameter selection handlers
  const handleParameterToggle = async (stationId, parameterName) => {
    try {
      // Find the parameter ID by name
      const parameter = parameters.find(p => p.name === parameterName);
      if (!parameter) {
        console.error("Parameter not found:", parameterName);
        return;
      }

      // Check if parameter is already assigned
      const station = stations.find(s => s.id === stationId);
      const isAssigned = station.parameters && station.parameters.some(p => p.id === parameter.id);

      if (isAssigned) {
        // Remove parameter
        console.log("Removing parameter:", parameterName, "from station:", stationId);
        const res = await fetch(`http://localhost:5000/api/stations/${stationId}/parameters/${parameter.id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          // Update local state
          const updatedStations = stations.map(s => {
            if (s.id === stationId) {
              return {
                ...s,
                parameters: s.parameters.filter(p => p.id !== parameter.id)
              };
            }
            return s;
          });
          setStations(updatedStations);
          console.log("Parameter removed successfully");
        }
      } else {
        // Add parameter
        console.log("Adding parameter:", parameterName, "to station:", stationId);
        const res = await fetch(`http://localhost:5000/api/stations/${stationId}/parameters/${parameter.id}`, {
          method: "POST"
        });

        if (res.ok) {
          // Update local state
          const updatedStations = stations.map(s => {
            if (s.id === stationId) {
              const currentParams = s.parameters || [];
              return {
                ...s,
                parameters: [...currentParams, parameter]
              };
            }
            return s;
          });
          setStations(updatedStations);
          console.log("Parameter added successfully");
        }
      }
    } catch (err) {
      console.error("Error toggling parameter:", err);
      // Refresh stations to get current state
      await fetchStationsByProduct(selected);
    }
  };

  // Handle product selection
  const handleProductSelect = (productName) => {
    setSelected(productName);
    setSearch("");
    setOpen(false);
    console.log("Product selected:", productName);
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setOpen(true);
    console.log("Search changed:", value);
  };

  // Handle search input click
  const handleSearchClick = () => {
    setOpen(true);
    console.log("Search input clicked");
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    setOpen(true);
    console.log("Search input focused");
  };

  return (
    <div>
      <h1 className="header">Add Station</h1>

      {/* Product Dropdown */}
      <div style={{ position: "relative", width: "250px", marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearchChange}
          onClick={handleSearchClick}
          onFocus={handleSearchFocus}
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
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
            }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <li
                  key={index}
                  onClick={() => handleProductSelect(product)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    backgroundColor: selected === product ? "#e3f2fd" : "white",
                    fontWeight: selected === product ? "bold" : "normal"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = selected === product ? "#e3f2fd" : "white";
                  }}
                >
                  {product}
                </li>
              ))
            ) : (
              <li style={{ padding: "10px", color: "#888", fontStyle: "italic" }}>
                {search ? "No products found" : "No products available"}
              </li>
            )}
          </ul>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {selected && (
        <div style={{ 
          marginTop: "10px", 
          padding: "8px", 
          backgroundColor: "#e8f5e8", 
          borderRadius: "4px",
          border: "1px solid #4caf50"
        }}>
          <strong>Selected Product:</strong> {selected}
        </div>
      )}

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
      <button 
        onClick={handleSave} 
        disabled={isLoading}
        style={{
          opacity: isLoading ? 0.6 : 1,
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Saving...' : 'Save Station'}
      </button>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#ffe6e6', 
          borderRadius: '4px',
          border: '1px solid #ff9999'
        }}>
          Error: {error}
        </div>
      )}

      {/* Remove or comment out these debug sections */}

      {/* Debug Information - REMOVE THIS ENTIRE SECTION */}
      {/*
      {debugInfo && (
        <div style={{ 
          marginTop: "20px", 
          padding: "10px", 
          backgroundColor: "#f0f8ff", 
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}>
          <h4>Debug Info:</h4>
          <p>{debugInfo}</p>
          <button onClick={() => fetchStationsByProduct(selected)} style={{ marginTop: "10px" }}>
            Manual Refresh
          </button>
        </div>
      )}
      */}

      {/* Parameters Debug Information - REMOVE THIS ENTIRE SECTION */}
      {/*
      <div style={{ 
        marginTop: "20px", 
        padding: "10px", 
        backgroundColor: "#fff8dc", 
        border: "1px solid #ccc",
        borderRadius: "4px"
      }}>
        <h4>Parameters Debug Info:</h4>
        <p>{parametersDebug}</p>
        <p>Parameters in state: {parameters.length}</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: "10px" }}>
          Reload Page
        </button>
      </div>
      */}

      {/* Existing Stations Table */}
      {selected && (
        <div style={{ marginTop: "30px" }}>
          <h2>Existing Stations for {selected}</h2>
          {loadingStations ? (
            <div>
              <p>Loading stations...</p>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Debug: Fetching from /api/stations/by-product/{selected}
              </p>
            </div>
          ) : stations.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ddd",
                marginTop: "10px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center", width: "50px" }}>⋮⋮</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Station #</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Station Name</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Cycle Time</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Daily Count</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Products/Hour</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Report Type</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Parameters</th>
                    <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((station, index) => (
                    <tr 
                      key={station.id || index} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white"
                      }}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <td style={{ 
                        padding: "12px", 
                        border: "1px solid #ddd", 
                        textAlign: "center",
                        cursor: "grab",
                        fontSize: "18px",
                        userSelect: "none"
                      }}
                      onDragStart={(e) => {
                        e.target.style.cursor = "grabbing";
                        e.target.style.opacity = "0.5";
                      }}
                      onDragEnd={(e) => {
                        e.target.style.cursor = "grab";
                        e.target.style.opacity = "1";
                      }}
                      >
                        ⋮⋮
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{station.station_number}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{station.station_name}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{station.cycle_time}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{station.daily_count}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{station.products_per_hour}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>{station.report_type}</td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        <ParameterSelector 
                          station={station}
                          parameters={parameters}
                          onParameterToggle={handleParameterToggle}
                        />
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                        {new Date(station.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ 
                marginTop: "10px", 
                fontSize: "14px", 
                color: "#666", 
                fontStyle: "italic" 
              }}>
                🖱️ Drag and drop rows to reorder stations
              </p>
            </div>
          ) : (
            <p style={{ color: "#666", fontStyle: "italic" }}>No stations found for this product.</p>
          )}
        </div>
      )}
    </div>
  );
};

// Parameter Selector Component - Updated for new structure
const ParameterSelector = ({ station, parameters, onParameterToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get current parameters for this station
  const currentParams = station.parameters || [];
  
  // Filter parameters based on search
  const filteredParameters = parameters.filter(param =>
    param.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (paramName) => {
    onParameterToggle(station.id, paramName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.parameter-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="parameter-selector" style={{ position: "relative" }}>
      <div 
        onClick={() => {
          console.log("Opening parameter selector for station:", station.id);
          setIsOpen(!isOpen);
        }}
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: "pointer",
          backgroundColor: "#f9f9f9",
          minHeight: "20px",
          fontSize: "12px"
        }}
      >
        {currentParams.length > 0 ? (
          <div>
            {currentParams.slice(0, 2).map(p => p.name).join(", ")}
            {currentParams.length > 2 && ` +${currentParams.length - 2} more`}
          </div>
        ) : (
          <span style={{ color: "#999" }}>Select parameters...</span>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          width: "300px",
          maxHeight: "200px",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "4px",
          zIndex: 1000,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <input
            type="text"
            placeholder="Search parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "none",
              borderBottom: "1px solid #eee",
              outline: "none"
            }}
            autoFocus
          />
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            {filteredParameters.length > 0 ? (
              filteredParameters.map(param => (
                <label
                  key={param.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "12px"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={currentParams.some(p => p.id === param.id)}
                    onChange={() => handleToggle(param.name)}
                    style={{ marginRight: "8px" }}
                  />
                  <span>
                    {param.name}
                    {param.unit && <span style={{ color: "#666" }}> ({param.unit})</span>}
                  </span>
                </label>
              ))
            ) : (
              <div style={{ padding: "8px", color: "#666", fontSize: "12px" }}>
                {searchTerm ? `No parameters found matching "${searchTerm}"` : "No parameters available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStation;
