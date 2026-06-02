/* BARRA DE NAVEGACION LATERAL CON RUTAS INTERNAS */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Sidebar.css";

const navItems = [
  { id: "calendario", label: "CALENDARIO MANTENIMIENTOS", path: "/calendario" },
  { id: "directorio", label: "DIRECTORIO EMPRESAS", path: "/directorio" },
  { id: "catalogo", label: "CATÁLOGO DE PÓLIZAS", path: "/polizas" },
  { id: "servicios", label: "CATÁLOGO DE SERVICIOS", path: "/servicios" },
  { id: "incidencias", label: "INCIDENCIAS", path: "/incidencias" },
  { id: "historial", label: "HISTORIAL DE INCIDENCIAS", path: "/historial" },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">P</div>
          <span className="sidebar-logo-text">PólizasPanel</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "sidebar-nav-item--active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">A</div>
            <div>
              <div className="sidebar-user-name">Admin</div>
              <div className="sidebar-user-role">Administrador</div>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
