import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { empresasService } from "../services/empresasService.js";

const mapEmpresa = (e) => ({
  id: e.id,
  nombre: e.nombre,
  rfc: e.rfc,
  giro: e.giro ?? "",
  telefono: e.telefono ?? "",
  email: e.email ?? "",
  sitio: e.sitio ?? "",
  direccion: e.direccion ?? "",
  contactoPrincipal: e.contacto_principal ?? e.contactoPrincipal ?? "",
  estatus: e.estatus ?? "activo",
  usuarios: (e.usuarios ?? []).map(mapUsuario),
  polizas: (e.polizas ?? []).map(mapPolizaVinculada),
  incidencias: (e.incidencias ?? []).map(mapIncidenciaResumen),
  cambios: (e.bitacora ?? e.cambios ?? []).map(mapCambio),
});

const mapUsuario = (u) => ({
  id: u.id,
  nombre: u.nombre,
  cargo: u.cargo ?? "",
  email: u.email ?? "",
  telefono: u.telefono ?? "",
});

const mapPolizaVinculada = (p) => ({
  id: p.id,
  nombre: p.poliza_nombre ?? p.nombre ?? "",
  tipo: p.tipo ?? "",
  precio: p.precio ?? "",
  vigencia: p.vigencia ?? "",
  vencimiento: p.vencimiento ?? "",
  activa: Boolean(p.activa ?? 1),
});

const mapIncidenciaResumen = (i) => ({
  ticket: i.ticket,
  asunto: i.asunto,
  estatus: i.estatus,
  fecha: i.fecha_creacion ?? i.fecha ?? "",
  tecnico: i.tecnico_nombre ?? i.tecnico ?? "—",
});

const mapCambio = (c) => ({
  tipo: c.tipo,
  descripcion: c.descripcion,
  fecha: c.creado_en ?? c.fecha ?? "",
});

const toPayload = (form) => ({
  nombre: form.nombre,
  rfc: form.rfc,
  giro: form.giro,
  telefono: form.telefono,
  email: form.email,
  sitio: form.sitio,
  direccion: form.direccion,
  contacto_principal: form.contactoPrincipal,
  estatus: form.estatus,
});

// ─────────────────────────────────────────────────────────────
export function useEmpresas(filtros = {}) {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await empresasService.getAll(filtros);
      setEmpresas(data.map(mapEmpresa));
    } catch (err) {
      console.error("useEmpresas:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros.search, filtros.giro, filtros.estatus]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ── CREATE ───────────────────────────────────────────────────
  const crear = async (form) => {
    try {
      const creada = await empresasService.create(toPayload(form));
      const mapeada = mapEmpresa(creada);
      setEmpresas((prev) => [...prev, mapeada]);
      Swal.fire({
        title: "Empresa creada",
        text: `${mapeada.nombre} fue añadida correctamente.`,
        icon: "success",
        confirmButtonColor: "#3b82f6",
        timer: 2200,
        timerProgressBar: true,
      });
      return mapeada;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo crear la empresa.",
        "error",
      );
      return null;
    }
  };

  // ── UPDAATE  ──────────────────────────────────────────────
  const actualizar = async (id, form) => {
    try {
      const actualizada = await empresasService.update(id, toPayload(form));
      const mapeada = mapEmpresa(actualizada);

      setEmpresas((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...mapeada,
                usuarios: e.usuarios,
                polizas: e.polizas,
                incidencias: e.incidencias,
                cambios: e.cambios,
              }
            : e,
        ),
      );
      Swal.fire({
        title: "Cambios guardados",
        text: `${mapeada.nombre} fue actualizada correctamente.`,
        icon: "success",
        confirmButtonColor: "#3b82f6",
        timer: 2200,
        timerProgressBar: true,
      });
      return mapeada;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo actualizar la empresa.",
        "error",
      );
      return null;
    }
  };

  // ── DELETE ────────────────────────────────────────────────
  const eliminar = async (emp) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar empresa?",
      html: `<p style="color:#6b7280;font-size:.9rem">Se eliminará <strong style="color:#1a1d2e">${emp.nombre}</strong> y todo su expediente.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return false;

    try {
      await empresasService.delete(emp.id);
      setEmpresas((prev) => prev.filter((e) => e.id !== emp.id));
      Swal.fire({
        title: "Eliminada",
        icon: "success",
        confirmButtonColor: "#3b82f6",
        timer: 2000,
        timerProgressBar: true,
      });
      return true;
    } catch (err) {
      Swal.fire("Error", err.message ?? "No se pudo eliminar.", "error");
      return false;
    }
  };

  const cargarExpediente = async (id) => {
    try {
      const data = await empresasService.getById(id);
      const mapeada = mapEmpresa(data);
      setEmpresas((prev) => prev.map((e) => (e.id === id ? mapeada : e)));
      return mapeada;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo cargar el expediente.",
        "error",
      );
      return null;
    }
  };

  // ── ADD USER ──────────────────────────────────────────
  const crearUsuario = async (empresaId, datos) => {
    try {
      const creado = await empresasService.crearUsuario(empresaId, datos);
      const u = mapUsuario(creado);
      setEmpresas((prev) =>
        prev.map((e) =>
          e.id === empresaId ? { ...e, usuarios: [...e.usuarios, u] } : e,
        ),
      );
      return u;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo crear el usuario.",
        "error",
      );
      return null;
    }
  };

  const actualizarLocal = (empresaActualizada) => {
    setEmpresas((prev) =>
      prev.map((e) =>
        e.id === empresaActualizada.id ? empresaActualizada : e,
      ),
    );
  };

  const vincularPoliza = async (empresaId, datos) => {
    try {
      const raw = await empresasService.vincularPoliza(empresaId, datos);

      const vinculada = {
        id: raw.id,
        nombre: raw.poliza_nombre ?? raw.nombre ?? "",
        tipo: raw.tipo ?? "",
        precio: raw.precio
          ? `$${Number(raw.precio).toLocaleString("es-MX")} MXN/mes`
          : "",
        vigencia: raw.vigencia ?? "",
        vencimiento: raw.vencimiento ?? "",
        activa: Boolean(raw.activa ?? 1),
      };
      return vinculada;
    } catch (err) {
      Swal.fire(
        "Error",
        err.message ?? "No se pudo vincular la póliza.",
        "error",
      );
      return null;
    }
  };

  return {
    empresas,
    loading,
    error,
    crear,
    actualizar,
    eliminar,
    cargarExpediente,
    crearUsuario,
    actualizarLocal,
    vincularPoliza,
  };
}
