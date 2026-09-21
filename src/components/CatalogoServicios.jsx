/* CATALOGO SERVICIOS */
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { TIPOS_SERVICIO } from "../data/servicios.js";
import "../css/CatalogoServicios.css";
import { serviciosService } from "../services/servicioService.js";

const TIPO_COLORS = {
  Remoto: { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
  Presencial: { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6" },
  Otros: { bg: "#f8fafc", text: "#475569", dot: "#64748b" },
  Mantenimiento: { bg: "#f8fafc", text: "#475569", dot: "#64748b" },
};

const EMPTY = { nombre: "", tipo: "Remoto", costo: "" };

function ServiceFormModal({ servicio, onClose, onSave }) {
  const isEditing = !!servicio;
  const [form, setForm] = useState(
    isEditing ? { ...servicio, costo: String(servicio.costo) } : { ...EMPTY },
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (f, v) => {
    setForm((p) => ({ ...p, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre del servicio es requerido";
    if (!form.costo || isNaN(Number(form.costo)) || Number(form.costo) <= 0)
      e.costo = "Ingresa un costo válido superior a $0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    try {
      let tipoServicioId = 1;
      if (form.tipo === "Presencial") tipoServicioId = 2;
      if (form.tipo === "Otros" || form.tipo === "Mantenimiento")
        tipoServicioId = 3;

      const payload = {
        nombre: form.nombre.trim(),
        tipo_servicio_id: tipoServicioId,
        costo: parseFloat(form.costo),
        activo: form.activo !== undefined ? form.activo : 1,
      };

      if (isEditing) {
        const servicioEditado = await serviciosService.update(
          servicio.id,
          payload,
        );

        Swal.fire({
          title: "Registro Actualizado",
          text: `${servicioEditado.nombre} se guardó correctamente en el catálogo.`,
          icon: "success",
          confirmButtonColor: "#2563eb",
          timer: 2000,
        });

        onSave({
          id: servicio.id,
          nombre: servicioEditado.nombre,
          tipo: form.tipo,
          costo: servicioEditado.costo,
          activo: servicioEditado.activo,
        });
      } else {
        /* ELIMINAR  */
        const servicioGuardado = await serviciosService.create(payload);

        Swal.fire({
          title: "Servicio Registrado",
          text: `${servicioGuardado.nombre} Servicio Registrado.`,
          icon: "success",
          confirmButtonColor: "#2563eb",
          timer: 2000,
        });

        onSave({
          id: servicioGuardado.id,
          nombre: servicioGuardado.nombre,
          tipo: form.tipo,
          costo: servicioGuardado.costo,
          activo: servicioGuardado.activo,
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error de persistencia",
        text: error.message || "No se pudo guardar la información.",
      });
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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
                  step="0.01"
                  value={form.costo}
                  onChange={(e) => set("costo", e.target.value)}
                  disabled={loading}
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
          <button
            className="sf-btn sf-btn--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="sf-btn sf-btn--primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : isEditing
                ? "Guardar cambios"
                : "Registrar servicio"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogoServicios() {
  const [servicios, setServicios] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [formModal, setFormModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setLoading(true);
        const data = await serviciosService.getAll({
          tipo: filterTipo,
          search,
        });

        const datosEstructurados = data.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          costo: s.costo,
          tipo: s.tipo_nombre || s.tipo || "Otros",
          activo: s.activo,
        }));

        setServicios(datosEstructurados);
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Error de carga",
          text: "No se pudieron recuperar los servicios de la base de datos.",
        });
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      cargarServicios();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [filterTipo, search]);

  const handleSave = (servicio) => {
    setServicios((prev) => {
      const exists = prev.some((s) => s.id === servicio.id);
      if (exists) {
        return prev.map((s) => (s.id === servicio.id ? servicio : s));
      }
      return [servicio, ...prev];
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
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await serviciosService.delete(s.id);
          setServicios((prev) => prev.filter((sv) => sv.id !== s.id));

          Swal.fire({
            title: "Baja Procesada",
            text: `${s.nombre} fue removido del sistema.`,
            icon: "success",
            confirmButtonColor: "#2563eb",
            timer: 2000,
          });
        } catch (error) {
          Swal.fire(
            "Error",
            "No se pudo eliminar el servicio del servidor.",
            "error",
          );
        }
      }
    });
  };

  const tipos = ["Todos", ...TIPOS_SERVICIO];

  const filtered = servicios;

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
            {servicios
              .reduce((a, s) => a + Number(s.costo), 0)
              .toLocaleString("es-MX", { minimumFractionDigits: 2 })}{" "}
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

          {loading ? (
            <div className="cs-empty">Conectando con la base de datos...</div>
          ) : filtered.length === 0 ? (
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
