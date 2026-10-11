import React, { useState, useEffect } from 'react';
import { getMatchResults } from '../api';

export default function CoachAnalytics({ matchId, sport = 'badminton', sessionData, onSeekToTime, onNavigateTab }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeHeatmapTab, setActiveHeatmapTab] = useState('p1');
  const [selectedRally, setSelectedRally] = useState(null);
  const [activeCoachPlayerTab, setActiveCoachPlayerTab] = useState('all'); // 'all', 'p1', 'p2'

  // Load analysis data ONLY when a matchId or sessionData exists
  useEffect(() => {
    if (!matchId && !sessionData) {
      setReport(null);
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      const res = await getMatchResults(matchId || 'session_01', sport);
      
      // If live camera session data is passed, customize report metrics from live camera recording
      if (sessionData) {
        res.match_id = sessionData.session_id || matchId;
        res.summary.total_duration = sessionData.duration_str || `${sessionData.duration_secs || 45} seconds`;
        if (sessionData.max_speed) {
          res.summary.top_smash_speed = `${sessionData.max_speed} km/h`;
          res.player_analytics.player1.speed_peak_kph = sessionData.max_speed;
        }
      }

      setReport(res);
      setLoading(false);
    }

    loadData();
  }, [matchId, sessionData, sport]);

  // Empty state if no video uploaded and no live camera recording made
  if (!matchId && !sessionData && !report) {
    return (
      <div className="coach-analytics-card empty-state-card">
        <div className="empty-icon">📊</div>
        <h2 className="empty-title">No Match Video or Live Session Analyzed Yet</h2>
        <p className="empty-desc">
          To generate an optical coach intelligence report, please upload a recorded match video in the <strong>Recorded Video</strong> tab or open your device camera in the <strong>Live Camera</strong> tab.
        </p>

        <div className="empty-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigateTab && onNavigateTab('video')}
          >
            📹 Upload Recorded Video
          </button>
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => onNavigateTab && onNavigateTab('live')}
          >
            🎥 Open Live Camera
          </button>
        </div>
      </div>
    );
  }

  if (loading || !report) {
    return (
      <div className="coach-analytics-card loading-state">
        <div className="spinner"></div>
        <p>Generating Coach Intelligence Report...</p>
      </div>
    );
  }

  const { summary, player_analytics, coach_report, rallies_log } = report;
  const p1 = player_analytics.player1;
  const p2 = player_analytics.player2;

  return (
    <div className="coach-analytics-card">
      {/* Top Headline & Grade Banner */}
      <div className="coach-banner">
        <div className="grade-box">
          <span className="grade-lbl">PERFORMANCE GRADE</span>
          <span className="grade-val">{coach_report.performance_grade}</span>
        </div>

        <div className="headline-box">
          <span className="coach-tag">💡 COACH EVALUATION SUMMARY</span>
          <h2 className="headline-text">{coach_report.tactical_summary}</h2>
          <p className="subtext">Based on optical motion tracking, speed calculation, and court coverage geometry.</p>
        </div>

        <div className="match-meta-pill">
          <span>MATCH ID: <code>{report.match_id || 'ANALYZED_SESSION'}</code></span>
          <span>SPORT: <strong>{sport.toUpperCase()}</strong></span>
        </div>
      </div>

      {/* KPI Metric Scorecards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">⚡</span>
            <span className="metric-title">PEAK SMASH SPEED</span>
          </div>
          <div className="metric-value text-cyan">{p1.speed_peak_kph} <small>km/h</small></div>
          <div className="metric-footer text-muted">Opponent: {p2.speed_peak_kph} km/h</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📐</span>
            <span className="metric-title">COURT COVERAGE</span>
          </div>
          <div className="metric-value text-green">{summary.court_coverage_p1}</div>
          <div className="metric-footer text-muted">Active Zone Width: 88%</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">⏱️</span>
            <span className="metric-title">REACTION DELAY</span>
          </div>
          <div className="metric-value text-amber">{p1.reaction_time_sec} <small>sec</small></div>
          <div className="metric-footer text-muted">Elite Benchmark: 0.22s</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🔋</span>
            <span className="metric-title">STAMINA INDEX</span>
          </div>
          <div className="metric-value">{p1.stamina_remaining}</div>
          <div className="metric-footer text-muted">Distance: {p1.distance_covered_meters}m</div>
        </div>
      </div>

      {/* Main Analysis Section: Tactical Heatmap + Shot Distribution */}
      <div className="analysis-split-row">
        {/* Interactive 2D Tactical Court & Heatmap */}
        <div className="analysis-panel heatmap-panel">
          <div className="panel-header">
            <h3 className="panel-title">🗺️ 2D Court Heatmap</h3>
            <div className="heatmap-tabs">
              <button
                type="button"
                className={`tab-btn ${activeHeatmapTab === 'p1' ? 'active' : ''}`}
                onClick={() => setActiveHeatmapTab('p1')}
              >
                Near Court (P1)
              </button>
              <button
                type="button"
                className={`tab-btn ${activeHeatmapTab === 'p2' ? 'active' : ''}`}
                onClick={() => setActiveHeatmapTab('p2')}
              >
                Far Court (P2)
              </button>
              <button
                type="button"
                className={`tab-btn ${activeHeatmapTab === 'shuttle' ? 'active' : ''}`}
                onClick={() => setActiveHeatmapTab('shuttle')}
              >
                Shuttle Placement
              </button>
            </div>
          </div>

          <div className="tactical-court-container">
            <div className="court-surface">
              <div className="net-line"><span>NET</span></div>
              <div className="center-line"></div>
              <div className="service-line top-service"></div>
              <div className="service-line bot-service"></div>

              {activeHeatmapTab === 'p1' && p1.heatmap_points.map((pt, i) => (
                <div
                  key={i}
                  className="heat-orb p1-heat"
                  style={{
                    left: `${pt.x}%`,
                    top: `${pt.y}%`,
                    opacity: pt.intensity,
                    transform: `scale(${1 + pt.intensity * 0.8})`
                  }}
                  title={`Position Frequency: ${Math.round(pt.intensity * 100)}%`}
                />
              ))}

              {activeHeatmapTab === 'p2' && p2.heatmap_points.map((pt, i) => (
                <div
                  key={i}
                  className="heat-orb p2-heat"
                  style={{
                    left: `${pt.x}%`,
                    top: `${pt.y}%`,
                    opacity: pt.intensity,
                    transform: `scale(${1 + pt.intensity * 0.8})`
                  }}
                  title={`Position Frequency: ${Math.round(pt.intensity * 100)}%`}
                />
              ))}

              {activeHeatmapTab === 'shuttle' && (
                <>
                  <div className="shuttle-marker in-marker" style={{ left: '35%', top: '78%' }}>IN</div>
                  <div className="shuttle-marker in-marker" style={{ left: '68%', top: '82%' }}>IN</div>
                  <div className="shuttle-marker in-marker" style={{ left: '25%', top: '65%' }}>IN</div>
                  <div className="shuttle-marker out-marker" style={{ left: '92%', top: '70%' }}>OUT</div>
                  <div className="shuttle-marker in-marker" style={{ left: '45%', top: '22%' }}>IN</div>
                </>
              )}
            </div>

            <div className="heatmap-legend">
              <span className="legend-label">Hotspot Density:</span>
              <div className="gradient-bar"></div>
              <span className="legend-high">High Active Area</span>
            </div>
          </div>
        </div>

        {/* Shot Selection Breakdown Chart */}
        <div className="analysis-panel shots-panel">
          <h3 className="panel-title">🏸 Shot Type Breakdown (Player 1)</h3>
          
          <div className="shot-bars-list">
            {p1.shot_breakdown.map((shot, idx) => (
              <div key={idx} className="shot-bar-item">
                <div className="shot-info">
                  <span className="shot-name">{shot.name}</span>
                  <span className="shot-count">{shot.count} shots ({shot.percentage}%)</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${shot.percentage}%`,
                      backgroundColor: idx === 0 ? '#ef4444' : idx === 1 ? '#00d2c8' : idx === 2 ? '#2563eb' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="unforced-errors-box">
            <div className="err-header">
              <span>⚠️ UNFORCED ERROR BREAKDOWN</span>
              <span className="err-count text-danger">4 Errors Total</span>
            </div>
            <p className="err-text">
              2 net clips during backhand drop sequence; 2 long lifts off high-velocity smashes.
            </p>
          </div>
        </div>
      </div>

      {/* Actionable Coach Feedback & Drills for Player 1 and Player 2 */}
      <div className="coach-feedback-section">
        <div className="feedback-section-header">
          <div>
            <h3 className="section-title">🎓 Targeted Coach Recommendations & Improvement Plan</h3>
            <p className="section-subtitle">Tactical diagnostic, biomechanical strengths, error tendencies, and customized drill roadmaps.</p>
          </div>
          
          <div className="coach-player-toggle-group">
            <button
              type="button"
              className={`coach-player-toggle-btn ${activeCoachPlayerTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCoachPlayerTab('all')}
            >
              👥 Both Players
            </button>
            <button
              type="button"
              className={`coach-player-toggle-btn ${activeCoachPlayerTab === 'p1' ? 'active' : ''}`}
              onClick={() => setActiveCoachPlayerTab('p1')}
            >
              🏸 Player 1 (Near Court)
            </button>
            <button
              type="button"
              className={`coach-player-toggle-btn ${activeCoachPlayerTab === 'p2' ? 'active' : ''}`}
              onClick={() => setActiveCoachPlayerTab('p2')}
            >
              🎾 Player 2 (Far Court)
            </button>
          </div>
        </div>

        {/* Section for Player 1 */}
        {(activeCoachPlayerTab === 'all' || activeCoachPlayerTab === 'p1') && (
          <div className="player-coach-block p1-coach-block">
            <div className="player-coach-block-header">
              <div className="block-title-group">
                <span className="player-indicator-dot p1-indicator"></span>
                <h4 className="player-block-title">Player 1 (Near Court) — Tactical Diagnostic & Roadmap</h4>
                <span className="badge badge-primary">GRADE: {coach_report.player1?.performance_grade || 'A-'}</span>
              </div>
              <span className="target-pill">Primary Target</span>
            </div>

            <div className="feedback-cards-grid">
              {/* Key Strengths */}
              <div className="feedback-card strength-card">
                <h4 className="card-heading text-green">✅ Proven Strengths (Player 1)</h4>
                <ul className="feedback-list">
                  {(coach_report.player1?.strengths || coach_report.strengths || []).map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="feedback-card weakness-card">
                <h4 className="card-heading text-amber">⚠️ Critical Areas for Improvement (Player 1)</h4>
                <ul className="feedback-list">
                  {(coach_report.player1?.weaknesses || coach_report.weaknesses || []).map((wk, i) => (
                    <li key={i}>{wk}</li>
                  ))}
                </ul>
              </div>

              {/* Training Roadmap */}
              <div className="feedback-card roadmap-card">
                <h4 className="card-heading text-cyan">🏋️ Corrective Action Drills (Player 1)</h4>
                <div className="roadmap-steps">
                  {(coach_report.player1?.improvement_roadmap || coach_report.improvement_roadmap || []).map((step, i) => (
                    <div key={i} className="roadmap-item">
                      <span className="phase-badge">{step.phase}</span>
                      <p className="goal-text">{step.goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section for Player 2 */}
        {(activeCoachPlayerTab === 'all' || activeCoachPlayerTab === 'p2') && (
          <div className="player-coach-block p2-coach-block">
            <div className="player-coach-block-header">
              <div className="block-title-group">
                <span className="player-indicator-dot p2-indicator"></span>
                <h4 className="player-block-title">Player 2 (Far Court) — Tactical Diagnostic & Roadmap</h4>
                <span className="badge badge-warning">GRADE: {coach_report.player2?.performance_grade || 'B+'}</span>
              </div>
              <span className="target-pill p2-pill">Opponent Profile</span>
            </div>

            <div className="feedback-cards-grid">
              {/* Key Strengths */}
              <div className="feedback-card strength-card">
                <h4 className="card-heading text-green">✅ Proven Strengths (Player 2)</h4>
                <ul className="feedback-list">
                  {(coach_report.player2?.strengths || [
                    'High net deceptive drops with quick wrist redirection (33% of shot distribution)',
                    'Solid deep baseline high clears providing ample recovery time',
                    'Anticipation on wide cross-court angles'
                  ]).map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="feedback-card weakness-card">
                <h4 className="card-heading text-amber">⚠️ Critical Areas for Improvement (Player 2)</h4>
                <ul className="feedback-list">
                  {(coach_report.player2?.weaknesses || [
                    'Attacking smash penetration lacks terminal velocity (peak 315 km/h)',
                    'Lateral baseline recovery drops by 0.35s in rallies over 8 shots',
                    'Vulnerable to sharp flat drives directed into right hip'
                  ]).map((wk, i) => (
                    <li key={i}>{wk}</li>
                  ))}
                </ul>
              </div>

              {/* Training Roadmap */}
              <div className="feedback-card roadmap-card">
                <h4 className="card-heading text-cyan">🏋️ Corrective Action Drills (Player 2)</h4>
                <div className="roadmap-steps">
                  {(coach_report.player2?.improvement_roadmap || [
                    { phase: 'Drill 1 (Power & Drive)', goal: 'Jump smash steep angle acceleration and attack finishing.' },
                    { phase: 'Drill 2 (Mid-Body Defense)', goal: 'Fast reflex racquet preparation against flat drives.' },
                    { phase: 'Drill 3 (Agility)', goal: 'Baseline lateral transition footwork and endurance intervals.' }
                  ]).map((step, i) => (
                    <div key={i} className="roadmap-item">
                      <span className="phase-badge">{step.phase}</span>
                      <p className="goal-text">{step.goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rally Log with Video Seeking */}
      <div className="rally-log-section">
        <h3 className="section-title">⏱️ Key Match Rallies & Timestamp Logs</h3>
        
        <div className="rallies-table-wrapper">
          <table className="rallies-table">
            <thead>
              <tr>
                <th>Rally #</th>
                <th>Timestamp</th>
                <th>Duration</th>
                <th>Shots</th>
                <th>Winning Player</th>
                <th>Max Speed</th>
                <th>Ending Shot</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rallies_log.map((rally) => (
                <tr
                  key={rally.id}
                  className={selectedRally === rally.id ? 'selected-row' : ''}
                  onClick={() => setSelectedRally(rally.id)}
                >
                  <td><strong>Rally #{rally.id}</strong></td>
                  <td><code>{rally.timestamp}</code></td>
                  <td>{rally.duration_sec}s</td>
                  <td>{rally.shots} shots</td>
                  <td>
                    <span className={`badge ${rally.winner === 'P1' ? 'badge-primary' : 'badge-warning'}`}>
                      {rally.winner === 'P1' ? 'Player 1' : 'Player 2'}
                    </span>
                  </td>
                  <td className="text-cyan"><strong>{rally.max_speed}</strong></td>
                  <td>{rally.type}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-seek-sm"
                      onClick={() => onSeekToTime && onSeekToTime(rally.timestamp)}
                    >
                      ▶ Replay Rally
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
