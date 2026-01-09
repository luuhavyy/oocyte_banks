import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { getPatientById } from "../../api/patientApi";
import { getBatchesByPatient } from "../../api/batchApi";
import { getAllAppointments } from "../../api/appointmentApi";
import { createBatch } from "../../api/batchApi";
import UploadBatchDialog from "../../components/batch/UploadBatchDialog";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PatientDetail() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [batches, setBatches] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openCreateBatch, setOpenCreateBatch] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [patientData, batchesData, appointmentsData] = await Promise.all([
        getPatientById(id),
        getBatchesByPatient(id),
        getAllAppointments({ patientId: id }),
      ]);
      setPatient(patientData);
      setBatches(Array.isArray(batchesData) ? batchesData : batchesData.items || []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : appointmentsData.items || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (batchData) => {
    try {
      const batch = await createBatch({ ...batchData, patientId: id });
      setOpenCreateBatch(false);
      fetchPatientData();
      return batch; // Return batch so dialog can upload frames
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create batch");
      throw err; // Re-throw so dialog can handle error
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate("/admin/patients")} sx={{ mr: 2, color: theme.palette.primary.main }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Patient Details
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {patient && (
        <>
          {/* Profile Tab Content */}
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1], mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} justifyContent="space-between" alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.fullName || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.email || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.dob ? format(new Date(patient.dob), "MMM dd, yyyy") : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Role
                  </Typography>
                  <Chip
                    label={patient.role?.charAt(0).toUpperCase() + patient.role?.slice(1)}
                    color={patient.role === "donor" ? "primary" : "secondary"}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Status
                  </Typography>
                  <Chip
                    label={patient.status?.charAt(0).toUpperCase() + patient.status?.slice(1)}
                    color={patient.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {patient.address || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Retrievals" />
                <Tab label="Appointments" />
              </Tabs>
            </Box>

            {/* Retrievals Tab */}
            <TabPanel value={tabValue} index={0}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Retrieval Batches
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateBatch(true)}
                    sx={{ backgroundColor: theme.palette.primary.main }}
                  >
                    Create Batch
                  </Button>
                </Box>

                {batches.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                      No retrieval batches yet
                    </Typography>
                    <Button variant="contained" onClick={() => setOpenCreateBatch(true)}>
                      Create First Batch
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Total Frames</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Likely Reproducible</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Unlikely Reproducible</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {batches.map((batch) => (
                          <TableRow 
                            key={batch.id} 
                            hover 
                            sx={{ cursor: "pointer" }}
                            onClick={() => navigate(`/admin/batches/${batch.id}`)}
                          >
                            <TableCell>
                              {batch.createdAt
                                ? format(new Date(batch.createdAt), "MMM dd, yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell>{batch.totalFrames || batch.resultSummary?.total || batch.resultSummary?.totalFrames || 0}</TableCell>
                            <TableCell>
                              <Chip
                                label={batch.resultSummary?.miiEggs || batch.resultSummary?.mii || 0}
                                color="tertiary"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={batch.resultSummary?.miEggs || batch.resultSummary?.mi || 0}
                                color="tertiary"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={batch.status || "pending"}
                                size="small"
                                color={batch.status === "completed" ? "success" : "default"}
                              />
                            </TableCell>
                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => navigate(`/admin/batches/${batch.id}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </TabPanel>

            {/* Appointments Tab */}
            <TabPanel value={tabValue} index={1}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Appointments
                </Typography>
                {appointments.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                      No appointments found
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.map((appt) => (
                          <TableRow key={appt.id} hover>
                            <TableCell>
                              {appt.appointmentDate
                                ? format(new Date(appt.appointmentDate), "MMM dd, yyyy 'at' HH:mm")
                                : "N/A"}
                            </TableCell>
                            <TableCell>{appt.type || "N/A"}</TableCell>
                            <TableCell>
                              <Chip
                                label={appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
                                size="small"
                                color={
                                  appt.status === "completed"
                                    ? "success"
                                    : appt.status === "cancelled"
                                    ? "error"
                                    : "default"
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </TabPanel>
          </Card>
        </>
      )}

      {/* Create Batch Dialog */}
      <UploadBatchDialog
        open={openCreateBatch}
        onClose={(success) => {
          setOpenCreateBatch(false);
          if (success) {
            fetchPatientData();
          }
        }}
        onSubmit={handleCreateBatch}
        patientId={id}
        patientName={patient?.fullName}
        onSuccess={(batchId) => {
          // Navigate to batch details page after successful upload
          navigate(`/admin/batches/${batchId}`);
        }}
      />
    </Container>
  );
}
