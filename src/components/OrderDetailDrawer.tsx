import {
  Box,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type OrderStatus = {
  value: string;
  label: string;
  color: string;
};

type Props = {
  open: boolean;
  order: any | null;
  onClose: () => void;
  orderStatuses: OrderStatus[];
  onStatusChange: (orderId: string, newStatus: string) => void;
};

export default function OrderDetailDrawer({
  open,
  order,
  onClose,
  orderStatuses,
  onStatusChange,
}: Props) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 500 } }}
    >
      {order && (
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
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 基础信息区 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Order ID
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {order.id}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {order.date}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                >
                  {orderStatuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 客户信息区 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {order.customer}
            </Typography>

            {order.customerPhone && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.customerPhone}
                </Typography>
              </>
            )}

            {order.customerAddress && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.customerAddress}
                </Typography>
              </>
            )}

            {order.salesRepName && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Sales Rep
                </Typography>
                <Typography variant="body1">{order.salesRepName}</Typography>
              </>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 订单明细区 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            {order.items && order.items.length > 0 ? (
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
                  {order.items.map((item: any, index: number) => (
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
                Total: ${order.total?.toLocaleString() || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
