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
import StudentOverview from "./pages/StudentOverview";
import Practice from "./pages/Practice";
import Mistakes from "./pages/Mistakes";
import GenerateQuestions from "./pages/GenerateQuestions";

import AdminQuestions from "./pages/AdminQuestions";
import AdminAssign from "./pages/AdminAssign";
import AdminEnquiries from "./pages/AdminEnquiries";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProgress from "./pages/AdminProgress";
import AdminGames from "./pages/AdminGames";
import AdminMemoryFlip from "./pages/AdminMemoryFlip";
import AdminLessons from "./pages/AdminLessons";

import Layout from "./pages/Layout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./pages/ProtectedRoute";
import TutorLessons from "./pages/TutorLessons";
import ScrollToTop from "./components/ScrollToTop";

import LunaMascotChat from "./components/LunaMascotChat";
import HapikoGuide from "./components/HapikoGuide";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

import MemoryFlip from "@/pages/games/MemoryFlip";
import GenerateGameQuestions from "@/pages/GenerateGameQuestions";
import GamesArcade from "@/pages/games/GamesArcade";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Layout><Landing /></Layout>} />

        <Route path="/:lang" element={<Layout><Landing /></Layout>} />

        <Route path="/:lang/auth" element={<Auth />} />
        <Route path="/:lang/login" element={<Login />} />

        <Route path="/en/terms" element={<Terms />} />
        <Route path="/jp/terms" element={<Terms />} />
        <Route path="/zh/terms" element={<Terms />} />
        <Route path="/:lang/subjects" element={<Layout><Subjects /></Layout>} />
        <Route path="/:lang/whyluna" element={<Layout><WhyLuna /></Layout>} />
        <Route path="/:lang/tutors" element={<Layout><Tutors /></Layout>} />
        <Route path="/:lang/enquiry" element={<Layout><Enquire /></Layout>} />
        <Route path="/:lang/forgot-password" element={<ForgotPassword />} />
        <Route path="/:lang/reset-password" element={<ResetPassword />} />

        {/* Old public links redirect */}
        <Route path="/login" element={<Navigate to="/en/login" replace />} />
        {/* Wrong language-prefixed protected links redirect */}
        <Route path="/:lang/studentoverview" element={<Navigate to="/studentoverview" replace />} />
        <Route path="/:lang/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/:lang/admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/:lang/tutor/lessons" element={<Navigate to="/tutor/lessons" replace />} />
        <Route path="/:lang/practice" element={<Navigate to="/practice" replace />} />
        <Route path="/:lang/mistakes" element={<Navigate to="/mistakes" replace />} />
        <Route path="/:lang/admin/assign" element={<Navigate to="/admin/assign" replace />} />
        <Route path="/:lang/admin/questions" element={<Navigate to="/admin/questions" replace />} />
        <Route path="/:lang/admin/lessons" element={<Navigate to="/admin/lessons" replace />} />
        <Route path="/:lang/admin/enquiries" element={<Navigate to="/admin/enquiries" replace />} />
        <Route path="/:lang/admin/progress" element={<Navigate to="/admin/progress" replace />} />
        <Route path="/admin/games"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminGames />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/games/memory-flip"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <AdminMemoryFlip />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/:lang/generate" element={<Navigate to="/generate" replace />} />

        <Route path="/subjects" element={<Navigate to="/en/subjects" replace />} />
        <Route path="/whyluna" element={<Navigate to="/en/whyluna" replace />} />
        <Route path="/tutors" element={<Navigate to="/en/tutors" replace />} />
        <Route path="/enquiry" element={<Navigate to="/en/enquiry" replace />} />



        <Route path="/generate-games" element={<ProtectedRoute allowedRoles={["admin"]}>  <GenerateGameQuestions /> </ProtectedRoute>} />
        <Route
          path="/games"
          element={
            <ProtectedRoute allowedRoles={["admin", "student"]}>
              <Layout>
                <GamesArcade />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/memory-flip"
          element={
            <ProtectedRoute allowedRoles={["admin", "student"]}>
              <Layout>
                <MemoryFlip />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/en/privacy" element={<Privacy />} />
        <Route path="/jp/privacy" element={<Privacy />} />
        <Route path="/zh/privacy" element={<Privacy />} />
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
      <HapikoGuide />
    </BrowserRouter>
  );
};

export default App;