import { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, Paper } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import axios from "axios";
import Footer from "../components/Footer";

type DashboardData = {
  period: string;
  totalSales: number;
  orders: number;
  avgOrderValue: number;
  topCategories: Array<{ category: string; value: number }>;
  lowStock: string[];
  salesTrend: Array<{ month: string; sales: number }>;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/dashboard")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch dashboard data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Failed to load dashboard data</Typography>
      </Box>
    );
  }

  const months = data.salesTrend.map((item) => item.month);
  const sales = data.salesTrend.map((item) => item.sales);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* KPI Cards */}
      {/* @ts-ignore */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h4">
                ${data.totalSales.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Orders
              </Typography>
              <Typography variant="h4">{data.orders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg Order Value
              </Typography>
              <Typography variant="h4">
                ${data.avgOrderValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4">{data.lowStock.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Trend Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          12-Month Sales Trend
        </Typography>
        <LineChart
          xAxis={[{ scaleType: "point", data: months }]}
          series={[
            {
              data: sales,
              label: "Sales ($)",
              color: "#1976d2",
            },
          ]}
          height={400}
        />
      </Paper>

      {/* Top Categories */}
      {/* @ts-ignore */}
      <Grid container spacing={3}>
        {/* @ts-ignore */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Categories
            </Typography>
            {data.topCategories.map((cat) => (
              <Box
                key={cat.category}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>{cat.category}</Typography>
                <Typography fontWeight="bold">
                  ${cat.value.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Low Stock Alert */}
        {/* @ts-ignore */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alert
            </Typography>
            {data.lowStock.length > 0 ? (
              data.lowStock.map((sku) => (
                <Typography key={sku} color="error" sx={{ mb: 1 }}>
                  • {sku}
                </Typography>
              ))
            ) : (
              <Typography color="text.secondary">All items in stock</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Footer />
    </Box>
  );
}
