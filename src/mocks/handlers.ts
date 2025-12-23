import { http, HttpResponse } from "msw";
import employeesData from "../data/employees.json";
import instrumentsData from "../data/instruments.json";
import ordersData from "../data/orders.json";
import stockTransactionsData from "../data/stockTransactions.json";

// Mutable in-memory data stores
let employees = [...employeesData];
let instruments = [...instrumentsData];
let orders = [...ordersData];
let stockTransactions = [...stockTransactionsData];

// Helper to generate unique IDs
let txnCounter = stockTransactions.length + 1;
const generateTxnId = () => `TXN-${String(txnCounter++).padStart(3, "0")}`;

// Helper to adjust stock and record transaction
function adjustStock(
  instrumentId: string,
  quantity: number,
  type: "in" | "out",
  reason: string,
  relatedOrderId?: string
) {
  const instrument = instruments.find((i) => i.id === instrumentId);
  if (!instrument) {
    throw new Error(`Instrument ${instrumentId} not found`);
  }

  if (type === "out" && instrument.stock < quantity) {
    throw new Error(
      `Insufficient stock for ${instrument.name}. Available: ${instrument.stock}, Requested: ${quantity}`
    );
  }

  // Adjust stock
  instrument.stock += type === "in" ? quantity : -quantity;

  // Record transaction
  const transaction = {
    id: generateTxnId(),
    instrumentId: instrument.id,
    instrumentName: instrument.name,
    type,
    quantity,
    date: new Date().toISOString().split("T")[0],
    operator: "System",
    reason,
    ...(relatedOrderId && { relatedOrderId }),
  };
  stockTransactions.push(transaction);

  return transaction;
}

// Helper function to calculate dashboard metrics from current data
function calculateDashboard() {
  const fulfilledOrders = orders.filter((o) => o.status === "fulfilled");
  const totalSales = fulfilledOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue =
    fulfilledOrders.length > 0
      ? Math.round(totalSales / fulfilledOrders.length)
      : 0;

  // Calculate top categories from instruments
  const categoryMap: Record<string, number> = {};
  fulfilledOrders.forEach((order) => {
    order.items.forEach((item) => {
      const instrument = instruments.find((i) => i.id === item.instrumentId);
      if (instrument) {
        const cat = instrument.category;
        categoryMap[cat] =
          (categoryMap[cat] || 0) + item.quantity * item.unitPrice;
      }
    });
  });

  const topCategories = Object.entries(categoryMap)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Find low stock items (stock < 5)
  const lowStock = instruments.filter((i) => i.stock < 5).map((i) => i.id);

  // Generate 12-month sales trend from actual order dates
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentYear = new Date().getFullYear();
  const monthlySales: Record<string, number> = {};

  // Initialize all months to 0
  monthNames.forEach((month) => {
    monthlySales[month] = 0;
  });

  // Aggregate sales by month from fulfilled orders
  fulfilledOrders.forEach((order) => {
    const orderDate = new Date(order.date);
    if (orderDate.getFullYear() === currentYear) {
      const monthIndex = orderDate.getMonth();
      const monthName = monthNames[monthIndex];
      monthlySales[monthName] += order.total;
    }
  });

  const salesTrend = monthNames.map((month) => ({
    month,
    sales: monthlySales[month],
  }));

  return {
    period: new Date().toISOString().slice(0, 7),
    totalSales,
    orders: fulfilledOrders.length,
    avgOrderValue,
    topCategories,
    lowStock,
    salesTrend,
  };
}

export const handlers = [
  // Employees endpoints
  http.get("/api/employees", () => {
    return HttpResponse.json(employees);
  }),

  http.post("/api/employees", async ({ request }) => {
    const newEmployee = (await request.json()) as any;
    employees.push(newEmployee);
    return HttpResponse.json(newEmployee, { status: 201 });
  }),

  http.delete("/api/employees/:id", ({ params }) => {
    const { id } = params;
    employees = employees.filter((e) => e.id !== id);
    return HttpResponse.json({ success: true });
  }),

  // 获取单个员工（用于编辑时回填表单）
  http.get("/api/employees/:id", ({ params }) => {
    const { id } = params;
    const employee = employees.find((e) => e.id === id);

    if (!employee) {
      return HttpResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json(employee);
  }),

  // 更新员工信息
  http.put("/api/employees/:id", async ({ request, params }) => {
    const { id } = params;
    const updates = (await request.json()) as any;

    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    employees[index] = { ...employees[index], ...updates };
    return HttpResponse.json(employees[index]);
  }),

  // Instruments endpoints
  http.get("/api/instruments", () => {
    return HttpResponse.json(instruments);
  }),

  http.post("/api/instruments", async ({ request }) => {
    const newInstrument = (await request.json()) as any;
    instruments.push(newInstrument);
    return HttpResponse.json(newInstrument, { status: 201 });
  }),

  http.put("/api/instruments/:id", async ({ request, params }) => {
    const { id } = params;
    const updates = (await request.json()) as any;
    const index = instruments.findIndex((i) => i.id === id);
    if (index === -1) {
      return HttpResponse.json(
        { error: "Instrument not found" },
        { status: 404 }
      );
    }
    instruments[index] = { ...instruments[index], ...updates };
    return HttpResponse.json(instruments[index]);
  }),

  http.delete("/api/instruments/:id", ({ params }) => {
    const { id } = params;
    instruments = instruments.filter((i) => i.id !== id);
    return HttpResponse.json({ success: true });
  }),

  http.post("/api/instruments/:id/stock-in", async ({ request, params }) => {
    const { id } = params;
    const { quantity, reason } = (await request.json()) as any;
    try {
      const transaction = adjustStock(
        id as string,
        quantity,
        "in",
        reason || "Stock in"
      );
      return HttpResponse.json(transaction, { status: 201 });
    } catch (error: any) {
      return HttpResponse.json({ error: error.message }, { status: 400 });
    }
  }),

  http.post("/api/instruments/:id/stock-out", async ({ request, params }) => {
    const { id } = params;
    const { quantity, reason } = (await request.json()) as any;
    try {
      const transaction = adjustStock(
        id as string,
        quantity,
        "out",
        reason || "Stock out"
      );
      return HttpResponse.json(transaction, { status: 201 });
    } catch (error: any) {
      return HttpResponse.json({ error: error.message }, { status: 400 });
    }
  }),

  // Stock Transactions endpoints
  http.get("/api/stock-transactions", () => {
    return HttpResponse.json(stockTransactions);
  }),

  // Orders endpoints
  http.get("/api/orders", () => {
    return HttpResponse.json(orders);
  }),

  http.post("/api/orders", async ({ request }) => {
    const newOrder = (await request.json()) as any;

    // Validate and adjust stock for each item
    try {
      if (newOrder.items && newOrder.items.length > 0) {
        for (const item of newOrder.items) {
          adjustStock(
            item.instrumentId,
            item.quantity,
            "out",
            `Order ${newOrder.id}`,
            newOrder.id
          );
        }
      }
      orders.push(newOrder);
      return HttpResponse.json(newOrder, { status: 201 });
    } catch (error: any) {
      return HttpResponse.json({ error: error.message }, { status: 400 });
    }
  }),

  http.put("/api/orders/:id", async ({ request, params }) => {
    const { id } = params;
    const updates = (await request.json()) as any;
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldOrder = orders[index];

    // Handle status change to cancelled - restore stock
    if (updates.status === "cancelled" && oldOrder.status !== "cancelled") {
      try {
        if (oldOrder.items && oldOrder.items.length > 0) {
          for (const item of oldOrder.items) {
            adjustStock(
              item.instrumentId,
              item.quantity,
              "in",
              `Order ${id} cancelled`,
              id as string
            );
          }
        }
      } catch (error: any) {
        return HttpResponse.json({ error: error.message }, { status: 400 });
      }
    }

    orders[index] = { ...oldOrder, ...updates };
    return HttpResponse.json(orders[index]);
  }),

  http.delete("/api/orders/:id", ({ params }) => {
    const { id } = params;
    const order = orders.find((o) => o.id === id);

    // If order is not fulfilled/shipped, restore stock
    if (order && order.status !== "fulfilled" && order.status !== "shipped") {
      try {
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            adjustStock(
              item.instrumentId,
              item.quantity,
              "in",
              `Order ${id} deleted`,
              id as string
            );
          }
        }
      } catch (error: any) {
        // Continue with deletion even if stock adjustment fails
        console.error("Stock adjustment failed:", error.message);
      }
    }

    orders = orders.filter((o) => o.id !== id);
    return HttpResponse.json({ success: true });
  }),

  // Dashboard metrics - dynamically calculated
  http.get("/api/dashboard", () => {
    const dashboardData = calculateDashboard();
    return HttpResponse.json(dashboardData);
  }),
];
