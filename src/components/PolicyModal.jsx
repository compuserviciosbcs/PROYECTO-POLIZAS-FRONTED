/* VISTA DETALLADA DE POLIZA */
import { useEffect } from "react";
import "../css/PolicyModal.css";
import CatalogoPolicies from "./CatalogoPolicies";

export default function PolicyModal({ policy, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-badge">{policy.tipo}</div>
            <h2 className="modal-title">{policy.nombre}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* KPI row */}
          <div className="modal-kpis">
            <div className="kpi-card">
              <span className="kpi-label">Precio mensual</span>
              <span className="kpi-value kpi-value--blue">{policy.precio}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Duración</span>
              <span className="kpi-value">{policy.duracion}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">SLA Respuesta</span>
              <span className="kpi-value kpi-value--green">
                {policy.sla_respuesta}
              </span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">SLA Solución</span>
              <span className="kpi-value kpi-value--orange">
                {policy.sla_solucion}
              </span>
            </div>
          </div>

          {/* Cobertura */}
          <div className="modal-section">
            <h3 className="modal-section-title">Descripción de cobertura</h3>
            <p className="modal-section-text">{policy.cobertura}</p>
          </div>

          {/* Servicios */}
          <div className="modal-section">
            <h3 className="modal-section-title">Servicios incluidos</h3>
            <ul className="modal-services-list">
              {policy.servicios.map((s, i) => (
                <li key={i} className="modal-service-item">
                  <span className="service-check">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div className="modal-section modal-status-row">
            <span
              className={`status-pill ${policy.activa ? "status-pill--active" : "status-pill--inactive"}`}
            >
              <span
                className={
                  policy.activa ? "status-dot-active" : "status-dot-inactive"
                }
              />
              {policy.activa ? "Póliza activa" : "Póliza inactiva"}
            </span>
            <span className="modal-id-text">
              ID interno: #{policy.id.toString().padStart(4, "0")}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn modal-btn--secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
