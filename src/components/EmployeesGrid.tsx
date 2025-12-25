import { Box, IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type EmployeeRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type Props = {
  rows: EmployeeRow[];
  onEdit: (employee: EmployeeRow) => void;
  onDelete: (id: string) => void;
};

export default function EmployeesGrid({ rows, onEdit, onDelete }: Props) {
  const columns: GridColDef<EmployeeRow>[] = [
    { field: "id", headerName: "ID", width: 110 },
    { field: "name", headerName: "Name", width: 180, editable: true },
    { field: "email", headerName: "Email", width: 220, editable: true },
    { field: "phone", headerName: "Phone", width: 160, editable: true },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => onEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(params.row.id)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
