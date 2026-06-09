import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { serviciosService } from "../services/servicioService.js";

export function useServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await serviciosService.getAll();

        const normalizados = data.map((s) => ({
          id: s.id,
          nombre: s.nombre,
          tipo: s.tipo_nombre ?? s.tipo ?? "Otros",
          costo: Number(s.costo ?? 0),
        }));

        setServicios(normalizados);
      } catch (err) {
        console.error("useServicios:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  // ── Crear ─────────────────────────────────────────────────────
  const crear = async (nuevoServicio) => {
    try {
      const creado = await serviciosService.create(nuevoServicio);
      const normalizado = {
        id: creado.id,
        nombre: creado.nombre,
        tipo: creado.tipo_nombre ?? creado.tipo ?? "Otros",
        costo: Number(creado.costo ?? 0),
      };
      setServicios((prev) => [...prev, normalizado]);
      return normalizado;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo crear el servicio.",
        "error",
      );
      return null;
    }
  };

  // ── Actualizar ────────────────────────────────────────────────
  const actualizar = async (id, datos) => {
    try {
      const actualizado = await serviciosService.update(id, datos);
      const normalizado = {
        id: actualizado.id,
        nombre: actualizado.nombre,
        tipo: actualizado.tipo_nombre ?? actualizado.tipo ?? "Otros",
        costo: Number(actualizado.costo ?? 0),
      };
      setServicios((prev) => prev.map((s) => (s.id === id ? normalizado : s)));
      return normalizado;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo actualizar el servicio.",
        "error",
      );
      return null;
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────
  const eliminar = async (id) => {
    try {
      await serviciosService.delete(id);
      setServicios((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo eliminar el servicio.",
        "error",
      );
      return false;
    }
  };

  return { servicios, loading, error, crear, actualizar, eliminar };
}
