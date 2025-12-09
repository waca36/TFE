import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EspacesPage from "./pages/EspacesPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import CreateReservationPage from "./pages/CreateReservationPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEspaceForm from "./pages/AdminEspaceForm";
import AdminReservationsPage from "./pages/AdminReservationsPage";
import EventsPage from "./pages/EventsPage";
import EventRegisterPage from "./pages/EventRegisterPage";
import MyEventRegistrationsPage from "./pages/MyEventRegistrationsPage";
import AdminEventsDashboard from "./pages/AdminEventsDashboard";
import AdminEventForm from "./pages/AdminEventForm";
import AdminPendingEventsPage from "./pages/AdminPendingEventsPage";
import AdminPendingReservationsPage from "./pages/AdminPendingReservationsPage";
import GarderiePage from "./pages/GarderiePage";
import GarderieReservePage from "./pages/GarderieReservePage";
import MyGarderieReservationsPage from "./pages/MyGarderieReservationsPage";
import AdminGarderieDashboard from "./pages/AdminGarderieDashboard";
import AdminGarderieForm from "./pages/AdminGarderieForm";
import ProfilePage from "./pages/ProfilePage";
import OrganizerEventsPage from "./pages/OrganizerEventsPage";
import OrganizerEventForm from "./pages/OrganizerEventForm";
import HomePage from "./pages/HomePage";

export default function App() {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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

      <Route
        path="/profile"
        element={
          <Layout>
            <ProfilePage />
          </Layout>
        }
      />

      <Route
        path="/organizer/events"
        element={
          <Layout>
            <OrganizerEventsPage />
          </Layout>
        }
      />

      <Route
        path="/organizer/events/new"
        element={
          <Layout>
            <OrganizerEventForm />
          </Layout>
        }
      />

      <Route
        path="/organizer/events/edit/:id"
        element={
          <Layout>
            <OrganizerEventForm />
          </Layout>
        }
      />

      <Route
        path="/admin"
        element={
          <Layout>
            <AdminDashboard />
          </Layout>
        }
      />

      <Route
        path="/admin/reservations"
        element={
          <Layout>
            <AdminReservationsPage />
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
        path="/admin/events/pending"
        element={
          <Layout>
            <AdminPendingEventsPage />
          </Layout>
        }
      />

      <Route
        path="/admin/reservations/pending"
        element={
          <Layout>
            <AdminPendingReservationsPage />
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

      <Route
        path="*"
        element={
          <Layout>
            <div className="page404">{t("error.404")}</div>
          </Layout>
        }
      />
    </Routes>
  );
}
