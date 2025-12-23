import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
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
  Drawer,
  Divider,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import {
  useOrders,
  useInstruments,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
} from "../hooks/useData";

type OrderItem = {
  instrumentId: string;
  instrumentName: string;
  quantity: number;
  unitPrice: number;
};

type OrderFormData = {
  id: string;
  customer: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  status: string;
  salesRepName: string;
  items: OrderItem[];
  total: number;
};

const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "default" },
  { value: "processing", label: "Processing", color: "info" },
  { value: "paid_not_shipped", label: "Paid (Not Shipped)", color: "warning" },
  { value: "shipped", label: "Shipped", color: "primary" },
  { value: "fulfilled", label: "Fulfilled", color: "success" },
  { value: "cancelled", label: "Cancelled", color: "error" },
];

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: instruments = [] } = useInstruments();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    id: "",
    customer: "",
    customerPhone: "",
    customerAddress: "",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    salesRepName: "",
    items: [],
    total: 0,
  });

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const statusObj = ORDER_STATUSES.find((s) => s.value === status);
    return statusObj?.color || "default";
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "Order ID", width: 140 },
    { field: "customer", headerName: "Customer", width: 150 },
    { field: "date", headerName: "Date", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const statusObj = ORDER_STATUSES.find((s) => s.value === params.value);
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
      valueFormatter: (value) => `$${value?.toLocaleString() || 0}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleViewDetail(params.row)}>
            <VisibilityIcon fontSize="small" />
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

  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      id: `ORD-${Date.now()}`,
      customer: "",
      customerPhone: "",
      customerAddress: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      salesRepName: "",
      items: [],
      total: 0,
    });
    setFormOpen(true);
  };

  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setDetailDrawerOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { instrumentId: "", instrumentName: "", quantity: 1, unitPrice: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      total: calculateTotal(newItems),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];

    if (field === "instrument") {
      newItems[index].instrumentId = value?.id || "";
      newItems[index].instrumentName = value?.name || "";
      newItems[index].unitPrice = value?.price || 0;
    } else if (field === "quantity") {
      newItems[index].quantity = Number(value);
    }

    setFormData({
      ...formData,
      items: newItems,
      total: calculateTotal(newItems),
    });
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleFormSubmit = () => {
    if (editMode) {
      updateOrder.mutate({ id: formData.id, updates: formData });
    } else {
      createOrder.mutate(formData);
    }
    setFormOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedOrder(orders.find((o: any) => o.id === id));
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedOrder) {
      deleteOrder.mutate(selectedOrder.id);
    }
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrder.mutate({ id: orderId, updates: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const totalSales = orders
    .filter((o: any) => o.status === "fulfilled")
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

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
        <Box>
          <Typography variant="h4">Sales Orders</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Total Orders: {orders.length} | Fulfilled Sales: $
            {totalSales.toLocaleString()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
          sx={{ height: 40, minWidth: 120 }}
        >
          New Order
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search by Order ID or Customer"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={filteredOrders}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: "date", sort: "desc" }] },
          }}
        />
      </Box>

      {/* Add/Edit Order Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Order" : "Create New Order"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* @ts-ignore */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Order ID"
                fullWidth
                value={formData.id}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Name"
                fullWidth
                value={formData.customer}
                onChange={(e) =>
                  setFormData({ ...formData, customer: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Phone"
                fullWidth
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Customer Address"
                fullWidth
                value={formData.customerAddress}
                onChange={(e) =>
                  setFormData({ ...formData, customerAddress: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sales Rep Name"
                fullWidth
                value={formData.salesRepName}
                onChange={(e) =>
                  setFormData({ ...formData, salesRepName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {ORDER_STATUSES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Order Items</Typography>
                <Button startIcon={<AddIcon />} onClick={handleAddItem}>
                  Add Item
                </Button>
              </Box>
              {formData.items.map((item, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={5}>
                    <Autocomplete
                      options={instruments}
                      getOptionLabel={(option: any) =>
                        `${option.name} (${option.id})`
                      }
                      value={
                        instruments.find(
                          (i: any) => i.id === item.instrumentId
                        ) || null
                      }
                      onChange={(_, value) =>
                        handleItemChange(index, "instrument", value)
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Instrument" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Quantity"
                      type="number"
                      fullWidth
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Unit Price"
                      type="number"
                      fullWidth
                      value={item.unitPrice}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      onClick={() => handleRemoveItem(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Typography variant="h6">
                  Total: ${formData.total.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={formData.items.length === 0}
          >
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        PaperProps={{ sx: { width: 500 } }}
      >
        {selectedOrder && (
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5">Order Details</Typography>
              <IconButton onClick={() => setDetailDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Order ID
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedOrder.id}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedOrder.date}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <Select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value)
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {selectedOrder.customer}
              </Typography>

              {selectedOrder.customerPhone && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedOrder.customerPhone}
                  </Typography>
                </>
              )}

              {selectedOrder.customerAddress && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedOrder.customerAddress}
                  </Typography>
                </>
              )}

              {selectedOrder.salesRepName && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sales Rep
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.salesRepName}
                  </Typography>
                </>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.instrumentName || item.instrumentId}
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.unitPrice}</TableCell>
                        <TableCell align="right">
                          ${(item.quantity * item.unitPrice).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="text.secondary">No items</Typography>
              )}
              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Typography variant="h6">
                  Total: ${selectedOrder.total?.toLocaleString() || 0}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete order {selectedOrder?.id}?
          </Typography>
          {selectedOrder?.status !== "fulfilled" &&
            selectedOrder?.status !== "shipped" && (
              <Typography color="warning.main" sx={{ mt: 1 }}>
                Note: Stock will be restored for this order.
              </Typography>
            )}
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
