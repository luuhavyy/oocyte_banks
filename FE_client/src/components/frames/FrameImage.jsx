import { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { API_BASE_URL } from "../../config/api";

/**
 * FrameImage Component
 * Displays original frame image without bounding boxes (client view)
 * Maintains 4:3 aspect ratio
 * Fetches image via API with authentication
 */
export default function FrameImage({ frame }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  // Get frame ID (support both id and frameId)
  const frameId = frame?.id || frame?.frameId;

  // Fetch image with authentication
  useEffect(() => {
    if (!frameId) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const token = localStorage.getItem("client_token");
        
        if (!token) {
          console.error("No client_token found in localStorage");
          throw new Error("Authentication required");
        }

        const response = await fetch(`${API_BASE_URL}/frames/view/${frameId}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Unauthorized - token may be expired or invalid");
            // Clear invalid token
            localStorage.removeItem("client_token");
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageSrc(blobUrl);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    fetchImage();

    // Cleanup blob URL on unmount
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [frameId]);

  if (!frameId) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "75%", // 4:3 aspect ratio
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          color: "text.secondary",
          borderRadius: 2,
        }}
      >
        No frame ID
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "75%", // 4:3 aspect ratio
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          color: "text.secondary",
          borderRadius: 2,
        }}
      >
        Failed to load image
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        paddingTop: "75%", // 4:3 aspect ratio
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            zIndex: 2,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      {imageSrc && (
        <Box
          component="img"
          src={imageSrc}
          alt="Frame"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: loading ? "none" : "block",
          }}
        />
      )}
    </Box>
  );
}
