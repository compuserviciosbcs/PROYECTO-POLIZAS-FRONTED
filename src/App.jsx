/* ENRUTADOR PRINCIPAL DEL CRM */
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import CatalogoPolicies from "./components/CatalogoPolicies.jsx";
import CatalogoServicios from "./components/CatalogoServicios.jsx";
import CalendarView from "./components/CalendarView.jsx";
import DirectorioEmpresas from "./components/DirectorioEmpresas.jsx";
import GestionIncidencias from "./components/GestionIncidencias.jsx";
import HistorialIncidencias from "./components/HistorialIncidencias.jsx";
import { useServicios } from "./services/useServicios.js";
import { usePolicies } from "./services/usePolicies.js";
import { initialIncidencias } from "./data/incidencias.js";
import "./App.css";

export default function App() {
  const [incidencias, setIncidencias] = useState(initialIncidencias);

  const {
    servicios,
    crear: crearServicio,
    actualizar: actualizarServicio,
    eliminar: eliminarServicio,
  } = useServicios();

  const { filteredData: polizasAgrupadas } = usePolicies("", "Todos");
  const catalogoPolizas = Object.values(polizasAgrupadas).flat();

  return (
    <Router>
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

            <Route
              path="/incidencias"
              element={
                <GestionIncidencias
                  incidencias={incidencias}
                  onUpdate={setIncidencias}
                />
              }
            />

            <Route
              path="/historial"
              element={
                <HistorialIncidencias
                  incidencias={incidencias}
                  onUpdate={setIncidencias}
                />
              }
            />

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
    </Router>
  );
}
