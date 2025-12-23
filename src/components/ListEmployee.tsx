import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listEmployees, deleteEmployee } from "../services/service";
import Pagination from "@mui/material/Pagination";
import { IconButton, Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

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

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

  // 打开删除确认对话框
  function openDeleteDialog(id: string, name: string) {
    setEmployeeToDelete({ id, name });
    setDeleteDialogOpen(true);
  }

  // 关闭对话框
  function closeDeleteDialog() {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  }

  // 确认删除
  function confirmDelete() {
    if (!employeeToDelete) return;

    deleteEmployee(employeeToDelete.id)
      .then(() => {
        getAllEmployees();
        closeDeleteDialog();
      })
      .catch((error) => {
        console.error("删除员工失败:", error);
        closeDeleteDialog();
      });
  }

  return (
    <Box sx={{ p: 2, marginX: "auto", maxWidth: "950px" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button variant="contained" onClick={addNewEmployee}>
          Add Employee
        </Button>
      </Box>

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
                  onClick={() => openDeleteDialog(employee.id, employee.name)}
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
      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete employee{" "}
            <strong>{employeeToDelete?.name}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListEmployee;
