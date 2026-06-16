/* VISTA GENERAL DEL DIRECTORIO DE EMPRESASS Y CRUD DE EMPRESAS */
import { useState } from "react";
import EmpresaExpediente from "./EmpresaExpediente.jsx";
import { useEmpresas } from "../services/useEmpresas.js";
import "../css/DirectorioEmpresas.css";

const GIROS = [
  "Todos",
  "Construcción",
  "Distribución",
  "Salud",
  "Agropecuario",
  "Manufactura",
  "Servicios",
  "Tecnología",
  "Comercio",
  "Turismo",
  "Otro",
];

const EMPTY_EMPRESA = {
  nombre: "",
  rfc: "",
  giro: "Servicios",
  telefono: "",
  email: "",
  sitio: "",
  direccion: "",
  contactoPrincipal: "",
  estatus: "activo",
  usuarios: [],
  polizas: [],
  incidencias: [],
  cambios: [],
};

function Field({
  label,
  field,
  placeholder,
  required,
  value,
  onChange,
  error,
}) {
  return (
    <div className="ef-field">
      <label className="ef-label">
        {label}
        {required && <span className="ef-req"> *</span>}
      </label>
      <input
        className={`ef-input ${error ? "ef-input--error" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {error && <span className="ef-error">{error}</span>}
    </div>
  );
}

function EmpresaFormModal({ empresa, onClose, onSave }) {
  const isEditing = !!empresa;
  const [form, setForm] = useState(
    isEditing ? { ...empresa } : { ...EMPTY_EMPRESA },
  );
  const [errors, setErrors] = useState({});

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.rfc.trim()) e.rfc = "Requerido";
    if (!form.email.trim()) e.email = "Requerido";
    if (!form.contactoPrincipal.trim()) e.contactoPrincipal = "Requerido";
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
    <div className="ef-overlay" onClick={onClose}>
      <div className="ef-card" onClick={(e) => e.stopPropagation()}>
        <div className="ef-header">
          <div>
            <p className="ef-header-sub">
              {isEditing ? "Modificar registro" : "Nuevo registro"}
            </p>
            <h2 className="ef-header-title">
              {isEditing ? "Editar empresa" : "Añadir empresa"}
            </h2>
          </div>
          <button className="ef-close" onClick={onClose}>
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

        <div className="ef-body">
          <p className="ef-section-lbl">Datos de la empresa</p>
          <Field
            label="Razón social"
            field="nombre"
            placeholder="Ej. Empresa S.A. de C.V."
            required
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            error={errors.nombre}
          />

          <div className="ef-row">
            <Field
              label="RFC"
              field="rfc"
              placeholder="Ej. EMP920315AB2"
              required
              value={form.rfc}
              onChange={(e) => set("rfc", e.target.value)}
              error={errors.rfc}
            />
            <div className="ef-field ef-field--grow">
              <label className="ef-label">Giro</label>
              <select
                className="ef-select"
                value={form.giro}
                onChange={(e) => set("giro", e.target.value)}
              >
                {GIROS.filter((g) => g !== "Todos").map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ef-row">
            <Field
              label="Teléfono"
              field="telefono"
              placeholder="(664) 000-0000"
              value={form.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              error={errors.telefono}
            />
            <Field
              label="Email"
              field="email"
              placeholder="contacto@empresa.mx"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
            />
          </div>

          <div className="ef-row">
            <Field
              label="Sitio web"
              field="sitio"
              placeholder="www.empresa.mx"
              value={form.sitio}
              onChange={(e) => set("sitio", e.target.value)}
              error={errors.sitio}
            />
            <Field
              label="Contacto principal"
              field="contactoPrincipal"
              placeholder="Nombre del contacto"
              required
              value={form.contactoPrincipal}
              onChange={(e) => set("contactoPrincipal", e.target.value)}
              error={errors.contactoPrincipal}
            />
          </div>

          <Field
            label="Dirección"
            field="direccion"
            placeholder="Calle, número, ciudad, estado"
            value={form.direccion}
            onChange={(e) => set("direccion", e.target.value)}
            error={errors.direccion}
          />

          <div className="ef-field">
            <label className="ef-label">Estatus</label>
            <div className="ef-toggle-row">
              <button
                className={`ef-toggle ${form.estatus === "activo" ? "ef-toggle--on" : ""}`}
                onClick={() =>
                  set(
                    "estatus",
                    form.estatus === "activo" ? "inactivo" : "activo",
                  )
                }
              >
                <span className="ef-toggle-knob" />
              </button>
              <span
                className={`ef-toggle-lbl ${form.estatus === "activo" ? "ef-toggle-lbl--active" : "ef-toggle-lbl--inactive"}`}
              >
                {form.estatus === "activo"
                  ? "Empresa activa"
                  : "Empresa inactiva"}
              </span>
            </div>
          </div>
        </div>

        <div className="ef-footer">
          <button className="ef-btn ef-btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="ef-btn ef-btn--primary" onClick={handleSubmit}>
            {isEditing ? "Guardar cambios" : "Crear empresa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DirectorioEmpresas({ catalogoPolizas = [] }) {
  const [search, setSearch] = useState("");
  const [filterGiro, setFilterGiro] = useState("Todos");
  const [filterEstatus, setFilterEstatus] = useState("Todos");
  const [formModal, setFormModal] = useState(null);
  const [expediente, setExpediente] = useState(null);

  const {
    empresas,
    loading,
    error,
    crear,
    actualizar,
    eliminar,
    cargarExpediente,
    crearUsuario,
    actualizarLocal,
    vincularPoliza,
  } = useEmpresas({ search, giro: filterGiro, estatus: filterEstatus });

  const handleSave = async ({ isEditing, ...form }) => {
    if (isEditing) {
      const actualizada = await actualizar(form.id, form);
      if (actualizada && expediente?.id === form.id) {
        setExpediente((prev) => ({ ...prev, ...actualizada }));
      }
    } else {
      await crear(form);
    }
    setFormModal(null);
  };

  const handleVerExpediente = async (emp) => {
    const completo = await cargarExpediente(emp.id);
    if (completo) setExpediente(completo);
  };

  const filtered = empresas.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.nombre.toLowerCase().includes(q) ||
      e.rfc.toLowerCase().includes(q) ||
      e.contactoPrincipal.toLowerCase().includes(q);
    const matchGiro = filterGiro === "Todos" || e.giro === filterGiro;
    const matchStatus =
      filterEstatus === "Todos" || e.estatus === filterEstatus;
    return matchSearch && matchGiro && matchStatus;
  });

  const activas = empresas.filter((e) => e.estatus === "activo").length;
  const inactivas = empresas.filter((e) => e.estatus === "inactivo").length;
  const totalPolizas = empresas.reduce(
    (a, e) => a + e.polizas.filter((p) => p.activa).length,
    0,
  );

  if (expediente) {
    return (
      <EmpresaExpediente
        empresa={expediente}
        onBack={() => setExpediente(null)}
        onEdit={(emp) => setFormModal({ empresa: emp })}
        onUpdateEmpresa={(updated) => {
          actualizarLocal(updated);
          setExpediente(updated);
        }}
        onCrearUsuario={crearUsuario}
        onVincularPoliza={vincularPoliza}
        catalogoPolizas={catalogoPolizas}
      />
    );
  }

  return (
    <div className="dir-container">
      <h1 className="dir-title">Directorio de Empresas</h1>

      {/* Stats */}
      <div className="dir-stats">
        <div className="dir-stat-card">
          <span className="dir-stat-value">{empresas.length}</span>
          <span className="dir-stat-label">Total empresas</span>
        </div>
        <div className="dir-stat-card">
          <span className="dir-stat-value dir-stat-value--green">
            {activas}
          </span>
          <span className="dir-stat-label">Activas</span>
        </div>
        <div className="dir-stat-card">
          <span className="dir-stat-value dir-stat-value--red">
            {inactivas}
          </span>
          <span className="dir-stat-label">Inactivas</span>
        </div>
        <div className="dir-stat-card">
          <span className="dir-stat-value dir-stat-value--blue">
            {totalPolizas}
          </span>
          <span className="dir-stat-label">Pólizas vigentes</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="dir-toolbar">
        <button className="btn-add" onClick={() => setFormModal({})}>
          <span className="btn-add-icon">+</span> Añadir empresa
        </button>
        <div className="dir-filters">
          <select
            className="dir-select"
            value={filterGiro}
            onChange={(e) => setFilterGiro(e.target.value)}
          >
            {GIROS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <select
            className="dir-select"
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value)}
          >
            <option value="Todos">Todos los estatus</option>
            <option value="activo">Activas</option>
            <option value="inactivo">Inactivas</option>
          </select>
        </div>
        <div className="search-wrap" style={{ flex: 1 }}>
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#9ca3af" strokeWidth="1.5" />
            <path
              d="M13.5 13.5L17 17"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="search-input"
            placeholder="Buscar por nombre, RFC o contacto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Estados de carga */}
      {loading && <div className="dir-empty">Cargando directorio...</div>}
      {!loading && error && (
        <div className="dir-empty" style={{ color: "#ef4444" }}>
          Error: {error}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="dir-grid">
          {filtered.length === 0 && (
            <div className="dir-empty">No se encontraron empresas.</div>
          )}
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="dir-card"
              onClick={() => handleVerExpediente(emp)}
            >
              <div className="dir-card-top">
                <div className="dir-card-avatar">{emp.nombre.charAt(0)}</div>
                <span
                  className={`dir-estatus-pill ${emp.estatus === "activo" ? "dir-estatus-pill--active" : "dir-estatus-pill--inactive"}`}
                >
                  <span
                    className={`dir-estatus-dot ${emp.estatus === "activo" ? "dir-estatus-dot--active" : "dir-estatus-dot--inactive"}`}
                  />
                  {emp.estatus === "activo" ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div className="dir-card-body">
                <h3 className="dir-card-nombre">{emp.nombre}</h3>
                <p className="dir-card-rfc">{emp.rfc}</p>
                <div className="dir-card-meta">
                  <span className="dir-card-giro-badge">{emp.giro}</span>
                </div>
                <div className="dir-card-info">
                  <div className="dir-info-row">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M2.5 6.5l7.5 5 7.5-5M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1z"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{emp.email}</span>
                  </div>
                  <div className="dir-info-row">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M3 5a2 2 0 012-2h1.5a.5.5 0 01.5.5v3a.5.5 0 01-.146.354L5.5 8.207A11.02 11.02 0 009.793 12.5l1.353-1.354A.5.5 0 0111.5 11h3a.5.5 0 01.5.5V13a2 2 0 01-2 2h-1C6.716 15 3 11.284 3 6V5z"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span>{emp.telefono}</span>
                  </div>
                  <div className="dir-info-row">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                      <circle
                        cx="10"
                        cy="8"
                        r="3"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span className="dir-info-dir">{emp.direccion}</span>
                  </div>
                </div>
              </div>
              <div className="dir-card-footer">
                <div className="dir-card-badges">
                  <span className="dir-mini-badge dir-mini-badge--blue">
                    {emp.polizas.filter((p) => p.activa).length} póliza
                    {emp.polizas.filter((p) => p.activa).length !== 1
                      ? "s"
                      : ""}
                  </span>
                  <span className="dir-mini-badge dir-mini-badge--gray">
                    {emp.usuarios.length} usuario
                    {emp.usuarios.length !== 1 ? "s" : ""}
                  </span>
                  <span className="dir-mini-badge dir-mini-badge--orange">
                    {emp.incidencias.length} ticket
                    {emp.incidencias.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  className="dir-card-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="action-btn action-btn--edit"
                    onClick={() => setFormModal({ empresa: emp })}
                  >
                    Editar
                  </button>
                  <button
                    className="action-btn action-btn--delete"
                    onClick={() => eliminar(emp)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formModal && (
        <EmpresaFormModal
          empresa={formModal.empresa}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
