import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Landing from "./pages/public/Landing";
import Services from "./pages/public/Services";
import AcademicSupport from "./pages/public/AcademicSupport";
import {
  SchoolConsultingPage,
  SchoolDetailPage,
  SchoolDetailRouter,
  SchoolRegionPage,
  ServiceDetailPage,
} from "./pages/public/ServiceDetails";
import Subjects from "./pages/public/Subjects";
import SubjectDetail from "./pages/public/SubjectDetail";
import WhyLuna from "./pages/public/WhyLuna";
import Tutors from "./pages/public/Tutors";
import TutorDetail from "./pages/public/TutorDetail";
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
const LanguageQuestionGenerator = lazy(() => import("./pages/admin/generate/LanguageQuestionGenerator"));
const SharedVocabularyGenerator = lazy(() => import("./pages/admin/generate/SharedVocabularyGenerator"));
const MathGenerator = lazy(() => import("./pages/admin/generate/MathGenerator"));

const GameManagement = lazy(() => import("./pages/admin/games/GameManagement"));
const MemoryFlipManager = lazy(() => import("./pages/admin/games/MemoryFlipManager"));

const QuestionBankHome = lazy(() => import("./pages/admin/questions/QuestionBankHome"));
const MemoryFlipBank = lazy(() => import("./pages/admin/questions/MemoryFlipBank"));
const LanguageQuestionBank = lazy(() => import("./pages/admin/questions/LanguageQuestionBank"));
const MathQuestionBank = lazy(() => import("./pages/admin/questions/MathQuestionBank"));

const TutorDashboard = lazy(() => import("./pages/tutor/TutorDashboard"));
const TutorLessons = lazy(() => import("./pages/tutor/TutorLessons"));

const StudentOverview = lazy(() => import("./pages/student/StudentOverview"));
const StudentLessons = lazy(() => import("./pages/student/StudentLessons"));
const Practice = lazy(() => import("./pages/student/Practice"));
const GamesArcade = lazy(() => import("./pages/student/games/GamesArcade"));
const MemoryFlip = lazy(() => import("./pages/student/games/MemoryFlip"));
const WordSearch = lazy(() => import("./pages/student/games/WordSearch"));
const LetterMatch = lazy(() => import("./pages/student/games/LetterMatch"));
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

const RedirectServicesToEn = () => {
  const location = useLocation();

  return <Navigate to={`/en${location.pathname}${location.search}${location.hash}`} replace />;
};

const RedirectEssayWriting = () => {
  const location = useLocation();
  const nextPath = location.pathname.replace("/services/essay-writing", "/services/essay-support");

  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
};

const RedirectApplicationEssay = () => {
  const location = useLocation();
  const nextPath = location.pathname.replace("/services/application-essay", "/services/essay-support");

  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
};

const RedirectMockScreening = () => {
  const location = useLocation();
  const nextPath = location.pathname.replace("/services/mock-screening", "/services/mock-interview");

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

          <Route path="/:lang/services" element={<Layout><Services /></Layout>} />
          <Route path="/:lang/services/essay-support" element={<Layout><ServiceDetailPage pageKey="essaySupport" /></Layout>} />
          <Route path="/:lang/services/essay-writing" element={<RedirectEssayWriting />} />
          <Route path="/:lang/services/application-essay" element={<RedirectApplicationEssay />} />
          <Route path="/:lang/services/parent-interview" element={<Layout><ServiceDetailPage pageKey="parentInterview" /></Layout>} />
          <Route path="/:lang/services/mock-interview" element={<Layout><ServiceDetailPage pageKey="mockInterview" /></Layout>} />
          <Route path="/:lang/services/mock-screening" element={<RedirectMockScreening />} />
          <Route path="/:lang/services/exam-package" element={<Layout><ServiceDetailPage pageKey="examPackage" /></Layout>} />
          <Route path="/:lang/services/school-consulting" element={<Layout><SchoolConsultingPage /></Layout>} />
          <Route path="/:lang/services/school-consulting/japan" element={<Layout><SchoolRegionPage region="japan" /></Layout>} />
          <Route path="/:lang/services/school-consulting/singapore" element={<Layout><SchoolRegionPage region="singapore" /></Layout>} />
          <Route path="/:lang/services/school-consulting/japan/:schoolSlug" element={<Layout><SchoolDetailPage region="japan" /></Layout>} />
          <Route path="/:lang/services/school-consulting/singapore/:schoolSlug" element={<Layout><SchoolDetailPage region="singapore" /></Layout>} />
          <Route path="/:lang/services/school-consulting/:schoolSlug" element={<Layout><SchoolDetailRouter /></Layout>} />
          <Route path="/:lang/services/consultation" element={<Layout><ServiceDetailPage pageKey="consultation" /></Layout>} />
          <Route path="/:lang/academic-support" element={<Layout><AcademicSupport /></Layout>} />
          <Route path="/:lang/subjects" element={<Layout><Subjects /></Layout>} />
          <Route path="/:lang/subjects/:slug" element={<Layout><SubjectDetail /></Layout>} />
          <Route path="/:lang/whyluna" element={<Layout><WhyLuna /></Layout>} />
          <Route path="/:lang/careers" element={<Careers />} />
          <Route path="/:lang/careers/:slug" element={<CareerDetail />} />
          <Route path="/:lang/tutors" element={<Layout><Tutors /></Layout>} />
          <Route path="/:lang/tutors/:slug" element={<Layout><TutorDetail /></Layout>} />
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
          <Route path="/services" element={<Navigate to="/en/services" replace />} />
          <Route path="/services/essay-support" element={<Navigate to="/en/services/essay-support" replace />} />
          <Route path="/services/essay-writing" element={<Navigate to="/en/services/essay-support" replace />} />
          <Route path="/services/application-essay" element={<Navigate to="/en/services/essay-support" replace />} />
          <Route path="/services/parent-interview" element={<Navigate to="/en/services/parent-interview" replace />} />
          <Route path="/services/mock-interview" element={<Navigate to="/en/services/mock-interview" replace />} />
          <Route path="/services/mock-screening" element={<Navigate to="/en/services/mock-interview" replace />} />
          <Route path="/services/exam-package" element={<Navigate to="/en/services/exam-package" replace />} />
          <Route path="/services/school-consulting" element={<Navigate to="/en/services/school-consulting" replace />} />
          <Route path="/services/school-consulting/japan" element={<Navigate to="/en/services/school-consulting/japan" replace />} />
          <Route path="/services/school-consulting/singapore" element={<Navigate to="/en/services/school-consulting/singapore" replace />} />
          <Route path="/services/consultation" element={<Navigate to="/en/services/consultation" replace />} />
          <Route path="/services/*" element={<RedirectServicesToEn />} />
          <Route path="/academic-support" element={<Navigate to="/en/academic-support" replace />} />
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
          <Route path="/admin/generate/language" element={<AdminPage><LanguageQuestionGenerator /></AdminPage>} />
          <Route path="/admin/generate/english" element={<Navigate to="/admin/generate/language" replace />} />
          <Route path="/admin/generate/shared-vocabulary" element={<AdminPage><SharedVocabularyGenerator /></AdminPage>} />
          <Route path="/admin/generate/memory-flip" element={<Navigate to="/admin/generate/shared-vocabulary" replace />} />
          <Route path="/admin/generate/japanese" element={<Navigate to="/admin/generate/language" replace />} />
          <Route path="/admin/generate/chinese" element={<Navigate to="/admin/generate/language" replace />} />
          <Route path="/admin/generate/math" element={<AdminPage><MathGenerator /></AdminPage>} />

          <Route path="/generate-games" element={<Navigate to="/admin/generate/shared-vocabulary" replace />} />

          {/* Admin Games */}
          <Route path="/admin/games" element={<AdminPage><GameManagement /></AdminPage>} />
          <Route path="/admin/games/memory-flip" element={<AdminPage><MemoryFlipManager /></AdminPage>} />

          {/* Admin Question Banks */}
          <Route path="/admin/questions" element={<AdminPage><QuestionBankHome /></AdminPage>} />
          <Route path="/admin/questions/language" element={<AdminPage><LanguageQuestionBank /></AdminPage>} />
          <Route path="/admin/questions/english" element={<Navigate to="/admin/questions/language" replace />} />
          <Route path="/admin/questions/games/memory-flip" element={<AdminPage><MemoryFlipBank /></AdminPage>} />
          <Route path="/admin/questions/japanese" element={<Navigate to="/admin/questions/language" replace />} />
          <Route path="/admin/questions/chinese" element={<Navigate to="/admin/questions/language" replace />} />
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

          <Route path="/word-match" element={<Navigate to="/letter-match" replace />} />

          <Route
            path="/letter-match"
            element={
              <ProtectedRoute allowedRoles={["admin", "student"]}>
                <LetterMatch />
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
