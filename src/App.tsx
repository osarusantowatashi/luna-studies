import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Landing from "./pages/public/Landing";
import Subjects from "./pages/public/Subjects";
import SubjectDetail from "./pages/public/SubjectDetail";
import WhyLuna from "./pages/public/WhyLuna";
import Tutors from "./pages/public/Tutors";
import Enquire from "./pages/public/Enquire";
import ArcadeLanding from "./pages/public/ArcadeLanding";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";
import Careers from "./pages/public/Careers";
import CareerDetail from "./pages/public/CareerDetail";

import Auth from "./pages/auth/Auth";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAssign = lazy(() => import("./pages/admin/AdminAssign"));
const AdminEnquiries = lazy(() => import("./pages/admin/AdminEnquiries"));
const AdminLessons = lazy(() => import("./pages/admin/AdminLessons"));
const AdminProgress = lazy(() => import("./pages/admin/AdminProgress"));

const GenerateHome = lazy(() => import("./pages/admin/generate/GenerateHome"));
const EnglishGenerator = lazy(() => import("./pages/admin/generate/EnglishGenerator"));
const MemoryFlipGenerator = lazy(() => import("./pages/admin/generate/MemoryFlipGenerator"));
const JapaneseGenerator = lazy(() => import("./pages/admin/generate/JapaneseGenerator"));
const MathGenerator = lazy(() => import("./pages/admin/generate/MathGenerator"));

const GameManagement = lazy(() => import("./pages/admin/games/GameManagement"));
const MemoryFlipManager = lazy(() => import("./pages/admin/games/MemoryFlipManager"));

const QuestionBankHome = lazy(() => import("./pages/admin/questions/QuestionBankHome"));
const EnglishQuestionBank = lazy(() => import("./pages/admin/questions/EnglishQuestionBank"));
const MemoryFlipBank = lazy(() => import("./pages/admin/questions/MemoryFlipBank"));
const JapaneseQuestionBank = lazy(() => import("./pages/admin/questions/JapaneseQuestionBank"));
const MathQuestionBank = lazy(() => import("./pages/admin/questions/MathQuestionBank"));

const TutorDashboard = lazy(() => import("./pages/tutor/TutorDashboard"));
const TutorLessons = lazy(() => import("./pages/tutor/TutorLessons"));

const StudentOverview = lazy(() => import("./pages/student/StudentOverview"));
const StudentLessons = lazy(() => import("./pages/student/StudentLessons"));
const Practice = lazy(() => import("./pages/student/Practice"));
const GamesArcade = lazy(() => import("./pages/student/games/GamesArcade"));
const MemoryFlip = lazy(() => import("./pages/student/games/MemoryFlip"));
const WordSearch = lazy(() => import("./pages/student/games/WordSearch"));
const WordMatch = lazy(() => import("./pages/student/games/WordMatch"));
const Mistakes = lazy(() => import("./pages/student/Mistakes"));

const Page = lazy(() => import("./pages/shared/Page"));
const NotFound = lazy(() => import("./pages/shared/NotFound"));

import Layout from "./pages/shared/Layout";
import ProtectedRoute from "./pages/shared/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import LunaMascotChat from "./components/LunaMascotChat";
import HapikoGuide from "./components/HapikoGuide";
import AuthSessionGuard from "./components/AuthSessionGuard";

const AdminPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["admin"]}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const StudentPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["admin", "student"]}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const TutorPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["admin", "tutor"]}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const RedirectJpToJa = () => {
  const location = useLocation();
  const nextPath = location.pathname.replace(/^\/jp(?=\/|$)/, "/ja");

  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthSessionGuard />

      <Suspense

        fallback={

          <div className="flex min-h-screen items-center justify-center">

            Loading...

          </div>

        }

      >

        <Routes>
          {/* Public */}
          <Route path="/jp" element={<RedirectJpToJa />} />
          <Route path="/jp/*" element={<RedirectJpToJa />} />

          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/:lang" element={<Layout><Landing /></Layout>} />

          <Route path="/:lang/auth" element={<Auth />} />
          <Route path="/:lang/login" element={<Login />} />
          <Route path="/:lang/forgot-password" element={<ForgotPassword />} />
          <Route path="/:lang/reset-password" element={<ResetPassword />} />

          <Route path="/:lang/subjects" element={<Layout><Subjects /></Layout>} />
          <Route path="/:lang/subjects/:slug" element={<Layout><SubjectDetail /></Layout>} />
          <Route path="/:lang/whyluna" element={<Layout><WhyLuna /></Layout>} />
          <Route path="/:lang/careers" element={<Careers />} />
          <Route path="/:lang/careers/:slug" element={<CareerDetail />} />
          <Route path="/:lang/tutors" element={<Layout><Tutors /></Layout>} />
          <Route path="/:lang/arcade" element={<Layout><ArcadeLanding /></Layout>} />
          <Route path="/:lang/enquiry" element={<Layout><Enquire /></Layout>} />


          <Route path="/en/terms" element={<Terms />} />
          <Route path="/ja/terms" element={<Terms />} />
          <Route path="/zh/terms" element={<Terms />} />

          <Route path="/en/privacy" element={<Privacy />} />
          <Route path="/ja/privacy" element={<Privacy />} />
          <Route path="/zh/privacy" element={<Privacy />} />

          {/* Public Redirects */}
          <Route path="/login" element={<Navigate to="/en/login" replace />} />
          <Route path="/subjects" element={<Navigate to="/en/subjects" replace />} />
          <Route path="/whyluna" element={<Navigate to="/en/whyluna" replace />} />
          <Route path="/tutors" element={<Navigate to="/en/tutors" replace />} />
          <Route path="/arcade" element={<Navigate to="/en/arcade" replace />} />
          <Route path="/enquiry" element={<Navigate to="/en/enquiry" replace />} />



          {/* Language-prefixed App Redirects */}
          <Route path="/:lang/studentoverview" element={<Navigate to="/studentoverview" replace />} />
          <Route path="/:lang/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/:lang/practice" element={<Navigate to="/practice" replace />} />
          <Route path="/:lang/mistakes" element={<Navigate to="/mistakes" replace />} />
          <Route path="/:lang/generate" element={<Navigate to="/generate" replace />} />
          <Route path="/:lang/tutor/lessons" element={<Navigate to="/tutor/lessons" replace />} />

          <Route path="/:lang/admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/:lang/admin/assign" element={<Navigate to="/admin/assign" replace />} />
          <Route path="/:lang/admin/students" element={<Navigate to="/admin/students" replace />} />
          <Route path="/:lang/admin/questions" element={<Navigate to="/admin/questions" replace />} />
          <Route path="/:lang/admin/lessons" element={<Navigate to="/admin/lessons" replace />} />
          <Route path="/:lang/admin/enquiries" element={<Navigate to="/admin/enquiries" replace />} />
          <Route path="/:lang/admin/progress" element={<Navigate to="/admin/progress" replace />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminPage><AdminDashboard /></AdminPage>} />
          <Route path="/admin/assign" element={<AdminPage><AdminAssign /></AdminPage>} />
          <Route path="/admin/lessons" element={<AdminPage><AdminLessons /></AdminPage>} />
          <Route path="/admin/enquiries" element={<AdminPage><AdminEnquiries /></AdminPage>} />
          <Route path="/admin/progress" element={<AdminPage><AdminProgress /></AdminPage>} />

          {/* Admin Generate */}
          <Route path="/generate" element={<AdminPage><GenerateHome /></AdminPage>} />
          <Route path="/admin/generate" element={<AdminPage><GenerateHome /></AdminPage>} />
          <Route path="/admin/generate/english" element={<AdminPage><EnglishGenerator /></AdminPage>} />
          <Route path="/admin/generate/memory-flip" element={<AdminPage><MemoryFlipGenerator /></AdminPage>} />
          <Route path="/admin/generate/japanese" element={<AdminPage><JapaneseGenerator /></AdminPage>} />
          <Route path="/admin/generate/math" element={<AdminPage><MathGenerator /></AdminPage>} />

          <Route path="/generate-games" element={<Navigate to="/admin/generate/memory-flip" replace />} />
          <Route path="/admin/generate/math" element={<Navigate to="/admin/generate" replace />} />

          {/* Admin Games */}
          <Route path="/admin/games" element={<AdminPage><GameManagement /></AdminPage>} />
          <Route path="/admin/games/memory-flip" element={<AdminPage><MemoryFlipManager /></AdminPage>} />

          {/* Admin Question Banks */}
          <Route path="/admin/questions" element={<AdminPage><QuestionBankHome /></AdminPage>} />
          <Route path="/admin/questions/english" element={<AdminPage><EnglishQuestionBank /></AdminPage>} />
          <Route path="/admin/questions/games/memory-flip" element={<AdminPage><MemoryFlipBank /></AdminPage>} />
          <Route path="/admin/questions/japanese" element={<AdminPage><JapaneseQuestionBank /></AdminPage>} />
          <Route path="/admin/questions/math" element={<AdminPage><MathQuestionBank /></AdminPage>} />

          {/* Tutor */}
          <Route path="/dashboard" element={<TutorPage><TutorDashboard /></TutorPage>} />
          <Route path="/tutor/lessons" element={<TutorPage><TutorLessons /></TutorPage>} />

          {/* Student */}
          <Route path="/studentoverview" element={<StudentPage><StudentOverview /></StudentPage>} />
          <Route path="/student/lessons" element={<StudentPage><StudentLessons /></StudentPage>} />
          <Route path="/practice" element={<StudentPage><Practice /></StudentPage>} />
          <Route path="/games" element={<StudentPage><GamesArcade /></StudentPage>} />


          <Route
            path="/memory-flip"
            element={
              <ProtectedRoute allowedRoles={["admin", "student"]}>
                <MemoryFlip />
              </ProtectedRoute>
            }
          />

          <Route
            path="/word-search"
            element={
              <ProtectedRoute allowedRoles={["admin", "student"]}>
                <WordSearch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/word-match"
            element={
              <ProtectedRoute allowedRoles={["admin", "student"]}>
                <WordMatch />
              </ProtectedRoute>
            }
          />

          {/* Shared */}
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

          <Route path="*" element={<NotFound />} />
        </Routes>

      </Suspense>

      <LunaMascotChat />
      <HapikoGuide />
    </BrowserRouter>
  );
};

export default App;
