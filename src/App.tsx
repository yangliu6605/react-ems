import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeForm from "./components/EmployeeForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Layout from "./Layout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Inventory from "./pages/Inventory";
import Orders from "./pages/OrdersNew";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />}></Route>
            <Route path="/dashboard" element={<Dashboard />}></Route>
            <Route path="/employees" element={<Employees />}></Route>
            <Route path="/employees/new" element={<EmployeeForm />}></Route>
            <Route
              path="/employees/:id/edit"
              element={<EmployeeForm />}
            ></Route>
            <Route path="/inventory" element={<Inventory />}></Route>
            <Route path="/orders" element={<Orders />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
