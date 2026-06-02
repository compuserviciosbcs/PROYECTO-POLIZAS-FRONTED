/* VISTA GENERAL DEL CATALOGO DE POLIZAS */
import { useState } from "react";
import Swal from "sweetalert2";
import PolicyModal from "./PolicyModal.jsx";
import PolicyFormModal from "./PolicyFormModal.jsx";
import { initialData } from "../data/policies.js";
import "../css/CatalogoPolicies.css";

export default function CatalogoPolicies({ catalogoServicios = [] }) {
  const [data, setData] = useState(initialData);
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextId, setNextId] = useState(10);

  const filterOptions = ["Todos", ...Object.keys(initialData)];
  const totalPages = 3;

  const handleSave = ({ policy, grupo, isEditing }) => {
    setData((prev) => {
      const next = { ...prev };

      if (isEditing) {
        const oldGrupo = formModal.groupName;
        if (oldGrupo !== grupo) {
          next[oldGrupo] = next[oldGrupo].filter((p) => p.id !== policy.id);
          next[grupo] = [...(next[grupo] || []), policy];
        } else {
          next[grupo] = next[grupo].map((p) =>
            p.id === policy.id ? policy : p,
          );
        }
      } else {
        const newPolicy = { ...policy, id: nextId };
        setNextId((id) => id + 1);
        next[grupo] = [...(next[grupo] || []), newPolicy];
      }

      return next;
    });

    setFormModal(null);
    Swal.fire({
      title: isEditing ? "Cambios guardados" : "Póliza creada",
      text: isEditing
        ? `${policy.nombre} fue actualizada correctamente.`
        : `${policy.nombre} fue añadida al catálogo.`,
      icon: "success",
      confirmButtonColor: "#3b82f6",
      timer: 2200,
      timerProgressBar: true,
    });
  };

  const handleDelete = (groupName, policyId, policyName) => {
    Swal.fire({
      title: "¿Eliminar póliza?",
      html: `<p style="color:#6b7280;font-size:0.9rem">Esta acción eliminará <strong style="color:#1a1d2e">${policyName}</strong> de forma permanente.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      borderRadius: "12px",
      customClass: {
        popup: "swal-custom-popup",
        title: "swal-custom-title",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prev) => ({
          ...prev,
          [groupName]: prev[groupName].filter((p) => p.id !== policyId),
        }));
        Swal.fire({
          title: "Eliminada",
          text: `${policyName} ha sido eliminada.`,
          icon: "success",
          confirmButtonColor: "#3b82f6",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  };

  const getFilteredData = () => {
    let filtered = {};
    if (filter === "Todos") {
      filtered = { ...data };
    } else {
      filtered = { [filter]: data[filter] || [] };
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = Object.fromEntries(
        Object.entries(filtered)
          .map(([group, policies]) => [
            group,
            policies.filter(
              (p) =>
                p.nombre.toLowerCase().includes(q) ||
                p.tipo.toLowerCase().includes(q),
            ),
          ])
          .filter(([, policies]) => policies.length > 0),
      );
    }
    return filtered;
  };

  const filteredData = getFilteredData();

  return (
    <div className="catalogo-container">
      <h1 className="catalogo-title">Catálogo de Pólizas</h1>

      {/* Toolbar */}
      <div className="catalogo-toolbar">
        <button className="btn-add" onClick={() => setFormModal({})}>
          <span className="btn-add-icon">+</span> Añadir
        </button>

        <div className="filter-tabs">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              className={`filter-tab ${filter === opt ? "filter-tab--active" : ""}`}
              onClick={() => setFilter(opt)}
            >
              {opt === "Todos"
                ? "Todos"
                : opt
                    .replace("Pólizas de soporte ", "")
                    .replace("Pólizas ", "")}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#9ca3af" strokeWidth="1.5" />
            <path
              d="M13.5 13.5L17 17"
              stroke="#9ca3af"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="search-input"
            placeholder="Búsqueda (Por nombre de póliza o tipo)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tables */}
      <div className="tables-wrapper">
        {Object.entries(filteredData).map(([groupName, policies]) => (
          <div key={groupName} className="policy-group">
            <div className="policy-table">
              <div className="policy-table-header">
                <span>ID</span>
                <span>{groupName}</span>
                <span className="col-acciones">Acciones</span>
              </div>
              {policies.length === 0 ? (
                <div className="policy-table-empty">
                  No hay pólizas en este grupo.
                </div>
              ) : (
                policies.map((policy, idx) => (
                  <div
                    key={policy.id}
                    className={`policy-row ${idx % 2 === 0 ? "policy-row--even" : ""}`}
                  >
                    <span className="col-id">{policy.id}</span>
                    <span className="col-nombre">{policy.nombre}</span>
                    <div className="col-actions">
                      <button
                        className="action-btn action-btn--view"
                        onClick={() => setSelectedPolicy(policy)}
                      >
                        Ver
                      </button>
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => setFormModal({ policy, groupName })}
                      >
                        Editar
                      </button>
                      <button
                        className="action-btn action-btn--delete "
                        onClick={() =>
                          handleDelete(groupName, policy.id, policy.nombre)
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

        {Object.keys(filteredData).length === 0 && (
          <div className="no-results">No se encontraron pólizas.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ‹
        </button>
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            className={`page-btn ${currentPage === p ? "page-btn--active" : ""}`}
            onClick={() => setCurrentPage(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          ›
        </button>
      </div>

      {/* Modal ver */}
      {selectedPolicy && (
        <PolicyModal
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
        />
      )}

      {/* Modal añadir / editar */}
      {formModal && (
        <PolicyFormModal
          policy={formModal.policy}
          groupName={formModal.groupName}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
          catalogoServicios={catalogoServicios}
        />
      )}
    </div>
  );
}
