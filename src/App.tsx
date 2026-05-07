import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Subjects from "./pages/Subjects";
import WhyLuna from "./pages/WhyLuna";
import Tutors from "./pages/Tutors";
import Enquire from "./pages/Enquire";

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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/whyluna" element={<WhyLuna />} />
        <Route path="/tutors" element={<Tutors />} />
        <Route path="/enquiry" element={<Enquire />} />

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
          path="/tutor/mistakes"
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
    </BrowserRouter>
  );
};

export default App;