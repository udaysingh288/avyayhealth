import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/shared/ErrorBoundary';
import AuthGuard from './components/shared/AuthGuard';
import Enroll from './pages/Enroll';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import Timeline from './pages/Timeline';
import CarePlan from './pages/CarePlan';
import CareTeam from './pages/CareTeam';

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        {/* Enrollment — no auth needed */}
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/enroll/:code" element={<Enroll />} />

        {/* Protected app routes */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<Home />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/care-plan" element={<CarePlan />} />
          <Route path="/care-team" element={<CareTeam />} />
        </Route>

        {/* Legacy redirects */}
        <Route path="/learn" element={<Navigate to="/care-plan" replace />} />
        <Route path="/resources" element={<Navigate to="/care-team" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
