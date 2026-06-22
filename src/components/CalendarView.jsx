/* VISTAL GENERAL DE CALENDARIO */
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import dayGridPlugin from "@fullcalendar/daygrid";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import Swal from "sweetalert2";
import { useCalendario } from "../services/useCalendario.js";
import "../css/CalendarView.css";

export default function CalendarView() {
  const { eventos, loading, error, reagendar, eliminar } = useCalendario();

  const handleEventChange = async (changeInfo) => {
    const { event } = changeInfo;
    const ok = await reagendar(event.id, {
      fecha_inicio: event.start.toISOString(),
      fecha_fin: (event.end ?? event.start).toISOString(),
    });
    if (!ok) changeInfo.revert();
  };

  const handleEventClick = (clickInfo) => {
    const { extendedProps, title } = clickInfo.event;
    const esIncidencia = extendedProps.tipo === "incidencia";

    Swal.fire({
      title: esIncidencia
        ? `🟠 Incidencia — ${extendedProps.incidenciaTicket}`
        : `🔵 Mantenimiento`,
      html: `
        <p style="text-align:left;font-size:.9rem;color:#374151;margin-bottom:8px">
          <strong>${title}</strong>
        </p>
        <p style="text-align:left;font-size:.85rem;color:#6b7280">
          Empresa: ${extendedProps.empresaNombre || "—"}<br/>
          Técnico: ${extendedProps.tecnicoNombre || "Sin asignar"}<br/>
          ${extendedProps.descripcion ? `Detalle: ${extendedProps.descripcion}` : ""}
        </p>
      `,
      icon: esIncidencia ? "warning" : "info",
      confirmButtonColor: "#3b82f6",
      confirmButtonText: "Cerrar",
      showDenyButton: true,
      denyButtonText: "Eliminar evento",
      denyButtonColor: "#ef4444",
    }).then((r) => {
      if (r.isDenied) eliminar(clickInfo.event.id);
    });
  };

  return (
    <div className="calendar-view-container">
      {loading && (
        <div className="calendar-loading">Cargando calendario...</div>
      )}
      {!loading && error && (
        <div className="calendar-error">Error: {error}</div>
      )}

      {!loading && !error && (
        <FullCalendar
          plugins={[
            resourceTimelinePlugin,
            dayGridPlugin,
            resourceTimeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          editable={true}
          eventResizableFromStart={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
          }}
          events={eventos}
          eventChange={handleEventChange}
          eventClick={handleEventClick}
          eventTextColor="#fff"
          locale="es"
          schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        />
      )}
    </div>
  );
}
