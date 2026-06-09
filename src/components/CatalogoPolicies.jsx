/* VISTA GENERAL DEL CATALOGO DE POLIZAS */
import { useState } from "react";
import PolicyModal from "./PolicyModal.jsx";
import PolicyFormModal from "./PolicyFormModal.jsx";
import { usePolicies } from "../services/usePolicies.js";
import "../css/CatalogoPolicies.css";

const GRUPOS = [
  "Pólizas de soporte general TI",
  "Pólizas de soporte CONTPAQi®",
  "Pólizas Combo",
];

const FILTER_OPTIONS = ["Todos", ...GRUPOS];

export default function CatalogoPolicies({ catalogoServicios = [] }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const { filteredData, loading, error, handleSave, handleDelete } =
    usePolicies(search, filter);

  const onSaveSubmit = async ({ policy, grupo, isEditing }) => {
    const ok = await handleSave({
      policy,
      grupo,
      oldGrupoName: formModal?.groupName,
    });
    if (ok) setFormModal(null);
  };

  return (
    <div className="catalogo-container">
      <h1 className="catalogo-title">Catálogo de Pólizas</h1>

      {/* Toolbar */}
      <div className="catalogo-toolbar">
        <button className="btn-add" onClick={() => setFormModal({})}>
          <span className="btn-add-icon">+</span> Añadir
        </button>

        <div className="filter-tabs">
          {FILTER_OPTIONS.map((opt) => (
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
        {loading && (
          <div className="policy-table-empty">Cargando catálogo...</div>
        )}

        {!loading && error && (
          <div className="policy-table-empty" style={{ color: "#ef4444" }}>
            Error: {error}
          </div>
        )}

        {!loading &&
          !error &&
          Object.entries(filteredData).map(([groupName, policies]) => (
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
                          className="action-btn action-btn--delete"
                          onClick={() => handleDelete(policy, groupName)}
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

        {!loading && !error && Object.keys(filteredData).length === 0 && (
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
          onSave={onSaveSubmit}
          catalogoServicios={catalogoServicios}
        />
      )}
    </div>
  );
}
