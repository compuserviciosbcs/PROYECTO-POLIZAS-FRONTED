/* ENRUTADOR PRINCIPAL DEL CRM */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./components/LoginPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import CatalogoPolicies from "./components/CatalogoPolicies.jsx";
import CatalogoServicios from "./components/CatalogoServicios.jsx";
import CalendarView from "./components/CalendarView.jsx";
import DirectorioEmpresas from "./components/DirectorioEmpresas.jsx";
import GestionIncidencias from "./components/GestionIncidencias.jsx";
import HistorialIncidencias from "./components/HistorialIncidencias.jsx";
import { useServicios } from "./services/useServicios.js";
import { usePolicies } from "./services/usePolicies.js";
import "./App.css";

function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#9ca3af",
          fontFamily: "DM Sans,sans-serif",
        }}
      >
        Cargando...
      </div>
    );

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}

function LoginPublica() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (user)
    return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
  return <LoginPage />;
}

function AppShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

function ServiciosPage() {
  const { servicios, crear, actualizar, eliminar } = useServicios();
  return (
    <CatalogoServicios
      servicios={servicios}
      onCrear={crear}
      onActualizar={actualizar}
      onEliminar={eliminar}
    />
  );
}

function PolizasPage() {
  const { servicios } = useServicios();
  return <CatalogoPolicies catalogoServicios={servicios} />;
}

function DirectorioPage() {
  const { filteredData: polizasAgrupadas } = usePolicies("", "Todos");
  const catalogoPolizas = Object.values(polizasAgrupadas).flat();
  return <DirectorioEmpresas catalogoPolizas={catalogoPolizas} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPublica />} />

          <Route element={<PrivateRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/calendario" replace />} />
              <Route path="/calendario" element={<CalendarView />} />
              <Route path="/directorio" element={<DirectorioPage />} />
              <Route path="/servicios" element={<ServiciosPage />} />
              <Route path="/polizas" element={<PolizasPage />} />
              <Route path="/incidencias" element={<GestionIncidencias />} />
              <Route path="/historial" element={<HistorialIncidencias />} />
              <Route
                path="*"
                element={
                  <div className="placeholder-screen">
                    <p>404 - Vista no encontrada</p>
                  </div>
                }
              />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
