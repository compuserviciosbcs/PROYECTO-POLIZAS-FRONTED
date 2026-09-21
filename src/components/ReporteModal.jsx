import { useState } from "react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ESTATUS_CONFIG = {
  abierto: { label: "Abierto" },
  pendiente: { label: "Pendiente" },
  solucionado: { label: "Solucionado" },
  "no solucionado": { label: "No solucionado" },
};

const formatDateInput = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

export default function ReporteModal({ empresa, onClose }) {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [desde, setDesde] = useState(formatDateInput(inicioMes));
  const [hasta, setHasta] = useState(formatDateInput(hoy));

  /* Filtrado por fechha */
  const incidenciasFiltradas = (empresa.incidencias || []).filter((inc) => {
    if (!inc.fecha) return false;
    const fechaLimpia = inc.fecha.split(" ")[0].split("T")[0];
    if (desde && fechaLimpia < desde) return false;
    if (hasta && fechaLimpia > hasta) return false;
    return true;
  });

  const handleDescargar = () => {
    if (desde && hasta && desde > hasta) {
      Swal.fire(
        "Rango inválido",
        "La fecha de inicio no puede ser posterior a la fecha final.",
        "warning",
      );
      return;
    }

    try {
      const doc = new jsPDF();

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE DE INCIDENCIAS Y TICKETS", 14, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado: ${formatDateInput(new Date())}`, 196, 15, {
        align: "right",
      });

      /* Información de la empresa */
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(empresa.nombre || "Empresa", 14, 34);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(
        `RFC: ${empresa.rfc || "—"}  |  Contacto: ${empresa.contactoPrincipal || "—"}  |  Tel: ${empresa.telefono || "—"}`,
        14,
        40,
      );
      doc.text(
        `Periodo evaluado: ${desde || "Inicio"} hasta ${hasta || "Hoy"}`,
        14,
        46,
      );

      /* Resumen */
      const total = incidenciasFiltradas.length;
      const resueltos = incidenciasFiltradas.filter(
        (i) => i.estatus === "solucionado",
      ).length;
      const pendientes = incidenciasFiltradas.filter(
        (i) => i.estatus === "abierto" || i.estatus === "pendiente",
      ).length;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 51, 182, 14, 2, 2, "F");

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Tickets en periodo: ${total}`, 22, 60);
      doc.text(`Solucionados: ${resueltos}`, 85, 60);
      doc.text(`Pendientes/Abiertos: ${pendientes}`, 145, 60);

      /* FILAs para la tabla */
      const rows = incidenciasFiltradas.map((inc) => {
        const estatus =
          ESTATUS_CONFIG[inc.estatus]?.label || inc.estatus || "—";
        const fecha = (inc.fecha || "—").split("T")[0];
        return [
          inc.ticket || "—",
          inc.asunto || "—",
          inc.tecnico || "—",
          fecha,
          estatus,
        ];
      });

      autoTable(doc, {
        startY: 70,
        head: [["Ticket", "Asunto", "Técnico asignado", "Fecha", "Estatus"]],
        body:
          rows.length > 0
            ? rows
            : [
                [
                  "—",
                  "No se encontraron tickets en el periodo seleccionado",
                  "—",
                  "—",
                  "—",
                ],
              ],
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 26, fontStyle: "bold" },
          1: { cellWidth: "auto" },
          2: { cellWidth: 38 },
          3: { cellWidth: 25 },
          4: { cellWidth: 28 },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            const raw = String(data.cell.raw).toLowerCase();
            if (raw.includes("solucionado")) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = "bold";
            } else if (raw.includes("abierto")) {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fontStyle = "bold";
            } else if (raw.includes("pendiente")) {
              data.cell.styles.textColor = [146, 64, 14];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      const nombreSanitizado = (empresa.nombre || "empresa")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      doc.save(`reporte_tickets_${nombreSanitizado}_${desde}_a_${hasta}.pdf`);
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "Ocurrió un error al generar el archivo PDF.",
        "error",
      );
    }
  };

  return (
    <div className="uf-overlay" onClick={onClose}>
      <div className="uf-card uf-card--md" onClick={(e) => e.stopPropagation()}>
        <div className="uf-header">
          <div>
            <p className="uf-modal-sub">Reporte de tickets</p>
            <h2 className="uf-title">Descargar reporte en PDF</h2>
          </div>
          <button className="uf-close" onClick={onClose}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="uf-body">
          <p
            style={{
              color: "#64748b",
              fontSize: "0.88rem",
              marginBottom: "1rem",
            }}
          >
            El reporte por defecto abarca desde el primer día del mes actual
            hasta hoy. Puedes editar las fechas libremente.
          </p>

          <div className="uf-row">
            <div className="uf-field uf-field--grow">
              <label className="uf-label">Desde</label>
              <input
                type="date"
                className="uf-input"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="uf-field uf-field--grow">
              <label className="uf-label">Hasta</label>
              <input
                type="date"
                className="uf-input"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
          </div>

          <div className="vp-preview" style={{ marginTop: "1rem" }}>
            <div className="vp-preview-row">
              <span className="vp-preview-nombre">
                Tickets dentro del periodo
              </span>
              <span
                className="vp-preview-meta"
                style={{ fontWeight: 700, color: "#1d4ed8" }}
              >
                {incidenciasFiltradas.length} encontradas
              </span>
            </div>
          </div>
        </div>

        <div className="uf-footer">
          <button className="uf-btn uf-btn--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="uf-btn uf-btn--primary" onClick={handleDescargar}>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
