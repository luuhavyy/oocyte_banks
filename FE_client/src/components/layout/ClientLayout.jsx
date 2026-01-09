import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import DrawerClient from "./DrawerClient";
import ClientFooter from "./ClientFooter";
import PublicHeader from "./PublicHeader";
import TopBarClient from "./TopBarClient";

const pageTitles = {
  "/home": "Journey",
  "/medical-history": "Medical History",
  "/appointments": "Appointments",
  "/history": "Evaluation History",
  "/help": "Help",
  "/profile": "Profile",
};

export default function ClientLayout({ children }) {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useSelector(s => s.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);

  const isLoggedIn = !!user;
  const pageTitle = pageTitles[location.pathname] || "Home";

  const handleToggleDrawer = () => {
    if (drawerCollapsed) {
      // If collapsed, expand it
      setDrawerCollapsed(false);
    } else {
      // If expanded, collapse it
      setDrawerCollapsed(true);
    }
  };

  const drawerWidth = drawerCollapsed ? 64 : 220;

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100%",
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      {!isLoggedIn && <PublicHeader />}
      {isLoggedIn && (
        <>
          <TopBarClient pageTitle={pageTitle} sidebarOpen={drawerOpen} sidebarWidth={drawerWidth} />
          <DrawerClient 
            open={drawerOpen} 
            collapsed={drawerCollapsed}
            onClose={() => setDrawerOpen(false)}
            onToggle={handleToggleDrawer}
          />
        </>
      )}
      <Box
        component="main"
        sx={{
          width: { 
            xs: "100%", 
            md: isLoggedIn && drawerOpen ? `calc(100% - ${drawerWidth}px)` : "100%" 
          },
          maxWidth: "100%",
          minHeight: isLoggedIn ? "calc(100vh - 64px - 64px)" : "calc(100vh - 70px - 64px)",
          mt: isLoggedIn ? "64px" : "70px",
          mb: "0px",
          ml: { xs: 0, md: isLoggedIn && drawerOpen ? `${drawerWidth}px` : 0 },
          px: isLoggedIn ? { xs: 2, sm: 3, md: 4 } : 0,
          pb: "0px",
          transition: "width 0.3s ease, margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch", 
          backgroundColor: theme.palette.background.default,
          flex: 1,
        }}
      >
        {children}
      </Box>
      <Box
        sx={{
          width: { 
            xs: "100%", 
            md: isLoggedIn && drawerOpen ? `calc(100% - ${drawerWidth}px)` : "100%" 
          },
          ml: { xs: 0, md: isLoggedIn && drawerOpen ? `${drawerWidth}px` : 0 },
          backgroundColor: theme.palette.background.default,
          transition: "width 0.3s ease, margin-left 0.3s ease",
        }}
      >
        <ClientFooter />
      </Box>    
    </Box>
  );
}
