import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
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
  Select,
  FormControl,
  InputLabel,
  useTheme,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { createAppointment, getMyAppointments, updateAppointment } from "../../api/appointmentApi";
import { useSelector } from "react-redux";

export default function AppointmentsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const { me } = useSelector((s) => s.patient);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [formData, setFormData] = useState({
    appointmentDate: "",
    type: "checkup",
    notes: "",
  });

  useEffect(() => {
    checkMedicalHistory();
    fetchAppointments();
  }, []);

  const checkMedicalHistory = () => {
    if (!me?.medicalHistory || Object.keys(me.medicalHistory).length === 0) {
      // Medical history not completed - will show alert
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getMyAppointments();
      setAppointments(data.items || data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    const hasMedicalHistory = me?.medicalHistory && Object.keys(me.medicalHistory).length > 0;
    if (!hasMedicalHistory) {
      setError("Please complete your medical history first");
      setTimeout(() => {
        navigate("/medical-history");
      }, 2000);
      return;
    }
    setEditingAppointment(null);
    setFormData({ appointmentDate: "", type: "checkup", notes: "" });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAppointment(null);
    setFormData({ appointmentDate: "", type: "checkup", notes: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData);
      } else {
        await createAppointment(formData);
      }
      handleCloseDialog();
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save appointment");
    }
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
      setEditingAppointment(selectedAppointment);
      setFormData({
        appointmentDate: selectedAppointment.appointmentDate
          ? format(new Date(selectedAppointment.appointmentDate), "yyyy-MM-dd'T'HH:mm")
          : "",
        type: selectedAppointment.type || "check-up",
        notes: selectedAppointment.notes || "",
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleCancel = async () => {
    if (selectedAppointment) {
      try {
        await updateAppointment(selectedAppointment.id, { status: "cancelled" });
        fetchAppointments();
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to cancel appointment");
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "tertiary";
      case "completed":
        return "success";
      case "cancelled":
        return "primary";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "retrieval":
        return "Retrieval";
      case "checkup":
        return "Check-up";
      default:
        return type;
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ backgroundColor: theme.palette.primary.main }}
        >
          Book Appointment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!me?.medicalHistory || Object.keys(me.medicalHistory).length === 0 ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your medical history before booking an appointment.
          <Button
            variant="text"
            size="small"
            onClick={() => navigate("/medical-history")}
            sx={{ ml: 2 }}
          >
            Go to Medical History
          </Button>
        </Alert>
      ) : null}

      <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
        <CardContent>
          {appointments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                No appointments yet
              </Typography>
              <Button variant="contained" onClick={handleOpenDialog}>
                Book Your First Appointment
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        {appointment.appointmentDate
                          ? format(new Date(appointment.appointmentDate), "MMM dd, yyyy 'at' HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getTypeLabel(appointment.type)}</TableCell>
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
                          disabled={appointment.status === "cancelled" || appointment.status === "completed"}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog disableScrollLock={true} open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          {editingAppointment ? "Edit Appointment" : "Book New Appointment"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date & Time"
                  type="datetime-local"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="checkup">Check-up</MenuItem>
                    <MenuItem value="retrieval">Retrieval</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: theme.palette.text.secondary }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: theme.palette.primary.main }}>
              {editingAppointment ? "Update" : "Book"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Actions Menu */}
      <Menu disableScrollLock={true} anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Reschedule
        </MenuItem>
        <MenuItem onClick={handleCancel}>
          <CancelIcon sx={{ mr: 1, fontSize: 20 }} />
          Cancel
        </MenuItem>
      </Menu>
    </Container>
  );
}

