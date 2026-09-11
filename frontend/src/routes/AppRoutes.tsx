import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminProtectedRoute } from './AdminProtectedRoute';

// Feature Pages
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { UserDashboardPage } from '../features/dashboard/UserDashboardPage';
import { CheckinPage } from '../features/checkins/CheckinPage';
import { JournalPage } from '../features/journal/JournalPage';
import { BaselineOverviewPage } from '../features/wellness-baseline/BaselineOverviewPage';
import { RiskAssessmentPage } from '../features/risk/RiskAssessmentPage';
import { ForecastingPage } from '../features/forecasting/ForecastingPage';
import { RecommendationsPage } from '../features/recommendations/RecommendationsPage';
import { VictimCompensationPage } from '../features/compensation/VictimCompensationPage';
import { SupportAssistantPage } from '../features/support/SupportAssistantPage';
import { MyCounsellorPage } from '../features/counselor/MyCounsellorPage';
import { VictimCounsellorChatPage } from '../features/counselor/VictimCounsellorChatPage';
import { CounselorDashboardPage } from '../features/counselor/CounselorDashboardPage';
import { AvailableVictimsPage } from '../features/counselor/AvailableVictimsPage';
import { CounselorInboxPage } from '../features/counselor/CounselorInboxPage';
import { CaseDetailsPage } from '../features/counselor/CaseDetailsPage';
import { InterventionsPage } from '../features/interventions/InterventionsPage';
import { AlertsQueuePage } from '../features/alerts/AlertsQueuePage';

// Admin Feature Pages
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { AdminAnalyticsPage } from '../features/admin/AdminAnalyticsPage';
import { AdminCasesPage } from '../features/admin/AdminCasesPage';
import { AdminInboxPage } from '../features/admin/AdminInboxPage';
import { AdminCounsellorAllocationPage } from '../features/admin/AdminCounsellorAllocationPage';
import { CampusHeatmapPage } from '../features/heatmap/CampusHeatmapPage';
import { WhatIfSimulatorPage } from '../features/simulator/WhatIfSimulatorPage';
import { AdminAuditLogsPage } from '../features/admin/AdminAuditLogsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected App Layout */}
      <Route element={<DashboardLayout />}>
        {/* Victim / Witness Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/my-counsellor" element={<MyCounsellorPage />} />
          <Route path="/victim/my-counsellor" element={<MyCounsellorPage />} />
          <Route path="/victim/counsellor-chat" element={<VictimCounsellorChatPage />} />
          <Route path="/checkins" element={<CheckinPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/wellness" element={<BaselineOverviewPage />} />
          <Route path="/risk" element={<RiskAssessmentPage />} />
          <Route path="/forecast" element={<ForecastingPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/compensation" element={<VictimCompensationPage />} />
          <Route path="/support" element={<SupportAssistantPage />} />
        </Route>

        {/* Counselor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['COUNSELOR']} />}>
          <Route path="/counselor" element={<CounselorDashboardPage />} />
          <Route path="/counselor/inbox" element={<CounselorInboxPage />} />
          <Route path="/counselor/available-victims" element={<AvailableVictimsPage />} />
          <Route path="/counselor/cases" element={<CounselorDashboardPage />} />
          <Route path="/counselor/case/:id" element={<CaseDetailsPage />} />
          <Route path="/counselor/cases/:id" element={<CaseDetailsPage />} />
          <Route path="/counselor/interventions" element={<InterventionsPage />} />
          <Route path="/counselor/alerts" element={<AlertsQueuePage />} />
        </Route>

        {/* Hidden District Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/inbox" element={<AdminInboxPage />} />
          <Route path="/admin/counsellor-allocation" element={<AdminCounsellorAllocationPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/cases" element={<AdminCasesPage />} />
          <Route path="/admin/heatmap" element={<CampusHeatmapPage />} />
          <Route path="/admin/interventions" element={<InterventionsPage />} />
          <Route path="/admin/simulator" element={<WhatIfSimulatorPage />} />
          <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
