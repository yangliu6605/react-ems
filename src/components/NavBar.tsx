import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

type NavBarProps = {
  // 点击左上角菜单按钮时触发（由父组件控制侧边栏开/关）
  onMenuClick: () => void;
};

const NavBar = ({ onMenuClick }: NavBarProps) => {
  const navigator = useNavigate();
  const theme = useTheme();
  // md 以上认为是桌面端；桌面端侧边栏常驻，不显示菜单按钮
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // 点击标题：回到首页
  function backToList() {
    navigator("/");
  }

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {!isDesktop && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        {/* 占位用容器：保持标题在左侧，并把可点击区域限制在“文字本身” */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer", display: "inline-block" }}
            onClick={backToList}
          >
            ERP System
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
