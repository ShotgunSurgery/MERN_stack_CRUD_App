import React, { useState } from "react";

const initialPermissions = {
  userConfiguration: { view: false, add: false, update: false, delete: false },
  productConfiguration: { view: false, add: false, update: false, delete: false },
  stationConfiguration: { view: false, add: false, update: false, delete: false },
  shiftConfiguration: { view: false, add: false, update: false, delete: false },
  stationAllocation: { update: false, delete: false },
};

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    nickname: "",
    mobileNumber: "",
    designation: "",
    joiningDate: "",
    userType: "Operator",
    permissions: initialPermissions,
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("userConfiguration");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("permissions")) {
      const keys = name.split(".");
      setFormData((prev) => {
        const updatedPermissions = { ...prev.permissions };
        updatedPermissions[keys[1]][keys[2]] = checked;
        return { ...prev, permissions: updatedPermissions };
      });
    } else if (type === "radio") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.joiningDate) newErrors.joiningDate = "Joining Date is required";

    // Mobile number validation
    if (formData.mobileNumber) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.mobileNumber.replace(/\s|-|\(|\)/g, ""))) {
        newErrors.mobileNumber = "Mobile number must be exactly 10 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submissionData = {
      username: formData.username,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      nickname: formData.nickname,
      mobile_number: formData.mobileNumber,
      designation: formData.designation,
      joining_date: formData.joiningDate,
      user_type: formData.userType,
      permissions: formData.permissions,
    };

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("User registered successfully!");
        console.log("Registration successful:", result);
        // Reset form
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          nickname: "",
          mobileNumber: "",
          designation: "",
          joiningDate: "",
          userType: "Operator",
          permissions: initialPermissions,
        });
        setErrors({});
      } else {
        const error = await response.json();
        alert("Registration failed: " + (error.error || "Unknown error"));
        console.error("Registration error:", error);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error. Please try again.");
    }
  };

  const permissionSections = [
    { key: "userConfiguration", label: "User Config" },
    { key: "productConfiguration", label: "Product Config" },
    { key: "stationConfiguration", label: "Station Config" },
    { key: "shiftConfiguration", label: "Shift Config" },
    { key: "stationAllocation", label: "Station Alloc" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", color: "#333", marginBottom: 30, fontSize: 28 }}>User Registration</h2>
      <form onSubmit={handleSubmit} style={{ backgroundColor: "#fff", padding: 30, borderRadius: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>

        {/* Account Info Section */}
        <div style={{ marginBottom: 30, padding: 20, backgroundColor: "#f9f9f9", borderRadius: 8, border: "1px solid #e0e0e0" }}>
          <h3 style={{ marginBottom: 20, color: "#555", fontSize: 20 }}>📋 Account Info</h3>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Username*:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{ width: "100%", padding: 10, borderRadius: 5, border: errors.username ? "1px solid red" : "1px solid #ccc", fontSize: 16 }}
            />
            {errors.username && <div style={{ color: "red", marginTop: 5 }}>{errors.username}</div>}
          </div>
          <div style={{ display: "flex", gap: 15, marginBottom: 15 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Password*:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 5, border: errors.password ? "1px solid red" : "1px solid #ccc", fontSize: 16 }}
              />
              {errors.password && <div style={{ color: "red", marginTop: 5 }}>{errors.password}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Confirm Password*:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 5, border: errors.confirmPassword ? "1px solid red" : "1px solid #ccc", fontSize: 16 }}
              />
              {errors.confirmPassword && <div style={{ color: "red", marginTop: 5 }}>{errors.confirmPassword}</div>}
            </div>
          </div>
        </div>

        {/* Personal Info Section */}
        <div style={{ marginBottom: 30, padding: 20, backgroundColor: "#f9f9f9", borderRadius: 8, border: "1px solid #e0e0e0" }}>
          <h3 style={{ marginBottom: 20, color: "#555", fontSize: 20 }}>👤 Personal Info</h3>
          <div style={{ display: "flex", gap: 15, marginBottom: 15 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>First Name*:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 5, border: errors.firstName ? "1px solid red" : "1px solid #ccc", fontSize: 16 }}
              />
              {errors.firstName && <div style={{ color: "red", marginTop: 5 }}>{errors.firstName}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Last Name*:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 5, border: errors.lastName ? "1px solid red" : "1px solid #ccc", fontSize: 16 }}
              />
              {errors.lastName && <div style={{ color: "red", marginTop: 5 }}>{errors.lastName}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 15, marginBottom: 15 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Nickname:</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc", fontSize: 16 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Mobile Number:</label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 5, border: errors.mobileNumber ? "1px solid red" : "1px solid #ccc", fontSize: 16 }}
              />
              {errors.mobileNumber && <div style={{ color: "red", marginTop: 5 }}>{errors.mobileNumber}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 15 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Designation:</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 5, border: "1px solid #ccc", fontSize: 16 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Joining Date*:</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 5, border: errors.joiningDate ? "1px solid red" : "1px solid #ccc", fontSize: 16 }}
              />
              {errors.joiningDate && <div style={{ color: "red", marginTop: 5 }}>{errors.joiningDate}</div>}
            </div>
          </div>
        </div>

        {/* User Type Section */}
        <div style={{ marginBottom: 30, padding: 20, backgroundColor: "#f9f9f9", borderRadius: 8, border: "1px solid #e0e0e0" }}>
          <h3 style={{ marginBottom: 20, color: "#555", fontSize: 20 }}>👔 User Type*</h3>
          <div style={{ display: "flex", gap: 20 }}>
            {["Operator", "Supervisor", "Admin"].map((type) => (
              <label key={type} style={{ cursor: "pointer", fontSize: 16 }}>
                <input
                  type="radio"
                  name="userType"
                  value={type}
                  checked={formData.userType === type}
                  onChange={handleChange}
                  style={{ marginRight: 8 }}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Permissions Section */}
        <div style={{ marginBottom: 30, padding: 20, backgroundColor: "#f9f9f9", borderRadius: 8, border: "1px solid #e0e0e0" }}>
          <h3 style={{ marginBottom: 20, color: "#555", fontSize: 20 }}>🔐 Permissions</h3>
          <div style={{ display: "flex", marginBottom: 20, borderBottom: "1px solid #ccc" }}>
            {permissionSections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveTab(section.key)}
                style={{
                  flex: 1,
                  padding: 10,
                  border: "none",
                  backgroundColor: activeTab === section.key ? "#4CAF50" : "#f0f0f0",
                  color: activeTab === section.key ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                {section.label}
              </button>
            ))}
          </div>
          <div>
            {Object.keys(formData.permissions[activeTab]).map((perm) => (
              <label key={perm} style={{ display: "block", marginBottom: 10, cursor: "pointer", fontSize: 16 }}>
                <input
                  type="checkbox"
                  name={`permissions.${activeTab}.${perm}`}
                  checked={formData.permissions[activeTab][perm]}
                  onChange={handleChange}
                  style={{ marginRight: 8 }}
                />
                {perm.charAt(0).toUpperCase() + perm.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "15px 40px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 18,
              fontWeight: "bold",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
          >
            Register User
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegistration;
