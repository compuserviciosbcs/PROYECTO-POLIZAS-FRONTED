const API_BASE_URL = import.meta.env.VITE_API_URL;
const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("token") || "";
  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
};

export const serviciosService = {
  // ── GET: Obtener todos los servicios ──
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.tipo && filtros.tipo !== "Todos") {
      params.append("tipo", filtros.tipo);
    }
    if (filtros.search && filtros.search.trim() !== "") {
      params.append("search", filtros.search.trim());
    }

    const response = await fetch(
      `${API_BASE_URL}/servicios?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.error || "Error al obtener los servicios");
    return data.data || data;
  },

  // ── POST: Crear un nuevo servicio ──
  create: async (nuevoServicio) => {
    const response = await fetch(`${API_BASE_URL}/servicios`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(nuevoServicio),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al crear the servicio");

    return data.data || data;
  },

  // ── PUT: Modificar un servicio existente ──
  update: async (id, datosActualizados) => {
    const response = await fetch(`${API_BASE_URL}/servicios/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(datosActualizados),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al actualizar el servicio");

    return data.data || data;
  },

  // ── DELETE: Dar de baja/eliminar un servicio ──
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/servicios/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al eliminar el servicio");

    return data.data || data;
  },
};

export const empresasService = {
  // ── GET: Obtener todas las empresas ──
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.error || "Error al obtener las empresas");
    return data.data || data;
  },

  // ── POST: Crear una nueva empresa ──
  create: async (nuevaEmpresa) => {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      method: "POST",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(nuevaEmpresa),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al crear la empresa");

    return data.data || data;
  },

  // ── PUT: Modificar una empresa existente ──
  update: async (id, datosActualizados) => {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(datosActualizados),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al actualizar la empresa");

    return data.data || data;
  },

  // ── DELETE: Dar de baja/eliminar una empresa ──
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al eliminar la empresa");

    return data.data || data;
  },
};
