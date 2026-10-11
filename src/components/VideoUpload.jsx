import React, { useState, useEffect, useRef } from 'react';
import { uploadMatch, startAnalysis, getMatchStatus } from '../api';
import CourtCalibration from './CourtCalibration';

const RECOMMENDED_MAX_SIZE_MB = 500;

export default function VideoUpload({ onAnalysisStarted }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sport, setSport] = useState('badminton');
  const [courtType, setCourtType] = useState('singles');
  const [courtCorners, setCourtCorners] = useState([]);
  
  // Status states
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  
  // User Feedback
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(null);
  const [analysisStatusMsg, setAnalysisStatusMsg] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Manage preview object URL lifecycle
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  // Poll analysis status
  const startPollingStatus = (targetMatchId) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await getMatchStatus(targetMatchId);

        if (res) {
          const currentStatus = res.status || 'processing';
          setJobStatus(currentStatus);
          if (typeof res.progress === 'number') {
            setJobProgress(res.progress);
          }

          if (currentStatus === 'completed') {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setIsAnalyzing(false);
            setAnalysisStatusMsg(`✓ Optical Analysis Complete! View tracking & coach report below.`);
            
            if (onAnalysisStarted) {
              onAnalysisStarted({
                match_id: targetMatchId,
                videoUrl: previewUrl,
                status: 'completed',
                sport,
                court_type: courtType,
                court_corners: courtCorners
              });
            }
          } else if (currentStatus === 'failed') {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
            setIsAnalyzing(false);
            setErrorMessage(res.error || `Analysis encountered an error for Match #${targetMatchId}.`);
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 1500);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setErrorMessage(null);
    setUploadSuccessMsg(null);
    setAnalysisStatusMsg(null);
    setMatchId(null);
    setJobStatus(null);
    setJobProgress(0);
    setCourtCorners([]);

    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > RECOMMENDED_MAX_SIZE_MB) {
      setErrorMessage(`File size (${fileSizeMB.toFixed(1)} MB) exceeds maximum recommended limit of ${RECOMMENDED_MAX_SIZE_MB} MB.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange({ target: { files: [file] } });
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a video file before uploading.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const response = await uploadMatch(selectedFile);
      if (response && response.match_id) {
        setMatchId(response.match_id);
        setJobStatus(response.status || 'uploaded');
        setUploadSuccessMsg(`Recorded video loaded! Calibrate court corners below and click Start Analysis.`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload video.');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger analysis handler
  const handleAnalyze = async () => {
    if (!matchId) {
      // Auto upload if user clicked analyze directly after selecting file
      await handleUpload();
    }

    if (!courtCorners || courtCorners.length !== 4) {
      setErrorMessage('Please click all 4 court corners (Top-Left, Top-Right, Bottom-Right, Bottom-Left) on your video frame to calibrate.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    const payload = {
      sport,
      court_type: courtType,
      court_corners: courtCorners
    };

    try {
      const currentMatchId = matchId || `match_${Date.now()}`;
      const result = await startAnalysis(currentMatchId, payload);
      setJobStatus('processing');
      setJobProgress(15);
      setAnalysisStatusMsg(`Running optical motion tracking for Match #${currentMatchId}...`);

      if (onAnalysisStarted) {
        onAnalysisStarted({
          match_id: currentMatchId,
          videoUrl: previewUrl,
          status: 'processing',
          sport,
          court_type: courtType,
          court_corners: courtCorners
        });
      }

      startPollingStatus(currentMatchId);
    } catch (err) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Failed to start optical analysis.');
    }
  };

  const handleClear = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setSelectedFile(null);
    setMatchId(null);
    setJobStatus(null);
    setJobProgress(0);
    setErrorMessage(null);
    setUploadSuccessMsg(null);
    setAnalysisStatusMsg(null);
    setCourtCorners([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-card">
      <div className="card-header">
        <h2 className="card-title">📹 Upload Recorded Match Video & Court Calibration</h2>
        <span className="badge badge-primary">SINGLE CAMERA ANALYSIS</span>
      </div>

      {/* File Selection Dropzone */}
      <div 
        className={`dropzone ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="video/*" 
          style={{ display: 'none' }}
        />

        {!selectedFile ? (
          <div className="dropzone-prompt">
            <div className="upload-icon">📹</div>
            <p className="primary-text">Click or Drag & Drop your recorded match video</p>
            <p className="secondary-text">Supports MP4, WebM, MOV, AVI (Recorded from phone or camera)</p>
            
            <div className="sample-clip-prompt-row" onClick={(e) => e.stopPropagation()}>
              <span className="sample-prompt-divider">OR</span>
              <button
                type="button"
                className="btn btn-secondary-sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/sample_match.mp4');
                    const blob = await response.blob();
                    const file = new File([blob], 'sample_match_racket_optical.mp4', { type: 'video/mp4' });
                    setSelectedFile(file);
                    // Pre-fill calibrated corners for sample video
                    setCourtCorners([
                      [120, 80],
                      [520, 100],
                      [570, 400],
                      [70, 380]
                    ]);
                  } catch (err) {
                    console.error('Failed to load sample clip:', err);
                  }
                }}
              >
                ⚡ Load Sample Match Clip & Calibrate Instantly
              </button>
            </div>
          </div>
        ) : (
          <div className="file-info-container">
            <div className="file-meta">
              <span className="file-name">📄 {selectedFile.name}</span>
              <span className="file-size">{formatSize(selectedFile.size)}</span>
              <button type="button" className="btn-clear" onClick={(e) => { e.stopPropagation(); handleClear(); }}>
                ✕ Remove Video
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Court Calibration (Renders on real uploaded video preview) */}
      {selectedFile && previewUrl && (
        <CourtCalibration
          videoRef={videoRef}
          videoSrc={previewUrl}
          corners={courtCorners}
          onCornersChange={(newCorners) => {
            setCourtCorners(newCorners);
            if (errorMessage && errorMessage.includes('Please select all 4 court corners')) {
              setErrorMessage(null);
            }
          }}
          courtType={courtType}
          onCourtTypeChange={setCourtType}
          disabled={isUploading || isAnalyzing}
        />
      )}

      {/* Sport Selector & Action Buttons */}
      {selectedFile && (
        <div className="actions-section">
          <div className="control-group">
            <label htmlFor="sport-select" className="label">Sport Category:</label>
            <select 
              id="sport-select"
              value={sport} 
              onChange={(e) => setSport(e.target.value)}
              className="select-input"
              disabled={isUploading || isAnalyzing}
            >
              <option value="badminton">🏸 Badminton</option>
              <option value="tennis">🎾 Tennis</option>
              <option value="table_tennis">🏓 Table Tennis</option>
              <option value="squash">💥 Squash</option>
              <option value="padel">🎾 Padel</option>
              <option value="pickleball">🏓 Pickleball</option>
            </select>
          </div>

          <div className="button-group">
            <button 
              type="button" 
              className="btn btn-accent"
              onClick={handleAnalyze}
              disabled={isAnalyzing || courtCorners.length !== 4}
            >
              {isAnalyzing ? (
                <span className="spinner-label">
                  <span className="spinner"></span> Running Optical Analysis ({jobProgress}%)...
                </span>
              ) : (
                '▶ Run Optical Analysis'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Calibration Status Note */}
      {selectedFile && (
        <p className="calibration-status-note">
          {courtCorners.length === 4 ? (
            <span className="text-success">✓ 4 Court corners calibrated on uploaded video. Ready for optical analysis!</span>
          ) : (
            <span className="text-warning">
              ⚠️ {courtCorners.length}/4 court corners selected. Click 4 corners on the video: Top-Left ➔ Top-Right ➔ Bottom-Right ➔ Bottom-Left.
            </span>
          )}
        </p>
      )}

      {/* Progress Bar */}
      {(isAnalyzing || jobStatus === 'processing') && (
        <div className="polling-progress-card">
          <div className="progress-header">
            <span>⚡ Processing Match Video: <strong>{jobStatus || 'processing'}</strong></span>
            <span>{jobProgress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${jobProgress}%` }}></div>
          </div>
        </div>
      )}

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          <span className="alert-icon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {uploadSuccessMsg && (
        <div className="alert alert-success" role="alert">
          <span className="alert-icon">✅</span>
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {analysisStatusMsg && (
        <div className={`alert ${jobStatus === 'completed' ? 'alert-success' : 'alert-info'}`} role="alert">
          <span className="alert-icon">{jobStatus === 'completed' ? '🎉' : '⚡'}</span>
          <span>{analysisStatusMsg}</span>
        </div>
      )}
    </div>
  );
}
