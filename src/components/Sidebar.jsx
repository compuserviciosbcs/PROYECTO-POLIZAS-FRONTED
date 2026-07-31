/* BARRA DE NAVEGACION LATERAL CON RUTAS INTERNAS */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Swal from "sweetalert2";
import "../css/Sidebar.css";

const navItems = [
  { path: "/polizas", label: "CATÁLOGO DE PÓLIZAS" },
  { path: "/servicios", label: "CATÁLOGO DE SERVICIOS" },
  { path: "/directorio", label: "DIRECTORIO EMPRESAS" },
  { path: "/incidencias", label: "INCIDENCIAS" },
  { path: "/historial", label: "HISTORIAL DE INCIDENCIAS" },
  { path: "/calendario", label: "CALENDARIO MANTENIMIENTOS" },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });
    if (confirm.isConfirmed) {
      logout();
      navigate("/login");
    }
  };

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
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? "sidebar-nav-item--active" : ""}`}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.nombre?.charAt(0) ?? "A"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{user?.nombre ?? "Admin"}</div>
              <div className="sidebar-user-role">{user?.email ?? ""}</div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13 15l4-5-4-5M17 10H7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 3H5a1 1 0 00-1 1v12a1 1 0 001 1h5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}
