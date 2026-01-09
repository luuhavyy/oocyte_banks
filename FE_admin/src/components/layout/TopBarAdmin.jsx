import { AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/adminAuthSlice";
import { getRoleFromToken } from "../../utils/jwtUtils";

export default function TopBarAdmin({ pageTitle = "", sidebarOpen = true, sidebarWidth = 220 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(s => s.adminAuth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
    handleClose();
  };

  const userRole = user?.role || getRoleFromToken(token);
  const roleDisplay = userRole === "admin" ? "SUPER ADMIN" : "STAFF";
  const userInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: 1100,
          width: { xs: "100%", md: sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : "100%" },
          left: { xs: 0, md: sidebarOpen ? `${sidebarWidth}px` : 0 },
          backgroundColor: "#FFFFFF",
          borderBottom: '1px solid #F0F0F0',
          transition: "width 0.3s ease, left 0.3s ease",
        }}
      >
        <Toolbar 
          sx={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            px: { xs: 2, sm: 3 },
            minHeight: "64px !important",
          }}
        >
          {/* User Info - Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ textAlign: "right", display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: '#212121',
                  fontSize: '14px',
                  lineHeight: 1.2,
                }}
              >
                {user?.fullName || "Admin User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 400,
                  color: '#757575',
                  fontSize: '12px',
                  lineHeight: 1.2,
                }}
              >
                {roleDisplay}
              </Typography>
            </Box>

            <IconButton 
              onClick={handleAvatarClick} 
              sx={{ p: 0 }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#C2185B',
                  width: 40,
                  height: 40,
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {userInitials}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Avatar Menu */}
      <Menu
        disableScrollLock={true}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: '0px 4px 12px rgba(194, 24, 91, 0.15)',
            border: '1px solid #F0F0F0',
            minWidth: 180,
          }
        }}
      >
        <MenuItem onClick={() => { navigate("/admin/change-password"); handleClose(); }}>
          Change Password
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}

