import { useState } from "react";
import Swal from "sweetalert2";
import { useIncidencias } from "../services/useIncidencias.js";
import "../css/GestionIncidencias.css";

const ESTATUS_OPCIONES = ["Todos", "Abierto", "En Proceso"];

export default function GestionIncidencias() {
  const [filterEstatus, setFilterEstatus] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [solucionText, setSolucionText] = useState("");
  const [slaRespuesta, setSlaRespuesta] = useState("");
  const [slaSolucion, setSlaSolucion] = useState("");
  const [jsonVisible, setJsonVisible] = useState(false);
  const [botPayload, setBotPayload] = useState(null);

  const {
    incidencias,
    loading,
    error,
    cerrar,
    cambiarEstatus,
    eliminar,
    actualizarLocal,
  } = useIncidencias({ estatus: filterEstatus, search });

  const filteredTickets = incidencias.filter((t) => {
    if (filterEstatus === "Todos") {
      return t.estatus !== "Solucionado" && t.estatus !== "No Solucionado";
    }
    return t.estatus === filterEstatus;
  });

  const handleCerrarTicket = async () => {
    if (!solucionText.trim()) return;

    const resultado = await cerrar(selectedTicket.id, {
      solucionAplicada: solucionText.trim(),
      slaRespuestaHoras: slaRespuesta || null,
      slaSolucionHoras: slaSolucion || null,
    });

    if (!resultado) return;

    setBotPayload(resultado.botPayload);
    setJsonVisible(true);
    setSelectedTicket(null);
    setSolucionText("");
    setSlaRespuesta("");
    setSlaSolucion("");

    Swal.fire({
      title: "Ticket cerrado",
      text: `${resultado.incidencia.ticket} — solución registrada correctamente.`,
      icon: "success",
      confirmButtonColor: "#3b82f6",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const handleCopiarJson = () => {
    navigator.clipboard.writeText(JSON.stringify(botPayload, null, 2));
    Swal.fire({
      title: "Copiado",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  if (loading) return <div className="inc-empty">Cargando incidencias...</div>;
  if (error)
    return (
      <div className="inc-empty" style={{ color: "#ef4444" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="inc-container">
      <div className="inc-header-view">
        <h1 className="inc-title">Mesa de Control de Incidencias</h1>
        <p className="inc-subtitle">
          Monitoreo y despacho operativo de solicitudes de servicio
        </p>
      </div>

      {/* Toolbar */}
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

      {/* Grid de tarjetas */}
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
                    Afectado: <strong>{ticket.usuarioAfectado || "—"}</strong>
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
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setSolucionText("");
                  }}
                >
                  Gestionar Cierre
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de gestión */}
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

              <div className="inc-modal-section">
                <label className="inc-modal-label">
                  Resolución técnica <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  className="inc-modal-textarea"
                  placeholder="Describe los pasos aplicados para solucionar la falla..."
                  rows={4}
                  value={solucionText}
                  onChange={(e) => setSolucionText(e.target.value)}
                />
              </div>

              {/* SLA — opcionales pero recomendados */}
              <div className="inc-modal-sla-row">
                <div className="inc-modal-section" style={{ flex: 1 }}>
                  <label className="inc-modal-label">SLA Respuesta (hrs)</label>
                  <input
                    className="inc-modal-input"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Ej. 0.5"
                    value={slaRespuesta}
                    onChange={(e) => setSlaRespuesta(e.target.value)}
                  />
                </div>
                <div className="inc-modal-section" style={{ flex: 1 }}>
                  <label className="inc-modal-label">SLA Solución (hrs)</label>
                  <input
                    className="inc-modal-input"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Ej. 3.5"
                    value={slaSolucion}
                    onChange={(e) => setSlaSolucion(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="inc-modal-footer">
              <button
                className="inc-btn-cancel"
                onClick={() => setSelectedTicket(null)}
              >
                Volver
              </button>
              <button
                className="inc-btn-submit"
                disabled={!solucionText.trim()}
                onClick={handleCerrarTicket}
              >
                Emitir Ticket y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
