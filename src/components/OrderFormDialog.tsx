import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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

type OrderStatus = {
  value: string;
  label: string;
  color: string;
};

type Props = {
  open: boolean;
  editMode: boolean;
  formData: OrderFormData;
  onChange: (next: OrderFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
  instruments: any[];
  orderStatuses: OrderStatus[];
};

export default function OrderFormDialog({
  open,
  editMode,
  formData,
  onChange,
  onClose,
  onSubmit,
  instruments,
  orderStatuses,
}: Props) {
  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleAddItem = () => {
    const newItems = [
      ...formData.items,
      { instrumentId: "", instrumentName: "", quantity: 1, unitPrice: 0 },
    ];
    onChange({ ...formData, items: newItems, total: calculateTotal(newItems) });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    onChange({ ...formData, items: newItems, total: calculateTotal(newItems) });
  };

  const handleInstrumentChange = (index: number, value: any) => {
    const newItems = [...formData.items];
    newItems[index].instrumentId = value?.id || "";
    newItems[index].instrumentName = value?.name || "";
    newItems[index].unitPrice = value?.price || 0;
    onChange({ ...formData, items: newItems, total: calculateTotal(newItems) });
  };

  const handleQtyChange = (index: number, qty: number) => {
    const newItems = [...formData.items];
    newItems[index].quantity = qty;
    onChange({ ...formData, items: newItems, total: calculateTotal(newItems) });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editMode ? "Edit Order" : "Create New Order"}</DialogTitle>
      <DialogContent>
        {/* 订单基础信息区：订单号/日期/客户信息/销售/状态 */}
        <Box
          sx={{
            mt: 1,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField label="Order ID" fullWidth value={formData.id} disabled />

          <TextField
            label="Date"
            type="date"
            fullWidth
            value={formData.date}
            onChange={(e) => onChange({ ...formData, date: e.target.value })}
          />

          <TextField
            label="Customer Name"
            fullWidth
            value={formData.customer}
            onChange={(e) =>
              onChange({ ...formData, customer: e.target.value })
            }
          />

          <TextField
            label="Customer Phone"
            fullWidth
            value={formData.customerPhone}
            onChange={(e) =>
              onChange({ ...formData, customerPhone: e.target.value })
            }
          />

          <Box sx={{ gridColumn: { xs: "1 / -1" } }}>
            <TextField
              label="Customer Address"
              fullWidth
              value={formData.customerAddress}
              onChange={(e) =>
                onChange({ ...formData, customerAddress: e.target.value })
              }
            />
          </Box>

          <TextField
            label="Sales Rep Name"
            fullWidth
            value={formData.salesRepName}
            onChange={(e) =>
              onChange({ ...formData, salesRepName: e.target.value })
            }
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) =>
                onChange({ ...formData, status: e.target.value })
              }
            >
              {orderStatuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 订单明细区：商品列表（SKU/数量/单价），用于计算订单总价 */}
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
          <Box
            key={index}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr auto" },
              gap: 2,
              mb: 2,
              alignItems: "center",
            }}
          >
            <Autocomplete
              options={instruments}
              getOptionLabel={(option: any) => `${option.name} (${option.id})`}
              value={
                instruments.find((i: any) => i.id === item.instrumentId) || null
              }
              onChange={(_, value) => handleInstrumentChange(index, value)}
              renderInput={(params) => (
                <TextField {...params} label="Instrument" />
              )}
            />

            <TextField
              label="Quantity"
              type="number"
              value={item.quantity}
              onChange={(e) => handleQtyChange(index, Number(e.target.value))}
            />

            <TextField
              label="Unit Price"
              type="number"
              value={item.unitPrice}
              disabled
            />

            <IconButton onClick={() => handleRemoveItem(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Typography variant="h6">
            Total: ${formData.total.toLocaleString()}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={formData.items.length === 0}
        >
          {editMode ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
