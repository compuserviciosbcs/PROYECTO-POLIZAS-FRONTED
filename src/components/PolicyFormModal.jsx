/* FORMULARIO DE CATALOGO DE POLIZAS - VALIDACIÓN SILENCIOSA */
import { useState, useEffect, useMemo } from "react";
import "../css/PolicyFormModal.css";

const GRUPOS = [
  "Pólizas de soporte general TI",
  "Pólizas de soporte CONTPAQi®",
  "Pólizas Combo",
];

const EMPTY_FORM = {
  nombre: "",
  tipo: "",
  grupo: "Pólizas de soporte general TI",
  duracion: "12 meses",
  cobertura: "",
  descuento: 0,
  serviciosIds: [],
  sla_respuesta: "",
  sla_solucion: "",
  activa: true,
};

const LIMITS = {
  nombre: 50,
  tipo: 40,
  duracion: 20,
  sla_respuesta: 25,
  sla_solucion: 25,
  cobertura: 500,
};

export default function PolicyFormModal({
  policy,
  groupName,
  onClose,
  onSave,
  catalogoServicios,
}) {
  const isEditing = !!policy;

  const [form, setForm] = useState(() =>
    isEditing
      ? {
          ...policy,
          grupo: groupName,
          descuento: policy.descuento ?? 0,
          serviciosIds: policy.serviciosIds ?? [],
        }
      : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState({});
  const [searchServicio, setSearchServicio] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");

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

  const handleInputChange = (field, value) => {
    let cleanValue = value;

    if (LIMITS[field] && cleanValue.length > LIMITS[field]) return;

    if (field === "nombre" || field === "tipo") {
      cleanValue = cleanValue.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ .,_#-]/g, "");
    }

    setForm((f) => ({ ...f, [field]: cleanValue }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleServicio = (id) => {
    setForm((f) => ({
      ...f,
      serviciosIds: f.serviciosIds.includes(id)
        ? f.serviciosIds.filter((s) => s !== id)
        : [...f.serviciosIds, id],
    }));
    setErrors((e) => ({ ...e, serviciosIds: undefined }));
  };

  const serviciosSeleccionados = useMemo(
    () => catalogoServicios.filter((s) => form.serviciosIds.includes(s.id)),
    [form.serviciosIds, catalogoServicios],
  );
  const subtotal = serviciosSeleccionados.reduce((a, s) => a + s.costo, 0);
  const descuentoMonto = Math.round(subtotal * (form.descuento / 100));
  const total = subtotal - descuentoMonto;
  const precioTexto =
    total > 0 ? `$${total.toLocaleString("es-MX")} MXN/mes` : "";

  const tiposDisponibles = [
    "Todos",
    ...new Set(catalogoServicios.map((s) => s.tipo)),
  ];

  const filteredCatalogo = catalogoServicios.filter((s) => {
    const matchTipo = filterTipo === "Todos" || s.tipo === filterTipo;
    const matchSearch =
      !searchServicio.trim() ||
      s.nombre.toLowerCase().includes(searchServicio.toLowerCase());
    return matchTipo && matchSearch;
  });

  const validate = () => {
    const e = {};
    const trimmedForm = {};
    Object.keys(form).forEach((key) => {
      if (typeof form[key] === "string") trimmedForm[key] = form[key].trim();
    });

    if (!trimmedForm.nombre) e.nombre = "Requerido";
    else if (trimmedForm.nombre.length < 4) e.nombre = "Mínimo 4 caracteres";

    if (!trimmedForm.tipo) e.tipo = "Requerido";
    if (!trimmedForm.duracion) e.duracion = "Requerido";

    if (!trimmedForm.cobertura) e.cobertura = "Requerido";
    else if (trimmedForm.cobertura.length < 15)
      e.cobertura = "Mínimo 15 caracteres";

    if (!trimmedForm.sla_respuesta) e.sla_respuesta = "Requerido";
    if (!trimmedForm.sla_solucion) e.sla_solucion = "Requerido";

    if (form.serviciosIds.length === 0)
      e.serviciosIds = "Selecciona al menos un servicio";

    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const serviciosNombres = serviciosSeleccionados.map((s) => s.nombre);
    onSave({
      policy: {
        ...form,
        nombre: form.nombre.trim(),
        tipo: form.tipo.trim(),
        duracion: form.duracion.trim(),
        cobertura: form.cobertura.trim(),
        sla_respuesta: form.sla_respuesta.trim(),
        sla_solucion: form.sla_solucion.trim(),
        servicios: serviciosNombres,
        precio: precioTexto,
        precioNum: total,
        descuento: form.descuento,
        serviciosIds: form.serviciosIds,
      },
      grupo: form.grupo,
      isEditing,
    });
  };

  return (
    <div className="pf-overlay" onClick={onClose}>
      <div
        className="pf-card pf-card--wide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pf-header">
          <div>
            <p className="pf-header-sub">
              {isEditing ? "Modificar registro" : "Nuevo registro"}
            </p>
            <h2 className="pf-header-title">
              {isEditing ? "Editar póliza" : "Añadir póliza"}
            </h2>
          </div>
          <button className="pf-close" onClick={onClose} aria-label="Cerrar">
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

        <div className="pf-body pf-body--two-col">
          {/* Columna izquierda: datos generales */}
          <div className="pf-col pf-col--left">
            <p className="pf-section-label">Datos generales</p>

            <div className="pf-field">
              <label className="pf-label">
                Nombre de la póliza <span className="pf-required">*</span>
              </label>
              <input
                className={`pf-input ${errors.nombre ? "pf-input--error" : ""}`}
                placeholder="Ej. Póliza Esencial o Póliza Oro CONTPAQi"
                value={form.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
              />
              {errors.nombre && (
                <span className="pf-error-msg">{errors.nombre}</span>
              )}
            </div>

            <div className="pf-row">
              <div className="pf-field pf-field--grow">
                <label className="pf-label">
                  Tipo <span className="pf-required">*</span>
                </label>
                <input
                  className={`pf-input ${errors.tipo ? "pf-input--error" : ""}`}
                  placeholder="Ej. Soporte general TI"
                  value={form.tipo}
                  onChange={(e) => handleInputChange("tipo", e.target.value)}
                />
                {errors.tipo && (
                  <span className="pf-error-msg">{errors.tipo}</span>
                )}
              </div>
              <div className="pf-field pf-field--grow">
                <label className="pf-label">
                  Duración <span className="pf-required">*</span>
                </label>
                <input
                  className={`pf-input ${errors.duracion ? "pf-input--error" : ""}`}
                  placeholder="Ej. 12 meses o 1 año"
                  value={form.duracion}
                  onChange={(e) =>
                    handleInputChange("duracion", e.target.value)
                  }
                />
                {errors.duracion && (
                  <span className="pf-error-msg">{errors.duracion}</span>
                )}
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Grupo</label>
              <select
                className="pf-select"
                value={form.grupo}
                onChange={(e) => handleInputChange("grupo", e.target.value)}
              >
                {GRUPOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="pf-row">
              <div className="pf-field pf-field--grow">
                <label className="pf-label">
                  SLA Respuesta <span className="pf-required">*</span>
                </label>
                <input
                  className={`pf-input ${errors.sla_respuesta ? "pf-input--error" : ""}`}
                  placeholder="Ej. 4 horas hábiles"
                  value={form.sla_respuesta}
                  onChange={(e) =>
                    handleInputChange("sla_respuesta", e.target.value)
                  }
                />
                {errors.sla_respuesta && (
                  <span className="pf-error-msg">{errors.sla_respuesta}</span>
                )}
              </div>
              <div className="pf-field pf-field--grow">
                <label className="pf-label">
                  SLA Solución <span className="pf-required">*</span>
                </label>
                <input
                  className={`pf-input ${errors.sla_solucion ? "pf-input--error" : ""}`}
                  placeholder="Ej. 24 horas hábiles"
                  value={form.sla_solucion}
                  onChange={(e) =>
                    handleInputChange("sla_solucion", e.target.value)
                  }
                />
                {errors.sla_solucion && (
                  <span className="pf-error-msg">{errors.sla_solucion}</span>
                )}
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">
                Descripción de cobertura <span className="pf-required">*</span>
              </label>
              <textarea
                className={`pf-textarea ${errors.cobertura ? "pf-input--error" : ""}`}
                placeholder="Describe qué cubre esta póliza detalladamente..."
                rows={3}
                value={form.cobertura}
                onChange={(e) => handleInputChange("cobertura", e.target.value)}
              />
              {errors.cobertura && (
                <span className="pf-error-msg">{errors.cobertura}</span>
              )}
            </div>

            <div className="pf-field">
              <label className="pf-label">Estatus</label>
              <div className="pf-toggle-row">
                <button
                  className={`pf-toggle ${form.activa ? "pf-toggle--on" : ""}`}
                  onClick={() => setField("activa", !form.activa)}
                >
                  <span className="pf-toggle-knob" />
                </button>
                <span
                  className={`pf-toggle-label ${form.activa ? "pf-toggle-label--active" : "pf-toggle-label--inactive"}`}
                >
                  {form.activa ? "Póliza activa" : "Póliza inactiva"}
                </span>
              </div>
            </div>
          </div>

          {/* Columna derecha: selección de servicios + precio */}
          <div className="pf-col pf-col--right">
            <p className="pf-section-label">Servicios incluidos</p>
            {errors.serviciosIds && (
              <span className="pf-error-msg pf-error-msg--top">
                {errors.serviciosIds}
              </span>
            )}

            <div className="pf-srv-toolbar">
              <input
                className="pf-input pf-srv-search"
                placeholder="Buscar servicio..."
                value={searchServicio}
                onChange={(e) => setSearchServicio(e.target.value)}
              />
              <select
                className="pf-select pf-srv-filter"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
              >
                {tiposDisponibles.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="pf-srv-list" style={{ maxHeight: "180px" }}>
              {filteredCatalogo.length === 0 && (
                <div className="pf-srv-empty">Sin resultados</div>
              )}
              {filteredCatalogo.map((s) => {
                const checked = form.serviciosIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`pf-srv-item ${checked ? "pf-srv-item--checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleServicio(s.id)}
                      className="pf-srv-checkbox"
                    />
                    <span className="pf-srv-name">{s.nombre}</span>
                    <span className="pf-srv-tipo">{s.tipo}</span>
                    <span className="pf-srv-costo">
                      ${s.costo.toLocaleString("es-MX")}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="pf-precio-box">
              <div className="pf-precio-row">
                <span className="pf-precio-label">Servicios seleccionados</span>
                <span className="pf-precio-val">
                  {form.serviciosIds.length}
                </span>
              </div>
              <div className="pf-precio-row">
                <span className="pf-precio-label">Subtotal</span>
                <span className="pf-precio-val">
                  ${subtotal.toLocaleString("es-MX")} MXN
                </span>
              </div>
              <div className="pf-precio-row pf-precio-row--discount">
                <label className="pf-precio-label" htmlFor="descuento">
                  Descuento (%)
                </label>
                <input
                  id="descuento"
                  type="text"
                  className="pf-descuento-input"
                  value={form.descuento}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    const num = Number(val);
                    setField("descuento", val === "" ? 0 : Math.min(100, num));
                  }}
                />
              </div>
              {form.descuento > 0 && (
                <div className="pf-precio-row pf-precio-row--saving">
                  <span className="pf-precio-label">Ahorro</span>
                  <span className="pf-precio-val pf-precio-val--green">
                    -${descuentoMonto.toLocaleString("es-MX")} MXN
                  </span>
                </div>
              )}
              <div className="pf-precio-total">
                <span>Total mensual</span>
                <span className="pf-precio-total-val">
                  {total > 0 ? `$${total.toLocaleString("es-MX")} MXN` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pf-footer">
          <button className="pf-btn pf-btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="pf-btn pf-btn--primary" onClick={handleSubmit}>
            {isEditing ? "Guardar cambios" : "Crear póliza"}
          </button>
        </div>
      </div>
    </div>
  );
}
