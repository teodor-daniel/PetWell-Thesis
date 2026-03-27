import React, { Suspense, useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingNavbar from './components/navigation/LandingNavbar';
import Navbar from './components/navigation/Navbar';
import OwnerNavbar from './components/navigation/OwnerNavbar';
import VetNavbar from './components/navigation/VetNavbar';
import PrivateRoute from './components/routing/PrivateRoute';
import { AuthContext } from './contexts/AuthContext';
import './index.css';
import ClinicAppointmentsPage from './pages/ClinicAppointmentsPage';
import Goodbye from './pages/landing/Goodbye';
import OwnerSettingsPage from './pages/OwnerSettingsPage';
import ClinicOwnerSignup from './pages/OwnerSignupPage';
import PetDetailPage from './pages/PetDetailPage';


const LandingHome = React.lazy(() => import('./pages/landing/LandingPage'));
const Login = React.lazy(() => import('./pages/LoginPage'));
const SignUp = React.lazy(() => import('./pages/UserSignupPage'));
const Home = React.lazy(() => import('./pages/UserHomePage'));
const Dashboard = React.lazy(() => import('./pages/OwnerMainPage'));
const UserPetHome = React.lazy(() => import('./pages/UserPetsPage'));
const UserSettings = React.lazy(() => import('./pages/UserSettingsPage'));
const ClinicPage = React.lazy(() => import('./pages/OwnerClinicDetailsPage'));
const AllClinicsPage = React.lazy(() => import('./pages/ClinicsBrowsePage'));
const ClinicsPage = React.lazy(() => import('./pages/ClinicsBrowsePage'));
const Contact = React.lazy(() => import('./pages/landing/ContactPage'));
const VetSignup = React.lazy(() => import('./pages/VetSignupPage'));

const VetMainPage = React.lazy(() => import('./pages/VetMainPage'));
const VetClinicDashboardPage = React.lazy(() => import('./pages/VetClinicDashboardPage'));
const VetAccountSettingsPage = React.lazy(() => import('./pages/VetAccountSettingsPage'));

const UserAppointmentBookingPage = React.lazy(() => import('./pages/UserAppointmentBookingPage'));
const AddMedicalRecord = React.lazy(() => import('./pages/MedicalRecordUploadPage'));
const MedicalRecords = React.lazy(() => import('./pages/MedicalRecordsPage'));
const AddAppointmentRecord = React.lazy(() => import('./pages/AppointmentRecordUploadPage'));

const Pricing = React.lazy(() => import('./pages/landing/Pricing'));
const Legal = React.lazy(() => import('./pages/landing/Legal'));

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const isOwner = user?.role === 'OWNER';
  const isVet = user?.role === 'VET';

  return (
    <Suspense fallback={<div />}>
      <Routes>

        <Route
          path="/"
          element={
            loading ? null : user ? (
              user.role === 'OWNER' ? <Navigate to="/dashboard" replace /> :
                user.role === 'VET' ? <Navigate to="/vet-dashboard" replace /> :
                  <Navigate to="/home" replace />
            ) : (
              <><LandingNavbar /><LandingHome /></>
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/vet" element={<VetSignup />} />
        <Route path="/signup/clinic-owner" element={<ClinicOwnerSignup />} />

        <Route path="/contact" element={
          user
            ? <><Navbar /><Contact /></>
            : <><LandingNavbar /><Contact /></>
        } />
        <Route path="/pricing" element={<><LandingNavbar /><Pricing /></>} />
        <Route path="/legal" element={<><LandingNavbar /><Legal /></>} />

        <Route
          path="/goodbye"
          element={<Goodbye />}
        />


        <Route
          path="/home"
          element={
            <PrivateRoute requiredRole="USER">
              <><Navbar /><Home /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/pets"
          element={
            <PrivateRoute requiredRole="USER">
              <><Navbar /><UserPetHome /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/usersettings"
          element={
            <PrivateRoute requiredRole="USER">
              <><Navbar /><UserSettings /></>
            </PrivateRoute>
          }
        />


        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRole="OWNER">
              <><OwnerNavbar /><Dashboard /></>
            </PrivateRoute>
          }
        />
        <Route path="/owner-settings" element={<><OwnerNavbar /><OwnerSettingsPage /></>} />
        <Route path="/clinic-appointments/:clinicId" element={<><OwnerNavbar /><ClinicAppointmentsPage /></>} />


        <Route
          path="/vet-dashboard"
          element={
            <PrivateRoute requiredRole="VET">
              <><VetNavbar /><VetMainPage /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/vet/account-settings"
          element={
            <PrivateRoute requiredRole="VET">
              <><VetNavbar /><VetAccountSettingsPage /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/clinics/:clinicId/dashboard"
          element={
            <PrivateRoute requiredRole="VET">
              <><VetNavbar /><VetClinicDashboardPage /></>
            </PrivateRoute>
          }
        />

        {/* <Route
          path="/vet/appointments"
          element={
            <PrivateRoute requiredRole="VET">
              <><Navbar /><Navbar /></>
              </PrivateRoute>
          }
        /> */}


        <Route
          path="/clinics/:slug"
          element={<>{isOwner ? <OwnerNavbar /> : isVet ? <VetNavbar /> : <Navbar />}<ClinicPage /></>}
        />
        <Route
          path="/clinics"
          element={<>{isOwner ? <OwnerNavbar /> : isVet ? <VetNavbar /> : <Navbar />}<AllClinicsPage /></>}
        />
        <Route
          path="/contact"
          element={<>{isOwner ? <OwnerNavbar /> : isVet ? <VetNavbar /> : <Navbar />}<Contact /></>}
        />

        <Route path="/clinics/:id/book" element={<><Navbar /><UserAppointmentBookingPage /></>} />


        <Route
          path="/medical-records/add"
          element={
            <PrivateRoute requiredRole="VET">
              <><VetNavbar /><AddMedicalRecord /></>
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments/:appointmentId/add-record"
          element={
            <PrivateRoute requiredRole="VET">
              <><VetNavbar /><AddAppointmentRecord /></>
            </PrivateRoute>
          }
        />


        <Route path="/pet/:petId" element={<PetDetailPage />} />ł§ł


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}