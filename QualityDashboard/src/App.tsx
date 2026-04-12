import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RequireAuth from './components/auth/RequireAuth';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Coordinators from './pages/Coordinators';
import Reimbursement from './pages/Reimbursement';
import Penalties from './pages/Penalties';
import Engagement from './pages/Engagement';
import { useAuthSession } from './hooks/useAuthSession';

export default function App() {
  useAuthSession();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Overview />} />
          <Route path="/coordinators" element={<Coordinators />} />
          <Route path="/reimbursement" element={<Reimbursement />} />
          <Route path="/penalties" element={<Penalties />} />
          <Route path="/engagement" element={<Engagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
