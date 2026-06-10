const API_BASE_URL = import.meta.env.VITE_API_URL;

export const empresasService = {
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.search) params.append("search", filtros.search.trim());
    if (filtros.giro && filtros.giro !== "Todos")
      params.append("giro", filtros.giro);
    if (filtros.estatus && filtros.estatus !== "Todos")
      params.append("estatus", filtros.estatus);

    const res = await fetch(`${API_BASE_URL}/empresas?${params}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al obtener empresas");
    return json.data ?? json;
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al obtener empresa");
    return json.data ?? json;
  },

  create: async (datos) => {
    const res = await fetch(`${API_BASE_URL}/empresas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al crear empresa");
    return json.data ?? json;
  },

  update: async (id, datos) => {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al actualizar empresa");
    return json.data ?? json;
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al eliminar empresa");
    return json.data ?? json;
  },

  // Usuarios
  crearUsuario: async (empresaId, datos) => {
    const res = await fetch(`${API_BASE_URL}/empresas/${empresaId}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al crear usuario");
    return json.data ?? json;
  },

  // Plizas vinculadas
  vincularPoliza: async (empresaId, datos) => {
    const res = await fetch(`${API_BASE_URL}/empresas/${empresaId}/polizas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Error al vincular póliza");
    return json.data ?? json;
  },
};
