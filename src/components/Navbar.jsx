import React from 'react';

const SPORTS_LIST = [
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'table_tennis', name: 'Table Tennis', icon: '🏓' },
  { id: 'squash', name: 'Squash', icon: '💥' },
  { id: 'padel', name: 'Padel', icon: '🎾' },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓' },
];

export default function Navbar({ activeTab, setActiveTab, selectedSport, setSelectedSport }) {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand & Logo */}
        <div className="brand-group">
          <div className="brand-icon-wrapper">
            <span className="brand-icon">🏆</span>
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-main-title">RallyLens</h1>
              <span className="ai-tag">SINGLE CAMERA TRACKING</span>
            </div>
            <p className="brand-tagline">Optical Motion Analytics & Coach Review System</p>
          </div>
        </div>

        {/* Sport Selector Dropdown */}
        <div className="sport-selector-wrapper">
          <label htmlFor="navbar-sport-select" className="sport-label">Sport:</label>
          <select
            id="navbar-sport-select"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="sport-select-input"
          >
            {SPORTS_LIST.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.icon} {sport.name}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            <span className="tab-icon">📹</span>
            <span>Recorded Video</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            <span className="tab-icon">🎥</span>
            <span>Live Camera</span>
            <span className="pulse-dot"></span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="tab-icon">📊</span>
            <span>Coach Intelligence</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            <span>Player Profile</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
