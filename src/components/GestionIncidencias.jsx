import { useState } from "react";
import "../css/GestionIncidencias.css";

const ESTATUS_OPCIONES = ["Todos", "Abierto", "En Proceso"];

export default function GestionIncidencias({
  incidencias = [],
  onUpdateIncidencias,
}) {
  const [filterEstatus, setFilterEstatus] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [solucionText, setSolucionText] = useState("");

  const filteredTickets = incidencias.filter((t) => {
    const matchEstatus =
      filterEstatus === "Todos"
        ? t.estatus !== "Solucionado"
        : t.estatus === filterEstatus;
    const q = search.toLowerCase();
    return (
      matchEstatus &&
      (!q ||
        t.ticket.toLowerCase().includes(q) ||
        t.empresaNombre.toLowerCase().includes(q) ||
        t.asunto.toLowerCase().includes(q))
    );
  });

  const handleCerrarTicket = (ticketId) => {
    if (!solucionText.trim()) return;

    const ticketOriginal = incidencias.find((t) => t.ticket === ticketId);
    const botPayload = {
      event: "INCIDENCIA_RESUELTA",
      timestamp: new Date().toISOString(),
      payload: {
        ticket: ticketId,
        empresa: ticketOriginal?.empresaNombre,
        solucion: solucionText.trim(),
        metricas: { sla_respuesta: "0.5 hrs", sla_solucion: "3.8 hrs" },
      },
    };
    console.log("Payload JSON para el Bot:", botPayload);

    if (onUpdateIncidencias) {
      onUpdateIncidencias(
        incidencias.map((t) =>
          t.ticket === ticketId
            ? {
                ...t,
                estatus: "Solucionado",
                cierre: { solucionAplicada: solucionText.trim() },
              }
            : t,
        ),
      );
    }
    setSelectedTicket(null);
    setSolucionText("");
  };

  return (
    <div className="inc-container">
      <div className="inc-header-view">
        <h1 className="inc-title">Mesa de Control de Incidencias</h1>
        <p className="inc-subtitle">
          Monitoreo y despacho operativo de solicitudes de servicio
        </p>
      </div>

      {/* Toolbar / Filtros */}
      <div className="inc-toolbar">
        <div className="inc-tabs">
          {ESTATUS_OPCIONES.map((e) => (
            <button
              key={e}
              className={`inc-tab-btn ${filterEstatus === e ? "inc-tab-btn--active" : ""}`}
              onClick={() => setFilterEstatus(e)}
            >
              {e}
            </button>
          ))}
        </div>
        <input
          className="inc-search-input"
          placeholder="Buscar por ticket, empresa o asunto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="inc-grid">
        {filteredTickets.length === 0 ? (
          <div className="inc-empty">
            No hay solicitudes en este estatus operativo.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.ticket}
              className={`inc-card inc-card--${ticket.estatus.toLowerCase().replace(" ", "")}`}
            >
              <div className="inc-card-header">
                <span className="inc-card-id">{ticket.ticket}</span>
                <span className="inc-card-type">
                  {ticket.clasificacion === "Remota" ? "Remoto" : "Presencial"}
                </span>
                <span
                  className={`inc-tag inc-tag--${ticket.estatus.toLowerCase().replace(" ", "")}`}
                >
                  {ticket.estatus}
                </span>
              </div>

              <div className="inc-card-body">
                <h4 className="inc-card-empresa">{ticket.empresaNombre}</h4>
                <p className="inc-card-asunto">{ticket.asunto}</p>
                <div className="inc-card-meta">
                  <span>
                    Afectado: <strong>{ticket.usuarioAfectado}</strong>
                  </span>
                  <span>
                    Técnico:{" "}
                    <strong>{ticket.tecnicoAsignado || "Sin asignar"}</strong>
                  </span>
                </div>
              </div>

              <div className="inc-card-footer">
                <button
                  className="inc-btn-manage"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  {ticket.estatus === "Solucionado"
                    ? "Ver Resumen"
                    : "Gestionar Cierre"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTicket && (
        <div className="inc-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="inc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inc-modal-header">
              <div>
                <p className="inc-modal-meta">
                  {selectedTicket.ticket} •{" "}
                  {selectedTicket.polizaAsociada || "Sin Póliza"}
                </p>
                <h3 className="inc-modal-title">
                  {selectedTicket.empresaNombre}
                </h3>
              </div>
              <button
                className="inc-modal-close"
                onClick={() => setSelectedTicket(null)}
              >
                &times;
              </button>
            </div>

            <div className="inc-modal-body">
              <div className="inc-modal-section">
                <label className="inc-modal-label">
                  Descripción del reporte
                </label>
                <p className="inc-modal-text">{selectedTicket.descripcion}</p>
              </div>

              {selectedTicket.estatus !== "Solucionado" ? (
                <div className="inc-modal-section">
                  <label className="inc-modal-label">
                    Resolución técnica (Obligatorio)
                  </label>
                  <textarea
                    className="inc-modal-textarea"
                    placeholder="Describe los pasos aplicados para solucionar la falla..."
                    rows={4}
                    value={solucionText}
                    onChange={(e) => setSolucionText(e.target.value)}
                  />
                </div>
              ) : (
                <div className="inc-modal-section">
                  <label className="inc-modal-label">Solución aplicada</label>
                  <div className="inc-solucion-box">
                    {selectedTicket.cierre?.solucionAplicada}
                  </div>
                </div>
              )}
            </div>

            <div className="inc-modal-footer">
              <button
                className="inc-btn-cancel"
                onClick={() => setSelectedTicket(null)}
              >
                Volver
              </button>
              {selectedTicket.estatus !== "Solucionado" && (
                <button
                  className="inc-btn-submit"
                  disabled={!solucionText.trim()}
                  onClick={() => handleCerrarTicket(selectedTicket.ticket)}
                >
                  Emitir Ticket y Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
