import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import axios from "axios";

type Instrument = {
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
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/instruments")
      .then((response) => {
        setInstruments(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch instruments:", error);
        setLoading(false);
      });
  }, []);

  const lowStockItems = instruments.filter((i) => i.stock < i.reorderLevel);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Low Stock Alert: {lowStockItems.length} items need reordering
          </Typography>
          {lowStockItems.map((item) => (
            <Typography key={item.id} variant="body2">
              • {item.name} ({item.id}): {item.stock} units remaining
            </Typography>
          ))}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Reorder Level</TableCell>
              <TableCell align="right">Cost</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instruments.map((instrument) => (
              <TableRow
                key={instrument.id}
                sx={{
                  backgroundColor:
                    instrument.stock < instrument.reorderLevel
                      ? "warning.light"
                      : "inherit",
                }}
              >
                <TableCell>{instrument.id}</TableCell>
                <TableCell>{instrument.name}</TableCell>
                <TableCell>{instrument.category}</TableCell>
                <TableCell>{instrument.brand}</TableCell>
                <TableCell align="right">{instrument.stock}</TableCell>
                <TableCell align="right">{instrument.reorderLevel}</TableCell>
                <TableCell align="right">${instrument.cost}</TableCell>
                <TableCell align="right">${instrument.price}</TableCell>
                <TableCell>
                  <Chip
                    label={instrument.status}
                    color={
                      instrument.status === "active" ? "success" : "default"
                    }
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Total Items: {instruments.length} | Low Stock: {lowStockItems.length}
        </Typography>
      </Box>
    </Box>
  );
}
