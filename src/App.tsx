import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeForm from "./components/EmployeeForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Layout from "./Layout";
import ListEmployee from "./components/ListEmployee";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ListEmployee />}></Route>
            <Route path="/add-employee" element={<EmployeeForm />}></Route>
            <Route path="/edit-employee/:id" element={<EmployeeForm />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
