import { createBrowserRouter, Navigate, useParams } from "react-router";

import Root from "../pages/patient/Root";
import Home from "../pages/patient/Home";
import Psychologists from "../pages/patient/Psychologists";
import PsychologistDetail from "../pages/patient/PsychologistDetail";
import Booking from "../pages/patient/Booking";
import UserProfile from "../pages/UserProfile";
import Appointments from "../pages/patient/Appointments";
import NotFound from "../pages/patient/NotFound";
import ChatSession from "../pages/patient/ChatSession";

import PsychOffers from "../pages/psych/PsychOffer";
import PsychRoot from "../pages/psych/PsychRoot";
import PsychHome from "../pages/psych/PsychHome";
import PsychSchedule from "../pages/psych/PsychSchedule";
import PsychAppointments from "../pages/psych/PsychAppointments";

import Auth from "../pages/Auth";

import AdminRoot from "../pages/admin/AdminRoot";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLogs from "../pages/admin/AdminLogs";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminMetrics from "../pages/admin/AdminMetrics";
import AdminOffers from "../pages/admin/AdminOffers";

function LegacyChatRedirect() {
  const { id } = useParams();
  return <Navigate to={`/chat/${id || ""}`} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/chat/:id",
    Component: ChatSession,
  },

  {
    path: "/paciente/chat/:id",
    Component: LegacyChatRedirect,
  },

  {
    path: "/auth",
    Component: Auth,
  },

  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
  
  {
    path: "/paciente",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "psicologos", Component: Psychologists },
      { path: "psicologo/:id", Component: PsychologistDetail },
      { path: "reservar/:id", Component: Booking },
      { path: "perfil", Component: UserProfile },
      { path: "mis-citas", Component: Appointments },
      { path: "*", Component: NotFound },
    ],
  },

 
  {
    path: "/panel-psicologo",
    Component: PsychRoot,
    children: [
      { index: true, Component: PsychHome },
      { path: "citas", Component: PsychAppointments },
      { path: "agenda", Component: PsychSchedule },
      { path: "perfil", Component: UserProfile },
      { path: "ofertas", Component: PsychOffers },
    ],
  },

  // 👉 ADMIN
  {
    path: "/admin",
    Component: AdminRoot,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "metricas", Component: AdminMetrics },
      { path: "logs", Component: AdminLogs },
      { path: "usuarios", Component: AdminUsers },
      { path: "ofertas", Component: AdminOffers },
    ],
  },


]);