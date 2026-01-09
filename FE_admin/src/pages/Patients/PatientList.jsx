import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  CircularProgress,
  Alert,
  useTheme,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { getAllPatients } from "../../api/patientApi";

export default function PatientList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getAllPatients({ limit: 100 });
      setPatients(data.items || data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      patient.fullName?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    return status === "active" ? "success" : "default";
  };

  const getRoleColor = (role) => {
    return role === "donor" ? "primary" : "secondary";
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Patients
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 2, borderRadius: 0, boxShadow: 0, backgroundColor: theme.palette.background.default }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 0 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                No patients found
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>DOB</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow
                      key={patient.id || patient.userId}
                      hover
                      sx={{
                        opacity: patient.status === "inactive" ? 0.6 : 1,
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{patient.fullName || "N/A"}</TableCell>
                      <TableCell>{patient.email || "N/A"}</TableCell>
                      <TableCell>
                        {patient.dob ? format(new Date(patient.dob), "MMM dd, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.role?.charAt(0).toUpperCase() + patient.role?.slice(1)}
                          color={getRoleColor(patient.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.status?.charAt(0).toUpperCase() + patient.status?.slice(1)}
                          color={getStatusColor(patient.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/patients/${patient.id || patient.userId}`)}
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
    </Container>
  );
}
