import { useState } from "react";
import { useHistorial } from "../services/useIncidencias.js";
import "../css/HistorialIncidencias.css";

export default function HistorialIncidencias() {
  const [search, setSearch] = useState("");
  const [filterModalidad, setFilterModalidad] = useState("Todos");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { historial, loading, error } = useHistorial({
    search,
    clasificacion: filterModalidad,
  });

  if (error)
    return (
      <div className="hi-table-empty" style={{ color: "#ef4444" }}>
        Error: {error}
      </div>
    );

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
          Total clausurados: <strong>{historial.length}</strong>
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
              <th>Fecha cierre</th>
              <th>Técnico</th>
              <th className="hi-text-right">SLA Solución</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="hi-table-empty">
                  Cargando historial...
                </td>
              </tr>
            ) : historial.length === 0 ? (
              <tr>
                <td colSpan="7" className="hi-table-empty">
                  No se encontraron folios resueltos en el historial de
                  auditoría.
                </td>
              </tr>
            ) : (
              historial.map((ticket) => (
                <tr
                  key={ticket.ticket}
                  className="hi-table-row-clickable"
                  onClick={() => setSelectedTicket(ticket)}
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
                      {ticket.clasificacion}
                    </span>
                  </td>
                  <td className="hi-td-date">
                    {ticket.fechaCierre
                      ? new Date(ticket.fechaCierre).toLocaleDateString(
                          "es-MX",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </td>
                  <td className="hi-td-tech">
                    {ticket.tecnicoAsignado || "—"}
                  </td>
                  <td className="hi-text-right hi-td-sla">
                    {ticket.cierre?.slaSolucionHoras
                      ? `${ticket.cierre.slaSolucionHoras} hrs`
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {selectedTicket && (
        <div className="hi-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="hi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hi-modal-header">
              <div>
                <p className="hi-modal-meta">
                  {selectedTicket.ticket} •{" "}
                  {selectedTicket.polizaAsociada || "Póliza no especificada"}
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
                <label className="hi-modal-label">Problema reportado</label>
                <p className="hi-modal-text">{selectedTicket.descripcion}</p>
              </div>

              {selectedTicket.clasificacion?.toLowerCase() === "remota" && (
                <div className="hi-modal-section">
                  <label className="hi-modal-label">Acceso Remoto</label>
                  <div
                    className="hi-solucion-box"
                    style={{
                      background: "#fff7ef",
                      borderColor: "#fee8db",
                      color: "#af4c1e",
                      fontWeight: 600,
                    }}
                  >
                    AnyDesk:{" "}
                    {selectedTicket.anydesk_id ||
                      selectedTicket.anydeskId ||
                      "No registrado"}
                  </div>
                </div>
              )}

              <div className="hi-modal-section">
                <label className="hi-modal-label">
                  Solución técnica aplicada
                </label>
                <div className="hi-solucion-box">
                  {selectedTicket.cierre?.solucionAplicada ||
                    "Sin descripción de solución registrada."}
                </div>
              </div>

              <div className="hi-modal-section">
                <label className="hi-modal-label">
                  Métricas de rendimiento
                </label>
                <div className="hi-kpi-grid">
                  <div className="hi-kpi-card">
                    <span className="hi-kpi-lbl">SLA Respuesta</span>
                    <span className="hi-kpi-val">
                      {selectedTicket.cierre?.slaRespuestaHoras
                        ? `${selectedTicket.cierre.slaRespuestaHoras} hrs`
                        : "—"}
                    </span>
                  </div>
                  <div className="hi-kpi-card">
                    <span className="hi-kpi-lbl">SLA Solución</span>
                    <span className="hi-kpi-val hi-kpi-val--blue">
                      {selectedTicket.cierre?.slaSolucionHoras
                        ? `${selectedTicket.cierre.slaSolucionHoras} hrs`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Datos de cita si fue presencial */}
              {selectedTicket.clasificacion?.toLowerCase() === "presencial" &&
                selectedTicket.cita && (
                  <div className="hi-modal-section">
                    <label className="hi-modal-label">
                      Datos de la visita presencial
                    </label>
                    <div
                      className="hi-solucion-box"
                      style={{ fontSize: ".85rem" }}
                    >
                      📅 {selectedTicket.cita.fecha_cita} a las{" "}
                      {selectedTicket.cita.hora_cita}
                      <br />
                      📍 {selectedTicket.cita.direccion || "—"}
                      <br />
                      👤 {selectedTicket.cita.contacto || "—"} ·{" "}
                      {selectedTicket.cita.telefono || "—"}
                    </div>
                  </div>
                )}
            </div>

            <div className="hi-modal-footer">
              <button
                className="hi-btn-close"
                onClick={() => setSelectedTicket(null)}
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
