// Test script for stations API
// Run this with Node.js to test if the stations endpoint is working

const testStationData = {
  product_name: "Test Product",
  station_number: 1,
  station_name: "Test Station",
  cycle_time: 30,
  daily_count: 100,
  products_per_hour: 120,
  report_type: "Done"
};

async function testStationsAPI() {
  try {
    console.log("Testing stations API...");
    console.log("Sending data:", testStationData);
    
    const response = await fetch("http://localhost:5000/api/stations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testStationData)
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    
    if (response.ok) {
      const result = await response.json();
      console.log("Success! Response:", result);
    } else {
      const errorText = await response.text();
      console.error("Error response:", errorText);
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run the test
testStationsAPI();
