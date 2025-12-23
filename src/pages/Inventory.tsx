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
} from "@mui/material";
import InventoryInstrumentsGrid from "../components/InventoryInstrumentsGrid";
import StockTransactionsGrid from "../components/StockTransactionsGrid";
import InstrumentFormDialog, {
  InstrumentFormData,
} from "../components/InstrumentFormDialog";
import AddIcon from "@mui/icons-material/Add";
import {
  useInstruments,
  useStockTransactions,
  useCreateInstrument,
  useUpdateInstrument,
  useDeleteInstrument,
  useStockIn,
  useStockOut,
} from "../hooks/useData";

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

  // 表格列定义已抽到 components 中，Inventory 页面只负责提供数据与回调

  // 打开新增弹窗，预填默认数据并标记为新增模式
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

  // 进入编辑模式，载入选中乐器的数据
  const handleEdit = (instrument: any) => {
    setEditMode(true);
    setFormData(instrument);
    setFormOpen(true);
  };

  // 提交新增/编辑表单，根据模式调用不同的接口
  const handleFormSubmit = () => {
    if (editMode) {
      updateInstrument.mutate({ id: formData.id, updates: formData });
    } else {
      createInstrument.mutate(formData);
    }
    setFormOpen(false);
  };

  // 打开入库对话框，记录当前操作的乐器
  const handleStockIn = (id: string) => {
    setSelectedInstrument(id);
    setStockMode("in");
    setStockFormData({ quantity: 0, reason: "" });
    setStockDialogOpen(true);
  };

  // 打开出库对话框，记录当前操作的乐器
  const handleStockOut = (id: string) => {
    setSelectedInstrument(id);
    setStockMode("out");
    setStockFormData({ quantity: 0, reason: "" });
    setStockDialogOpen(true);
  };

  // 在入库/出库对话框中提交数量与原因
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

  // 打开删除确认框，保存待删除乐器 ID
  const handleDeleteClick = (id: string) => {
    setSelectedInstrument(id);
    setDeleteDialogOpen(true);
  };

  // 确认删除乐器，调用删除接口
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
      {/* 页面标题区：页面名称 + 新增按钮（打开新增商品弹窗） */}
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

      {/* 低库存提示区：当库存低于 reorderLevel 时显示提醒 */}
      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Low Stock Alert: {lowStockItems.length} items need reordering
          </Typography>
        </Alert>
      )}

      {/* 工具栏区：搜索（SKU/名称） + 状态筛选（active/inactive） */}
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

      {/* 库存主表区：展示商品列表（可编辑/入库/出库/删除），横向溢出时在表格区域滚动 */}
      <Box sx={{ height: 500, mb: 4, overflowX: "auto" }}>
        <Box sx={{ minWidth: 950, height: "100%" }}>
          <InventoryInstrumentsGrid
            rows={filteredInstruments}
            onEdit={handleEdit}
            onStockIn={handleStockIn}
            onStockOut={handleStockOut}
            onDelete={handleDeleteClick}
          />
        </Box>
      </Box>

      {/* 库存交易历史区：展示每次入库/出库记录，默认按日期倒序 */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Stock Transaction History
      </Typography>
      <Box sx={{ height: 400, overflowX: "auto" }}>
        <Box sx={{ minWidth: 850, height: "100%" }}>
          <StockTransactionsGrid rows={transactions} />
        </Box>
      </Box>

      {/* 新增/编辑弹窗：维护商品基础信息（SKU/名称/品牌/库存/价格/状态） */}
      <InstrumentFormDialog
        open={formOpen}
        editMode={editMode}
        formData={formData}
        onChange={setFormData}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* 入库/出库弹窗：录入数量与原因，提交后生成交易记录并更新库存 */}
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

      {/* 删除确认弹窗：确认后删除商品（需要二次确认，防止误删） */}
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
