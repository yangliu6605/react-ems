import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  IconButton,
  Chip,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  useInstruments,
  useStockTransactions,
  useCreateInstrument,
  useUpdateInstrument,
  useDeleteInstrument,
  useStockIn,
  useStockOut,
} from "../hooks/useData";

type InstrumentFormData = {
  id: string;
  name: string;
  category: string;
  brand: string;
  stock: number;
  reorderLevel: number;
  cost: number;
  price: number;
  status: string;
};

export default function Inventory() {
  const { data: instruments = [], isLoading } = useInstruments();
  const { data: transactions = [] } = useStockTransactions();
  const createInstrument = useCreateInstrument();
  const updateInstrument = useUpdateInstrument();
  const deleteInstrument = useDeleteInstrument();
  const stockIn = useStockIn();
  const stockOut = useStockOut();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [stockMode, setStockMode] = useState<"in" | "out">("in");
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState<InstrumentFormData>({
    id: "",
    name: "",
    category: "",
    brand: "",
    stock: 0,
    reorderLevel: 5,
    cost: 0,
    price: 0,
    status: "active",
  });

  const [stockFormData, setStockFormData] = useState({
    quantity: 0,
    reason: "",
  });

  const lowStockItems = instruments.filter(
    (i: any) => i.stock < i.reorderLevel
  );

  const filteredInstruments = instruments.filter((instrument: any) => {
    const matchesSearch =
      instrument.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instrument.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || instrument.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "SKU", width: 120 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "brand", headerName: "Brand", width: 120 },
    {
      field: "stock",
      headerName: "Stock",
      width: 100,
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
    { field: "reorderLevel", headerName: "Reorder Level", width: 120 },
    {
      field: "cost",
      headerName: "Cost",
      width: 100,
      valueFormatter: (value) => `$${value}`,
    },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      valueFormatter: (value) => `$${value}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
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
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleStockIn(params.row.id)}>
            <ArrowUpwardIcon fontSize="small" color="success" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleStockOut(params.row.id)}
          >
            <ArrowDownwardIcon fontSize="small" color="warning" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row.id)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const transactionColumns: GridColDef[] = [
    { field: "date", headerName: "Date", width: 120 },
    {
      field: "type",
      headerName: "Type",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === "in" ? "In" : "Out"}
          color={params.value === "in" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    { field: "instrumentId", headerName: "SKU", width: 120 },
    { field: "instrumentName", headerName: "Instrument", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 100 },
    { field: "operator", headerName: "Operator", width: 100 },
    { field: "reason", headerName: "Reason", width: 200 },
  ];

  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      id: `SKU-${Date.now()}`,
      name: "",
      category: "",
      brand: "",
      stock: 0,
      reorderLevel: 5,
      cost: 0,
      price: 0,
      status: "active",
    });
    setFormOpen(true);
  };

  const handleEdit = (instrument: any) => {
    setEditMode(true);
    setFormData(instrument);
    setFormOpen(true);
  };

  const handleFormSubmit = () => {
    if (editMode) {
      updateInstrument.mutate({ id: formData.id, updates: formData });
    } else {
      createInstrument.mutate(formData);
    }
    setFormOpen(false);
  };

  const handleStockIn = (id: string) => {
    setSelectedInstrument(id);
    setStockMode("in");
    setStockFormData({ quantity: 0, reason: "" });
    setStockDialogOpen(true);
  };

  const handleStockOut = (id: string) => {
    setSelectedInstrument(id);
    setStockMode("out");
    setStockFormData({ quantity: 0, reason: "" });
    setStockDialogOpen(true);
  };

  const handleStockSubmit = () => {
    if (!selectedInstrument) return;

    const mutation = stockMode === "in" ? stockIn : stockOut;
    mutation.mutate({
      id: selectedInstrument,
      quantity: stockFormData.quantity,
      reason:
        stockFormData.reason || (stockMode === "in" ? "Stock in" : "Stock out"),
    });
    setStockDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedInstrument(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedInstrument) {
      deleteInstrument.mutate(selectedInstrument);
    }
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Inventory Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
          sx={{ height: 40, minWidth: 120 }}
        >
          Add Item
        </Button>
      </Box>

      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Low Stock Alert: {lowStockItems.length} items need reordering
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search by SKU or Name"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 500, mb: 4 }}>
        <DataGrid
          rows={filteredInstruments}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Stock Transaction History
      </Typography>
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={transactions}
          columns={transactionColumns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: "date", sort: "desc" }] },
          }}
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Instrument" : "Add New Instrument"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="SKU"
                fullWidth
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                disabled={editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                fullWidth
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Brand"
                fullWidth
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Reorder Level"
                type="number"
                fullWidth
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderLevel: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cost"
                type="number"
                fullWidth
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock In/Out Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)}>
        <DialogTitle>Stock {stockMode === "in" ? "In" : "Out"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={stockFormData.quantity}
            onChange={(e) =>
              setStockFormData({
                ...stockFormData,
                quantity: Number(e.target.value),
              })
            }
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            label="Reason (optional)"
            fullWidth
            value={stockFormData.reason}
            onChange={(e) =>
              setStockFormData({ ...stockFormData, reason: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStockSubmit}
            variant="contained"
            color={stockMode === "in" ? "success" : "warning"}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this instrument?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
