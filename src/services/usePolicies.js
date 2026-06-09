import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const GRUPO_ID_MAP = {
  "Pólizas de soporte general TI": 1,
  "Pólizas de soporte CONTPAQi®": 2,
  "Pólizas Combo": 3,
};

const GRUPO_MAP = {
  "Polizas de soporte general TI": "Pólizas de soporte general TI",
  "Polizas de soporte CONTPAQi": "Pólizas de soporte CONTPAQi®",
  "Polizas Combo": "Pólizas Combo",
};

const GRUPOS_UI = Object.values(GRUPO_MAP);
const ESTADO_INICIAL = Object.fromEntries(GRUPOS_UI.map((g) => [g, []]));

const mapPoliza = (p) => ({
  id: p.id,
  nombre: p.nombre,
  tipo: p.tipo,
  cobertura: p.cobertura ?? "",
  duracion: p.duracion ?? "12 meses",
  descuento: Number(p.descuento ?? 0),
  precio: p.precio
    ? `$${Number(p.precio).toLocaleString("es-MX")} MXN/mes`
    : "",
  sla_respuesta: p.sla_respuesta ?? "",
  sla_solucion: p.sla_solucion ?? "",
  activa: Boolean(p.activa),
  serviciosIds: Array.isArray(p.servicios) ? p.servicios.map((s) => s.id) : [],
  servicios: Array.isArray(p.servicios) ? p.servicios.map((s) => s.nombre) : [],
});

export function usePolicies(search = "", filter = "Todos") {
  const [data, setData] = useState(ESTADO_INICIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarPolizas = useCallback(async (busqueda) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (busqueda.trim()) params.append("search", busqueda.trim());

      const res = await fetch(`${API_BASE_URL}/polizas?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Error al obtener pólizas");

      const lista = json.data ?? json;
      const agrupado = Object.fromEntries(GRUPOS_UI.map((g) => [g, []]));

      lista.forEach((p) => {
        const grupoRaw = p.grupo_nombre ?? p.grupo ?? "";
        const grupoUI = GRUPO_MAP[grupoRaw] ?? grupoRaw;
        if (agrupado[grupoUI]) agrupado[grupoUI].push(mapPoliza(p));
      });

      setData(agrupado);
    } catch (err) {
      console.error("usePolicies:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => cargarPolizas(search), 300);
    return () => clearTimeout(timer);
  }, [search, cargarPolizas]);

  // Filtrado local solo por tab — el search ya va al API
  const filteredData = {};
  GRUPOS_UI.forEach((grupo) => {
    if (filter !== "Todos" && filter !== grupo) return;
    const items = data[grupo] ?? [];
    if (items.length > 0) filteredData[grupo] = items;
  });

  // ── Guardar (POST / PUT) ──────────────────────────────────────
  const handleSave = async ({ policy, grupo, oldGrupoName }) => {
    const isEditing = !!policy.id;

    const payload = {
      nombre: policy.nombre,
      tipo: policy.tipo,
      grupo_id: GRUPO_ID_MAP[grupo] ?? 1,
      cobertura: policy.cobertura,
      duracion: policy.duracion,
      descuento: policy.descuento,
      precio: policy.precioNum ?? 0,
      sla_respuesta: policy.sla_respuesta,
      sla_solucion: policy.sla_solucion,
      activa: policy.activa ? 1 : 0,
      servicios_ids: policy.serviciosIds ?? [],
    };

    try {
      const url = isEditing
        ? `${API_BASE_URL}/polizas/${policy.id}`
        : `${API_BASE_URL}/polizas`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Error al guardar");

      const guardada = mapPoliza(json.data ?? json);

      setData((prev) => {
        const next = structuredClone(prev);

        if (isEditing) {
          if (oldGrupoName && oldGrupoName !== grupo) {
            next[oldGrupoName] = (next[oldGrupoName] ?? []).filter(
              (p) => p.id !== policy.id,
            );
            next[grupo] = [...(next[grupo] ?? []), guardada];
          } else {
            next[grupo] = (next[grupo] ?? []).map((p) =>
              p.id === policy.id ? guardada : p,
            );
          }
        } else {
          next[grupo] = [...(next[grupo] ?? []), guardada];
        }

        return next;
      });

      Swal.fire({
        title: isEditing ? "Póliza actualizada" : "Póliza creada",
        text: `${guardada.nombre} se guardó correctamente.`,
        icon: "success",
        confirmButtonColor: "#2563eb",
        timer: 1800,
        timerProgressBar: true,
      });

      return true;
    } catch (err) {
      console.error("handleSave:", err);
      Swal.fire(
        "Error",
        err.message ?? "No se pudo guardar la póliza.",
        "error",
      );
      return false;
    }
  };

  // ── Eliminar (DELETE) ─────────────────────────────────────────
  const handleDelete = async (policy, grupo) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar póliza?",
      html: `<p style="color:#6b7280;font-size:.9rem">Se eliminará permanentemente <strong style="color:#1a1d2e">${policy.nombre}</strong>.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/polizas/${policy.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Error al eliminar");

      setData((prev) => ({
        ...prev,
        [grupo]: (prev[grupo] ?? []).filter((p) => p.id !== policy.id),
      }));

      Swal.fire({
        title: "Eliminada",
        text: `${policy.nombre} fue eliminada del catálogo.`,
        icon: "success",
        confirmButtonColor: "#2563eb",
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire("Error", err.message ?? "No se pudo eliminar.", "error");
    }
  };

  return { filteredData, loading, error, handleSave, handleDelete };
}
