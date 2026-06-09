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
import { initialEmpresas } from "./data/empresas.js";
import { initialIncidencias } from "./data/incidencias.js";
import "./App.css";

export default function App() {
  const { servicios, crear, actualizar, eliminar } = useServicios();

  const [empresas, setEmpresas] = useState(initialEmpresas);
  const [incidencias, setIncidencias] = useState(initialIncidencias);

  return (
    <Router>
      <div className="app-layout">
        <Sidebar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/calendario" replace />} />

            <Route
              path="/directorio"
              element={
                <DirectorioEmpresas
                  empresas={empresas}
                  onUpdate={setEmpresas}
                />
              }
            />

            <Route path="/calendario" element={<CalendarView />} />

            <Route
              path="/servicios"
              element={
                <CatalogoServicios
                  servicios={servicios}
                  onCrear={crear}
                  onActualizar={actualizar}
                  onEliminar={eliminar}
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
                  empresas={empresas}
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
