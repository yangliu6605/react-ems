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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import OrdersGrid from "../components/OrdersGrid";
import OrderFormDialog from "../components/OrderFormDialog";
import OrderDetailDrawer from "../components/OrderDetailDrawer";
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

  // 新建订单：初始化表单数据并打开弹窗
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

  // 查看详情：打开右侧 Drawer，并把当前订单设置为 selectedOrder
  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setDetailDrawerOpen(true);
  };

  // 提交表单：根据 editMode 决定创建/更新订单
  const handleFormSubmit = () => {
    if (editMode) {
      updateOrder.mutate({ id: formData.id, updates: formData });
    } else {
      createOrder.mutate(formData);
    }
    setFormOpen(false);
  };

  // 点击删除：打开删除确认弹窗，并记录待删除订单
  const handleDeleteClick = (id: string) => {
    setSelectedOrder(orders.find((o: any) => o.id === id));
    setDeleteDialogOpen(true);
  };

  // 确认删除：调用删除接口（MSW 会处理库存回补逻辑）
  const handleDeleteConfirm = () => {
    if (selectedOrder) {
      deleteOrder.mutate(selectedOrder.id);
    }
    setDeleteDialogOpen(false);
  };

  // 详情抽屉中修改订单状态：直接调用 updateOrder
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
      {/* 页面标题区：标题 + 总订单数/销售额摘要 + 新建订单按钮 */}
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

      {/* 工具栏区：搜索（订单号/客户名）+ 状态筛选 */}
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

      {/* 订单主表区：DataGrid 展示订单列表（默认按日期倒序；支持分页/排序） */}
      <Box sx={{ height: 600 }}>
        <OrdersGrid
          rows={filteredOrders}
          orderStatuses={ORDER_STATUSES}
          onViewDetail={handleViewDetail}
          onDelete={handleDeleteClick}
        />
      </Box>

      {/* 新建/编辑订单弹窗：录入客户信息 + 订单明细（SKU/数量/单价） */}
      <OrderFormDialog
        open={formOpen}
        editMode={editMode}
        formData={formData}
        onChange={setFormData}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        instruments={instruments}
        orderStatuses={ORDER_STATUSES}
      />

      {/* 订单详情抽屉（Drawer）：查看订单详情，并支持修改订单状态 */}
      <OrderDetailDrawer
        open={detailDrawerOpen}
        order={selectedOrder}
        onClose={() => setDetailDrawerOpen(false)}
        orderStatuses={ORDER_STATUSES}
        onStatusChange={handleStatusChange}
      />

      {/* 删除确认弹窗：防止误删；非已发货/已完成订单会提示库存回补 */}
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
