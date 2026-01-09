import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  LinearProgress,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  AutoAwesome as EvaluateIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { getBatch, deleteBatch, approveBatchEligibility } from "../../api/batchApi";
import { getFramesByBatch } from "../../api/frameApi";
import {
  startBatchEvaluation,
  reEvaluateBatch,
  getEvaluationStatus,
} from "../../api/evaluationApi";
import FrameWithBBox from "../../components/frames/FrameWithBBox";
import FrameImage from "../../components/frames/FrameImage";

export default function BatchDetailsPage() {
  const theme = useTheme();
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [frames, setFrames] = useState([]);
  const [evaluationStatus, setEvaluationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [filterTab, setFilterTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [eligibilityMenuAnchor, setEligibilityMenuAnchor] = useState(null);

  useEffect(() => {
    loadBatchData();
  }, [batchId]);

  const loadBatchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [batchData, framesData] = await Promise.all([
        getBatch(batchId),
        getFramesByBatch(batchId),
      ]);
      setBatch(batchData);
      setFrames(framesData);

      try {
        const evalStatus = await getEvaluationStatus(batchId);
        setEvaluationStatus(evalStatus);
      } catch {
        setEvaluationStatus(null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load batch");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (isReEvaluation = false) => {
    setEvaluating(true);
    setError(null);
    try {
      if (isReEvaluation) {
        await reEvaluateBatch(batchId);
      } else {
        await startBatchEvaluation(batchId);
      }

      const poll = setInterval(async () => {
        const status = await getEvaluationStatus(batchId);
        setEvaluationStatus(status);
        if (status.status === "completed" || status.status === "failed") {
          clearInterval(poll);
          setEvaluating(false);
          loadBatchData();
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start evaluation");
      setEvaluating(false);
    }
  };

  const handleDeleteBatch = async () => {
    try {
      await deleteBatch(batchId);
      navigate(`/admin/patients/${batch?.patientId}`);
    } catch {
      setError("Failed to delete batch");
    }
    setDeleteDialogOpen(false);
  };

  const handleApproveEligibility = async (approved) => {
    try {
      await approveBatchEligibility(batchId, approved, null);
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      await loadBatchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update eligibility status");
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
    }
  };

  const hasEvaluation = frames.some((f) => f.detectionResults);
  const miiCount = frames.filter(
    (f) => f.evaluationResult?.maturity === "MII"
  ).length;
  const miCount = frames.filter(
    (f) => f.evaluationResult?.maturity === "MI"
  ).length;

  const filteredFrames = frames.filter((frame) => {
    if (filterTab === "all") return true;
    if (filterTab === "likely") return frame.evaluationResult?.maturity === "MII";
    if (filterTab === "unlikely")
      return frame.evaluationResult?.maturity === "MI";
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: 400, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pt: 4, pb: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={700} component="span">
              Batch Details{" "}
              <Typography variant="h4" component="span" sx={{ fontSize: "0.7em", fontWeight: 400 }}>
                #{batch?.id || batchId}
              </Typography>
            </Typography>
            <Typography color="text.secondary">
              Patient: {batch?.patientName || batch?.patientId}
            </Typography>
          </Box>
        </Box>

        {/* ACTION BUTTONS */}
        <Box sx={{ display: "flex", gap: 2, height: "fit-content" }}>
          {!hasEvaluation ? (
            <Button
              variant="contained"
              size="medium"
              startIcon={<EvaluateIcon />}
              onClick={() => handleEvaluate(false)}
              disabled={evaluating}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Start Evaluation
            </Button>
          ) : (
            <Button
              variant="contained"
              size="medium"
              startIcon={<RefreshIcon />}
              onClick={() => handleEvaluate(true)}
              disabled={evaluating}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Re-Evaluate 
            </Button>
          )}

          <Button
            variant="outlined"
            size="medium"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ color: theme.palette.primary.main }}
          >
            Delete Batch
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* MAIN CONTENT */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "300px 1fr",
          },
          gap: 2,
        }}
      >        
      {/* LEFT COLUMN (NARROW) */}
      <Box sx={{ width: "100%"}}>  
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography fontWeight={600} mb={2}>
                Batch Information
              </Typography>

              <Typography fontSize={12} color="text.secondary">
                Created Date
              </Typography>
              <Typography mb={2}>
                {batch?.createdAt ? new Date(batch.createdAt).toLocaleDateString() : "N/A"}
              </Typography>

              {batch?.patientRole && (
                <>
                  <Typography fontSize={12} color="text.secondary">
                    Patient Role
                  </Typography>
                  <Typography mb={2} textTransform="capitalize">
                    {batch.patientRole}
                  </Typography>
                </>
              )}

              {hasEvaluation && batch?.eligibilityPercentage !== null && batch?.eligibilityPercentage !== undefined && batch?.patientRole && (
                <>
                  <Typography fontSize={12} color="text.secondary">
                    {batch.patientRole === "donor" ? "Likely Reproducible (% MII)" : "Unlikely Reproducible (% MI)"}
                  </Typography>
                  <Typography mb={1.5} variant="h6" fontWeight={700}>
                    {batch.eligibilityPercentage.toFixed(1)}%
                  </Typography>
                </>
              )}

              {hasEvaluation && batch?.suggestedEligibility && (
                <>
                  <Typography fontSize={12} color="text.secondary">
                    Suggested Eligibility
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, mb: 1 }}>
                    <Chip
                      label={batch.suggestedEligibility === "eligible" ? "Eligible" : "Not Eligible"}
                      color={batch.suggestedEligibility === "eligible" ? "primary" : "default"}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        backgroundColor: batch.suggestedEligibility === "eligible" 
                          ? theme.palette.primary.main 
                          : theme.palette.text.disabled,
                        color: batch.suggestedEligibility === "eligible" 
                          ? "#FFFFFF" 
                          : theme.palette.text.primary,
                      }}
                    />
                    {batch?.eligibilityStatus === "pending" && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => setEligibilityMenuAnchor(e.currentTarget)}
                          sx={{ 
                            color: theme.palette.text.secondary,
                            "&:hover": { backgroundColor: theme.palette.action.hover }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={eligibilityMenuAnchor}
                          open={Boolean(eligibilityMenuAnchor)}
                          onClose={() => setEligibilityMenuAnchor(null)}
                          disableScrollLock={true}
                        >
                          <MenuItem
                            onClick={() => {
                              setEligibilityMenuAnchor(null);
                              setApproveDialogOpen(true);
                            }}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <CheckCircleIcon sx={{ mr: 1, fontSize: 18, color: theme.palette.primary.main }} />
                            Approve
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setEligibilityMenuAnchor(null);
                              setRejectDialogOpen(true);
                            }}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <CancelIcon sx={{ mr: 1, fontSize: 18, color: theme.palette.primary.main }} />
                            Reject
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                  </Box>
                </>
              )}

              {hasEvaluation && batch?.eligibilityStatus && (
                <>
                  <Typography fontSize={12} color="text.secondary" sx={{ mt: 2 }}>
                    Eligibility Status
                  </Typography>
                  <Chip
                    label={batch.eligibilityStatus === "approved" ? "Approved" : batch.eligibilityStatus === "rejected" ? "Rejected" : "Pending"}
                    size="small"
                    sx={{ mt: 0.5, mb: 1,
                      backgroundColor: batch.eligibilityStatus === "approved" 
                        ? theme.palette.primary.main 
                        : batch.eligibilityStatus === "rejected"
                        ? theme.palette.grey[300]
                        : theme.palette.grey[300],
                      color: batch.eligibilityStatus === "approved" ? "#fff" : theme.palette.text.primary
                    }}
                  />
                </>
              )}


              <Typography fontSize={12} color="text.secondary" sx={{ mt: 2 }}>
                Total Frames
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {frames.length}
              </Typography>
            </CardContent>
          </Card>

        </Box>

        {/* RIGHT COLUMN (FRAMES) */}
        <Box sx={{ width: "100%" }}>
          <Card sx={{ boxShadow: 2, minHeight: "100%" }}>
            <CardContent>
              <Typography fontWeight={600} mb={2}>
                Captured Frames ({filteredFrames.length})
              </Typography>
              {(hasEvaluation || evaluating) && (
                <LinearProgress
                  variant="determinate"
                  value={
                    evaluationStatus?.progress
                      ? evaluationStatus.progress * 100
                      : 0
                  }
                  sx={{ mb: 0 }}
                />
              )}

              <Tabs
                value={filterTab}
                onChange={(e, v) => setFilterTab(v)}
                sx={{ mb: 2 }}
                variant="fullWidth"
              >
                <Tab label={`All (${frames.length})`} value="all" />
                <Tab label={`Likely Reproducible (${miiCount})`} value="likely" />
                <Tab label={`Unlikely Reproducible (${miCount})`} value="unlikely" />
              </Tabs>

              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {hasEvaluation 
                  ? "Click on a frame to view evaluation details."
                  : "Click on a frame to view evaluation details after running evaluation."}
              </Typography>

              {/* RESPONSIVE GRID */}
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
                {filteredFrames.map((frame) => (
                  <Box
                    key={frame.id}
                    onClick={() => {
                      if (hasEvaluation) {
                        setSelectedFrame(frame);
                      }
                    }}
                    sx={{
                      cursor: hasEvaluation ? "pointer" : "default",
                      "&:hover": hasEvaluation ? { transform: "scale(1.03)" } : {},
                      opacity: hasEvaluation ? 1 : 0.7,
                    }}
                  >
                    <Box
                      sx={{
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        borderRadius: 2,
                      }}
                    >
                      <FrameImage frame={frame} />
                    </Box>
                    <Typography
                      variant="caption"
                      display="block"
                      textAlign="center"
                      mt={1}
                    >
                      Frame #{frame.index ?? frame.id}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* FRAME DETAILS DIALOG */}
      <Dialog
        disableScrollLock={true}
        open={Boolean(selectedFrame)}
        onClose={() => setSelectedFrame(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedFrame && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              Frame Details
            </DialogTitle>

            <DialogContent>
              {/* MAIN GRID */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 3,
                  alignItems: "start",
                }}
              >
                {/* LEFT COLUMN – IMAGES (STACKED) */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateRows: "auto auto",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography fontSize={13} mb={1}>
                      Original Image
                    </Typography>
                    <Card variant="outlined">
                      <FrameImage frame={selectedFrame} />
                    </Card>
                  </Box>

                  <Box>
                    <Typography fontSize={13} mb={1}>
                      With Detection Results
                    </Typography>
                    <Card variant="outlined">
                      <FrameWithBBox
                        frame={selectedFrame}
                        showBBox
                        hideLabels
                      />
                    </Card>
                  </Box>
                </Box>

                {/* RIGHT COLUMN – TABLE + SUMMARY */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateRows: "auto auto",
                    gap: 3,
                  }}
                >
                  {/* Detection Table */}
                  {selectedFrame.detectionResults?.detections?.length > 0 && (
                    <Box>
                      <Typography fontWeight={700} mb={1}>
                        Detection Results
                      </Typography>

                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Class</TableCell>
                            <TableCell align="right">
                              Confidence
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedFrame.detectionResults.detections.map(
                            (det, i) => {
                              const classColors = {
                                oocyte: {
                                  bg: "#FF6B9D",
                                  color: "#FFFFFF",
                                },
                                cytoplasm: {
                                  bg: "#C2185B",
                                  color: "#FFFFFF",
                                },
                                polarbody: {
                                  bg: "#FFB84D",
                                  color: "#FFFFFF",
                                },
                                pb: {
                                  bg: "#6B9DFF",
                                  color: "#FFFFFF",
                                },
                              };

                              const color =
                                classColors[det.class] || {
                                  bg: "#757575",
                                  color: "#FFFFFF",
                                };

                              return (
                                <TableRow key={i}>
                                  <TableCell>
                                    <Chip
                                      label={det.class.toUpperCase()}
                                      size="small"
                                      sx={{
                                        bgcolor: color.bg,
                                        color: color.color,
                                        fontWeight: 600,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    {(det.confidence * 100).toFixed(2)}%
                                  </TableCell>
                                </TableRow>
                              );
                            }
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  )}

                  {/* Evaluation Summary – STACK VERTICAL */}
                  {selectedFrame.evaluationResult && (
                    <Box>
                      <Typography fontWeight={700} mb={1}>
                        Evaluation Summary
                      </Typography>

                      <Box mb={2}>
                        <Typography
                          fontSize={12}
                          color="text.secondary"
                        >
                          Maturity Status
                        </Typography>
                        <Typography fontWeight={600}>
                          {selectedFrame.evaluationResult.maturity}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          fontSize={12}
                          color="text.secondary"
                        >
                          Quality Assessment
                        </Typography>
                        <Typography fontWeight={600}>
                          {selectedFrame.evaluationResult.quality}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => setSelectedFrame(null)}
                sx={{ color: "#c2185b" }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>


      {/* DELETE DIALOG */}
      <Dialog disableScrollLock={true} open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Batch?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="primary" variant="contained" onClick={handleDeleteBatch}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* APPROVE ELIGIBILITY DIALOG */}
      <Dialog disableScrollLock={true} open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Eligibility</DialogTitle>
        <DialogContent>
          <Typography>
            Approve this batch's eligibility status? This will update the patient's journey stage.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleApproveEligibility(true)}
            sx={{ 
              backgroundColor: theme.palette.primary.main,
              "&:hover": { backgroundColor: theme.palette.primary.dark }
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* REJECT ELIGIBILITY DIALOG */}
      <Dialog disableScrollLock={true} open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Eligibility</DialogTitle>
        <DialogContent>
          <Typography>
            Reject this batch's eligibility status?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            startIcon={<CancelIcon />}
            onClick={() => handleApproveEligibility(false)}
            sx={{ 
              backgroundColor: theme.palette.primary.main,
              "&:hover": { backgroundColor: theme.palette.primary.dark }
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
