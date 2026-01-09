import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { API_BASE_URL } from "../../config/api";

const CLASS_COLORS = {
  oocyte: "#FF6B9D",      // Primary pink
  cytoplasm: "#C2185B",   // Dark pink
  polarbody: "#FFB84D",   // Soft orange (minimal use)
  pb: "#6B9DFF",          // Soft blue (minimal use)
};

/**
 * FrameWithBBox Component
 * Displays frame image with bounding boxes overlaid using CSS (not canvas)
 * - If detectionResults exist and showBBox=true: Show image with CSS bbox overlay
 * - If no detectionResults or showBBox=false: Show original image without bbox
 * - hideLabels: optionally hide class labels on top of boxes (for compact dialogs)
 */
export default function FrameWithBBox({ frame, showBBox = true, hideLabels = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0, left: 0, top: 0 });
  const imageElement = useRef(null);
  const containerRef = useRef(null);

  const detections = frame?.detectionResults?.detections || [];
  const shouldShowBBox = showBBox && detections.length > 0;

  // Fetch image with authentication
  useEffect(() => {
    if (!frame?.id) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const token = localStorage.getItem("admin_token");
        
        if (!token) {
          console.error("No admin_token found. Redirecting to login.");
          setError(true);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/frames/view/${frame.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Authentication failed (401). Token expired or invalid.");
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageSrc(blobUrl);
      } catch (err) {
        console.error("Failed to fetch image:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchImage();

    // Cleanup blob URL on unmount or frame change
    return () => {
      // Cleanup blob URL when component unmounts or frame.id changes
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [frame?.id]);

  // Update rendered size when image or container changes
  useEffect(() => {
    if (!imageElement.current || loading) return;

    const updateRenderedSize = () => {
      const img = imageElement.current;
      if (!img || img.offsetWidth === 0 || img.offsetHeight === 0) {
        requestAnimationFrame(updateRenderedSize);
        return;
      }

      const container = containerRef.current || img.parentElement;
      if (!container) {
        requestAnimationFrame(updateRenderedSize);
        return;
      }

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const imgWidth = img.offsetWidth;
      const imgHeight = img.offsetHeight;
      const imgLeft = (containerWidth - imgWidth) / 2;
      const imgTop = (containerHeight - imgHeight) / 2;

      setRenderedSize({
        width: imgWidth,
        height: imgHeight,
        left: imgLeft,
        top: imgTop,
      });
    };

    // Use ResizeObserver to track container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateRenderedSize();
    });

    const container = containerRef.current || imageElement.current?.parentElement;
    if (container) {
      resizeObserver.observe(container);
      updateRenderedSize();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [imageSrc, loading, imageDimensions]);

  const handleImageLoad = (e) => {
    const img = e.target;
    // Store natural image dimensions for bbox scaling
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
          bgcolor: "white",
          color: "text.secondary",
          borderRadius: "8px",
        }}
      >
        Failed to load image
      </Box>
    );
  }

  // If no bbox to show, render simple image
  if (!shouldShowBBox) {
    return (
      <Box sx={{ position: "relative", width: "100%", height: "100%", borderRadius: "8px", overflow: "hidden" }}>
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
            bgcolor: "white",
            zIndex: 1,
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
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: loading ? "none" : "block",
              borderRadius: "8px",
            }}
          />
        )}
      </Box>
    );
  }

  // Render image with CSS bbox overlay
  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            bgcolor: "white",
            zIndex: 2,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}

      {imageSrc ? (
        <Box 
          ref={containerRef}
          sx={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {/* Base Image */}
          <Box
            component="img"
            ref={imageElement}
            src={imageSrc}
            alt="Frame"
            onLoad={handleImageLoad}
            onError={handleImageError}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              display: "block",
              opacity: loading ? 0 : 1,
              transition: "opacity 0.3s",
            }}
          />

          {/* Bounding Boxes Overlay - CSS based */}
          {!loading && detections.length > 0 && imageDimensions.width > 0 && imageDimensions.height > 0 && renderedSize.width > 0 && renderedSize.height > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: `${renderedSize.top}px`,
                left: `${renderedSize.left}px`,
                width: `${renderedSize.width}px`,
                height: `${renderedSize.height}px`,
                pointerEvents: "none", // Allow clicks to pass through
                zIndex: 1,
              }}
            >
              {detections.map((detection, index) => {
                if (!detection.bbox) return null;

                const { bbox, class: className, confidence } = detection;
                const color = CLASS_COLORS[className] || "#FFFFFF";

                // Calculate bbox position as percentage
                const leftPercent = (bbox.x1 / imageDimensions.width) * 100;
                const topPercent = (bbox.y1 / imageDimensions.height) * 100;
                const widthPercent = ((bbox.x2 - bbox.x1) / imageDimensions.width) * 100;
                const heightPercent = ((bbox.y2 - bbox.y1) / imageDimensions.height) * 100;

                const label = `${className} ${(confidence * 100).toFixed(1)}%`;

                return (
                  <Box
                    key={detection.id || index}
                    sx={{
                      position: "absolute",
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                      width: `${widthPercent}%`,
                      height: `${heightPercent}%`,
                      border: `2px solid ${color}`,
                      backgroundColor: `${color}20`, // 20 = ~12% opacity in hex
                      pointerEvents: "none",
                    }}
                    >
                    {/* Label */}
                    {!hideLabels && (
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          top: -22,
                          left: 0,
                          backgroundColor: color,
                          color: "#FFFFFF",
                          px: 0.5,
                          py: 0.25,
                          fontSize: "11px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          borderRadius: "2px",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {label}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      ) : !loading && !error ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "white",
            color: "text.secondary",
          }}
        >
          Loading...
        </Box>
      ) : null}
    </Box>
  );
}
