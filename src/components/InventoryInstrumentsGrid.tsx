import { Box, Chip, IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

type Props = {
  rows: any[];
  onEdit: (row: any) => void;
  onStockIn: (id: string) => void;
  onStockOut: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function InventoryInstrumentsGrid({
  rows,
  onEdit,
  onStockIn,
  onStockOut,
  onDelete,
}: Props) {
  // instruments 主表 DataGrid 列定义（优化列宽以适应页面）
  const columns: GridColDef[] = [
    { field: "id", headerName: "SKU", width: 100 },
    { field: "name", headerName: "Name", width: 180 },
    { field: "category", headerName: "Category", width: 100 },
    { field: "brand", headerName: "Brand", width: 100 },
    {
      field: "stock",
      headerName: "Stock",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.row.stock < params.row.reorderLevel ? "warning" : "default"
          }
          size="small"
        />
      ),
    },
    { field: "reorderLevel", headerName: "Reorder", width: 90 },
    {
      field: "cost",
      headerName: "Cost",
      width: 80,
      valueFormatter: (value) => `$${value}`,
    },
    {
      field: "price",
      headerName: "Price",
      width: 80,
      valueFormatter: (value) => `$${value}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => onEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onStockIn(params.row.id)}>
            <ArrowUpwardIcon fontSize="small" color="success" />
          </IconButton>
          <IconButton size="small" onClick={() => onStockOut(params.row.id)}>
            <ArrowDownwardIcon fontSize="small" color="warning" />
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
      }}
    />
  );
}
