/* ENRUTADOR PRINCIPAL DEL CRM */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

function PrivateLayout() {
  const { user, loading } = useAuth();

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

  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function AppShell() {
  const {
    servicios,
    crear: crearServicio,
    actualizar: actualizarServicio,
    eliminar: eliminarServicio,
  } = useServicios();
  const { filteredData: polizasAgrupadas } = usePolicies("", "Todos");
  const catalogoPolizas = Object.values(polizasAgrupadas).flat();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/calendario" replace />} />
          <Route
            path="/directorio"
            element={<DirectorioEmpresas catalogoPolizas={catalogoPolizas} />}
          />
          <Route path="/calendario" element={<CalendarView />} />
          <Route
            path="/servicios"
            element={
              <CatalogoServicios
                servicios={servicios}
                onCrear={crearServicio}
                onActualizar={actualizarServicio}
                onEliminar={eliminarServicio}
              />
            }
          />
          <Route
            path="/polizas"
            element={<CatalogoPolicies catalogoServicios={servicios} />}
          />
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
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPublica />} />
          <Route path="/*" element={<PrivateLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function LoginPublica() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
}
