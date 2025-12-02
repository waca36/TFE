const API_URL = "http://localhost:8080";

export function authHeaders(token) {
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function loginRequest(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Email ou mot de passe incorrect");
  return res.json();
}

export async function registerRequest(data) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur d'inscription");
  return res.json();
}

export async function getEspaces() {
  const res = await fetch(`${API_URL}/api/public/espaces`);
  if (!res.ok) throw new Error("Erreur lors du chargement des espaces");
  return res.json();
}

export async function getReservationsByUser(id, token) {
  const res = await fetch(`${API_URL}/api/public/reservations/user/${id}`, {
    headers: authHeaders(token),
  });

  if (!res.ok) throw new Error("Impossible de récupérer les réservations");
  return res.json();
}

export async function createReservation(payload, token) {
  const res = await fetch(`${API_URL}/api/public/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Erreur lors de la création de la réservation");
  return res.json();
}

export async function adminGetEspaces(token) {
  const res = await fetch("http://localhost:8080/api/admin/espaces", {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération espaces (admin)");
  return res.json();
}

export async function adminGetEspace(id, token) {
  const res = await fetch(`http://localhost:8080/api/admin/espaces/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération espace (admin)");
  return res.json();
}

export async function adminCreateEspace(payload, token) {
  const res = await fetch("http://localhost:8080/api/admin/espaces", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur création espace (admin)");
  return res.json();
}

export async function adminUpdateEspace(id, payload, token) {
  const res = await fetch(`http://localhost:8080/api/admin/espaces/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur mise à jour espace (admin)");
  return res.json();
}

export async function adminDeleteEspace(id, token) {
  const res = await fetch(`http://localhost:8080/api/admin/espaces/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur suppression espace (admin)");
}

export async function getPublicEvents() {
  const res = await fetch("http://localhost:8080/api/public/events");
  if (!res.ok) throw new Error("Erreur chargement événements");
  return res.json();
}

export async function adminGetEvents(token) {
  const res = await fetch("http://localhost:8080/api/admin/events", {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur admin events");
  return res.json();
}

export async function adminCreateEvent(payload, token) {
  const res = await fetch("http://localhost:8080/api/admin/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur création event");
  return res.json();
}

export async function adminUpdateEvent(id, payload, token) {
  const res = await fetch(`http://localhost:8080/api/admin/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur modification event");
  return res.json();
}

export async function adminDeleteEvent(id, token) {
  const res = await fetch(`http://localhost:8080/api/admin/events/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur suppression event");
}


export async function getGarderieSessions() {
  const res = await fetch(`${API_URL}/api/public/garderie/sessions`);
  if (!res.ok) throw new Error("Erreur chargement sessions garderie");
  return res.json();
}

export async function createGarderieReservation(payload, token) {
  const res = await fetch(`${API_URL}/api/public/garderie/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur réservation garderie");
  return res.json();
}

export async function getMyGarderieReservations(token) {
  const res = await fetch(`${API_URL}/api/public/garderie/reservations/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération réservations garderie");
  return res.json();
}


export async function adminGetGarderieSessions(token) {
  const res = await fetch(`${API_URL}/api/admin/garderie/sessions`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération sessions (admin)");
  return res.json();
}

export async function adminGetGarderieSession(id, token) {
  const res = await fetch(`${API_URL}/api/admin/garderie/sessions/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération session (admin)");
  return res.json();
}

export async function adminCreateGarderieSession(payload, token) {
  const res = await fetch(`${API_URL}/api/admin/garderie/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur création session (admin)");
  return res.json();
}

export async function adminUpdateGarderieSession(id, payload, token) {
  const res = await fetch(`${API_URL}/api/admin/garderie/sessions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erreur modification session (admin)");
  return res.json();
}

export async function adminDeleteGarderieSession(id, token) {
  const res = await fetch(`${API_URL}/api/admin/garderie/sessions/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur suppression session (admin)");
}
