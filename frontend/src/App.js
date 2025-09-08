import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';


import NavBar from "./components/NavBar";

import Home from '../src/pages/Home';
import CreateProduct from "./pages/CreateProduct";
import ParameterValues from "./pages/ParameterValues";
import AddStation from "./pages/AddStation";

import UserRegistration from "./pages/UserRegistration";

import ShiftConfig from "./pages/ShiftConfig";
import AllocateWorker from "./pages/AllocateWorker";


function App() {
  return (
    <Router>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/createProduct" element={<CreateProduct/>}></Route>
        <Route path="/parameters/:productId" element={<ParameterValues/>}></Route>
        <Route path="/addStation" element={<AddStation/>}></Route>

        <Route path="/userRegistration" element={<UserRegistration/>}></Route>
        <Route path="/allocateWorker" element={<AllocateWorker/>}></Route>
        <Route path="/shiftConfig" element={<ShiftConfig/>}></Route>

      </Routes>
    </Router>
  );
}

export default App;
