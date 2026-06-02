/* MODULO IV: HISTORIAL DE INCIDENCIAS - MAQUETADO LIMPIO */
import { useState } from "react";
import { initialIncidencias } from "../data/incidencias.js";
import "../css/HistorialIncidencias.css";

export default function HistorialIncidencias({
  incidencias = initialIncidencias,
  onVerIncidencia,
}) {
  const [search, setSearch] = useState("");
  const [filterModalidad, setFilterModalidad] = useState("Todos");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const historicoSolucionados = incidencias.filter(
    (t) => t.estatus === "Solucionado",
  );

  const filteredHistorico = historicoSolucionados.filter((t) => {
    const matchModalidad =
      filterModalidad === "Todos" || t.clasificacion === filterModalidad;
    const q = search.toLowerCase();
    return (
      matchModalidad &&
      (!q ||
        t.ticket.toLowerCase().includes(q) ||
        t.empresaNombre.toLowerCase().includes(q) ||
        t.asunto.toLowerCase().includes(q) ||
        t.tecnicoAsignado.toLowerCase().includes(q))
    );
  });

  const handleRowClick = (ticket) => {
    setSelectedTicket(ticket);

    if (onVerIncidencia) onVerIncidencia(ticket);
  };

  return (
    <div className="hi-container">
      <div className="hi-header-view">
        <h1 className="hi-title">Historial de Incidencias</h1>
        <p className="hi-subtitle">
          Registro histórico de folios clausurados, soluciones y auditoría de
          SLAs
        </p>
      </div>

      <div className="hi-toolbar">
        <div className="hi-filters-left">
          <input
            className="hi-search"
            placeholder="Buscar por ticket, empresa, asunto o técnico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="hi-select"
            value={filterModalidad}
            onChange={(e) => setFilterModalidad(e.target.value)}
          >
            <option value="Todos">Todas las modalidades</option>
            <option value="Remota">Remota</option>
            <option value="Presencial">Presencial</option>
          </select>
        </div>
        <div className="hi-counter-badge">
          Total Clausurados: <strong>{filteredHistorico.length}</strong>
        </div>
      </div>

      <div className="hi-table-wrapper">
        <table className="hi-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Empresa</th>
              <th>Asunto</th>
              <th>Modalidad</th>
              <th>Fecha Cierre</th>
              <th>Técnico</th>
              <th className="hi-text-right">SLA Solución</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistorico.length === 0 ? (
              <tr>
                <td colSpan="7" className="hi-table-empty">
                  No se encontraron folios resueltos en el historial de
                  auditoría.
                </td>
              </tr>
            ) : (
              filteredHistorico.map((ticket) => (
                <tr
                  key={ticket.ticket}
                  className="hi-table-row-clickable"
                  onClick={() => handleRowClick(ticket)}
                >
                  <td className="hi-td-ticket">{ticket.ticket}</td>
                  <td className="hi-td-empresa">{ticket.empresaNombre}</td>
                  <td>
                    <div className="hi-td-asunto">{ticket.asunto}</div>
                    <div className="hi-td-subtext">
                      {ticket.usuarioAfectado}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`hi-badge-type hi-badge-type--${ticket.clasificacion.toLowerCase()}`}
                    >
                      {ticket.clasificacion === "Remota"
                        ? "Remoto"
                        : "Presencial"}
                    </span>
                  </td>
                  <td className="hi-td-date">{ticket.fechaCreacion}</td>
                  <td className="hi-td-tech">
                    {ticket.tecnicoAsignado || "—"}
                  </td>
                  <td className="hi-text-right hi-td-sla">
                    {ticket.cierre?.slaSolucionHoras
                      ? `${ticket.cierre.slaSolucionHoras} hrs`
                      : "0.5 hrs"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div className="hi-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="hi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hi-modal-header">
              <div>
                <p className="hi-modal-meta">
                  {selectedTicket.ticket} •{" "}
                  {selectedTicket.polizaAsociada || "Póliza No Especificada"}
                </p>
                <h3 className="hi-modal-title">
                  {selectedTicket.empresaNombre}
                </h3>
              </div>
              <button
                className="hi-modal-close"
                onClick={() => setSelectedTicket(null)}
              >
                &times;
              </button>
            </div>

            <div className="hi-modal-body">
              <div className="hi-modal-section">
                <label className="hi-modal-label">Problema Reportado</label>
                <p className="hi-modal-text">{selectedTicket.descripcion}</p>
              </div>

              <div className="hi-modal-section">
                <label className="hi-modal-label">
                  Solución Técnica Aplicada
                </label>
                <div className="hi-solucion-box">
                  {selectedTicket.cierre?.solucionAplicada ||
                    "Sin descripción de solución registrada."}
                </div>
              </div>

              <div className="hi-modal-section">
                <label className="hi-modal-label">
                  Métricas e Impacto de Rendimiento
                </label>
                <div className="hi-kpi-grid">
                  <div className="hi-kpi-card">
                    <span className="hi-kpi-lbl">SLA Respuesta</span>
                    <span className="hi-kpi-val">
                      {selectedTicket.cierre?.slaRespuestaHoras || "0.5"} hrs
                    </span>
                  </div>
                  <div className="hi-kpi-card">
                    <span className="hi-kpi-val--blue">SLA Solución</span>
                    <span className="hi-kpi-val">
                      {selectedTicket.cierre?.slaSolucionHoras || "3.8"} hrs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hi-modal-footer">
              <button
                className="hi-btn-close"
                onClick={() => setSelectedTicket(null)}
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
