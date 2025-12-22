import { http, HttpResponse } from "msw";
import employeesData from "../data/employees.json";
import instrumentsData from "../data/instruments.json";
import ordersData from "../data/orders.json";

// Mutable in-memory data stores
let employees = [...employeesData];
let instruments = [...instrumentsData];
let orders = [...ordersData];

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

  // Generate 12-month sales trend (simplified: distribute total across months)
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
  const baseMonthly = Math.round(totalSales / 12);
  const salesTrend = monthNames.map((month) => ({
    month,
    sales: baseMonthly + Math.floor(Math.random() * 20000) - 10000,
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

  // Instruments endpoints
  http.get("/api/instruments", () => {
    return HttpResponse.json(instruments);
  }),

  // Orders endpoints
  http.get("/api/orders", () => {
    return HttpResponse.json(orders);
  }),

  http.post("/api/orders", async ({ request }) => {
    const newOrder = (await request.json()) as any;
    orders.push(newOrder);
    return HttpResponse.json(newOrder, { status: 201 });
  }),

  http.delete("/api/orders/:id", ({ params }) => {
    const { id } = params;
    orders = orders.filter((o) => o.id !== id);
    return HttpResponse.json({ success: true });
  }),

  // Dashboard metrics - dynamically calculated
  http.get("/api/dashboard", () => {
    const dashboardData = calculateDashboard();
    return HttpResponse.json(dashboardData);
  }),
];
