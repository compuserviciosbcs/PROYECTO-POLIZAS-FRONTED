const API_BASE_URL = import.meta.env.VITE_API_URL;

const TOKEN = import.meta.env.VITE_APP_BEARER_TOKEN;

export const incidenciasService = {
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estatus) params.append("estatus", filtros.estatus);
    if (filtros.clasificacion)
      params.append("clasificacion", filtros.clasificacion);
    if (filtros.prioridad) params.append("prioridad", filtros.prioridad);
    if (filtros.empresa_id) params.append("empresa_id", filtros.empresa_id);
    if (filtros.search?.trim()) params.append("search", filtros.search.trim());

    const res = await fetch(`${API_BASE_URL}/incidencias?${params}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    const json = await res.json();
    if (!res.ok)
      throw new Error(json.message ?? "Error al obtener incidencias");
    return json.data ?? json;
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/${id}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al obtener incidencia");
    return json.data ?? json;
  },

  create: async (datos) => {
    const res = await fetch(`${API_BASE_URL}/incidencias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(datos),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al crear incidencia");
    return json.data ?? json;
  },

  cambiarEstatus: async (id, datos) => {
    const payload = typeof datos === "string" ? { estatus: datos } : datos;

    const res = await fetch(`${API_BASE_URL}/incidencias/${id}/estatus`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al cambiar estatus");
    return json.data ?? json;
  },

  cerrar: async (id, datos) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/${id}/cerrar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(datos),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al cerrar incidencia");
    return json.data ?? json; // { incidencia, bot_payload }
  },

  agregarNota: async (id, { autor, texto }) => {
    const res = await fetch(`${API_BASE_URL}/incidencias/${id}/notas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ autor, texto }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al agregar nota");
    return json.data ?? json;
  },

  delete: async (id) => {
    const res = await fetch(
      `${API_BASE_URL}/incidencias/${id}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
      {
        method: "DELETE",
      },
    );
    const json = await res.json();
    if (!res.ok)
      throw new Error(json.message ?? "Error al eliminar incidencia");
    return json.data ?? json;
  },

  getHistorial: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.empresa_id) params.append("empresa_id", filtros.empresa_id);
    if (filtros.clasificacion)
      params.append("clasificacion", filtros.clasificacion);
    if (filtros.search?.trim()) params.append("search", filtros.search.trim());
    if (filtros.desde) params.append("desde", filtros.desde);
    if (filtros.hasta) params.append("hasta", filtros.hasta);

    const res = await fetch(`${API_BASE_URL}/historial?${params}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al obtener historial");
    return json.data ?? json;
  },
};
