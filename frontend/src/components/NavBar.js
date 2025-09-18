import { Link } from "react-router-dom";

export default function NavBar(){
     return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Windals Precision Pvt. Ltd. </h2>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/createProduct" style={styles.link}>Create Product</Link>
        <Link to="/addStation" style={styles.link}>Add Station</Link>
        <Link to="/userRegistration" style={styles.link}>User Registration</Link>
        <Link to="/users" style={styles.link}>Users</Link>
        <Link to="/shiftConfig" style={styles.link}>Shift Configuration</Link>
      </div>
    </nav>
  );
}

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
