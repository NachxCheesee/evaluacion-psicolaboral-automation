const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ACCESS = "aquachile_access_token";
const REFRESH = "aquachile_refresh_token";
const SESSION = "aquachile_session";

export function obtenerToken() {
  return localStorage.getItem(ACCESS);
}

export function obtenerUsuario() {
  const raw = localStorage.getItem(SESSION);
  return raw ? JSON.parse(raw) : null;
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
  const rt = localStorage.getItem(REFRESH);
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt })
    });
    if (!res.ok) return false;
    guardarSesion(await res.json());
    return true;
  } catch (_) {
    return false;
  }
}

async function peticion(path, options = {}, reintentado = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const t = obtenerToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !reintentado) {
    const ok = await refrescarToken();
    if (ok) {
      headers.Authorization = `Bearer ${obtenerToken()}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const body = await res.json();
      mensaje = body.message || mensaje;
    } catch (_) {
      // sin cuerpo
    }
    throw new Error(mensaje);
  }

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
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
    } catch (_) {
      // sin cuerpo
    }
    throw new Error(mensaje);
  }
  const data = await res.json();
  guardarSesion(data);
  return data.usuario;
}

export async function logout() {
  const rt = localStorage.getItem(REFRESH);
  if (rt) {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt })
      });
    } catch (_) {
      // ignorar
    }
  }
  limpiarSesion();
}

export const api = {
  get: (p) => peticion(p),
  post: (p, body) => peticion(p, { method: "POST", body: JSON.stringify(body) }),
  put: (p, body) => peticion(p, { method: "PUT", body: JSON.stringify(body) }),
  patch: (p, body) => peticion(p, { method: "PATCH", body: JSON.stringify(body) }),
  del: (p) => peticion(p, { method: "DELETE" })
};
