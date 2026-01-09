import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  PictureAsPdf as PictureAsPdfIcon,
  History as HistoryIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { getEvaluationHistory } from "../../api/evaluationApi";
import { useSelector } from "react-redux";
import FrameImage from "../../components/frames/FrameImage";

export default function EvaluationHistoryPage() {
  const theme = useTheme();
  const { user } = useSelector((s) => s.auth);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEvaluationHistory(user.userId);
      // Ensure history is always an object with history array
      setHistory({
        patientId: data?.patientId || user.userId,
        history: data?.history || [],
      });
    } catch (err) {
      // Handle 404 or empty history gracefully
      if (err.response?.status === 404) {
        setHistory({
          patientId: user.userId,
          history: [],
        });
      } else {
        setError(err.response?.data?.detail || "Failed to load evaluation history");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export with jsPDF
    alert("PDF export feature coming soon!");
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Container>
    );
  }

  // Show error only if it's a real error, not just empty history
  if (error && (!history || history.history?.length === 0)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Unable to load evaluation history. Please try again later.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const records = history?.history || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1 }}>
          Evaluation History
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          View your egg retrieval and evaluation results
        </Typography>
      </Box>

      {records.length > 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1], mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
              Eligibility Result 
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {records.map((record, index) => {
                const suggestedEligibility = record.suggestedEligibility;
                const isEligible = suggestedEligibility === "eligible";
                const miiEggs = record.miiEggs ?? 0;
                const miEggs = record.miEggs ?? 0;
                const total = miiEggs + miEggs;
                const userRole = user?.subrole || "donor";
                const isDonor = userRole === "donor";
                
                let percentage = 0;
                let threshold = 0;
                let eggType = "";
                
                if (isDonor) {
                  percentage = total > 0 ? (miiEggs / total) * 100 : 0;
                  threshold = 70;
                  eggType = "likely reproducible (MII)";
                } else {
                  percentage = total > 0 ? (miEggs / total) * 100 : 0;
                  threshold = 90;
                  eggType = "unlikely reproducible (MI)";
                }
                
                const percentageText = percentage.toFixed(1);
                
                let messageText = "";
                if (isDonor) {
                  if (isEligible) {
                    messageText = `Congratulations! You are eligible to donate eggs. Your evaluation shows that ${percentageText}% of your eggs are ${eggType}, which meets our threshold of ${threshold}% or higher.`;
                  } else {
                    messageText = `We appreciate your interest in donating eggs. Unfortunately, your evaluation shows that ${percentageText}% of your eggs are ${eggType}, which is below our threshold of ${threshold}%. We understand this may be disappointing, and we encourage you to discuss this with our medical team if you have any questions.`;
                  }
                } else {
                  // Recipient: eligible = need donation (not good news), not eligible = can have own baby (good news)
                  if (isEligible) {
                    messageText = `Based on your evaluation, you are eligible to receive egg donation. Your evaluation shows that ${percentageText}% of your eggs are ${eggType}, which indicates that egg donation may be a suitable option for you. We encourage you to consult with our fertility specialists to discuss your options and determine the best path forward for your family planning goals.`;
                  } else {
                    messageText = `Your evaluation shows that ${percentageText}% of your eggs are ${eggType}, which suggests you may have the opportunity to conceive using your own eggs. We encourage you to consult with our fertility specialists to discuss your options and explore the best path forward for your family planning goals.`;
                  }
                }
                
                return (
                  <Box
                    key={index}
                    sx={{
                      p: 3,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.background.paper,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                      {record.retrievalDate
                        ? format(new Date(record.retrievalDate), "MMM dd, yyyy")
                        : "N/A"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Chip
                        label={isEligible ? "Eligible" : "Not Eligible"}
                        color={isEligible ? "primary" : "default"}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          backgroundColor: isEligible 
                            ? theme.palette.primary.main 
                            : theme.palette.text.disabled,
                          color: isEligible ? "#FFFFFF" : theme.palette.text.primary,
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.primary,
                        lineHeight: 1.6,
                      }}
                    >
                      {messageText}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {records.length === 0 ? (
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HistoryIcon
                sx={{
                  fontSize: 80,
                  color: theme.palette.text.disabled,
                  mb: 3,
                  opacity: 0.5,
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 2,
                }}
              >
                No Evaluation History Yet
              </Typography>
              <Box
                sx={{
                  maxWidth: 500,
                  mx: "auto",
                  p: 3,
                  backgroundColor: theme.palette.secondary.light,
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <InfoIcon
                    sx={{
                      color: theme.palette.primary.main,
                      fontSize: 24,
                      mt: 0.5,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        mb: 1,
                      }}
                    >
                      Your evaluation history will appear here once:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 3, textAlign: "left" }}>
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary, mb: 1 }}
                      >
                        You have completed your first egg retrieval appointment
                      </Typography>
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary, mb: 1 }}
                      >
                        The lab has processed and evaluated your retrieval batch
                      </Typography>
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        AI evaluation results are available
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontStyle: "italic",
                }}
              >
                Please contact the clinic if you have questions about your retrieval process.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Retrieval Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Likely Reproducible</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Unlikely Reproducible</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record, index) => {
                    const miiEggs = record.miiEggs ?? 0;
                    const miEggs = record.miEggs ?? 0
                    const total = miiEggs + miEggs;
                    const miiPercent = total > 0 ? ((miiEggs / total) * 100).toFixed(1) : 0;
                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          {record.retrievalDate
                            ? format(new Date(record.retrievalDate), "MMM dd, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={miiEggs}
                            color="tertiary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={miEggs}
                            color="tertiary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {total} ({miiPercent}% likely)
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(record)}
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog
        disableScrollLock={true}
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Evaluation Details
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Retrieval Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedRecord.retrievalDate
                      ? format(new Date(selectedRecord.retrievalDate), "MMMM dd, yyyy 'at' HH:mm")
                      : "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Batch ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: "monospace" }}>
                    {selectedRecord.batchId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Likely Reproducible
                  </Typography>
                  <Chip
                    label={selectedRecord.miiEggs ?? 0}
                    color="tertiary"
                    sx={{ fontSize: "18px", fontWeight: 600, height: "36px" }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Unlikely Reproducible
                  </Typography>
                  <Chip
                    label={selectedRecord.miEggs ?? 0}
                    color="tertiary"
                    sx={{ fontSize: "18px", fontWeight: 600, height: "36px" }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {(selectedRecord.miiEggs ?? 0) + (selectedRecord.miEggs ?? 0)}
                  </Typography>
                </Grid>
              </Grid>

              {selectedRecord.frames && selectedRecord.frames.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Frames ({selectedRecord.frames.length})
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(3, 1fr)",
                        md: "repeat(4, 1fr)",
                      },
                      gap: 2,
                    }}
                  >
                    {selectedRecord.frames.map((frame, idx) => (
                      <Card
                        key={frame.id || idx}
                        sx={{
                          borderRadius: 2,
                          boxShadow: theme.shadows[1],
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            backgroundColor: theme.palette.background.default,
                            overflow: "hidden",
                          }}
                        >
                          <FrameImage frame={frame} />
                        </Box>
                        <CardContent sx={{ p: 1.5, display: "flex", justifyContent: "center" }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Frame #{idx + 1}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: theme.palette.text.secondary }}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            Export PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

