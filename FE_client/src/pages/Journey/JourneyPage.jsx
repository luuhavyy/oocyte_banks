import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Grid,
} from "@mui/material";
import {
  Check as CheckIcon,
  CalendarMonth as CalendarMonthIcon,
  Folder as FolderIcon,
  EggAlt as EggAltIcon,
  LocalHospital as HospitalIcon,
} from "@mui/icons-material";
import { getMyJourney } from "../../api/journeyApi";

const STAGES = [
  { key: "registration", label: "Registration", description: "Account created successfully" },
  { key: "medicalHistory", label: "Medical History", description: "Complete your medical information", link: "/medical-history" },
  { key: "appointment", label: "Appointment", description: "Book your first appointment", link: "/appointments" },
  { key: "retrieval", label: "Retrieval", description: "Egg retrieval process" },
  { key: "eligibility", label: "Eligibility Result", description: "View results", link: "/history" },
];

export default function JourneyPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJourney();
  }, []);

  const fetchJourney = async () => {
    try {
      setLoading(true);
      const data = await getMyJourney();
      setJourney(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load journey");
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = (stage) => {
    if (stage.link) {
      if (stage.key === "eligibility" && journey?.stage[stage.key] === "done") {
        navigate(stage.link);
      } else if (journey?.stage[stage.key] !== "done") {
        navigate(stage.link);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!journey) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">No journey data available</Alert>
      </Container>
    );
  }

  const getActiveStepIndex = () => {
    const activeIndex = STAGES.findIndex((s) => journey.stage?.[s.key] === "active");
    if (activeIndex >= 0) {
      return activeIndex;
    }
    
    let lastDoneIndex = -1;
    STAGES.forEach((stage, index) => {
      const status = journey.stage?.[stage.key] || "pending";
      if (status === "done") {
        lastDoneIndex = index;
      }
    });
    
    if (lastDoneIndex >= 0 && lastDoneIndex < STAGES.length - 1) {
      const nextStageStatus = journey.stage?.[STAGES[lastDoneIndex + 1].key] || "pending";
      if (nextStageStatus === "pending" || nextStageStatus === "failed") {
        return lastDoneIndex;
      }
    }
    
    return -1;
  };

  const activeStepIndex = getActiveStepIndex();
  
  const styles = {
    titleWrapper: {
      display: "flex",
      alignItems: "center",
      gap: 2,
      mb: 4,
    },
    titleBar: {
      width: "4px",
      height: "32px",
      backgroundColor: theme.palette.primary.main,
      borderRadius: "2px",
    },
    progressContainer: {
      position: "relative",
      width: "100%",
      padding: "40px 0 60px",
      [theme.breakpoints.down("md")]: {
        padding: "40px 0 80px",
      },
    },
    progressLine: {
      position: "absolute",
      top: "64px",
      left: 0,
      right: 0,
      height: "3px",
      backgroundColor: theme.palette.divider,
      zIndex: 0,
      [theme.breakpoints.down("md")]: {
        display: "none",
      },
    },
    progressLineCompleted: {
      position: "absolute",
      top: "64px",
      left: 0,
      height: "3px",
      backgroundColor: theme.palette.primary.main,
      zIndex: 1,
      transition: "width 0.3s ease",
      [theme.breakpoints.down("md")]: {
        display: "none",
      },
    },
    stagesWrapper: {
      position: "relative",
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      zIndex: 2,
      gap: 1,
      [theme.breakpoints.down("md")]: {
        flexWrap: "wrap",
        justifyContent: "flex-start",
      },
    },
    stageItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
      minWidth: "120px",
      maxWidth: "200px",
      [theme.breakpoints.down("md")]: {
        flex: "0 0 calc(50% - 8px)",
        maxWidth: "none",
      },
      [theme.breakpoints.down("sm")]: {
        flex: "0 0 100%",
      },
    },
    stageCircle: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "12px",
      transition: "all 0.3s ease",
    },
    stageCircleCompleted: {
      backgroundColor: theme.palette.primary.main,
      color: "#FFFFFF",
      boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
    },
    stageCircleActive: {
      backgroundColor: theme.palette.primary.main,
      color: "#FFFFFF",
      boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
    },
    stageCirclePending: {
      backgroundColor: "transparent",
      border: `2px solid ${theme.palette.text.disabled}`,
      color: theme.palette.text.disabled,
    },
    stageDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: theme.palette.text.disabled,
    },
    stageLabel: {
      fontSize: "16px",
      fontWeight: 600,
      textAlign: "center",
      marginBottom: "8px",
    },
    stageLabelCompleted: {
      color: theme.palette.text.primary,
    },
    stageLabelPending: {
      color: theme.palette.text.secondary,
    },
    stageStatus: {
      fontSize: "12px",
      fontWeight: 400,
      textAlign: "center",
      display: "inline-block",
    },
    stageStatusCompleted: {
      color: theme.palette.text.secondary,
    },
    stageStatusActive: {
      color: "#FFFFFF",
      backgroundColor: theme.palette.primary.main,
      padding: "4px 12px",
      borderRadius: 2,
      fontWeight: 500,
      fontSize: "12px",
      display: "inline-block",
    },
    stageStatusPending: {
      color: theme.palette.text.secondary,
    },
  };

  const getProgressPercentage = () => {
    if (activeStepIndex >= 0 && STAGES.length > 1) {
      return (activeStepIndex / (STAGES.length - 1)) * 100;
    }
    
    const lastDoneIndex = [...STAGES]
      .map((s, i) => ({ status: journey.stage?.[s.key] || "pending", i }))
      .filter((s) => s.status === "done")
      .pop()?.i ?? -1;
    
    if (lastDoneIndex >= 0 && STAGES.length > 1) {
      return (lastDoneIndex / (STAGES.length - 1)) * 100;
    }
    
    return 0;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={styles.titleWrapper}>
        <Box sx={styles.titleBar} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
            Your Journey Status
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Welcome, {journey.fullName || "Patient"}. Track your progress through the egg bank process.
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: theme.shadows[1], position: "relative", overflow: "hidden" }}>
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.palette.secondary.main}40 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.palette.tertiary.main}40 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <CardContent sx={{ p: { xs: 3, md: 5 }, position: "relative" }}>
          <Box sx={styles.progressContainer}>
            <Box sx={styles.progressLine} />
            <Box 
              sx={{
                ...styles.progressLineCompleted,
                width: `${progressPercentage}%`,
              }} 
            />
            <Box sx={styles.stagesWrapper}>
              {STAGES.map((stage, index) => {
                const status = journey.stage?.[stage.key] || "pending";
                const isCompleted = status === "done";
                const isActive = activeStepIndex === index;
                const isPending = !isCompleted && !isActive;

                return (
                  <Box key={stage.key} sx={styles.stageItem}>
                    <Box
                      sx={{
                        ...styles.stageCircle,
                        ...(isCompleted ? styles.stageCircleCompleted : {}),
                        ...(isActive ? styles.stageCircleActive : {}),
                        ...(isPending ? styles.stageCirclePending : {}),
                      }}
                    >
                      {isCompleted || isActive ? (
                        <CheckIcon sx={{ fontSize: "24px" }} />
                      ) : (
                        <Box sx={styles.stageDot} />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        ...styles.stageLabel,
                        ...(isPending ? styles.stageLabelPending : styles.stageLabelCompleted),
                      }}
                    >
                      {stage.label}
                    </Typography>
                    {isActive ? (
                      <Box
                        sx={{
                          ...styles.stageStatus,
                          ...styles.stageStatusActive,
                        }}
                      >
                        Current Step
                      </Box>
                    ) : isCompleted && stage.key === "eligibility" ? (
                      <Box
                        sx={{
                          ...styles.stageStatus,
                          ...styles.stageStatusActive,
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                          },
                        }}
                        onClick={() => handleStageClick(stage)}
                      >
                        View Result
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          ...styles.stageStatus,
                          ...(isCompleted ? styles.stageStatusCompleted : styles.stageStatusPending),
                        }}
                      >
                        {isCompleted ? "Completed" : "Pending"}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Appointments
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.secondary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.palette.primary.main,
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {journey.appointments?.length || 0}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Retrieval Batches
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.secondary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.palette.primary.main,
                }}
              >
                <FolderIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {journey.batches?.length || 0}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Likely Reproducible
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.secondary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.palette.primary.main,
                }}
              >
                <EggAltIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {journey.eggRecords?.reduce((sum, r) => sum + (r.miiEggs || 0), 0) || 0}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                Unlikely Reproducible
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.secondary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.palette.primary.main,
                }}
              >
                <HospitalIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {journey.eggRecords?.reduce((sum, r) => sum + (r.miEggs || 0), 0) || 0}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

