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
          to="/users"
          className={`navbar-link ${location.pathname === "/users" ? "active" : ""}`}
        >
          Users
        </Link>
        <Link 
          to="/shiftConfig" 
          className={`navbar-link ${location.pathname === "/shiftConfig" ? "active" : ""}`}
        >
          Shift Configuration
        </Link>
        <Link 
          to="/allocateWorker" 
          className={`navbar-link ${location.pathname === "/allocateWorker" ? "active" : ""}`}
        >
          Allocate Worker
        </Link>
      </div>

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
          <Link
            to="/users"
            className="navbar-mobile-link"
            onClick={closeMobileMenu}
          >
            Users
          </Link>
        </div>
      </div>
    </nav>
  );
}