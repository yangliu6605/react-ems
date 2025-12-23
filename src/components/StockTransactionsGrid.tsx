import { Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type Props = {
  rows: any[];
};

export default function StockTransactionsGrid({ rows }: Props) {
  // stock transactions 历史记录 DataGrid 列定义（优化列宽以适应页面）
  const columns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 110 },
    {
      field: "type",
      headerName: "Type",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value === "in" ? "In" : "Out"}
          color={params.value === "in" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    { field: "instrumentId", headerName: "SKU", width: 100 },
    { field: "instrumentName", headerName: "Instrument", width: 180 },
    { field: "quantity", headerName: "Qty", width: 80 },
    { field: "operator", headerName: "Operator", width: 90 },
    { field: "reason", headerName: "Reason", width: 180 },
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
