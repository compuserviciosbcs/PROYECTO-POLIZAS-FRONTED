import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { incidenciasService } from "../services/incidenciasService.js";

// ── Mapas BD ↔ UI ─────────────────────────────────────────────
const ESTATUS_BD_A_UI = {
  abierto: "Abierto",
  pendiente: "En Proceso",
  solucionado: "Solucionado",
  no_solucionado: "No Solucionado",
};

const ESTATUS_UI_A_BD = Object.fromEntries(
  Object.entries(ESTATUS_BD_A_UI).map(([k, v]) => [v, k]),
);

const CLASIFICACION_BD_A_UI = { remota: "Remota", presencial: "Presencial" };
const CLASIFICACION_UI_A_BD = { Remota: "remota", Presencial: "presencial" };

const mapIncidencia = (i) => ({
  id: i.id,
  incidencia_id: i.id,
  empresa_id: i.empresa_id,
  tecnico_id: i.tecnico_id,
  ticket: i.ticket,
  empresaNombre: i.empresa_nombre ?? i.empresaNombre ?? "",
  usuarioAfectado: i.usuario_nombre ?? i.usuarioAfectado ?? "",
  tecnicoAsignado: i.tecnico_nombre ?? i.tecnicoAsignado ?? "",
  polizaAsociada: i.poliza_nombre ?? i.polizaAsociada ?? "",
  asunto: i.asunto,
  descripcion: i.descripcion,
  estatus: ESTATUS_BD_A_UI[i.estatus] ?? i.estatus,
  clasificacion: CLASIFICACION_BD_A_UI[i.clasificacion] ?? i.clasificacion,
  prioridad: i.prioridad ?? "media",
  fechaCreacion: i.fecha_creacion ?? i.fechaCreacion ?? "",
  fechaCierre: i.fecha_cierre ?? i.fechaCierre ?? null,
  fechaUltimaAct: i.fecha_ultima_act ?? "",
  slaRespuesta: i.sla_respuesta_hrs ?? null,
  slaSolucion: i.sla_solucion_hrs ?? null,
  cierre: i.solucion_aplicada
    ? {
        solucionAplicada: i.solucion_aplicada,
        slaRespuestaHoras: i.sla_respuesta_hrs,
        slaSolucionHoras: i.sla_solucion_hrs,
      }
    : null,
  cita: i.cita ?? null,
  notes: i.notas ?? [],
});

// ─────────────────────────────────────────────────────────────
export function useIncidencias(filtros = {}) {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filtrosBD = { ...filtros };

      if (filtros.estatus === "Todos") {
        delete filtrosBD.estatus;
      } else if (filtros.estatus) {
        filtrosBD.estatus = ESTATUS_UI_A_BD[filtros.estatus] ?? filtros.estatus;
      }

      if (filtros.clasificacion && filtros.clasificacion !== "Todos") {
        filtrosBD.clasificacion =
          CLASIFICACION_UI_A_BD[filtros.clasificacion] ?? filtros.clasificacion;
      }

      const data = await incidenciasService.getAll(filtrosBD);

      setIncidencias(data.map(mapIncidencia));
    } catch (err) {
      console.error("useIncidencias:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    filtros.estatus,
    filtros.clasificacion,
    filtros.search,
    filtros.empresa_id,
  ]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (form) => {
    try {
      const payload = {
        empresa_id: form.empresa_id,
        usuario_id: form.usuario_id ?? null,
        empresa_poliza_id: form.empresa_poliza_id ?? null,
        tecnico_id: form.tecnico_id ?? null,
        asunto: form.asunto,
        descripcion: form.descripcion,
        clasificacion:
          CLASIFICACION_UI_A_BD[form.clasificacion] ?? form.clasificacion,
        prioridad: form.prioridad ?? "media",
        cita: form.clasificacion === "Presencial" ? form.cita : null,
      };
      const creada = await incidenciasService.create(payload);
      setIncidencias((prev) => [mapIncidencia(creada), ...prev]);
      Swal.fire({
        title: "Incidencia creada",
        text: `Folio ${creada.ticket} registrado correctamente.`,
        icon: "success",
        confirmButtonColor: "#3b82f6",
        timer: 2000,
        timerProgressBar: true,
      });
      return mapIncidencia(creada);
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo crear la incidencia.",
        "error",
      );
      return null;
    }
  };

  const cerrar = async (
    id,
    { solucionAplicada, slaRespuestaHoras, slaSolucionHoras, resultado },
  ) => {
    try {
      const res = await incidenciasService.cerrar(id, {
        estatus:
          resultado === "no_solucionado" ? "no_solucionado" : "solucionado",
        solucion_aplicada: solucionAplicada,
        sla_respuesta_hrs: slaRespuestaHoras ?? null,
        sla_solucion_hrs: slaSolucionHoras ?? null,
      });

      const incActualizada = mapIncidencia(res.incidencia);
      setIncidencias((prev) =>
        prev.map((i) => (i.id === id ? incActualizada : i)),
      );
      return { incidencia: incActualizada, botPayload: res.bot_payload };
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo cerrar la incidencia.",
        "error",
      );
      return null;
    }
  };

  const cambiarEstatus = async (id, datos) => {
    try {
      const payload =
        typeof datos === "string"
          ? { estatus: ESTATUS_UI_A_BD[datos] ?? datos }
          : {
              ...datos,
              estatus: ESTATUS_UI_A_BD[datos.estatus] ?? datos.estatus,
            };

      const actualizada = await incidenciasService.cambiarEstatus(id, payload);
      setIncidencias((prev) =>
        prev.map((i) => (i.id === id ? mapIncidencia(actualizada) : i)),
      );
      return mapIncidencia(actualizada);
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo actualizar el estatus.",
        "error",
      );
      return null;
    }
  };

  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar incidencia?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return false;
    try {
      await incidenciasService.delete(id);
      setIncidencias((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (err) {
      Swal.fire("Error", err.message ?? "No se pudo eliminar.", "error");
      return false;
    }
  };

  const actualizarLocal = (incidenciaActualizada) => {
    setIncidencias((prev) =>
      prev.map((i) =>
        i.id === incidenciaActualizada.id ? incidenciaActualizada : i,
      ),
    );
  };

  return {
    incidencias,
    loading,
    error,
    crear,
    cerrar,
    cambiarEstatus,
    eliminar,
    actualizarLocal,
    recargar: cargar,
  };
}

// ── Hook específico para historial (solo cerradas) ─────────
export function useHistorial(filtros = {}) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filtrosBD = { ...filtros };

      if (filtros.clasificacion === "Todos") {
        delete filtrosBD.clasificacion;
      } else if (filtros.clasificacion) {
        filtrosBD.clasificacion =
          CLASIFICACION_UI_A_BD[filtros.clasificacion] ?? filtros.clasificacion;
      }

      const data = await incidenciasService.getHistorial(filtrosBD);
      setHistorial(data.map(mapIncidencia));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    filtros.clasificacion,
    filtros.search,
    filtros.empresa_id,
    filtros.desde,
    filtros.hasta,
  ]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { historial, loading, error, recargar: cargar };
}
