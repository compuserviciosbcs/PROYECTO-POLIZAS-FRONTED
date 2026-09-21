const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("token") || "";
  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
};

export const calendarioService = {
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.empresa_id) params.append("empresa_id", filtros.empresa_id);
    if (filtros.tecnico_id) params.append("tecnico_id", filtros.tecnico_id);
    if (filtros.tipo) params.append("tipo", filtros.tipo);
    if (filtros.desde) params.append("desde", filtros.desde);
    if (filtros.hasta) params.append("hasta", filtros.hasta);

    const res = await fetch(`${API_BASE_URL}/calendario?${params}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok)
      throw new Error(json.message ?? "Error al obtener el calendario");
    return json.data ?? json;
  },

  create: async (datos) => {
    const res = await fetch(`${API_BASE_URL}/calendario`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(datos),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al crear el evento");
    return json.data ?? json;
  },

  update: async (id, datos) => {
    const res = await fetch(`${API_BASE_URL}/calendario/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(datos),
    });
    const json = await res.json();
    if (!res.ok)
      throw new Error(json.message ?? "Error al actualizar el evento");
    return json.data ?? json;
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/calendario/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al eliminar el evento");
    return json.data ?? json;
  },
};
