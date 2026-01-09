import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import {
  People,
  Folder,
  CalendarMonth,
  EggAlt,
  TrendingUp,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getDashboardOverview } from "../../api/dashboardApi";
import { formatDistanceToNow, format } from "date-fns";

// Helper function to format time ago
const formatTimeAgo = (date) => {
  try {
    const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true });
    return `Updated ${timeAgo}`;
  } catch (error) {
    return "Updated recently";
  }
};

// Helper function to format time (HH:mm format)
const formatTime = (date) => {
  try {
    return format(new Date(date), "h:mm a");
  } catch (error) {
    return "";
  }
};

/* ---------------- Metric Card ---------------- */
const MetricCard = ({ title, value, icon, extra, sx }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        px: 2.5,
        py: 2.5,
        height: "100%",
        width: "100%",
        boxShadow: theme.shadows[2],
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        mb={1.5}
      >
        <Typography variant="caption">{title}</Typography>
        <Avatar
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.primary.main,
            width: 40,
            height: 40,
            flexShrink: 0,
          }}
        >
          {icon}
        </Avatar>
      </Box>

      <Typography sx={{ fontSize: 28, fontWeight: 700 }}>
        {value}
      </Typography>

      {extra}
    </Paper>
  );
};

/* ================= DASHBOARD ================= */
export default function AdminDashboard() {
  const theme = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDashboardOverview();
      setData(res);
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  /* -------- Data mapping -------- */
  const monthlyTrend =
    data?.monthlyTrend?.map((i) => ({
      month: new Date(i.month + "-01").toLocaleDateString("en-US", {
        month: "short",
      }),
      Likely: i.likelyReproducible || 0,
      Unlikely: i.unlikelyReproducible || 0,
    })) || [];

  const journeyStages =
    data?.journeyStages?.map((i) => ({
      stage:
        {
          registration: "Registration",
          medicalHistory: "Medical History",
          appointment: "Appointment",
          retrieval: "Retrieval",
          eligibility: "Eligibility",
        }[i.stage] || i.stage,
      Donor: i.donor || 0,
      Recipient: i.recipient || 0,
    })) || [];

  // Use totalEggs from API if available, otherwise calculate from monthlyTrend
  const totalEggs = data?.totalEggs || data?.monthlyTrend?.reduce(
    (s, i) =>
      s + (i.likelyReproducible || 0) + (i.unlikelyReproducible || 0),
    0
  ) || 0;

  /* ================= RETURN ================= */
  return (
    <Box
      width="100%"
      sx={{
        p: { xs: 2, md: 3 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          Overview Dashboard
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          {/* ===== Metrics ===== */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 3,
              width: "100%",
            }}
          >
            <MetricCard
              title="Total Patients"
              value={data.totalPatients}
              icon={<People />}
              extra={
                data.patientsGrowthPercent !== undefined && data.patientsGrowthPercent !== null && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    <TrendingUp sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                    <Typography variant="caption">
                      {data.patientsGrowthPercent > 0 ? "↑" : data.patientsGrowthPercent < 0 ? "↓" : ""}
                      {Math.abs(data.patientsGrowthPercent).toFixed(1)}% vs last month
                    </Typography>
                  </Box>
                )
              }
            />

            <MetricCard
              title="Total Batches"
              value={data.totalBatches}
              icon={<Folder />}
              extra={
                data.lastBatchesUpdateTime && (
                  <Typography variant="caption">
                    {formatTimeAgo(new Date(data.lastBatchesUpdateTime))}
                  </Typography>
                )
              }
            />

            <MetricCard
              title="Today's Appointments"
              value={data.todayAppointments}
              icon={<CalendarMonth />}
              extra={
                data.todayAppointments > 0 &&
                data.nextAppointmentTime && (
                  <Chip
                    size="small"
                    label={`NEXT: ${formatTime(new Date(data.nextAppointmentTime))}`}
                    sx={{
                      mt: 0.5,
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.primary.main,
                    }}
                  />
                )
              }
            />

            <MetricCard
              title="Total Eggs"
              value={totalEggs}
              icon={<EggAlt />}
              extra={<Typography variant="caption"> Both Likely + Unlikely</Typography>}
            />
          </Box>

          {/* ===== Charts ===== */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 3,
              width: "100%",
            }}
          >
            <Paper sx={{ p: 3, width: "100%" }}>
              <Typography fontWeight={600}>Monthly Reproducibility Trend</Typography>
              <Typography variant="caption" mb={2} display="block">
                Likely vs Unlikely 
              </Typography>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Unlikely" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Likely" 
                    stroke={theme.palette.text.secondary} 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 3, width: "100%" }}>
              <Typography fontWeight={600}>Journey Stages Distribution</Typography>
              <Typography variant="caption" mb={2} display="block">
                Donor vs Recipient
              </Typography>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={journeyStages}>
                  <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Donor" fill={theme.palette.primary.main} />
                  <Bar dataKey="Recipient" fill={theme.palette.primary.darkLight} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
}
