import { Routes, Route, Navigate } from "react-router-dom";


import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EspacesPage from "./pages/EspacesPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import CreateReservationPage from "./pages/CreateReservationPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEspaceForm from "./pages/AdminEspaceForm";
import EventsPage from "./pages/EventsPage";
import AdminEventsDashboard from "./pages/AdminEventsDashboard";
import AdminEventForm from "./pages/AdminEventForm";


export default function App() {
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
        path="/events"
        element={
          <Layout>
            <EventsPage />
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




      {/* Page 404 */}
      <Route path="*" element={<div>Page non trouvée</div>} />
    </Routes>
  );
}
