import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listEmployees, deleteEmployee } from "../services/service";
import Pagination from "@mui/material/Pagination";
import { IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

type Employee = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

const ListEmployee = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  //分页
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(employees.length / pageSize);

  const start = (currentPage - 1) * pageSize;
  const currentEmployees = employees.slice(start, start + pageSize);

  const navigator = useNavigate();

  useEffect(() => {
    listEmployees()
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  function getAllEmployees() {
    listEmployees()
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function addNewEmployee() {
    navigator("/employees/new");
  }

  function updateEmployee(id: string) {
    navigator(`/employees/${id}/edit`);
  }

  function removeEmployee(id: string) {
    console.log(id);

    deleteEmployee(id)
      .then(() => {
        getAllEmployees();
      })
      .catch((error) => {
        console.error("删除员工失败:", error);
      });
  }

  return (
    <Box sx={{ p: 2, marginX: "auto", maxWidth: "800px" }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Typography sx={{ color: "text.primary" }}>Employees</Typography>
      </Breadcrumbs>
      <button className="btn btn-primary mb-2" onClick={addNewEmployee}>
        Add Employee
      </button>
      {/* 列表 */}
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentEmployees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.phone}</td>
              <td>{employee.email}</td>
              <td>
                <IconButton
                  aria-label="edit"
                  onClick={() => updateEmployee(employee.id)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  onClick={() => removeEmployee(employee.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </table>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(event, page) => setCurrentPage(page)}
        color="primary"
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />
    </Box>
  );
};

export default ListEmployee;
