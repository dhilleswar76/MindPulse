import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

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
import { SupportAssistantPage } from '../features/support/SupportAssistantPage';
import { CounselorDashboardPage } from '../features/counselor/CounselorDashboardPage';
import { CaseDetailsPage } from '../features/counselor/CaseDetailsPage';
import { InterventionsPage } from '../features/interventions/InterventionsPage';
import { AlertsQueuePage } from '../features/alerts/AlertsQueuePage';
import { InstitutionalAnalyticsPage } from '../features/analytics/InstitutionalAnalyticsPage';
import { CampusHeatmapPage } from '../features/heatmap/CampusHeatmapPage';
import { WhatIfSimulatorPage } from '../features/simulator/WhatIfSimulatorPage';

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
        {/* User / Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['USER', 'COUNSELOR', 'ADMIN']} />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/checkins" element={<CheckinPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/wellness" element={<BaselineOverviewPage />} />
          <Route path="/risk" element={<RiskAssessmentPage />} />
          <Route path="/forecast" element={<ForecastingPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/support" element={<SupportAssistantPage />} />
        </Route>

        {/* Counselor Routes */}
        <Route element={<ProtectedRoute allowedRoles={['COUNSELOR', 'ADMIN']} />}>
          <Route path="/counselor" element={<CounselorDashboardPage />} />
          <Route path="/counselor/cases" element={<CounselorDashboardPage />} />
          <Route path="/counselor/cases/:id" element={<CaseDetailsPage />} />
          <Route path="/counselor/interventions" element={<InterventionsPage />} />
          <Route path="/counselor/alerts" element={<AlertsQueuePage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<InstitutionalAnalyticsPage />} />
          <Route path="/admin/heatmap" element={<CampusHeatmapPage />} />
          <Route path="/admin/simulator" element={<WhatIfSimulatorPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
