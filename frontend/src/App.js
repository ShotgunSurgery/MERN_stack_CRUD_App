import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import logo from './logo.svg';

import NavBar from "./components/NavBar";

import Home from '../src/pages/Home';
import CreateProduct from "./pages/CreateProduct";
import Parameters from "./pages/ParameterValues";
import ParameterValues from "./pages/ParameterValues";

function App() {
  return (
    <Router>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/createProduct" element={<CreateProduct/>}></Route>
        <Route path="/parameters" element={<ParameterValues/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;