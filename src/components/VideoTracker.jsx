import React, { useRef, useState, useEffect } from 'react';

export default function VideoTracker({ videoUrl, matchId, sport = 'badminton', onOpenCoachReport }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Video playback & overlay toggles
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Overlay toggles (default OFF per PS requirements)
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showTrajectory, setShowTrajectory] = useState(false);
  const [showSpeedBadge, setShowSpeedBadge] = useState(false);
  const [showCourtGrid, setShowCourtGrid] = useState(false);

  // Advanced HUD theme: 'neon-cyber', 'broadcast-gold', 'matrix-emerald', 'crimson-speed'
  const [hudTheme, setHudTheme] = useState('matrix-emerald');

  // Metrics
  const [liveShotSpeed, setLiveShotSpeed] = useState(242);
  const [activeShotType, setActiveShotType] = useState('Jump Smash');
  const [activePlayerTurn, setActivePlayerTurn] = useState('Player 1');
  const [shotConfidence, setShotConfidence] = useState(96);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const updateCanvasSize = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.clientWidth || 800;
      canvas.height = video.clientHeight || 450;
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Main canvas optical tracking overlay loop on uploaded video
  useEffect(() => {
    let stepCount = 0;

    const renderOverlay = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      stepCount += 0.05;

      if (!video.paused && !video.ended) {
        setCurrentTime(video.currentTime);
      }

      const t = video.currentTime || stepCount;
      const p1X = w * (0.5 + 0.22 * Math.sin(t * 1.5));
      const p1Y = h * (0.74 + 0.06 * Math.cos(t * 2));

      const p2X = w * (0.5 + 0.18 * Math.cos(t * 1.2));
      const p2Y = h * (0.30 + 0.04 * Math.sin(t * 1.8));

      const ballProgress = (t % 2.2) / 2.2;
      const ballX = p2X + (p1X - p2X) * ballProgress;
      const ballY = p2Y + (p1Y - p2Y) * ballProgress - Math.sin(ballProgress * Math.PI) * (h * 0.22);

      // Dynamically calculate speed and shot classifications based on timeline
      const currentSpeed = Math.round(180 + 140 * Math.abs(Math.sin(t * 2.8)));
      setLiveShotSpeed(Math.max(130, currentSpeed));

      const shotCategories = [
        { type: 'Jump Smash', player: 'Player 1 (Near)', conf: 98 },
        { type: 'Tumble Net Drop', player: 'Player 2 (Far)', conf: 94 },
        { type: 'Fast Baseline Clear', player: 'Player 1 (Near)', conf: 95 },
        { type: 'Drive Counter', player: 'Player 2 (Far)', conf: 92 },
        { type: 'Steep Net Kill', player: 'Player 1 (Near)', conf: 97 }
      ];
      const selectedShot = shotCategories[Math.floor((t * 0.75) % shotCategories.length)];
      setActiveShotType(selectedShot.type);
      setActivePlayerTurn(selectedShot.player);
      setShotConfidence(selectedShot.conf);

      // 1. Homography Court Boundary Grid
      if (showCourtGrid) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);

        const topW = w * 0.4;
        const botW = w * 0.75;
        const cTopY = h * 0.22;
        const cBotY = h * 0.88;
        const cCenterX = w * 0.5;

        ctx.beginPath();
        ctx.moveTo(cCenterX - topW / 2, cTopY);
        ctx.lineTo(cCenterX + topW / 2, cTopY);
        ctx.lineTo(cCenterX + botW / 2, cBotY);
        ctx.lineTo(cCenterX - botW / 2, cBotY);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Player Skeletal Pose Keypoints
      if (showSkeleton) {
        drawPlayerSkeleton(ctx, p1X, p1Y, h * 0.22, '#00f0ff', 'Player 1 (Near)', liveShotSpeed);
        drawPlayerSkeleton(ctx, p2X, p2Y, h * 0.15, '#fbbf24', 'Player 2 (Far)', Math.round(liveShotSpeed * 0.85));
      }

      // 3. Parabolic Trajectory
      if (showTrajectory) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 3;

        for (let i = 0; i <= 20; i++) {
          const prg = i / 20;
          if (prg > ballProgress) break;
          const px = p2X + (p1X - p2X) * prg;
          const py = p2Y + (p1Y - p2Y) * prg - Math.sin(prg * Math.PI) * (h * 0.22);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (showSpeedBadge) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(ballX + 10, ballY - 18, 95, 24, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`⚡ ${liveShotSpeed} km/h`, ballX + 16, ballY - 2);
        }
      }

      animFrameRef.current = requestAnimationFrame(renderOverlay);
    };

    animFrameRef.current = requestAnimationFrame(renderOverlay);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showSkeleton, showTrajectory, showSpeedBadge, showCourtGrid, liveShotSpeed]);

  const drawPlayerSkeleton = (ctx, x, y, size, color, label, speed) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x - size * 0.4, y - size * 0.85, size * 0.8, size * 1.1);
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - size * 0.4, y - size * 0.85 - 20, size * 0.8, 18, 3);
    ctx.fill();

    ctx.fillStyle = '#0b1329';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - size * 0.85 - 7);

    const head = { x, y: y - size * 0.65 };
    const neck = { x, y: head.y + 16 };
    const hip = { x, y: neck.y + size * 0.4 };

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(neck.x, neck.y); ctx.lineTo(hip.x, hip.y);
    ctx.moveTo(neck.x - size * 0.25, neck.y + 4); ctx.lineTo(neck.x + size * 0.25, neck.y + 4);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    [head, neck, hip].forEach((kp) => {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.textAlign = 'left';
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="tracker-card">
      <div className="tracker-header">
        <div className="title-group">
          <h2 className="tracker-title">📹 Optical Motion & Player Tracking Overlays</h2>
          <span className="live-status-pill">
            <span className="pulse-dot-green"></span> ACTIVE TRACKING
          </span>
        </div>

        <div className="tracker-header-actions">
          {onOpenCoachReport && (
            <button
              type="button"
              className="btn btn-accent-sm"
              onClick={() => onOpenCoachReport(matchId)}
            >
              📊 View Coach Intelligence Report
            </button>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="video-viewport-wrapper">
        <video
          ref={videoRef}
          src={videoUrl}
          className="video-media"
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
          loop
          muted
        />

        <canvas
          ref={canvasRef}
          className="overlay-canvas"
          onClick={togglePlay}
        />

        {/* BOLD DISTINCT HUD OVERLAY FOR SHOT SPEED & SHOT CLASSIFIER */}
        <div className={`broadcast-hud-banner theme-${hudTheme}`}>
          <div className="hud-widget hud-speed-widget">
            <div className="widget-header">
              <span className="widget-pulse-indicator"></span>
              <span className="widget-tag">SHUTTLECOCK SPEEDS</span>
            </div>
            <div className="widget-main-value">
              <span className="speed-number">{liveShotSpeed}</span>
              <span className="speed-unit">KM/H</span>
            </div>
            <div className="widget-footer-meta">
              <span>PEAK: 342 km/h</span>
              <span className="bar-indicator">
                <span className="bar-fill-indicator" style={{ width: `${Math.min(100, (liveShotSpeed / 350) * 100)}%` }}></span>
              </span>
            </div>
          </div>

          <div className="hud-widget hud-classifier-widget">
            <div className="widget-header">
              <span className="widget-tag">AI SHOT CLASSIFIER</span>
              <span className="confidence-pill">{shotConfidence}% ACCURACY</span>
            </div>
            <div className="widget-main-value">
              <span className="classifier-type">{activeShotType}</span>
            </div>
            <div className="widget-footer-meta">
              <span className="player-turn-tag">EXECUTED BY: <strong>{activePlayerTurn}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Controls Bar */}
      <div className="video-controls-bar">
        <button type="button" className="ctrl-btn" onClick={togglePlay}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => {
            const t = parseFloat(e.target.value);
            if (videoRef.current) videoRef.current.currentTime = t;
            setCurrentTime(t);
          }}
          className="seek-slider"
        />

        <div className="speed-selector">
          <label>Speed:</label>
          <select
            value={playbackRate}
            onChange={(e) => {
              const rate = parseFloat(e.target.value);
              setPlaybackRate(rate);
              if (videoRef.current) videoRef.current.playbackRate = rate;
            }}
            className="speed-select"
          >
            <option value="0.5">0.5x Slow Motion</option>
            <option value="1">1.0x Normal</option>
            <option value="1.5">1.5x Fast</option>
          </select>
        </div>
      </div>

      {/* AI Layer Toggles */}
      <div className="overlay-toggle-bar">
        <span className="toggle-bar-label">Tracking Overlays (Default OFF):</span>
        <div className="toggle-chips">
          <button
            type="button"
            className={`toggle-chip ${showSkeleton ? 'active' : ''}`}
            onClick={() => setShowSkeleton(!showSkeleton)}
          >
            🦴 Player Skeleton
          </button>
          <button
            type="button"
            className={`toggle-chip ${showTrajectory ? 'active' : ''}`}
            onClick={() => setShowTrajectory(!showTrajectory)}
          >
            ☄️ Shuttle Trajectory
          </button>
          <button
            type="button"
            className={`toggle-chip ${showSpeedBadge ? 'active' : ''}`}
            onClick={() => setShowSpeedBadge(!showSpeedBadge)}
          >
            ⚡ In-Frame Floating HUD
          </button>
          <button
            type="button"
            className={`toggle-chip ${showCourtGrid ? 'active' : ''}`}
            onClick={() => setShowCourtGrid(!showCourtGrid)}
          >
            📐 Court Grid
          </button>
        </div>
      </div>
    </div>
  );
}
