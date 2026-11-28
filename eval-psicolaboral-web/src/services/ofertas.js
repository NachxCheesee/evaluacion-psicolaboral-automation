import { api } from "../lib/api";

function queryCategoria(categoria) {
  if (!categoria || categoria === "Todas") return "";
  return `?categoria=${encodeURIComponent(categoria)}`;
}

export async function listarOfertasPublicas(categoria) {
  return api.get(`/api/ofertas/publicas${queryCategoria(categoria)}`);
}

export async function obtenerOfertaPublica(id) {
  return api.get(`/api/ofertas/publicas/${id}`);
}

export async function listarOfertasAdmin(categoria) {
  return api.get(`/api/ofertas${queryCategoria(categoria)}`);
}

export async function crearOferta(oferta) {
  return api.post("/api/ofertas", oferta);
}

export async function actualizarOferta(id, oferta) {
  return api.put(`/api/ofertas/${id}`, oferta);
}

export async function publicarOferta(id) {
  return api.patch(`/api/ofertas/${id}/publicar`);
}

export async function despublicarOferta(id) {
  return api.patch(`/api/ofertas/${id}/despublicar`);
}

export async function eliminarOferta(id) {
  return api.del(`/api/ofertas/${id}`);
}

export async function listarPostulacionesOferta(id) {
  return api.get(`/api/ofertas/${id}/postulaciones`);
}

export async function actualizarEstadoPostulacion(id, estado) {
  return api.patch(`/api/postulaciones/${id}/estado`, { estado });
}

export async function postularOferta(id, datos, archivo) {
  const formData = new FormData();
  formData.append(
    "datos",
    new Blob([JSON.stringify(datos)], { type: "application/json" })
  );
  formData.append("cv", archivo);
  return api.postForm(`/api/ofertas/publicas/${id}/postular`, formData);
}
