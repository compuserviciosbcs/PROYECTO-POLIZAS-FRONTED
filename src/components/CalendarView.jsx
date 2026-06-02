/* VISTAL GENERAL DE CALENDARIO */
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import "../css/CalendarView.css";

const EVENTS = [
  {
    id: "1",
    title: "Mantenimiento Impresoras",
    start: "2026-05-26T12:00:00",
    end: "2026-05-26T13:00:00",
    extendedProps: {
      agente: "Ing Jose",
      prioridad: "Alta",
      detalles: "Detalles del mantenimiento",
    },
    backgroundColor: "#16005e",
    overlap: false,
  },
  {
    id: "2",
    title: "Instalación de impresoras",
    start: "2026-05-26T13:00:00",
    end: "2026-05-26T14:00:00",
    extendedProps: {
      agente: "Jane Smith",
      prioridad: "Media",
      detalles: "Detalles de la instalación",
    },
    backgroundColor: "#5e0056",
    overlap: false,
  },
  {
    id: "3",
    title: "Client test",
    start: "2026-05-26T16:00:00",
    end: "2026-05-26T17:00:00",
    extendedProps: {
      agente: "John John",
      prioridad: "Alta",
      detalles: "Detalles del mantenimiento",
    },
    backgroundColor: "#005e24",
    overlap: false,
  },
  {
    id: "4",
    title: "Reconexión de red",
    start: "2026-05-30T10:00:00",
    end: "2026-05-30T11:00:00",
    extendedProps: {
      agente: "Jane Jane",
      prioridad: "Media",
      detalles: "Detalles de la reconexión",
    },
    backgroundColor: "#5e5e00",
    overlap: false,
  },
];

export default function CalendarView() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;

    setSelectedEvent({
      title: event.title,
      start: event.start.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      end: event.end
        ? event.end.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      date: event.start.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      color: event.backgroundColor,
      agente: event.extendedProps.agente,
      prioridad: event.extendedProps.prioridad,
      detalles: event.extendedProps.detalles,
    });
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="cal-container">
      <div className="cal-header">
        <h1 className="cal-title">Calendario de Mantenimiento</h1>
        <p className="cal-subtitle">
          Consulta y gestiona las citas de servicio programadas
        </p>
      </div>

      <div className="cal-wrapper">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="listWeek"
          sss
          editable={true}
          selectable={true}
          nowIndicator={true}
          height="auto"
          locale="es"
          firstDay={1}
          slotMinTime="08:30:00"
          slotMaxTime="18:00:00"
          slotDuration="00:30:00"
          /* esconder domingo */
          hiddenDays={[0]}
          /* lunes a viernes de 8:30 a 17:30 y sabados de 9:00 a 14:00 */
          businessHours={[
            {
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "08:30:00",
              endTime: "17:30:00",
            },
            {
              daysOfWeek: [6],
              startTime: "09:00:00",
              endTime: "14:00:00",
            },
          ]}
          eventConstraint={[
            {
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "08:30:00",
              endTime: "17:30:00",
            },
            {
              daysOfWeek: [6],
              startTime: "09:00:00",
              endTime: "14:00:00",
            },
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridDay,timeGridWeek,dayGridMonth,listWeek",
          }}
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            list: "Lista",
          }}
          events={EVENTS}
          eventTextColor="#fff"
          eventBorderColor="transparent"
          allDayText="Todo el día"
          noEventsText="Sin citas programadas"
          eventClick={handleEventClick}
        />
      </div>

      {selectedEvent && (
        <div className="crm-modal-overlay" onClick={closeModal}>
          <div
            className="crm-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="crm-modal-header"
              style={{ borderLeft: `5px solid ${selectedEvent.color}` }}
            >
              <h3>{selectedEvent.title}</h3>
              <button className="crm-modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="crm-modal-body">
              <p>
                <strong>Fecha:</strong> {selectedEvent.date}
              </p>
              <p>
                <strong>Horario:</strong> {selectedEvent.start} -{" "}
                {selectedEvent.end}
              </p>
              <p>
                <strong>Agente asignado:</strong> {selectedEvent.agente}
              </p>
              <p>
                <strong>Prioridad:</strong>{" "}
                <span
                  className={`badge-${selectedEvent.prioridad.toLowerCase()}`}
                >
                  {selectedEvent.prioridad}
                </span>
              </p>
              <hr />
              <p>
                <strong>Detalles de la póliza/incidente:</strong>
              </p>
              <p className="crm-modal-desc">{selectedEvent.detalles}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
