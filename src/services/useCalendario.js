import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { calendarioService } from "../services/calendarioService.js";

const COLOR_POR_TIPO = {
  mantenimiento: { bg: "#3b82f6", border: "#2563eb" },
  incidencia: { bg: "#f97316", border: "#ea580c" },
};

const mapEvento = (m) => ({
  id: String(m.id),
  title: m.titulo,
  start: m.fecha_inicio,
  end: m.fecha_fin,
  backgroundColor:
    COLOR_POR_TIPO[m.tipo]?.bg ?? COLOR_POR_TIPO.mantenimiento.bg,
  borderColor:
    COLOR_POR_TIPO[m.tipo]?.border ?? COLOR_POR_TIPO.mantenimiento.border,
  extendedProps: {
    tipo: m.tipo,
    descripcion: m.descripcion,
    empresaNombre: m.empresa_nombre,
    tecnicoNombre: m.tecnico_nombre,
    incidenciaId: m.incidencia_id,
    incidenciaTicket: m.incidencia_ticket,
    reagendado: Boolean(m.reagendado),
  },
});

export function useCalendario(filtros = {}) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calendarioService.getAll(filtros);
      setEventos(data.map(mapEvento));
    } catch (err) {
      console.error("useCalendario:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    filtros.empresa_id,
    filtros.tecnico_id,
    filtros.tipo,
    filtros.desde,
    filtros.hasta,
  ]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (form) => {
    try {
      const creado = await calendarioService.create({
        empresa_id: form.empresaId || null,
        tecnico_id: form.tecnicoId || null,
        tipo: "mantenimiento",
        titulo: form.titulo,
        descripcion: form.descripcion,
        fecha_inicio: form.fechaInicio,
        fecha_fin: form.fechaFin,
      });
      setEventos((prev) => [...prev, mapEvento(creado)]);
      Swal.fire({
        title: "Mantenimiento agendado",
        icon: "success",
        confirmButtonColor: "#3b82f6",
        timer: 1800,
        timerProgressBar: true,
      });
      return creado;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo agendar el mantenimiento.",
        "error",
      );
      return null;
    }
  };

  const reagendar = async (id, { fecha_inicio, fecha_fin }) => {
    try {
      const actual = eventos.find((e) => e.id === id);
      if (!actual) return null;

      const actualizado = await calendarioService.update(id, {
        titulo: actual.title,
        descripcion: actual.extendedProps.descripcion,
        fecha_inicio,
        fecha_fin,
        tipo: actual.extendedProps.tipo,
        incidencia_id: actual.extendedProps.incidenciaId,
        reagendado: 1,
      });

      setEventos((prev) =>
        prev.map((e) => (e.id === id ? mapEvento(actualizado) : e)),
      );
      return actualizado;
    } catch (err) {
      Swal.fire("Error", err.message ?? "No se pudo reagendar.", "error");
      return null;
    }
  };

  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar evento del calendario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return false;

    try {
      await calendarioService.delete(id);
      setEventos((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (err) {
      Swal.fire("Error", err.message ?? "No se pudo eliminar.", "error");
      return false;
    }
  };

  return {
    eventos,
    loading,
    error,
    crear,
    reagendar,
    eliminar,
    recargar: cargar,
  };
}
