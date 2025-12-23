import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

export type InstrumentFormData = {
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

type Props = {
  open: boolean;
  editMode: boolean;
  formData: InstrumentFormData;
  onChange: (next: InstrumentFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function InstrumentFormDialog({
  open,
  editMode,
  formData,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? "Edit Instrument" : "Add New Instrument"}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            mt: 1,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="SKU"
            fullWidth
            value={formData.id}
            onChange={(e) => onChange({ ...formData, id: e.target.value })}
            disabled={editMode}
          />

          <TextField
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
          />

          <TextField
            label="Category"
            fullWidth
            value={formData.category}
            onChange={(e) =>
              onChange({ ...formData, category: e.target.value })
            }
          />

          <TextField
            label="Brand"
            fullWidth
            value={formData.brand}
            onChange={(e) => onChange({ ...formData, brand: e.target.value })}
          />

          <TextField
            label="Stock"
            type="number"
            fullWidth
            value={formData.stock}
            onChange={(e) =>
              onChange({ ...formData, stock: Number(e.target.value) })
            }
          />

          <TextField
            label="Reorder Level"
            type="number"
            fullWidth
            value={formData.reorderLevel}
            onChange={(e) =>
              onChange({ ...formData, reorderLevel: Number(e.target.value) })
            }
          />

          <TextField
            label="Cost"
            type="number"
            fullWidth
            value={formData.cost}
            onChange={(e) =>
              onChange({ ...formData, cost: Number(e.target.value) })
            }
          />

          <TextField
            label="Price"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) =>
              onChange({ ...formData, price: Number(e.target.value) })
            }
          />

          <Box sx={{ gridColumn: { xs: "1 / -1" } }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  onChange({ ...formData, status: e.target.value })
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          {editMode ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
