export default function DashboardResumen({ solicitudes }) {
  const total = solicitudes.length;
  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente").length;
  const enProceso = solicitudes.filter((s) => s.estado === "En proceso").length;
  const finalizadas = solicitudes.filter((s) => s.estado === "Finalizada").length;

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card-custom p-3 shadow-sm border-start border-4 border-secondary">
          <small className="text-muted text-uppercase fw-semibold">Total Solicitudes</small>
          <h3 className="fw-bold mt-1 mb-0">{total}</h3>
        </div>
      </div>
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card-custom p-3 shadow-sm border-start border-4 border-warning">
          <small className="text-muted text-uppercase fw-semibold">Pendientes</small>
          <h3 className="fw-bold mt-1 mb-0 text-warning">{pendientes}</h3>
        </div>
      </div>
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card-custom p-3 shadow-sm border-start border-4 border-info">
          <small className="text-muted text-uppercase fw-semibold">En Proceso</small>
          <h3 className="fw-bold mt-1 mb-0 text-info">{enProceso}</h3>
        </div>
      </div>
      <div className="col-12 col-sm-6 col-lg-3">
        <div className="card-custom p-3 shadow-sm border-start border-4 border-success">
          <small className="text-muted text-uppercase fw-semibold">Finalizadas</small>
          <h3 className="fw-bold mt-1 mb-0 text-success">{finalizadas}</h3>
        </div>
      </div>
    </div>
  );
}