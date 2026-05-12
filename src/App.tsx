import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Subjects from "./pages/Subjects";
import WhyLuna from "./pages/WhyLuna";
import Tutors from "./pages/Tutors";
import Enquire from "./pages/Enquire";
import Page from "./pages/Page";

import TutorDashboard from "./pages/TutorDashboard";
import TutorMistakes from "./pages/TutorMistakes";
import StudentOverview from "./pages/StudentOverview";
import Practice from "./pages/Practice";
import Mistakes from "./pages/Mistakes";
import RedoMistakes from "./pages/RedoMistakes";
import GenerateQuestions from "./pages/GenerateQuestions";

import AdminQuestions from "./pages/AdminQuestions";
import AdminAssign from "./pages/AdminAssign";
import AdminEnquiries from "./pages/AdminEnquiries";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProgress from "./pages/AdminProgress";

import Layout from "./pages/Layout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./pages/ProtectedRoute";
import TutorLessons from "./pages/TutorLessons";
import AdminLessons from "./pages/AdminLessons";
import ScrollToTop from "./components/ScrollToTop";

import LunaMascotChat from "./components/LunaMascotChat";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Navigate to="/en" replace />} />

        <Route path="/:lang" element={<Landing />} />
        <Route path="/:lang/auth" element={<Auth />} />
        <Route path="/:lang/login" element={<Login />} />
        <Route path="/:lang/subjects" element={<Subjects />} />
        <Route path="/:lang/whyluna" element={<WhyLuna />} />
        <Route path="/:lang/tutors" element={<Tutors />} />
        <Route path="/:lang/enquiry" element={<Enquire />} />
        <Route path="/:lang/forgot-password" element={<ForgotPassword />} />
        <Route path="/:lang/reset-password" element={<ResetPassword />} />

        {/* Old public links redirect */}
        <Route path="/login" element={<Navigate to="/en/login" replace />} />
        <Route path="/subjects" element={<Navigate to="/en/subjects" replace />} />
        <Route path="/whyluna" element={<Navigate to="/en/whyluna" replace />} />
        <Route path="/tutors" element={<Navigate to="/en/tutors" replace />} />
        <Route path="/enquiry" element={<Navigate to="/en/enquiry" replace />} />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assign"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminAssign />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminQuestions />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/lessons"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminLessons />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/page"
          element={
            <ProtectedRoute allowedRoles={["admin", "tutor", "student"]}>
              <Layout>
                <Page />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/enquiries"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminEnquiries />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/progress"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminProgress />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin only: generate questions */}
        <Route
          path="/generate"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <GenerateQuestions />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Tutor */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "tutor"]}>
              <Layout>
                <TutorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mistakes"
          element={
            <Layout>
              <TutorMistakes />
            </Layout>
          }
        />

        {/* Student */}
        <Route
          path="/studentoverview"
          element={
            <ProtectedRoute allowedRoles={["admin", "student"]}>
              <Layout>
                <StudentOverview />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons"
          element={
            <ProtectedRoute allowedRoles={["admin", "tutor"]}>
              <Layout>
                <TutorLessons />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/practice"
          element={
            <ProtectedRoute allowedRoles={["admin", "student"]}>
              <Layout>
                <Practice />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/redo-mistakes"
          element={
            <ProtectedRoute allowedRoles={["admin", "student"]}>
              <Layout>
                <RedoMistakes />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Shared: admin, tutor, student */}
        <Route
          path="/mistakes"
          element={
            <ProtectedRoute allowedRoles={["admin", "tutor", "student"]}>
              <Layout>
                <Mistakes />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

      </Routes>

      <LunaMascotChat />
    </BrowserRouter>
  );
};

export default App;