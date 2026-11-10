import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { OperatorLayout } from './features/operator/OperatorLayout';
import { OperatorDashboardPage } from './pages/operator/OperatorDashboardPage';
import { OperatorProfilePage } from './pages/operator/OperatorProfilePage';
import { OperatorRoutesPage } from './pages/operator/OperatorRoutesPage';
import { OperatorBookingsPage } from './pages/operator/OperatorBookingsPage';
import { ExperienceDetailPage } from './pages/ExperienceDetailPage';
import './index.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={queryClient}><BrowserRouter><Routes><Route path="/" element={<App />} /><Route path="/experiences/:id" element={<ExperienceDetailPage />} /><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute requiredRole="operator" />}><Route path="/operator" element={<OperatorLayout />}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<OperatorDashboardPage />} /><Route path="profile" element={<OperatorProfilePage />} /><Route path="routes" element={<OperatorRoutesPage />} /><Route path="bookings" element={<OperatorBookingsPage />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter></QueryClientProvider></React.StrictMode>);
