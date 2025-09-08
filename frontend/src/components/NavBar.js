import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/NavBar.css";


export default function NavBar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Windals Precision Pvt. Ltd.
      </Link>
      
      {/* Desktop Navigation */}
      <div className="navbar-links">
        <Link 
          to="/" 
          className={`navbar-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link 
          to="/createProduct" 
          className={`navbar-link ${location.pathname === "/createProduct" ? "active" : ""}`}
        >
          Create Product
        </Link>
        <Link 
          to="/addStation" 
          className={`navbar-link ${location.pathname === "/addStation" ? "active" : ""}`}
        >
          Add Station
        </Link>
        <Link 
          to="/userRegistration" 
          className={`navbar-link ${location.pathname === "/userRegistration" ? "active" : ""}`}
        >
          User Registration
        </Link>
        <Link 
          to="/shiftConfig" 
          className={`navbar-link ${location.pathname === "/shiftConfig" ? "active" : ""}`}
        >
          Shift Configuration
        </Link>
      </div>
      <Link 
          to="/allocateWorker" 
          className={`navbar-link ${location.pathname === "/allocateWorker" ? "active" : ""}`}
        >
          Allocate Worker
        </Link>

      {/* Mobile Menu Toggle */}
      <button 
        className="navbar-mobile-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        Menu
      </button>

      {/* Mobile Navigation */}
      <div className={`navbar-mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="navbar-mobile-links">
          <Link 
            to="/" 
            className="navbar-mobile-link"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/createProduct" 
            className="navbar-mobile-link"
            onClick={closeMobileMenu}
          >
            Create Product
          </Link>
          <Link 
            to="/addStation" 
            className="navbar-mobile-link"
            onClick={closeMobileMenu}
          >
            Add Station
          </Link>
        </div>
      </div>
    </nav>
  );
}
// export default function NavBar(){
//      return (
//     <nav style={styles.nav}>
//       <h2 style={styles.logo}>Windals Precision Pvt. Ltd. </h2>
//       <div style={styles.links}>
//         <Link to="/" style={styles.link}>Home</Link>
//         <Link to="/createProduct" style={styles.link}>Create Product</Link>
//         <Link to="/addStation" style={styles.link}>Add Station</Link>

//         <Link to="/userRegistration" style={styles.link}>User Registration</Link>

//         <Link to="/shiftConfig" style={styles.link}>Shift Configuration</Link>

//       </div>
//     </nav>
//   );
// }

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    background: "#333",
    color: "white"
  },
  logo: { margin: 0 },
  links: { display: "flex", gap: "15px" },
  link: { color: "white", textDecoration: "none" }
};

