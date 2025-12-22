import { http, HttpResponse } from "msw";
import employees from "../data/employees.json";
import instruments from "../data/instruments.json";
import orders from "../data/orders.json";
import dashboard from "../data/dashboard.json";

export const handlers = [
  // Employees endpoints
  http.get("/api/employees", () => {
    return HttpResponse.json(employees);
  }),

  // Instruments endpoints
  http.get("/api/instruments", () => {
    return HttpResponse.json(instruments);
  }),

  // Orders endpoints
  http.get("/api/orders", () => {
    return HttpResponse.json(orders);
  }),

  // Dashboard metrics
  http.get("/api/dashboard", () => {
    return HttpResponse.json(dashboard);
  }),
];
