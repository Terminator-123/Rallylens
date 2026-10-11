# RallyLens AI — Member 2 Implementation & Handoff Summary (Hour 3 Sprint)

This document summarizes the complete implementation for **Member 2 (Frontend Upload & Calibration UI)** during **Hour 3 (Make upload-to-analysis reliable and user-friendly)** of the **RallyLens AI** project.

---

## 📋 Member 2 Hour 3 Sprint Mission Target & Definition of Done

- **End-of-Hour Target**: A user can upload the chosen badminton clip, place the four court corners in the correct order, start analysis, and see the true processing status or a useful error.
- **Definition of Done Checkpoints**:
  - [x] Real file upload succeeds and produces a `match_id` via `POST /api/matches` (field name: `file`).
  - [x] Court corners use the shared order (`Top-Left`, `Top-Right`, `Bottom-Right`, `Bottom-Left`) and scale back to source video resolution (`videoWidth` × `videoHeight`).
  - [x] Analysis request uses exact JSON field names: `{ sport, court_type, court_corners }`.
  - [x] Completed and failed states are visible with a 2-second status polling loop (`GET /api/matches/:id/status`) that automatically stops on completion or error.
  - [x] Readable error states for oversized files (> 500 MB), unsupported formats, missing calibration, upload failures, and backend analysis errors.

---

## 📂 Files Owned & Delivered

1. [`src/api.js`](file:///c:/Users/rohit/OneDrive/Desktop/sports%20frontend/src/api.js) — Centralized API helpers with error validation, status polling, and mock progression tracker.
2. [`src/components/CourtCalibration.jsx`](file:///c:/Users/rohit/OneDrive/Desktop/sports%20frontend/src/components/CourtCalibration.jsx) — 4-corner interactive court calibration with SVG overlay, native resolution coordinate scaling, Undo, and Reset.
3. [`src/components/VideoUpload.jsx`](file:///c:/Users/rohit/OneDrive/Desktop/sports%20frontend/src/components/VideoUpload.jsx) — Upload UI card, format & size checks, 2s status polling loop with auto-cleanup, progress bar, error alerts, and Member 3 handoff payload preview.
4. [`src/pages/Home.jsx`](file:///c:/Users/rohit/OneDrive/Desktop/sports%20frontend/src/pages/Home.jsx) — Sprint container page.

---

## 🔌 Shared API Contract & JSON Payload

**Analysis Request Payload (`POST /api/matches/{id}/analyze`)**:
```json
{
  "sport": "badminton",
  "court_type": "doubles",
  "court_corners": [
    [120, 80],
    [520, 100],
    [570, 400],
    [70, 380]
  ]
}
```

---

## 🤝 Member 3 Handoff Specification

Member 3 Results Dashboard receives the following object via `onAnalysisStarted` callback:
```js
{
  match_id: "match_1728556800_abc12",
  videoUrl: "blob:http://localhost:5173/...",
  status: "completed", // or "processing" / "queued"
  sport: "badminton",
  court_type: "doubles",
  court_corners: [[120,80], [520,100], [570,400], [70,380]]
}
```

---

## 🐙 Git Branch & Verification

- **Branch**: `feature/upload-ui`
- **Build Status**: Verified clean Vite build (`npm run build`).
- **Remote Repository**: `https://github.com/Terminator-123/devx-sp.git`
