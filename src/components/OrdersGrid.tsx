import { Box, Chip, IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

type OrderStatus = {
  value: string;
  label: string;
  color: string;
};

type Props = {
  rows: any[];
  orderStatuses: OrderStatus[];
  onViewDetail: (order: any) => void;
  onDelete: (id: string) => void;
};

export default function OrdersGrid({
  rows,
  orderStatuses,
  onViewDetail,
  onDelete,
}: Props) {
  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find((s) => s.value === status);
    return statusObj?.color || "default";
  };

  // Orders 主表 DataGrid 列定义
  const columns: GridColDef[] = [
    { field: "id", headerName: "Order ID", width: 140 },
    { field: "customer", headerName: "Customer", width: 150 },
    { field: "date", headerName: "Date", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const statusObj = orderStatuses.find((s) => s.value === params.value);
        return (
          <Chip
            label={statusObj?.label || params.value}
            color={getStatusColor(params.value) as any}
            size="small"
          />
        );
      },
    },
    { field: "salesRepName", headerName: "Sales Rep", width: 130 },
    {
      field: "total",
      headerName: "Total",
      width: 120,
      renderCell: (params) => {
        const n = Number(params.value ?? 0);
        return `$${n.toLocaleString()}`;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => onViewDetail(params.row)}>
            <VisibilityIcon fontSize="small" />
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
    <DataGrid
      rows={rows}
      columns={columns}
      pageSizeOptions={[10, 25, 50]}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: { sortModel: [{ field: "date", sort: "desc" }] },
      }}
    />
  );
}
