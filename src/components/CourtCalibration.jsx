import React, { useRef, useState, useEffect } from 'react';

const CORNER_NAMES = [
  { id: 1, label: 'Top-Left (TL)', short: 'TL', color: '#3b82f6' },
  { id: 2, label: 'Top-Right (TR)', short: 'TR', color: '#10b981' },
  { id: 3, label: 'Bottom-Right (BR)', short: 'BR', color: '#f59e0b' },
  { id: 4, label: 'Bottom-Left (BL)', short: 'BL', color: '#ef4444' },
];

/**
 * CourtCalibration Component (Member 2 Owned)
 * Renders video frame overlay for selecting 4 court corner coordinates.
 * Order requirement: 1: Top-Left, 2: Top-Right, 3: Bottom-Right, 4: Bottom-Left
 * Maps click CSS display coordinates to original source video pixel dimensions.
 */
export default function CourtCalibration({
  videoRef,
  videoSrc,
  corners,
  onCornersChange,
  courtType,
  onCourtTypeChange,
  disabled = false
}) {
  const containerRef = useRef(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [videoDimensions, setVideoDimensions] = useState({ width: 1280, height: 720 });

  // Update container size on resize or video load
  const updateDimensions = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDisplaySize({ width: rect.width, height: rect.height });
    }
    if (videoRef && videoRef.current) {
      const v = videoRef.current;
      if (v.videoWidth && v.videoHeight) {
        setVideoDimensions({ width: v.videoWidth, height: v.videoHeight });
      }
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [videoRef, videoSrc]);

  // Handle click on calibration overlay
  const handleOverlayClick = (e) => {
    if (disabled || corners.length >= 4) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Get actual video source dimensions
    let nativeWidth = videoDimensions.width;
    let nativeHeight = videoDimensions.height;
    if (videoRef && videoRef.current && videoRef.current.videoWidth) {
      nativeWidth = videoRef.current.videoWidth;
      nativeHeight = videoRef.current.videoHeight;
      setVideoDimensions({ width: nativeWidth, height: nativeHeight });
    }

    // Scale display click coordinates back to source video width and height
    const scaleX = rect.width > 0 ? nativeWidth / rect.width : 1;
    const scaleY = rect.height > 0 ? nativeHeight / rect.height : 1;

    const sourceX = Math.round(clickX * scaleX);
    const sourceY = Math.round(clickY * scaleY);

    const newCorners = [...corners, [sourceX, sourceY]];
    onCornersChange(newCorners);

    console.log(`[Court Calibration] Corner ${newCorners.length} (${CORNER_NAMES[newCorners.length - 1].label}) clicked:`, {
      display: [Math.round(clickX), Math.round(clickY)],
      source: [sourceX, sourceY],
      sourceResolution: `${nativeWidth}x${nativeHeight}`
    });
  };

  const handleReset = () => {
    onCornersChange([]);
  };

  const handleUndo = () => {
    if (corners.length > 0) {
      onCornersChange(corners.slice(0, -1));
    }
  };

  // Convert source coordinates to display coordinates for SVG rendering
  const getDisplayPoint = (cornerSource) => {
    if (!containerRef.current || !displaySize.width || !displaySize.height) return [0, 0];
    const nativeWidth = videoDimensions.width || 1280;
    const nativeHeight = videoDimensions.height || 720;

    const displayX = (cornerSource[0] / nativeWidth) * displaySize.width;
    const displayY = (cornerSource[1] / nativeHeight) * displaySize.height;
    return [displayX, displayY];
  };

  const displayCorners = corners.map(getDisplayPoint);

  // Generate SVG polygon points string
  const polygonPoints = displayCorners.map(pt => `${pt[0]},${pt[1]}`).join(' ');

  const currentStep = corners.length;
  const isComplete = currentStep === 4;

  return (
    <div className="court-calibration-card">
      <div className="calibration-header">
        <div className="header-title-group">
          <h3 className="calibration-title">🎯 Court Calibration</h3>
          <span className="calibration-step-badge">
            {isComplete ? '✓ Calibration Complete' : `Step ${currentStep + 1} of 4: ${CORNER_NAMES[currentStep].label}`}
          </span>
        </div>
        <div className="court-type-selector">
          <label htmlFor="court-type-select" className="label-sm">Court Type:</label>
          <select
            id="court-type-select"
            value={courtType}
            onChange={(e) => onCourtTypeChange(e.target.value)}
            disabled={disabled}
            className="select-input-sm"
          >
            <option value="doubles">Doubles (Standard)</option>
            <option value="singles">Singles</option>
          </select>
        </div>
      </div>

      <p className="calibration-instruction">
        {!isComplete ? (
          <>
            Click four court corners on the video in order: 
            <strong> 1. Top-Left</strong> ➔ <strong> 2. Top-Right</strong> ➔ <strong> 3. Bottom-Right</strong> ➔ <strong> 4. Bottom-Left</strong>.
          </>
        ) : (
          <>All 4 corners set! Verify points below or click Reset to re-calibrate.</>
        )}
      </p>

      {/* Interactive Calibration Overlay Container */}
      <div
        ref={containerRef}
        className={`calibration-overlay-container ${isComplete ? 'is-complete' : ''}`}
        onClick={handleOverlayClick}
        style={{ cursor: isComplete || disabled ? 'default' : 'crosshair' }}
      >
        {/* Render child video preview or background */}
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className="calibration-video-player"
            controlsList="nodownload"
            onLoadedMetadata={updateDimensions}
          />
        ) : (
          <div className="calibration-placeholder">
            <span>📹 Load video preview to calibrate court corners</span>
          </div>
        )}

        {/* SVG Drawing Layer over display dimensions */}
        <svg
          className="calibration-svg-layer"
          width={displaySize.width}
          height={displaySize.height}
          viewBox={`0 0 ${displaySize.width || 1} ${displaySize.height || 1}`}
        >
          {/* Connected Polygon Lines */}
          {displayCorners.length > 1 && (
            <polyline
              points={polygonPoints}
              fill={isComplete ? 'rgba(0, 210, 200, 0.25)' : 'none'}
              stroke="#00d2c8"
              strokeWidth="2.5"
              strokeDasharray={isComplete ? 'none' : '4'}
            />
          )}
          {isComplete && displayCorners.length === 4 && (
            <line
              x1={displayCorners[3][0]}
              y1={displayCorners[3][1]}
              x2={displayCorners[0][0]}
              y2={displayCorners[0][1]}
              stroke="#00d2c8"
              strokeWidth="2.5"
            />
          )}

          {/* Render Corner Markers */}
          {displayCorners.map((pt, index) => {
            const meta = CORNER_NAMES[index];
            return (
              <g key={index} transform={`translate(${pt[0]}, ${pt[1]})`}>
                <circle r="12" fill={meta.color} stroke="#ffffff" strokeWidth="2" />
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {index + 1}
                </text>
                <text
                  x="16"
                  y="4"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  className="corner-label-text"
                >
                  {meta.short}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Calibration Toolbar & Selected Coordinates */}
      <div className="calibration-toolbar">
        <div className="corner-chips-list">
          {CORNER_NAMES.map((meta, i) => {
            const cornerCoord = corners[i];
            return (
              <div
                key={meta.id}
                className={`corner-chip ${cornerCoord ? 'filled' : 'pending'} ${currentStep === i ? 'active' : ''}`}
                style={{ borderColor: cornerCoord ? meta.color : undefined }}
              >
                <span className="chip-badge" style={{ backgroundColor: meta.color }}>
                  {meta.id}
                </span>
                <span className="chip-name">{meta.label}:</span>
                <span className="chip-coord">
                  {cornerCoord ? `[${cornerCoord[0]}, ${cornerCoord[1]}] px` : 'Not set'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="calibration-actions">
          <button
            type="button"
            className="btn btn-secondary-sm"
            onClick={handleUndo}
            disabled={disabled || corners.length === 0}
          >
            ↩ Undo Point
          </button>
          <button
            type="button"
            className="btn btn-danger-sm"
            onClick={handleReset}
            disabled={disabled || corners.length === 0}
          >
            🗑 Reset Calibration
          </button>
        </div>
      </div>

      <div className="resolution-info">
        <span>Source Resolution: {videoDimensions.width} × {videoDimensions.height} px</span>
        <span>Display Scale: {displaySize.width > 0 ? (videoDimensions.width / displaySize.width).toFixed(2) : '1.00'}x</span>
      </div>
    </div>
  );
}
