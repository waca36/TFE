const API_URL = "http://localhost:8080";

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res, defaultMessage) {
  if (res.ok) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  let message = defaultMessage;
  // Essayer JSON puis texte simple
  try {
    const data = await res.json();
    if (data?.message) message = data.message;
    else if (data?.error) message = data.error;
    else if (typeof data === "string") message = data;
  } catch {
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      // ignore parse errors
    }
  }

  const lowerDefault = (defaultMessage || "").toLowerCase();
  const isReservation = lowerDefault.includes("réservation") || lowerDefault.includes("reservation");

  if (!message || message === defaultMessage) {
    if (res.status === 409 && isReservation) {
      message = "Cet espace est déjà réservé sur ce créneau. Merci de choisir un autre horaire.";
    } else if (res.status === 403 && isReservation) {
      message = "Accès refusé pour cette réservation : vérifiez le créneau ou reconnectez-vous.";
    } else if (res.status === 400 && isReservation) {
      message = "Réservation refusée : horaires ou paiement invalides pour ce créneau.";
    }
  }

  if (res.status && res.status !== 200) {
    message = `${message} (code ${res.status})`;
  }
  throw new Error(message);
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

export async function getEspaceReservationsForCalendar(espaceId, year, month) {
  const res = await fetch(`${API_URL}/api/public/reservations/espace/${espaceId}/calendar?year=${year}&month=${month}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des réservations");
  return res.json();
}

export async function getReservationsByUser(id, token) {
  const res = await fetch(`${API_URL}/api/public/reservations/user/${id}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res, "Impossible de récupérer les réservations");
}

export async function getMyReservations(token) {
  const res = await fetch(`${API_URL}/api/public/reservations/me`, {
    headers: authHeaders(token),
  });
  return handleResponse(res, "Impossible de récupérer les réservations");
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
  return handleResponse(res, "Erreur lors de la création de la réservation");
}

export async function cancelReservation(id, token) {
  const res = await fetch(`${API_URL}/api/public/reservations/${id}/cancel`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse(res, "Erreur lors de l'annulation");
}

// Demande de réservation d'auditoire (sans paiement, en attente d'approbation)
export async function requestAuditoriumReservation(payload, token) {
  const res = await fetch(`${API_URL}/api/public/reservations/auditorium`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, "Erreur lors de la demande de réservation");
}

// Payer une réservation approuvée
export async function payApprovedReservation(id, paymentIntentId, token) {
  const res = await fetch(`${API_URL}/api/public/reservations/${id}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ paymentIntentId }),
  });
  return handleResponse(res, "Erreur lors du paiement de la réservation");
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
  return handleResponse(res, "Erreur lors de l'inscription");
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
  return handleResponse(res, "Erreur lors de l'annulation");
}

// ==================== GARDERIE ====================

export async function getGarderieSessions() {
  const res = await fetch(`${API_URL}/api/public/garderie/sessions`);
  if (!res.ok) throw new Error("Erreur lors du chargement des sessions");
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
  return handleResponse(res, "Erreur lors de la réservation garderie");
}

export async function getMyGarderieReservations(token) {
  const res = await fetch(`${API_URL}/api/public/garderie/reservations/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Impossible de récupérer les réservations");
  return res.json();
}

export async function cancelGarderieReservation(id, token) {
  const res = await fetch(`${API_URL}/api/public/garderie/reservations/${id}/cancel`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handleResponse(res, "Erreur lors de l'annulation");
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

// ==================== ADMIN RESERVATIONS (VUE GLOBALE) ====================

export async function adminGetAllReservations(token) {
  const res = await fetch(`${API_URL}/api/admin/reservations/all`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération réservations (admin)");
  return res.json();
}

export async function adminGetAllSpaceReservations(token) {
  const res = await fetch(`${API_URL}/api/admin/reservations/spaces`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération réservations espaces (admin)");
  return res.json();
}

export async function adminGetAllEventRegistrations(token) {
  const res = await fetch(`${API_URL}/api/admin/reservations/events`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération inscriptions événements (admin)");
  return res.json();
}

export async function adminGetAllGarderieReservations(token) {
  const res = await fetch(`${API_URL}/api/admin/reservations/childcare`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération réservations garderie (admin)");
  return res.json();
}

// ==================== ADMIN STATS ====================

export async function adminGetStats(token) {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération statistiques");
  return res.json();
}

// ==================== ADMIN PENDING RESERVATIONS (AUDITOIRES) ====================

export async function adminGetPendingReservations(token) {
  const res = await fetch(`${API_URL}/api/admin/reservations/pending`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération réservations en attente");
  return res.json();
}

export async function adminApproveReservation(id, approved, rejectionReason, token) {
  const res = await fetch(`${API_URL}/api/admin/reservations/${id}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ approved, rejectionReason }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur approbation réservation");
  }
  return res.json();
}

// ==================== ORGANIZER EVENTS ====================

export async function organizerCreateEvent(data, token) {
  const res = await fetch(`${API_URL}/api/organizer/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur création événement");
  }
  return res.json();
}

export async function organizerGetMyEvents(token) {
  const res = await fetch(`${API_URL}/api/organizer/events/my`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération événements");
  return res.json();
}

export async function organizerGetMyEvent(id, token) {
  const res = await fetch(`${API_URL}/api/organizer/events/my/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Événement introuvable");
  return res.json();
}

export async function organizerUpdateMyEvent(id, data, token) {
  const res = await fetch(`${API_URL}/api/organizer/events/my/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur modification événement");
  }
  return res.json();
}

export async function organizerCancelMyEvent(id, token) {
  const res = await fetch(`${API_URL}/api/organizer/events/my/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur annulation événement");
}

// ==================== ADMIN EVENTS (avec approbation) ====================

export async function adminGetPendingEvents(token) {
  const res = await fetch(`${API_URL}/api/admin/events/pending`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération événements en attente");
  return res.json();
}

export async function adminApproveEvent(id, approved, rejectionReason, token) {
  const res = await fetch(`${API_URL}/api/admin/events/${id}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ approved, rejectionReason }),
  });
  if (!res.ok) throw new Error("Erreur approbation événement");
  return res.json();
}

// ==================== ADMIN USERS ====================

export async function adminGetUsers(token) {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Erreur récupération utilisateurs");
  return res.json();
}

export async function adminUpdateUserRole(id, role, token) {
  const res = await fetch(`${API_URL}/api/admin/users/${id}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Erreur modification rôle utilisateur");
  return res.json();
}

export async function adminUpdateUserStatus(id, status, token) {
  const res = await fetch(`${API_URL}/api/admin/users/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Erreur modification statut utilisateur");
  return res.json();
}
