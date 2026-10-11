import React, { useState } from 'react';

export default function PlayerProfile({ onSelectSampleMatch }) {
  const [activePlayer, setActivePlayer] = useState('p1'); // 'p1' or 'p2'

  const playersData = {
    p1: {
      id: 'p1',
      tag: 'Player 1 (Near Court)',
      name: 'Viktor A.',
      title: 'State Championship Semi-Finalist • National Singles Circuit',
      sport: 'Badminton (Singles & Doubles)',
      ranking: 'District #3 / State Top 16',
      matchesAnalyzed: 24,
      winRate: '75%',
      avgSmashSpeed: '358 km/h',
      avatarIcon: '🏸',
      dominantHand: 'Right-handed',
      playStyle: 'Offensive Attacker (Smash & Net Dominance)',
      courtPosition: 'Near Court Focus (Baseline & Forecourt)',
      metrics: {
        peakSpeed: '382 km/h',
        avgSpeed: '194 km/h',
        courtCoverage: '88%',
        reactionTime: '0.25s',
        stamina: '80%'
      },
      skills: [
        { name: 'Smash Power & Acceleration', score: 94, color: '#ef4444' },
        { name: 'Court Agility & Footwork', score: 88, color: '#00d2c8' },
        { name: 'Shot Accuracy & Net Control', score: 86, color: '#2563eb' },
        { name: 'Tactical Selection & Strategy', score: 84, color: '#f59e0b' },
        { name: 'Endurance & Stamina Reserve', score: 76, color: '#10b981' },
      ],
      coachDirectives: {
        coachName: 'Head Coach David (Elite Badminton Academy)',
        date: 'Oct 2026',
        assessment: 'Viktor has developed elite smash velocity this season (reaching 382 km/h). Main focus for the upcoming state tournament is improving the deep backhand corner recovery footwork. When pushed wide to the left, his recovery time is 0.28s behind top-tier benchmarks.'
      },
      recentMatches: [
        { id: 'match_01', date: '2026-10-08', opponent: 'Kento M.', result: 'WIN (21-17, 21-19)', maxSpeed: '382 km/h', duration: '28m' },
        { id: 'match_02', date: '2026-10-02', opponent: 'Lee Z.', result: 'WIN (21-14, 18-21, 21-15)', maxSpeed: '365 km/h', duration: '42m' },
        { id: 'match_03', date: '2026-09-25', opponent: 'Loh K.', result: 'LOSS (19-21, 16-21)', maxSpeed: '348 km/h', duration: '34m' },
        { id: 'match_04', date: '2026-09-18', opponent: 'Chou T.', result: 'WIN (21-16, 21-13)', maxSpeed: '370 km/h', duration: '31m' },
      ]
    },
    p2: {
      id: 'p2',
      tag: 'Player 2 (Far Court)',
      name: 'Kento M.',
      title: 'State Finalist • High Precision Counter-Puncher',
      sport: 'Badminton (Singles & Doubles)',
      ranking: 'District #4 / State Top 20',
      matchesAnalyzed: 21,
      winRate: '71%',
      avgSmashSpeed: '335 km/h',
      avatarIcon: '🎾',
      dominantHand: 'Left-handed',
      playStyle: 'Tactical Counter-Puncher (Drop & High Lift Deception)',
      courtPosition: 'Far Court Focus (Rear Court Defense)',
      metrics: {
        peakSpeed: '345 km/h',
        avgSpeed: '180 km/h',
        courtCoverage: '82%',
        reactionTime: '0.30s',
        stamina: '72%'
      },
      skills: [
        { name: 'Drop Precision & Deception', score: 92, color: '#10b981' },
        { name: 'Defensive Anticipation & Net Tumble', score: 89, color: '#00d2c8' },
        { name: 'Rally Endurance & Patience', score: 86, color: '#2563eb' },
        { name: 'Smash Power & Speed', score: 79, color: '#ef4444' },
        { name: 'Lateral Direction Change', score: 74, color: '#f59e0b' },
      ],
      coachDirectives: {
        coachName: 'Head Coach Sarah (High Performance Center)',
        date: 'Oct 2026',
        assessment: 'Kento exhibits exceptional shot placement consistency and backhand defense. His key area of elevation is developing steeper jump smash attack angles to convert defensive rallies into winning points without over-relying on opponents unforced errors.'
      },
      recentMatches: [
        { id: 'match_p2_01', date: '2026-10-08', opponent: 'Viktor A.', result: 'LOSS (17-21, 19-21)', maxSpeed: '335 km/h', duration: '28m' },
        { id: 'match_p2_02', date: '2026-10-01', opponent: 'Anthony G.', result: 'WIN (21-18, 22-20)', maxSpeed: '342 km/h', duration: '39m' },
        { id: 'match_p2_03', date: '2026-09-22', opponent: 'Jonatan C.', result: 'WIN (21-15, 21-17)', maxSpeed: '338 km/h', duration: '33m' },
        { id: 'match_p2_04', date: '2026-09-14', opponent: 'Anders A.', result: 'LOSS (18-21, 19-21)', maxSpeed: '329 km/h', duration: '36m' },
      ]
    }
  };

  const currentPlayer = playersData[activePlayer];

  return (
    <div className="player-profile-card">
      {/* 2-Section Player Selector Navigation */}
      <div className="player-profile-tabs-header">
        <div className="profile-section-title-wrap">
          <h2 className="card-title">👤 Athlete Performance Profiles & Diagnostics</h2>
          <p className="card-subtitle">Official player performance metrics, optical biomechanical tracking history, and certified coaching directives.</p>
        </div>

        <div className="player-toggle-tabs">
          <button
            type="button"
            className={`player-tab-pill ${activePlayer === 'p1' ? 'active' : ''}`}
            onClick={() => setActivePlayer('p1')}
          >
            <span className="player-avatar-mini">🏸</span>
            <div className="tab-pill-text">
              <span className="pill-title">Player 1 (Near Court)</span>
              <span className="pill-sub">Viktor A. • Win Rate: 75%</span>
            </div>
            {activePlayer === 'p1' && <span className="tab-active-dot"></span>}
          </button>

          <button
            type="button"
            className={`player-tab-pill ${activePlayer === 'p2' ? 'active' : ''}`}
            onClick={() => setActivePlayer('p2')}
          >
            <span className="player-avatar-mini">🎾</span>
            <div className="tab-pill-text">
              <span className="pill-title">Player 2 (Far Court)</span>
              <span className="pill-sub">Kento M. • Win Rate: 71%</span>
            </div>
            {activePlayer === 'p2' && <span className="tab-active-dot"></span>}
          </button>
        </div>
      </div>

      {/* Profile Header Banner */}
      <div className={`profile-header-banner ${activePlayer === 'p2' ? 'p2-banner' : ''}`}>
        <div className="avatar-circle">
          <span>{currentPlayer.avatarIcon}</span>
        </div>

        <div className="profile-info-group">
          <div className="name-row">
            <h2 className="player-name">{currentPlayer.name}</h2>
            <span className={`badge ${activePlayer === 'p1' ? 'badge-primary' : 'badge-warning'}`}>
              {currentPlayer.tag}
            </span>
          </div>
          <p className="player-title">{currentPlayer.title}</p>
          <div className="profile-tags-row">
            <span className="ranking-tag">🏆 Ranking: {currentPlayer.ranking}</span>
            <span className="tag-item">✋ {currentPlayer.dominantHand}</span>
            <span className="tag-item">⚡ {currentPlayer.playStyle}</span>
          </div>
        </div>

        <div className="quick-kpi-boxes">
          <div className="kpi-mini">
            <span className="kpi-num text-cyan">{currentPlayer.matchesAnalyzed}</span>
            <span className="kpi-lbl">Matches Tracked</span>
          </div>

          <div className="kpi-mini">
            <span className="kpi-num text-green">{currentPlayer.winRate}</span>
            <span className="kpi-lbl">Win Rate</span>
          </div>

          <div className="kpi-mini">
            <span className="kpi-num text-amber">{currentPlayer.avgSmashSpeed}</span>
            <span className="kpi-lbl">Avg Top Speed</span>
          </div>
        </div>
      </div>

      {/* Optical Metric Highlights Bar */}
      <div className="profile-metrics-bar">
        <div className="profile-metric-item">
          <span className="p-metric-label">PEAK RECORDED SPEED</span>
          <span className="p-metric-val text-cyan">{currentPlayer.metrics.peakSpeed}</span>
        </div>
        <div className="profile-metric-item">
          <span className="p-metric-label">AVERAGE RALLY SPEED</span>
          <span className="p-metric-val">{currentPlayer.metrics.avgSpeed}</span>
        </div>
        <div className="profile-metric-item">
          <span className="p-metric-label">COURT COVERAGE</span>
          <span className="p-metric-val text-green">{currentPlayer.metrics.courtCoverage}</span>
        </div>
        <div className="profile-metric-item">
          <span className="p-metric-label">REACTION DELAY</span>
          <span className="p-metric-val text-amber">{currentPlayer.metrics.reactionTime}</span>
        </div>
        <div className="profile-metric-item">
          <span className="p-metric-label">STAMINA BENCHMARK</span>
          <span className="p-metric-val text-emerald">{currentPlayer.metrics.stamina}</span>
        </div>
      </div>

      {/* Skills Radar & Progression Section */}
      <div className="profile-body-grid">
        {/* Skill Breakdown */}
        <div className="profile-panel skills-panel">
          <div className="panel-hdr-flex">
            <h3 className="panel-title">🎯 AI-Evaluated Skill Matrix ({currentPlayer.name})</h3>
            <span className="badge badge-secondary">Optical AI Diagnostic</span>
          </div>
          
          <div className="skills-bars-list">
            {currentPlayer.skills.map((skill, idx) => (
              <div key={idx} className="skill-item">
                <div className="skill-info">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-score">{skill.score} / 100</span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    style={{ width: `${skill.score}%`, backgroundColor: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coach Notes & Training Plan */}
        <div className="profile-panel coach-notes-panel">
          <div className="panel-hdr-flex">
            <h3 className="panel-title">📝 Certified Coach Directives ({currentPlayer.name})</h3>
            <span className="badge badge-primary">{currentPlayer.coachDirectives.date}</span>
          </div>
          
          <div className="coach-note-box">
            <div className="note-author">
              <span className="author-role">{currentPlayer.coachDirectives.coachName}</span>
            </div>
            <p className="note-content">
              "{currentPlayer.coachDirectives.assessment}"
            </p>
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              className="btn btn-primary full-width"
              onClick={() => onSelectSampleMatch && onSelectSampleMatch('sample_badminton_01')}
            >
              📹 Load Latest Match Recording & Track Overlays
            </button>
          </div>
        </div>
      </div>

      {/* Match History Table */}
      <div className="match-history-section">
        <div className="section-hdr-flex">
          <h3 className="section-title">📜 Historical Match Archive for {currentPlayer.name}</h3>
          <span className="section-meta-count">{currentPlayer.recentMatches.length} Matches Logged</span>
        </div>
        
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>Result Score</th>
                <th>Peak Smash Speed</th>
                <th>Duration</th>
                <th>Match Action</th>
              </tr>
            </thead>
            <tbody>
              {currentPlayer.recentMatches.map((m) => (
                <tr key={m.id}>
                  <td><code>{m.date}</code></td>
                  <td><strong>{m.opponent}</strong></td>
                  <td>
                    <span className={`result-badge ${m.result.includes('WIN') ? 'win' : 'loss'}`}>
                      {m.result}
                    </span>
                  </td>
                  <td className="text-cyan"><strong>{m.maxSpeed}</strong></td>
                  <td>{m.duration}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => onSelectSampleMatch && onSelectSampleMatch('sample_badminton_01')}
                    >
                      🔍 Open Analytics
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
