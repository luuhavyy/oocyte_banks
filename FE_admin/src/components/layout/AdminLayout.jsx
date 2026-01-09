import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarAdmin from "./SidebarAdmin";
import TopBarAdmin from "./TopBarAdmin";
import AdminFooter from "./AdminFooter";

const pageTitles = {
  "/admin": "Dashboard Overview",
  "/admin/patients": "Patients",
  "/admin/appointments": "Appointments",
  "/admin/staffs": "Staff Management",
  "/admin/change-password": "Change Password",
};

export default function AdminLayout({ children }) {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get page title from route
  const pageTitle = pageTitles[location.pathname] || "Dashboard Overview";

  const handleToggleSidebar = () => {
    if (sidebarCollapsed) {
      // If collapsed, expand it
      setSidebarCollapsed(false);
    } else {
      // If expanded, collapse it
      setSidebarCollapsed(true);
    }
  };

  const sidebarWidth = sidebarCollapsed ? 64 : 220;

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      <TopBarAdmin pageTitle={pageTitle} sidebarOpen={sidebarOpen} sidebarWidth={sidebarWidth} />
      <SidebarAdmin 
        open={sidebarOpen} 
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggle={handleToggleSidebar}
      />
      <Box
        component="main"
        sx={{
          width: { 
            xs: "100%", 
            md: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : "100%" 
          },
          mt: "32px",
          mb: "0px",
          maxWidth: "100%",
          ml: { xs: 0, md: sidebarOpen ? `${sidebarWidth}px` : 0 },
          pt: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          pb: "0px",
          transition: "width 0.3s ease, margin-left 0.3s ease",
          backgroundColor: theme.palette.background.default,
          minHeight: "calc(100vh - 64px - 64px)", // Subtract top bar (64px) and footer height
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {children}
      </Box>
      <Box
        sx={{
          width: { 
            xs: "100%", 
            md: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : "100%" 
          },
          backgroundColor: theme.palette.background.default,
          ml: { xs: 0, md: sidebarOpen ? `${sidebarWidth}px` : 0 },
          transition: "width 0.3s ease, margin-left 0.3s ease",
        }}
      >
        <AdminFooter />
      </Box>
    </Box>
  );
}
