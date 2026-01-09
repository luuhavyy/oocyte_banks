import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, useMediaQuery, useTheme, Typography, Tooltip, IconButton } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LogoutIcon from "@mui/icons-material/Logout";
import EggAltIcon from "@mui/icons-material/EggAlt";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/adminAuthSlice";
import { getRoleFromToken } from "../../utils/jwtUtils";

const menuItems = [
  { label: "Dashboard", link: "/admin", icon: DashboardIcon },
  { label: "Patients", link: "/admin/patients", icon: PeopleIcon },
  { label: "Appointments", link: "/admin/appointments", icon: EventIcon },
];

export default function SidebarAdmin({ open, collapsed, onClose, onToggle }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token } = useSelector(s => s.adminAuth);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const variant = isMobile ? "temporary" : "persistent";

  const handleNavigate = (link) => {
    navigate(link);
    if (isMobile) onClose();
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      onClose();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  // Determine role from user object or decode from token
  const userRole = user?.role || getRoleFromToken(token);

  // Admin-only menu item
  const adminMenuItems = userRole === "admin"
    ? [{ label: "Staff Management", link: "/admin/staffs", icon: ManageAccountsIcon }]
    : [];

  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: sidebarWidth,
          boxSizing: "border-box",
          position: "fixed",
          top: 0,
          height: "100vh",
          backgroundColor: "#FFFFFF",
          borderRight: '1px solid #F0F0F0',
          zIndex: 1000,
          borderRadius: 0,
          transition: "width 0.3s ease",
          overflowX: "hidden",
        }
      }}
    >
      {/* Logo/Branding Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 1 : 2,
          py: 2,
          minHeight: "64px", // Match top bar height
          boxSizing: "border-box",
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                backgroundColor: '#FFE5F0',
                borderRadius: 2,
                padding: 1,
              }}
            >
              <EggAltIcon sx={{ color: '#C2185B', fontSize: 30 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#212121',
                  fontSize: '14px',
                  lineHeight: 1.2,
                  letterSpacing: '0.5px',
                }}
              >
                CRADLE
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 400,
                  color: '#757575',
                  fontSize: '11px',
                  lineHeight: 1.2,
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}
              >
                EGG BANK
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Tooltip title="Click to expand" placement="right">
            <IconButton
              onClick={handleToggle}
              sx={{
                p: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  backgroundColor: '#FFE5F0',
                  borderRadius: 2,
                  padding: 1,
                  cursor: 'pointer',
                }}
              >
                <EggAltIcon sx={{ color: '#C2185B', fontSize: 30 }} />
              </Box>
            </IconButton>
          </Tooltip>
        )}
        {!collapsed && (
          <IconButton
            onClick={handleToggle}
            sx={{ color: '#757575', ml: 1, p: 0.5 }}
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 0 }}>
        <List sx={{ py: 0 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = location.pathname === item.link || 
              (item.link === "/admin" && location.pathname === "/admin");
            return (
              <Tooltip key={item.label} title={collapsed ? item.label : ""} placement="right">
                <ListItem
                  button
                  selected={isSelected}
                  onClick={() => handleNavigate(item.link)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.25,
                    marginLeft: '0px',
                    justifyContent: collapsed ? "center" : "flex-start",
                    '&.Mui-selected': {
                      backgroundColor: '#FFE5F0',
                      color: '#C2185B',
                      '&:hover': {
                        backgroundColor: '#FFE5F0',
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#FFF5F8',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isSelected ? '#C2185B' : '#757575', 
                    minWidth: collapsed ? 0 : 40,
                    justifyContent: "center",
                    '& .MuiSvgIcon-root': {
                      fontSize: 22
                    }
                  }}>
                    <Icon />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: '14px',
                        color: isSelected ? '#C2185B' : '#212121',
                      }}
                    />
                  )}
                </ListItem>
              </Tooltip>
            );
          })}
          
          {adminMenuItems.length > 0 && (
            <>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = location.pathname === item.link;
                return (
                  <Tooltip key={item.label} title={collapsed ? item.label : ""} placement="right">
                    <ListItem
                      button
                      selected={isSelected}
                      onClick={() => handleNavigate(item.link)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        py: 1.25,
                        marginLeft: '0px',
                        justifyContent: collapsed ? "center" : "flex-start",
                        '&.Mui-selected': {
                          backgroundColor: '#FFE5F0',
                          color: '#C2185B',
                          '&:hover': {
                            backgroundColor: '#FFE5F0',
                          },
                        },
                        '&:hover': {
                          backgroundColor: '#FFF5F8',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: isSelected ? '#C2185B' : '#757575', 
                        minWidth: collapsed ? 0 : 40,
                        justifyContent: "center",
                        '& .MuiSvgIcon-root': {
                          fontSize: 22
                        }
                      }}>
                        <Icon />
                      </ListItemIcon>
                      {!collapsed && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '14px',
                            color: isSelected ? '#C2185B' : '#212121',
                          }}
                        />
                      )}
                    </ListItem>
                  </Tooltip>
                );
              })}
            </>
          )}
        </List>
      </Box>

      {/* Logout Footer */}
      <Box sx={{ p: collapsed ? 1 : 1.5 }}>
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1,
              px: collapsed ? 0.5 : 0.5,
              marginLeft: '0px',
              justifyContent: collapsed ? "center" : "flex-start",
              '&:hover': {
                backgroundColor: '#FFF5F8',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: '#757575', 
              minWidth: collapsed ? 0 : 40,
              justifyContent: "center",
              '& .MuiSvgIcon-root': {
                fontSize: 22
              }
            }}>
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#757575',
                }}
              />
            )}
          </ListItem>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
