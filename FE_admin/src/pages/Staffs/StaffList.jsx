import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import {
  fetchStaffs,
  deleteStaffAsync,
} from "../../features/staffs/staffSlice";
import StaffCreateDialog from "../../components/staff/StaffCreateDialog";
import StaffEditDialog from "../../components/staff/StaffEditDialog";

export default function StaffList() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.staff);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, staff: null });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);

  useEffect(() => {
    dispatch(fetchStaffs());
  }, [dispatch]);

  const handleMenuOpen = (event, staff) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaff(staff);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStaff(null);
  };

  const handleEdit = () => {
    if (selectedStaff) {
      setEditStaffId(selectedStaff.id || selectedStaff.staffId);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedStaff) {
      setDeleteDialog({ open: true, staff: selectedStaff });
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (deleteDialog.staff) {
      await dispatch(deleteStaffAsync(deleteDialog.staff.staffId));
      setDeleteDialog({ open: false, staff: null });
      dispatch(fetchStaffs());
    }
  };

  const filteredStaffs = list.filter((staff) => {
    const matchesSearch =
      staff.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || staff.role === filterRole;
    const matchesStatus = filterStatus === "all" || staff.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 4, pb: 2, backgroundColor: theme.palette.background.default }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: theme.palette.primary.main }}
        >
          Staff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            backgroundColor: theme.palette.primary.main,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          }}
        >
          Add New Staff
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card sx={{ mb: 2, borderRadius: 0, boxShadow: 0, backgroundColor: theme.palette.background.default }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
            <TextField
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 250 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={(e) => setFilterAnchor(e.currentTarget)}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                "&:hover": { borderColor: theme.palette.primary.dark, backgroundColor: theme.palette.action.hover },
              }}
            >
              Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Filter Menu */}
      <Menu
        disableScrollLock={true}
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0px 4px 12px rgba(194, 24, 91, 0.15)",
            border: `1px solid ${theme.palette.divider}`,
            minWidth: 180,
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Filter by Role
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterRole("all");
            setFilterAnchor(null);
          }}
          selected={filterRole === "all"}
        >
          All Roles
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterRole("admin");
            setFilterAnchor(null);
          }}
          selected={filterRole === "admin"}
        >
          Admin
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterRole("staff");
            setFilterAnchor(null);
          }}
          selected={filterRole === "staff"}
        >
          Staff
        </MenuItem>
        <MenuItem disabled sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Filter by Status
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterStatus("all");
            setFilterAnchor(null);
          }}
          selected={filterStatus === "all"}
        >
          All Status
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterStatus("active");
            setFilterAnchor(null);
          }}
          selected={filterStatus === "active"}
        >
          Active
        </MenuItem>
        <MenuItem
          onClick={() => {
            setFilterStatus("inactive");
            setFilterAnchor(null);
          }}
          selected={filterStatus === "inactive"}
        >
          Inactive
        </MenuItem>
      </Menu>

      {/* Staff Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
          ) : filteredStaffs.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                No staff members found
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Full Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Created At
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaffs.map((staff) => (
                  <TableRow key={staff.staffId} hover>
                    <TableCell>{staff.fullName || "N/A"}</TableCell>
                    <TableCell>{staff.email || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={staff.role || "N/A"}
                        size="small"
                        sx={{
                          backgroundColor:
                            staff.role === "admin"
                              ? theme.palette.primary.main
                              : theme.palette.secondary.main,
                          color:
                            staff.role === "admin"
                              ? theme.palette.primary.contrastText
                              : theme.palette.secondary.contrastText,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={staff.status || "N/A"}
                        size="small"
                        sx={{
                          backgroundColor:
                            staff.status === "active"
                              ? theme.palette.success.light
                              : theme.palette.error.light,
                          color:
                            staff.status === "active"
                              ? theme.palette.success.contrastText
                              : theme.palette.error.contrastText,
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(staff.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, staff)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>

      {/* Actions Menu */}
      <Menu disableScrollLock={true} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20, color: theme.palette.error.main }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        disableScrollLock={true}
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, staff: null })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(194, 24, 91, 0.15)",
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Confirm Deactivation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate{" "}
            <strong>{deleteDialog.staff?.fullName}</strong>? This action will
            set their status to inactive.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, staff: null })}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              backgroundColor: theme.palette.error.main,
              "&:hover": { backgroundColor: theme.palette.error.dark },
            }}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Staff Dialog */}
      <StaffCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {/* Edit Staff Dialog */}
      <StaffEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditStaffId(null);
        }}
        staffId={editStaffId}
      />
    </Container>
  );
}
