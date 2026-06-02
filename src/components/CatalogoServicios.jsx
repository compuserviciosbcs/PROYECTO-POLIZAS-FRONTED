/* VISTA GENERAL DEL CATALOGO DE SERVICIOS - CRM PROFESSIONAL */
import { useState } from "react";
import Swal from "sweetalert2";
import { TIPOS_SERVICIO } from "../data/servicios.js";
import "../css/CatalogoServicios.css";

const TIPO_COLORS = {
  Remoto: { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" }, // Verde ejecutivo
  Presencial: { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6" }, // Azul ejecutivo
  Otros: { bg: "#f8fafc", text: "#475569", dot: "#64748b" }, // Slate
};

const EMPTY = { nombre: "", tipo: "Remoto", costo: "" };

function ServiceFormModal({ servicio, onClose, onSave }) {
  const isEditing = !!servicio;
  const [form, setForm] = useState(
    isEditing ? { ...servicio, costo: String(servicio.costo) } : { ...EMPTY },
  );
  const [errors, setErrors] = useState({});

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre del servicio es requerido";
    if (!form.costo || isNaN(Number(form.costo)) || Number(form.costo) <= 0)
      e.costo = "Ingresa un costo válido superior a $0";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({ ...form, costo: Number(form.costo), isEditing });
  };

  return (
    <div className="sf-overlay" onClick={onClose}>
      <div className="sf-card" onClick={(e) => e.stopPropagation()}>
        <div className="sf-header">
          <div>
            <p className="sf-header-sub">
              {isEditing
                ? "Modificar registro de catálogo"
                : "Nuevo registro de catálogo"}
            </p>
            <h2 className="sf-header-title">
              {isEditing ? "Editar Servicio" : "Añadir Servicio"}
            </h2>
          </div>
          <button
            className="sf-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="sf-body">
          <div className="sf-field">
            <label className="sf-label">
              Nombre del servicio <span className="sf-req">*</span>
            </label>
            <input
              className={`sf-input ${errors.nombre ? "sf-input--error" : ""}`}
              placeholder="Ej. Soporte en sitio o mantenimiento preventivo"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
            />
            {errors.nombre && <span className="sf-error">{errors.nombre}</span>}
          </div>

          <div className="sf-row">
            <div className="sf-field sf-field--grow">
              <label className="sf-label">Tipo de modalidad</label>
              <select
                className="sf-select"
                value={form.tipo}
                onChange={(e) => set("tipo", e.target.value)}
              >
                {TIPOS_SERVICIO.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="sf-field sf-field--grow">
              <label className="sf-label">
                Costo mensual (MXN) <span className="sf-req">*</span>
              </label>
              <div className="sf-input-prefix-wrap">
                <span className="sf-input-prefix">$</span>
                <input
                  className={`sf-input sf-input--prefixed ${errors.costo ? "sf-input--error" : ""}`}
                  placeholder="0.00"
                  type="number"
                  min="0"
                  value={form.costo}
                  onChange={(e) => set("costo", e.target.value)}
                />
              </div>
              {errors.costo && <span className="sf-error">{errors.costo}</span>}
            </div>
          </div>

          <div className="sf-preview">
            <span className="sf-label">Vista en interfaz (Badge):</span>
            <span
              className="sf-badge"
              style={{
                background: TIPO_COLORS[form.tipo]?.bg || "#f1f5f9",
                color: TIPO_COLORS[form.tipo]?.text || "#475569",
              }}
            >
              <span
                className="sf-badge-dot"
                style={{ background: TIPO_COLORS[form.tipo]?.dot || "#64748b" }}
              />
              {form.tipo}
            </span>
          </div>
        </div>

        <div className="sf-footer">
          <button className="sf-btn sf-btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="sf-btn sf-btn--primary" onClick={handleSubmit}>
            {isEditing ? "Guardar cambios" : "Registrar servicio"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogoServicios({ servicios, onUpdate }) {
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [formModal, setFormModal] = useState(null);

  const handleSave = ({ isEditing, ...servicio }) => {
    if (isEditing) {
      onUpdate(servicios.map((s) => (s.id === servicio.id ? servicio : s)));
    } else {
      const newId = Math.max(0, ...servicios.map((s) => s.id)) + 1;
      onUpdate([...servicios, { ...servicio, id: newId }]);
    }
    setFormModal(null);
    Swal.fire({
      title: isEditing ? "Registro Actualizado" : "Servicio Registrado",
      text: `${servicio.nombre} se guardó correctamente en el catálogo corporativo.`,
      icon: "success",
      confirmButtonColor: "#2563eb",
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const handleDelete = (s) => {
    Swal.fire({
      title: "¿Dar de baja servicio?",
      html: `<p style="color:#64748b; font-size:0.875rem">Se eliminará de forma permanente <strong style="color:#0f172a">${s.nombre}</strong> del catálogo de la organización.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((r) => {
      if (r.isConfirmed) {
        onUpdate(servicios.filter((sv) => sv.id !== s.id));
        Swal.fire({
          title: "Baja Procesada",
          text: `${s.nombre} fue removido del sistema.`,
          icon: "success",
          confirmButtonColor: "#2563eb",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  };

  const tipos = ["Todos", ...TIPOS_SERVICIO];
  const filtered = servicios.filter((s) => {
    const matchTipo = filterTipo === "Todos" || s.tipo === filterTipo;
    const matchSearch =
      !search.trim() ||
      s.nombre.toLowerCase().includes(search.toLowerCase()) ||
      s.tipo.toLowerCase().includes(search.toLowerCase());
    return matchTipo && matchSearch;
  });

  return (
    <div className="cs-container">
      <div className="cs-view-header">
        <div>
          <h1 className="cs-title">Catálogo de Servicios</h1>
          <p className="cs-subtitle">
            Administra y tarifa las soluciones y pólizas comerciales de la
            empresa
          </p>
        </div>
        <button className="btn-add" onClick={() => setFormModal({})}>
          <span className="btn-add-icon">+</span> Nuevo Servicio
        </button>
      </div>

      {/* Indicadores Ejecutivos (Stats) */}
      <div className="cs-stats">
        <div className="cs-stat-card">
          <span className="cs-stat-label">Servicios Ofertados</span>
          <span className="cs-stat-value">{servicios.length}</span>
        </div>
        <div className="cs-stat-card">
          <span className="cs-stat-label">Modalidades Activas</span>
          <span className="cs-stat-value">
            {
              TIPOS_SERVICIO.filter((t) => servicios.some((s) => s.tipo === t))
                .length
            }
          </span>
        </div>
        <div className="cs-stat-card">
          <span className="cs-stat-label">Valor Total Catálogo</span>
          <span className="cs-stat-value cs-stat-value--blue">
            $
            {servicios.reduce((a, s) => a + s.costo, 0).toLocaleString("es-MX")}{" "}
            <span className="cs-currency">MXN</span>
          </span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="cs-toolbar">
        <div className="cs-filter-tabs">
          {tipos.map((t) => (
            <button
              key={t}
              className={`cs-filter-tab ${filterTipo === t ? "cs-filter-tab--active" : ""}`}
              onClick={() => setFilterTipo(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#64748b" strokeWidth="1.8" />
            <path
              d="M13.5 13.5L17 17"
              stroke="#64748b"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="search-input"
            placeholder="Buscar por servicio corporativo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla Responsiva Basada en Flexbox */}
      <div className="cs-table-wrap">
        <div className="cs-table">
          <div className="cs-table-header">
            <div className="cs-th cs-col-id">ID</div>
            <div className="cs-th cs-col-nombre">Nombre del Servicio</div>
            <div className="cs-th cs-col-tipo">Modalidad</div>
            <div className="cs-th cs-col-costo cs-col-right">Costo Mensual</div>
            <div className="cs-th cs-col-actions cs-col-center">Acciones</div>
          </div>

          {filtered.length === 0 ? (
            <div className="cs-empty">
              No se encontraron soluciones de servicio bajo estos criterios.
            </div>
          ) : (
            filtered.map((s, idx) => {
              const color = TIPO_COLORS[s.tipo] || TIPO_COLORS["Otros"];
              return (
                <div
                  key={s.id}
                  className={`cs-row ${idx % 2 === 0 ? "cs-row--even" : ""}`}
                >
                  <div className="cs-td cs-col-id">#{s.id}</div>
                  <div className="cs-td cs-col-nombre">
                    <span className="cs-mobile-label">Servicio</span>
                    <span className="cs-text-truncate">{s.nombre}</span>
                  </div>
                  <div className="cs-td cs-col-tipo">
                    <span className="cs-mobile-label">Tipo</span>
                    <span
                      className="cs-badge"
                      style={{ background: color.bg, color: color.text }}
                    >
                      <span
                        className="cs-badge-dot"
                        style={{ background: color.dot }}
                      />
                      {s.tipo}
                    </span>
                  </div>
                  <div className="cs-td cs-col-costo cs-col-right cs-costo">
                    <span className="cs-mobile-label">Costo</span>$
                    {Number(s.costo).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    <span className="cs-mxn">MXN</span>
                  </div>
                  <div className="cs-td cs-col-actions cs-col-center cs-actions">
                    <button
                      className="crm-action-btn crm-btn--edit"
                      onClick={() => setFormModal({ servicio: s })}
                    >
                      Editar
                    </button>
                    <button
                      className="crm-action-btn crm-btn--delete"
                      onClick={() => handleDelete(s)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {formModal && (
        <ServiceFormModal
          servicio={formModal.servicio}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
