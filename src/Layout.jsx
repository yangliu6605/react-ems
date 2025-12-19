import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
// import AppBreadcrumbs from "./components/Breadcrumbs";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export default function Layout() {
  return (
    <>
      <NavBar />
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Typography sx={{ color: "text.primary" }}>Employees</Typography>
      </Breadcrumbs>
      <Outlet />
      <Footer />
    </>
  );
}
