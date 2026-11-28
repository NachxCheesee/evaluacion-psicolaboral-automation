const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ACCESS = "aquachile_access_token";
const REFRESH = "aquachile_refresh_token";
const SESSION = "aquachile_session";

export function obtenerToken() {
  return localStorage.getItem(ACCESS);
}

export function obtenerUsuario() {
  const raw = localStorage.getItem(SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION);
    return null;
  }
}

export function estaAutenticado() {
  return Boolean(obtenerToken());
}

function guardarSesion(data) {
  localStorage.setItem(ACCESS, data.accessToken);
  localStorage.setItem(REFRESH, data.refreshToken);
  localStorage.setItem(SESSION, JSON.stringify(data.usuario));
}

export function limpiarSesion() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(SESSION);
}

async function refrescarToken() {
  const refreshToken = localStorage.getItem(REFRESH);
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) return false;
    guardarSesion(await res.json());
    return true;
  } catch {
    return false;
  }
}

async function peticion(path, options = {}, reintentado = false) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = obtenerToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !reintentado) {
    const refrescado = await refrescarToken();
    if (refrescado) {
      headers.Authorization = `Bearer ${obtenerToken()}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const body = await res.json();
      mensaje = body.message || mensaje;
    } catch {
      // Respuesta sin JSON.
    }
    throw new Error(mensaje);
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res;
}

export async function login(correo, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, password })
  });

  if (!res.ok) {
    let mensaje = "Credenciales incorrectas.";
    try {
      mensaje = (await res.json()).message || mensaje;
    } catch {
      // Respuesta sin JSON.
    }
    throw new Error(mensaje);
  }

  const data = await res.json();
  guardarSesion(data);
  return data.usuario;
}

export async function logout() {
  const refreshToken = localStorage.getItem(REFRESH);
  if (refreshToken) {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
    } catch {
      // El cierre local es suficiente si el backend no responde.
    }
  }
  limpiarSesion();
}

export const api = {
  get: (path) => peticion(path),
  post: (path, body) => peticion(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => peticion(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => peticion(path, {
    method: "PATCH",
    body: body === undefined ? undefined : JSON.stringify(body)
  }),
  del: (path) => peticion(path, { method: "DELETE" }),
  postForm: (path, formData) => peticion(path, { method: "POST", body: formData })
};

export { BASE_URL };
