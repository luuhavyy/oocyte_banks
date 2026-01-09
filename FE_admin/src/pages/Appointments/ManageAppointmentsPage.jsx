import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { getAllAppointments, updateAppointment } from "../../api/appointmentApi";
import { getAllPatients } from "../../api/patientApi";

export default function ManageAppointmentsPage() {
  const theme = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: "",
    appointmentDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData] = await Promise.all([
        getAllAppointments({ limit: 100 }),
        getAllPatients({ limit: 100 }),
      ]);
      setAppointments(appointmentsData.items || appointmentsData || []);
      setPatients(patientsData.items || patientsData || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => (p.id || p.userId) === patientId);
    return patient?.fullName || patientId || "Unknown";
  };

  const handleMenuOpen = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleEdit = () => {
    if (selectedAppointment) {
      setEditFormData({
        status: selectedAppointment.status || "",
        appointmentDate: selectedAppointment.appointmentDate
          ? format(new Date(selectedAppointment.appointmentDate), "yyyy-MM-dd'T'HH:mm")
          : "",
        notes: selectedAppointment.notes || "",
      });
      setOpenEditDialog(true);
    }
    handleMenuClose();
  };

  const handleUpdate = async () => {
    if (!selectedAppointment) return;
    try {
      const updateData = {};
      if (editFormData.status) updateData.status = editFormData.status;
      if (editFormData.appointmentDate) updateData.appointmentDate = editFormData.appointmentDate;
      if (editFormData.notes !== undefined) updateData.notes = editFormData.notes;

      await updateAppointment(selectedAppointment.id, updateData);
      setOpenEditDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update appointment");
    }
  };

  const handleQuickAction = async (action) => {
    if (!selectedAppointment) return;
    try {
      await updateAppointment(selectedAppointment.id, { status: action });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update appointment");
    }
    handleMenuClose();
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (search) {
      const patientName = getPatientName(appt.patientId).toLowerCase();
      if (!patientName.includes(search.toLowerCase())) return false;
    }
    if (statusFilter && appt.status !== statusFilter) return false;
    if (typeFilter && appt.type !== typeFilter) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", backgroundColor: theme.palette.background.default }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pt: 4, pb: 2, backgroundColor: theme.palette.background.default }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Manage Appointments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card sx={{ mb: 2, borderRadius: 0, boxShadow: 0, backgroundColor: theme.palette.background.default }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
            <TextField
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            Filter by Status
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setStatusFilter("");
            setFilterAnchor(null);
          }}
          selected={statusFilter === ""}
        >
          All Status
        </MenuItem>
        <MenuItem
          onClick={() => {
            setStatusFilter("pending");
            setFilterAnchor(null);
          }}
          selected={statusFilter === "pending"}
        >
          Pending
        </MenuItem>
        <MenuItem
          onClick={() => {
            setStatusFilter("confirmed");
            setFilterAnchor(null);
          }}
          selected={statusFilter === "confirmed"}
        >
          Confirmed
        </MenuItem>
        <MenuItem
          onClick={() => {
            setStatusFilter("completed");
            setFilterAnchor(null);
          }}
          selected={statusFilter === "completed"}
        >
          Completed
        </MenuItem>
        <MenuItem
          onClick={() => {
            setStatusFilter("cancelled");
            setFilterAnchor(null);
          }}
          selected={statusFilter === "cancelled"}
        >
          Cancelled
        </MenuItem>
        <MenuItem disabled sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
            Filter by Type
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTypeFilter("");
            setFilterAnchor(null);
          }}
          selected={typeFilter === ""}
        >
          All Types
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTypeFilter("checkup");
            setFilterAnchor(null);
          }}
          selected={typeFilter === "checkup"}
        >
          Check-up
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTypeFilter("retrieval");
            setFilterAnchor(null);
          }}
          selected={typeFilter === "retrieval"}
        >
          Retrieval
        </MenuItem>
      </Menu>

      {/* Appointments Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <TableContainer>
          {filteredAppointments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                No appointments found
              </Typography>
            </Box>
          ) : (
            <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {getPatientName(appointment.patientId)}
                      </TableCell>
                      <TableCell>
                        {appointment.appointmentDate
                          ? format(new Date(appointment.appointmentDate), "MMM dd, yyyy 'at' HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{appointment.type || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{appointment.notes || "-"}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, appointment)}
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
        <MenuItem onClick={() => handleQuickAction("confirmed")}>
          <CheckCircleIcon sx={{ mr: 1, fontSize: 20, color: theme.palette.primary.main }} />
          Confirm
        </MenuItem>
        <MenuItem onClick={() => handleQuickAction("cancelled")}>
          <CancelIcon sx={{ mr: 1, fontSize: 20, color: theme.palette.error.main }} />
          Cancel
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        disableScrollLock={true}
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(194, 24, 91, 0.15)",
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Edit Appointment
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFormData.status}
                  label="Status"
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date & Time"
                type="datetime-local"
                value={editFormData.appointmentDate}
                onChange={(e) => setEditFormData({ ...editFormData, appointmentDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ color: theme.palette.text.secondary }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            sx={{
              backgroundColor: theme.palette.primary.main,
              "&:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

