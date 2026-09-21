/* VISTA DETALLADA DE CADA EMPRESA */
import { useState } from "react";
import Swal from "sweetalert2";
import ReporteModal from "./ReporteModal";
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
  Modificacion: { bg: "#eff6ff", text: "#1d4ed8" },
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

function VincularPolizaModal({ catalogoPolizas = [], onClose, onSave }) {
  const [form, setForm] = useState({
    poliza_id: "",
    vigencia: "",
    vencimiento: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.poliza_id) e.poliza_id = "Selecciona una póliza";
    if (!form.vigencia) e.vigencia = "Requerido";
    if (!form.vencimiento) e.vencimiento = "Requerido";
    if (form.vigencia && form.vencimiento && form.vencimiento <= form.vigencia)
      e.vencimiento = "Debe ser posterior a la vigencia";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    await onSave({
      poliza_id: Number(form.poliza_id),
      vigencia: form.vigencia,
      vencimiento: form.vencimiento,
    });
    setSaving(false);
  };

  const preview = catalogoPolizas.find((p) => p.id === Number(form.poliza_id));

  return (
    <div className="uf-overlay" onClick={onClose}>
      <div className="uf-card uf-card--md" onClick={(e) => e.stopPropagation()}>
        <div className="uf-header">
          <div>
            <p className="uf-modal-sub">Expediente de empresa</p>
            <h2 className="uf-title">Vincular póliza</h2>
          </div>
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
          <div className="uf-field">
            <label className="uf-label">
              Póliza del catálogo <span className="uf-req">*</span>
            </label>
            <select
              className={`uf-input uf-select ${errors.poliza_id ? "uf-input--error" : ""}`}
              value={form.poliza_id}
              onChange={(e) => set("poliza_id", e.target.value)}
            >
              <option value="">Seleccionar póliza...</option>
              {catalogoPolizas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {p.tipo}
                </option>
              ))}
            </select>
            {errors.poliza_id && (
              <span className="uf-error">{errors.poliza_id}</span>
            )}
          </div>

          {preview && (
            <div className="vp-preview">
              <div className="vp-preview-row">
                <span className="vp-preview-nombre">{preview.nombre}</span>
              </div>
              <div className="vp-preview-row">
                <span className="vp-preview-meta">
                  SLA resp: {preview.sla_respuesta || "—"}
                </span>
                <span className="vp-preview-meta">
                  SLA sol: {preview.sla_solucion || "—"}
                </span>
                <span className="vp-preview-meta">
                  {preview.duracion || ""}
                </span>
              </div>
            </div>
          )}

          <div className="uf-row">
            <div className="uf-field uf-field--grow">
              <label className="uf-label">
                Vigencia desde <span className="uf-req">*</span>
              </label>
              <input
                type="date"
                className={`uf-input ${errors.vigencia ? "uf-input--error" : ""}`}
                value={form.vigencia}
                onChange={(e) => set("vigencia", e.target.value)}
              />
              {errors.vigencia && (
                <span className="uf-error">{errors.vigencia}</span>
              )}
            </div>
            <div className="uf-field uf-field--grow">
              <label className="uf-label">
                Vencimiento <span className="uf-req">*</span>
              </label>
              <input
                type="date"
                className={`uf-input ${errors.vencimiento ? "uf-input--error" : ""}`}
                value={form.vencimiento}
                onChange={(e) => set("vencimiento", e.target.value)}
              />
              {errors.vencimiento && (
                <span className="uf-error">{errors.vencimiento}</span>
              )}
            </div>
          </div>
        </div>

        <div className="uf-footer">
          <button
            className="uf-btn uf-btn--secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="uf-btn uf-btn--primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Vinculando..." : "Vincular póliza"}
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
  onCrearUsuario,
  onVincularPoliza,
  catalogoPolizas = [],
}) {
  const [tab, setTab] = useState("info");
  const [usuarioModal, setUsuarioModal] = useState(null);
  const [vincularModal, setVincularModal] = useState(false);
  const [reporteModal, setReporteModal] = useState(false);

  const update = (patch) => onUpdateEmpresa({ ...empresa, ...patch });

  const handleSaveUsuario = async ({ isEditing, ...u }) => {
    if (isEditing) {
      update({
        usuarios: empresa.usuarios.map((x) => (x.id === u.id ? u : x)),
      });
    } else {
      const creado = await onCrearUsuario(empresa.id, u);
      if (!creado) return;
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

  const handleVincularPoliza = async (datos) => {
    const vinculada = await onVincularPoliza(empresa.id, datos);
    if (!vinculada) return;
    update({ polizas: [...empresa.polizas, vinculada] });
    setVincularModal(false);
    Swal.fire({
      title: "Póliza vinculada",
      text: `${vinculada.nombre || "La póliza"} fue vinculada correctamente.`,
      icon: "success",
      confirmButtonColor: "#3b82f6",
      timer: 2000,
      timerProgressBar: true,
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
      <div className="exp-section-toolbar">
        <p className="exp-section-count">
          {empresa.polizas.length} póliza
          {empresa.polizas.length !== 1 ? "s" : ""} vinculadas
          {" · "}
          <span style={{ color: "#16a34a", fontWeight: 600 }}>
            {empresa.polizas.filter((p) => p.activa).length} vigente
            {empresa.polizas.filter((p) => p.activa).length !== 1 ? "s" : ""}
          </span>
        </p>
        <button
          className="btn-add btn-add--sm"
          onClick={() => setVincularModal(true)}
        >
          <span>+</span> Vincular póliza
        </button>
      </div>

      {empresa.polizas.length === 0 ? (
        <div className="exp-empty">
          Sin pólizas vinculadas. Usa el botón para asignar una del catálogo.
        </div>
      ) : (
        <div className="exp-table-wrap">
          <div className="exp-table">
            <div className="exp-table-header exp-table-header--polizas">
              <span>Póliza</span>
              <span>Tipo</span>
              <span>Vigencia</span>
              <span>Vencimiento</span>
              <span>Estatus</span>
            </div>
            {empresa.polizas.map((p) => (
              <div key={p.id} className="exp-table-row exp-table-row--polizas">
                <span className="exp-col-bold">{p.nombre}</span>
                <span className="exp-col-muted">{p.tipo}</span>
                <span className="exp-col-muted">{p.vigencia || "—"}</span>
                <span className="exp-col-muted">{p.vencimiento || "—"}</span>
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

      {vincularModal && (
        <VincularPolizaModal
          catalogoPolizas={catalogoPolizas}
          onClose={() => setVincularModal(false)}
          onSave={handleVincularPoliza}
        />
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
          {[
            {
              val: empresa.polizas.filter((p) => p.activa).length,
              lbl: "Pólizas activas",
            },
            { val: empresa.usuarios.length, lbl: "Usuarios" },
            { val: empresa.incidencias.length, lbl: "Tickets totales" },
            {
              val: empresa.incidencias.filter(
                (i) => i.estatus === "abierto" || i.estatus === "pendiente",
              ).length,
              lbl: "Tickets abiertos",
              orange: true,
            },
          ].map(({ val, lbl, orange }) => (
            <div key={lbl} className="exp-header-kpi">
              <span
                className={`exp-kpi-val ${orange ? "exp-kpi-val--orange" : ""}`}
              >
                {val}
              </span>
              <span className="exp-kpi-lbl">{lbl}</span>
            </div>
          ))}
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

      {/* Boton pdf */}
      <div className="exp-bottom-bar">
        <button
          className="btn-download-report"
          onClick={() => setReporteModal(true)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Descargar reporte
        </button>
      </div>

      {reporteModal && (
        <ReporteModal
          empresa={empresa}
          onClose={() => setReporteModal(false)}
        />
      )}
    </div>
  );
}
