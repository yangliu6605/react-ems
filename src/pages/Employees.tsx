import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EmployeesGrid from "../components/EmployeesGrid";
import { deleteEmployee, listEmployees } from "../services/service";

type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);

  const fetchEmployees = () => {
    listEmployees()
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <EmployeesGrid
        rows={employees}
        onEdit={(employee) => navigate(`/employees/${employee.id}/edit`)}
        onDelete={(id) =>
          deleteEmployee(id)
            .then(() => fetchEmployees())
            .catch((err) => console.error("Delete employee failed:", err))
        }
      />
    </Box>
  );
}
