import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EspacesPage from "./pages/EspacesPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import CreateReservationPage from "./pages/CreateReservationPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEspaceForm from "./pages/AdminEspaceForm";
import EventsPage from "./pages/EventsPage";
import EventRegisterPage from "./pages/EventRegisterPage";
import MyEventRegistrationsPage from "./pages/MyEventRegistrationsPage";
import AdminEventsDashboard from "./pages/AdminEventsDashboard";
import AdminEventForm from "./pages/AdminEventForm";
import GarderiePage from "./pages/GarderiePage";
import GarderieReservePage from "./pages/GarderieReservePage";
import MyGarderieReservationsPage from "./pages/MyGarderieReservationsPage";
import AdminGarderieDashboard from "./pages/AdminGarderieDashboard";
import AdminGarderieForm from "./pages/AdminGarderieForm";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  const { t } = useTranslation();

  return (
    <Routes>
      {/* Redirection de "/" vers "/espace" */}
      <Route path="/" element={<Navigate to="/espace" replace />} />

      {/* Pages SANS Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Pages AVEC Layout + Navbar */}
      <Route
        path="/espace"
        element={
          <Layout>
            <EspacesPage />
          </Layout>
        }
      />

      <Route
        path="/reservations"
        element={
          <Layout>
            <MyReservationsPage />
          </Layout>
        }
      />

      <Route
        path="/reservations/new/:espaceId"
        element={
          <Layout>
            <CreateReservationPage />
          </Layout>
        }
      />

      {/* EVENTS */}
      <Route
        path="/events"
        element={
          <Layout>
            <EventsPage />
          </Layout>
        }
      />

      <Route
        path="/events/register/:id"
        element={
          <Layout>
            <EventRegisterPage />
          </Layout>
        }
      />

      <Route
        path="/events/my"
        element={
          <Layout>
            <MyEventRegistrationsPage />
          </Layout>
        }
      />

      {/* GARDERIE */}
      <Route
        path="/garderie"
        element={
          <Layout>
            <GarderiePage />
          </Layout>
        }
      />

      <Route
        path="/garderie/reserve/:id"
        element={
          <Layout>
            <GarderieReservePage />
          </Layout>
        }
      />

      <Route
        path="/garderie/my"
        element={
          <Layout>
            <MyGarderieReservationsPage />
          </Layout>
        }
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={
          <Layout>
            <ProfilePage />
          </Layout>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <Layout>
            <AdminDashboard />
          </Layout>
        }
      />

      <Route
        path="/admin/espaces/new"
        element={
          <Layout>
            <AdminEspaceForm />
          </Layout>
        }
      />

      <Route
        path="/admin/espaces/:id/edit"
        element={
          <Layout>
            <AdminEspaceForm />
          </Layout>
        }
      />

      <Route
        path="/admin/events"
        element={
          <Layout>
            <AdminEventsDashboard />
          </Layout>
        }
      />

      <Route
        path="/admin/events/new"
        element={
          <Layout>
            <AdminEventForm />
          </Layout>
        }
      />

      <Route
        path="/admin/events/:id/edit"
        element={
          <Layout>
            <AdminEventForm />
          </Layout>
        }
      />

      <Route
        path="/admin/garderie"
        element={
          <Layout>
            <AdminGarderieDashboard />
          </Layout>
        }
      />

      <Route
        path="/admin/garderie/new"
        element={
          <Layout>
            <AdminGarderieForm />
          </Layout>
        }
      />

      <Route
        path="/admin/garderie/edit/:id"
        element={
          <Layout>
            <AdminGarderieForm />
          </Layout>
        }
      />

      {/* Page 404 */}
      <Route
        path="*"
        element={
          <Layout>
            <div style={{ padding: "2rem" }}>{t("error.404")}</div>
          </Layout>
        }
      />
    </Routes>
  );
}
