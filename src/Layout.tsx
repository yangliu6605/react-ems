import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import Sidebar from "./components/SideBar";
import { Box, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";

export default function Layout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [auth, setAuth] = useState(false);

  const handleDrawerOpen = () => setMobileOpen(true);
  const handleDrawerClose = () => setMobileOpen(false);
  const handleLogin = () => setAuth(true);
  const handleLogout = () => setAuth(false);

  return (
    <>
      <NavBar onMenuClick={handleDrawerOpen} />
      <Box sx={{ display: "flex" }}>
        <Sidebar
          variant={isDesktop ? "permanent" : "temporary"}
          open={isDesktop ? true : mobileOpen}
          onClose={handleDrawerClose}
          auth={auth}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
          }}
        >
          <Toolbar /> {/* 同步 AppBar 高度 */}
          <Outlet />
        </Box>
      </Box>
    </>
  );
}
