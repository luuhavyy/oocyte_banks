import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  useTheme,
  Alert,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { uploadFrame } from "../../api/frameApi";

export default function UploadBatchDialog({ open, onClose, onSubmit, patientId, patientName, onSuccess }) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    notes: "",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    setFiles((prev) => [...prev, ...fileArray]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleSubmit = async () => {
    if (!patientId) {
      setError("Patient ID is required");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one frame image");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Create batch
      const batch = await onSubmit({ ...formData, patientId });

      // Step 2: Upload frames
      const totalFiles = files.length;
      for (let i = 0; i < totalFiles; i++) {
        try {
          await uploadFrame(batch.id, files[i]);
          setProgress(((i + 1) / totalFiles) * 100);
        } catch (uploadError) {
          console.error(`Failed to upload file ${i + 1}:`, uploadError);
          setError(`Failed to upload ${files[i].name}. Please try again.`);
          setUploading(false);
          return;
        }
      }

      // Success - close dialog and refresh
      handleClose();
      // Trigger success callback with batch ID for navigation
      if (onSuccess && batch) {
        onSuccess(batch.id);
      }
      // Also call onClose with success flag
      if (onClose) {
        onClose(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to create batch");
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFormData({ notes: "" });
    setFiles([]);
    setError(null);
    setUploading(false);
    setProgress(0);
    setDragActive(false);
    onClose(false);
  };

  return (
    <Dialog
      disableScrollLock={true}
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
        Create Retrieval Batch
      </DialogTitle>
      <DialogContent>
        {patientName && (
          <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
            Patient: <strong>{patientName}</strong>
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Notes (Optional)"
          multiline
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={uploading}
          sx={{ mb: 3 }}
        />

        {/* File Upload Area */}
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            backgroundColor: dragActive ? theme.palette.primary.light + "10" : theme.palette.background.default,
            transition: "all 0.3s ease",
            mb: 2,
          }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 48, 
              color: dragActive ? theme.palette.primary.main : theme.palette.text.secondary, 
              mb: 2 
            }} 
          />
          <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
            Drag and drop frame images here, or click to select
          </Typography>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="file-upload"
            multiple
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              disabled={uploading}
              startIcon={<CloudUploadIcon />}
              sx={{
                mb: files.length > 0 ? 2 : 0,
              }}
            >
              Select Frame Images
            </Button>
          </label>
        </Box>

        {/* Files List */}
        {files.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Selected Frames ({files.length})
              </Typography>
            </Box>
            <List dense sx={{ maxHeight: 200, overflow: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom: index < files.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                  }}
                >
                  <ListItemIcon>
                    <ImageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(index)}
                      disabled={uploading}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Uploading... {Math.round(progress)}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={uploading}
          sx={{ color: theme.palette.text.secondary }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={uploading || files.length === 0}
          sx={{ backgroundColor: theme.palette.primary.main }}
        >
          {uploading ? "Uploading..." : files.length > 0 ? `Create Batch & Upload (${files.length})` : "Create Batch"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

