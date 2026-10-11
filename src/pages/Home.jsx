import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import VideoUpload from '../components/VideoUpload';
import VideoTracker from '../components/VideoTracker';
import LiveCameraTracker from '../components/LiveCameraTracker';
import CoachAnalytics from '../components/CoachAnalytics';
import PlayerProfile from '../components/PlayerProfile';

export default function Home({ onAnalysisStarted }) {
  const [activeTab, setActiveTab] = useState('video'); // 'video', 'live', 'analytics', 'profile'
  const [selectedSport, setSelectedSport] = useState('badminton');
  
  // Recorded video state
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  
  // Live camera session state
  const [liveSessionData, setLiveSessionData] = useState(null);

  // Callback when user uploads video & calibrates court
  const handleAnalysisStarted = (data) => {
    setActiveMatchId(data.match_id);
    setLiveSessionData(null);
    if (data.videoUrl) {
      setActiveVideoUrl(data.videoUrl);
    }
    if (onAnalysisStarted) {
      onAnalysisStarted(data);
    }
  };

  // Callback when user finishes/stops live camera match session
  const handleSessionRecorded = (session) => {
    setLiveSessionData(session);
    setActiveMatchId(session.session_id);
    setActiveTab('analytics'); // Automatically open Coach Report
  };

  // Open coach report tab directly
  const handleOpenCoachReport = (matchId) => {
    setActiveMatchId(matchId || activeMatchId);
    setActiveTab('analytics');
  };

  return (
    <div className="home-page">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
      />

      {/* Main Container */}
      <main className="main-content">
        <div className="container-wide">
          
          {/* TAB 1: RECORDED VIDEO ANALYSIS */}
          {activeTab === 'video' && (
            <div className="tab-pane">
              {/* Step 1: Upload Recorded Video & Calibrate Court */}
              <VideoUpload onAnalysisStarted={handleAnalysisStarted} />

              {/* Step 2: Video Tracker (Visible ONLY after a real video is uploaded and analyzed) */}
              {activeVideoUrl && activeMatchId && (
                <VideoTracker
                  videoUrl={activeVideoUrl}
                  matchId={activeMatchId}
                  sport={selectedSport}
                  onOpenCoachReport={handleOpenCoachReport}
                />
              )}
            </div>
          )}

          {/* TAB 2: LIVE CAMERA MATCH TRACKING */}
          {activeTab === 'live' && (
            <div className="tab-pane">
              <LiveCameraTracker
                sport={selectedSport}
                onSessionRecorded={handleSessionRecorded}
              />
            </div>
          )}

          {/* TAB 3: COACH INTELLIGENCE & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="tab-pane">
              <CoachAnalytics
                matchId={activeMatchId}
                sport={selectedSport}
                sessionData={liveSessionData}
                onSeekToTime={(timestamp) => {
                  if (activeVideoUrl) {
                    setActiveTab('video');
                  }
                }}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* TAB 4: PLAYER PROFILE */}
          {activeTab === 'profile' && (
            <div className="tab-pane">
              <PlayerProfile
                onSelectSampleMatch={() => {
                  setActiveMatchId('match_sample_tournament_01');
                  setActiveVideoUrl('/sample_match.mp4');
                  setActiveTab('video');
                }}
              />
            </div>
          )}

        </div>
      </main>

      {/* Broadcast Sports Footer */}
      <footer className="page-footer">
        <div className="footer-content">
          <p>🏆 <strong>RallyLens Sports Tracking</strong> | Single Camera Optical Motion Analysis & Coach Review System</p>
          <p className="footer-subtext">Badminton • Tennis • Table Tennis • Squash • Padel • Pickleball</p>
        </div>
      </footer>
    </div>
  );
}
