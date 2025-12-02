const API_URL = "http://localhost:8080";

export function authHeaders(token) {
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

// ==================== AUTH ====================

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

// ==================== ESPACES ====================

export async function getEspaces() {
  const res = await fetch(`${API_URL}/api/public/espaces`);
  if (!res.ok) throw new Error("Erreur lors du chargement des espaces");
  return res.json();
}

// ==================== RESERVATIONS ESPACES ====================

export async function getReservationsByUser(id, token) {
  const res = await fetch(`${API_URL}/api/public/reservations/user/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Impossible de récupérer les réservations");
  return res.json();
}

export async function getMyReservations(token) {
  const res = await fetch(`${API_URL}/api/public/reservations/me`, {
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

// ==================== EVENTS ====================

export async function getPublicEvents() {
  const res = await fetch(`${API_URL}/api/public/events`);
  if (!res.ok) throw new Error("Erreur lors du chargement des événements");
  return res.json();
}

export async function registerToEvent(payload, token) {
  const res = await fetch(`${API_URL}/api/public/events/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de l'inscription");
  }
  return res.json();
}

export async function getMyEventRegistrations(token) {
  const res = await fetch(`${API_URL}/api/public/events/registrations/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Impossible de récupérer les inscriptions");
  return res.json();
}

export async function cancelEventRegistration(id, token) {
  const res = await fetch(`${API_URL}/api/public/events/registrations/${id}/cancel`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de l'annulation");
  }
}

// ==================== GARDERIE ====================

export async function getGarderieSessions() {
  const res = await fetch(`${API_URL}/api/public/garderie/sessions`);
  if (!res.ok) throw new Error("Erreur lors du chargement des sessions");
  return res.json();
}

export async function getMyGarderieReservations(token) {
  const res = await fetch(`${API_URL}/api/public/garderie/reservations/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Impossible de récupérer les réservations");
  return res.json();
}

// ==================== PROFILE ====================

export async function getMyProfile(token) {
  const res = await fetch(`${API_URL}/api/user/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur chargement profil");
  return res.json();
}

export async function updateMyProfile(data, token) {
  const res = await fetch(`${API_URL}/api/user/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur mise à jour profil");
  return res.json();
}

export async function changeMyPassword(data, token) {
  const res = await fetch(`${API_URL}/api/user/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur changement mot de passe");
}

// ==================== ADMIN ESPACES ====================

export async function adminGetEspaces(token) {
  const res = await fetch(`${API_URL}/api/admin/espaces`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération espaces (admin)");
  return res.json();
}

export async function adminGetEspace(id, token) {
  const res = await fetch(`${API_URL}/api/admin/espaces/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Espace introuvable");
  return res.json();
}

export async function adminCreateEspace(data, token) {
  const res = await fetch(`${API_URL}/api/admin/espaces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur création espace (admin)");
  return res.json();
}

export async function adminUpdateEspace(id, data, token) {
  const res = await fetch(`${API_URL}/api/admin/espaces/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur modification espace (admin)");
  return res.json();
}

export async function adminDeleteEspace(id, token) {
  const res = await fetch(`${API_URL}/api/admin/espaces/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur suppression espace (admin)");
}

// ==================== ADMIN EVENTS ====================

export async function adminGetEvents(token) {
  const res = await fetch(`${API_URL}/api/admin/events`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération événements (admin)");
  return res.json();
}

export async function adminCreateEvent(data, token) {
  const res = await fetch(`${API_URL}/api/admin/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur création événement (admin)");
  return res.json();
}

export async function adminUpdateEvent(id, data, token) {
  const res = await fetch(`${API_URL}/api/admin/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur modification événement (admin)");
  return res.json();
}

export async function adminDeleteEvent(id, token) {
  const res = await fetch(`${API_URL}/api/admin/events/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur suppression événement (admin)");
}

// ==================== ADMIN GARDERIE ====================

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
  if (!res.ok) throw new Error("Session introuvable");
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
