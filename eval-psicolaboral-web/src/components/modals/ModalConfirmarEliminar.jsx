export default function ModalConfirmarEliminar({
  titulo = "¿Confirmar eliminación?",
  mensaje = "Esta acción no se puede deshacer.",
  textoBotonConfirmar = "Sí, eliminar",
  onConfirmar,
  onCancelar
}) {
  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(30,45,56,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "440px" }}>
        <div className="modal-content card-aquachile border-0 shadow-lg text-center p-3">
          <div className="modal-body py-3">
            <div
              className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3"
              style={{ width: "48px", height: "48px", backgroundColor: "#FDE8E8", color: "#E02424" }}
            >
              ✕
            </div>

            <h5 className="fw-bold mb-2" style={{ color: "var(--aqua-text-dark)" }}>
              {titulo}
            </h5>

            <div className="text-muted small mb-3">
              {mensaje}
            </div>

            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3"
                onClick={onCancelar}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger px-3"
                style={{ borderRadius: "3px" }}
                onClick={onConfirmar}
              >
                {textoBotonConfirmar}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}