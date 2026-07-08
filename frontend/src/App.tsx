import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { CreateGroupPage } from './pages/CreateGroupPage.js';
import { JoinGroupPage } from './pages/JoinGroupPage.js';
import { SelectGroupPage } from './pages/SelectGroupPage.js';
import { AppLayout } from './layouts/AppLayout.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { RecordMatchPage } from './pages/RecordMatchPage.js';
import { PlayersPage } from './pages/PlayersPage.js';
import { PlayerProfilePage } from './pages/PlayerProfilePage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { RankingsPage } from './pages/RankingsPage.js';
import { HeadToHeadPage } from './pages/HeadToHeadPage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { AdminPage } from './pages/AdminPage.js';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-group" element={<CreateGroupPage />} />
        <Route path="/join-group" element={<JoinGroupPage />} />
        <Route path="/select-group" element={<SelectGroupPage />} />

        <Route path="/g/:groupId" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="record" element={<RecordMatchPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/:membershipId" element={<PlayerProfilePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="rankings" element={<RankingsPage />} />
          <Route path="head-to-head" element={<HeadToHeadPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
