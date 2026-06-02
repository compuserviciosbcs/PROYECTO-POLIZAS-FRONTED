/* VISTA DETALLADA DE CADA EMPRESA */
import { useState } from "react";
import Swal from "sweetalert2";
import "../css/EmpresaExpediente.css";

const TABS = [
  { id: "info", label: "Información general" },
  { id: "usuarios", label: "Usuarios" },
  { id: "polizas", label: "Pólizas vinculadas" },
  { id: "incidencias", label: "Historial de incidencias" },
  { id: "cambios", label: "Bitácora de cambios" },
];

const ESTATUS_CONFIG = {
  abierto: { bg: "#fee2e2", text: "#b91c1c", label: "Abierto" },
  pendiente: { bg: "#fef3c7", text: "#92400e", label: "Pendiente" },
  solucionado: { bg: "#dcfce7", text: "#166534", label: "Solucionado" },
  "no solucionado": { bg: "#f3f4f6", text: "#6b7280", label: "No solucionado" },
};

const CAMBIO_CONFIG = {
  Alta: { bg: "#dcfce7", text: "#166534" },
  Baja: { bg: "#fee2e2", text: "#b91c1c" },
  Modificación: { bg: "#eff6ff", text: "#1d4ed8" },
  Renovación: { bg: "#faf5ff", text: "#6b21a8" },
};

function UsuarioFormModal({ usuario, onClose, onSave }) {
  const isEditing = !!usuario;
  const [form, setForm] = useState(
    isEditing
      ? { ...usuario }
      : { nombre: "", cargo: "", email: "", telefono: "" },
  );
  const [errors, setErrors] = useState({});

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.email.trim()) e.email = "Requerido";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({ ...form, isEditing });
  };

  return (
    <div className="uf-overlay" onClick={onClose}>
      <div className="uf-card" onClick={(e) => e.stopPropagation()}>
        <div className="uf-header">
          <h2 className="uf-title">
            {isEditing ? "Editar usuario" : "Añadir usuario"}
          </h2>
          <button className="uf-close" onClick={onClose}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="uf-body">
          {[
            { f: "nombre", l: "Nombre completo", p: "Ej. Juan Pérez", r: true },
            { f: "cargo", l: "Cargo", p: "Ej. Gerente TI" },
            { f: "email", l: "Email", p: "correo@empresa.mx", r: true },
            { f: "telefono", l: "Teléfono", p: "(664) 000-0000" },
          ].map(({ f, l, p, r }) => (
            <div key={f} className="uf-field">
              <label className="uf-label">
                {l}
                {r && <span className="uf-req"> *</span>}
              </label>
              <input
                className={`uf-input ${errors[f] ? "uf-input--error" : ""}`}
                placeholder={p}
                value={form[f] || ""}
                onChange={(e) => set(f, e.target.value)}
              />
              {errors[f] && <span className="uf-error">{errors[f]}</span>}
            </div>
          ))}
        </div>
        <div className="uf-footer">
          <button className="uf-btn uf-btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="uf-btn uf-btn--primary" onClick={handleSubmit}>
            {isEditing ? "Guardar" : "Añadir"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmpresaExpediente({
  empresa,
  onBack,
  onUpdateEmpresa,
}) {
  const [tab, setTab] = useState("info");
  const [usuarioModal, setUsuarioModal] = useState(null);

  const update = (patch) => onUpdateEmpresa({ ...empresa, ...patch });

  const handleSaveUsuario = ({ isEditing, ...u }) => {
    if (isEditing) {
      update({
        usuarios: empresa.usuarios.map((x) => (x.id === u.id ? u : x)),
      });
    } else {
      const newId = Math.max(0, ...empresa.usuarios.map((x) => x.id)) + 1;
      update({ usuarios: [...empresa.usuarios, { ...u, id: newId }] });
    }
    setUsuarioModal(null);
  };

  const handleDeleteUsuario = (u) => {
    Swal.fire({
      title: "¿Eliminar usuario?",
      html: `<p style="color:#6b7280;font-size:.9rem">Se eliminará a <strong>${u.nombre}</strong>.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((r) => {
      if (r.isConfirmed)
        update({ usuarios: empresa.usuarios.filter((x) => x.id !== u.id) });
    });
  };

  const renderInfo = () => (
    <div className="exp-info-grid">
      {[
        { label: "Razón social", value: empresa.nombre },
        { label: "RFC", value: empresa.rfc },
        { label: "Giro", value: empresa.giro },
        { label: "Contacto principal", value: empresa.contactoPrincipal },
        { label: "Teléfono", value: empresa.telefono },
        { label: "Email", value: empresa.email },
        { label: "Sitio web", value: empresa.sitio },
        { label: "Dirección", value: empresa.direccion, full: true },
      ].map(({ label, value, full }) => (
        <div
          key={label}
          className={`exp-info-item ${full ? "exp-info-item--full" : ""}`}
        >
          <span className="exp-info-label">{label}</span>
          <span className="exp-info-value">{value || "—"}</span>
        </div>
      ))}
      <div className="exp-info-item">
        <span className="exp-info-label">Estatus</span>
        <span
          className={`status-pill ${empresa.estatus === "activo" ? "status-pill--active" : "status-pill--inactive"}`}
        >
          <span
            className={
              empresa.estatus === "activo"
                ? "status-dot-active"
                : "status-dot-inactive"
            }
          />
          {empresa.estatus === "activo" ? "Activa" : "Inactiva"}
        </span>
      </div>
    </div>
  );

  const renderUsuarios = () => (
    <div>
      <div className="exp-section-toolbar">
        <p className="exp-section-count">
          {empresa.usuarios.length} usuario
          {empresa.usuarios.length !== 1 ? "s" : ""} registrados
        </p>
        <button
          className="btn-add btn-add--sm"
          onClick={() => setUsuarioModal({})}
        >
          <span>+</span> Añadir usuario
        </button>
      </div>
      {empresa.usuarios.length === 0 ? (
        <div className="exp-empty">Sin usuarios registrados.</div>
      ) : (
        <div className="exp-users-grid">
          {empresa.usuarios.map((u) => (
            <div key={u.id} className="exp-user-card">
              <div className="exp-user-avatar">{u.nombre.charAt(0)}</div>
              <div className="exp-user-info">
                <p className="exp-user-nombre">{u.nombre}</p>
                <p className="exp-user-cargo">{u.cargo || "—"}</p>
                <p className="exp-user-email">{u.email}</p>
                <p className="exp-user-tel">{u.telefono || "—"}</p>
              </div>
              <div className="exp-user-actions">
                <button
                  className="action-btn action-btn--edit"
                  onClick={() => setUsuarioModal({ usuario: u })}
                >
                  Editar
                </button>
                <button
                  className="action-btn action-btn--delete"
                  onClick={() => handleDeleteUsuario(u)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {usuarioModal && (
        <UsuarioFormModal
          usuario={usuarioModal.usuario}
          onClose={() => setUsuarioModal(null)}
          onSave={handleSaveUsuario}
        />
      )}
    </div>
  );

  const renderPolizas = () => (
    <div>
      {empresa.polizas.length === 0 ? (
        <div className="exp-empty">Sin pólizas vinculadas.</div>
      ) : (
        <div className="exp-table-wrap">
          <div className="exp-table">
            <div className="exp-table-header exp-table-header--polizas">
              <span>Póliza</span>
              <span>Tipo</span>
              <span>Precio</span>
              <span>Vigencia</span>
              <span>Vencimiento</span>
              <span>Estatus</span>
            </div>
            {empresa.polizas.map((p) => (
              <div key={p.id} className="exp-table-row exp-table-row--polizas">
                <span className="exp-col-bold">{p.nombre}</span>
                <span className="exp-col-muted">{p.tipo}</span>
                <span className="exp-col-price">{p.precio}</span>
                <span className="exp-col-muted">{p.vigencia}</span>
                <span className="exp-col-muted">{p.vencimiento}</span>
                <span>
                  <span
                    className={`status-pill ${p.activa ? "status-pill--active" : "status-pill--inactive"}`}
                  >
                    <span
                      className={
                        p.activa ? "status-dot-active" : "status-dot-inactive"
                      }
                    />
                    {p.activa ? "Vigente" : "Vencida"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderIncidencias = () => (
    <div>
      {empresa.incidencias.length === 0 ? (
        <div className="exp-empty">Sin incidencias registradas.</div>
      ) : (
        <div className="exp-table-wrap">
          <div className="exp-table">
            <div className="exp-table-header exp-table-header--inc">
              <span>Ticket</span>
              <span>Asunto</span>
              <span>Técnico</span>
              <span>Fecha</span>
              <span>Estatus</span>
            </div>
            {empresa.incidencias.map((inc, i) => {
              const cfg =
                ESTATUS_CONFIG[inc.estatus] || ESTATUS_CONFIG["abierto"];
              return (
                <div
                  key={i}
                  className={`exp-table-row exp-table-row--inc ${i % 2 === 0 ? "exp-row--even" : ""}`}
                >
                  <span className="exp-ticket">{inc.ticket}</span>
                  <span className="exp-col-bold">{inc.asunto}</span>
                  <span className="exp-col-muted">{inc.tecnico}</span>
                  <span className="exp-col-muted">{inc.fecha}</span>
                  <span>
                    <span
                      className="exp-estatus-badge"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      {cfg.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderCambios = () => (
    <div>
      {empresa.cambios.length === 0 ? (
        <div className="exp-empty">Sin cambios registrados.</div>
      ) : (
        <div className="exp-timeline">
          {empresa.cambios.map((c, i) => {
            const cfg = CAMBIO_CONFIG[c.tipo] || {
              bg: "#f3f4f6",
              text: "#6b7280",
            };
            return (
              <div key={i} className="exp-timeline-item">
                <div className="exp-timeline-dot" />
                {i < empresa.cambios.length - 1 && (
                  <div className="exp-timeline-line" />
                )}
                <div className="exp-timeline-content">
                  <div className="exp-timeline-top">
                    <span
                      className="exp-cambio-badge"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      {c.tipo}
                    </span>
                    <span className="exp-timeline-fecha">{c.fecha}</span>
                  </div>
                  <p className="exp-timeline-desc">{c.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const tabContent = {
    info: renderInfo,
    usuarios: renderUsuarios,
    polizas: renderPolizas,
    incidencias: renderIncidencias,
    cambios: renderCambios,
  };

  return (
    <div className="exp-container">
      {/* Breadcrumb */}
      <div className="exp-breadcrumb">
        <button className="exp-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M13 16l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Directorio
        </button>
        <span className="exp-breadcrumb-sep">›</span>
        <span className="exp-breadcrumb-current">{empresa.nombre}</span>
      </div>

      {/* Header empresa */}
      <div className="exp-header-card">
        <div className="exp-header-avatar">{empresa.nombre.charAt(0)}</div>
        <div className="exp-header-info">
          <div className="exp-header-top">
            <h1 className="exp-header-nombre">{empresa.nombre}</h1>
            <span
              className={`status-pill ${empresa.estatus === "activo" ? "status-pill--active" : "status-pill--inactive"}`}
            >
              <span
                className={
                  empresa.estatus === "activo"
                    ? "status-dot-active"
                    : "status-dot-inactive"
                }
              />
              {empresa.estatus === "activo" ? "Activa" : "Inactiva"}
            </span>
          </div>
          <div className="exp-header-meta">
            <span>{empresa.rfc}</span>
            <span className="exp-meta-sep">·</span>
            <span>{empresa.giro}</span>
            <span className="exp-meta-sep">·</span>
            <span>{empresa.contactoPrincipal}</span>
          </div>
        </div>
        <div className="exp-header-kpis">
          <div className="exp-header-kpi">
            <span className="exp-kpi-val">
              {empresa.polizas.filter((p) => p.activa).length}
            </span>
            <span className="exp-kpi-lbl">Pólizas activas</span>
          </div>
          <div className="exp-header-kpi">
            <span className="exp-kpi-val">{empresa.usuarios.length}</span>
            <span className="exp-kpi-lbl">Usuarios</span>
          </div>
          <div className="exp-header-kpi">
            <span className="exp-kpi-val">{empresa.incidencias.length}</span>
            <span className="exp-kpi-lbl">Tickets totales</span>
          </div>
          <div className="exp-header-kpi">
            <span className="exp-kpi-val exp-kpi-val--orange">
              {
                empresa.incidencias.filter(
                  (i) => i.estatus === "abierto" || i.estatus === "pendiente",
                ).length
              }
            </span>
            <span className="exp-kpi-lbl">Tickets abiertos</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="exp-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`exp-tab ${tab === t.id ? "exp-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido del tab */}
      <div className="exp-tab-content">{tabContent[tab]?.()}</div>
    </div>
  );
}
