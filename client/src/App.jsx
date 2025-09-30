import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { handleErrorResponse } from "./utils/handleResponse";
import routes from "./lib/routes";
import PageLoader from "./components/PageLoader";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthLayout = lazy(() => import("./layout/AuthLayout"));
const MainLayout = lazy(() => import("./layout/MainLayout"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

const App = () => {
  const { verifyUser, setUser } = useAuth();
  const [isVerifying, setisVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      const hasToken = document.cookie.includes("is-logged-in");
      if (!hasToken) {
        setUser(null);
        return;
      }
      try {
        setisVerifying(true);
        const result = await verifyUser();
        if (result.success) {
          setisVerifying(false);
          if (["/", "/tracker"].includes(window.location.pathname)) {
            navigate("/dashboard", { replace: true });
          }
        } else {
          setisVerifying(false);
          setUser(null);
          return handleErrorResponse(result.message || "Verification failed.");
        }
      } catch (error) {
        setUser(null);
        setisVerifying(false);
        return handleErrorResponse(result.message || "Verification failed.");
      }
    }
    init();
  }, []);

  if (isVerifying) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/tracker" element={<AuthPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<MainLayout />}>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                route.isProtected ? (
                  <ProtectedRoute>
                    <route.component />
                  </ProtectedRoute>
                ) : (
                  <route.component />
                )
              }
            />
          ))}
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </Suspense>
  )
};

export default App;
