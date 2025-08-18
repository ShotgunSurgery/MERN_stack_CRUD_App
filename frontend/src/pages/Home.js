import React from "react";
import "../styles/Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1 className="mainHead">Existing Product</h1>
      <Link to="/createProduct">
        <button className="createNew">Create New +</button>
      </Link>
    </div>
  );
};

export default Home;
