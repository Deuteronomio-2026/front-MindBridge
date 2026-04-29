import { createBrowserRouter, Navigate } from "react-router";

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
import PsychScheduleView from "../pages/psych/PsychScheduleView";
import PsychAppointments from "../pages/psych/PsychAppointments";
import PsychGroupSessions from "../pages/psych/PsychGroupSessions"; // 

import Auth from "../pages/Auth";

import AdminRoot from "../pages/admin/AdminRoot";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLogs from "../pages/admin/AdminLogs";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminMetrics from "../pages/admin/AdminMetrics";
import AdminOffers from "../pages/admin/AdminOffers";
import AdminGroupSessions from "../pages/admin/AdminGroupSessions";

export const router = createBrowserRouter([
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
  //  PACIENTE
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
      { path: "chat/:id", Component: ChatSession },
      { path: "*", Component: NotFound },
    ],
  },
  //  PSICÓLOGO
  {
    path: "/panel-psicologo",
    Component: PsychRoot,
    children: [
      { index: true, Component: PsychHome },
      { path: "citas", Component: PsychAppointments },
      { path: "chat/:id", Component: ChatSession },
      { path: "agenda", Component: PsychScheduleView },
      { path: "agenda/editar", Component: PsychSchedule },
      { path: "perfil", Component: UserProfile },
      { path: "ofertas", Component: PsychOffers },
      { path: "sesiones-grupales", Component: PsychGroupSessions }, // ✅ Ruta para sesiones grupales
    ],
  },
  //  ADMIN
  {
    path: "/admin",
    Component: AdminRoot,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "metricas", Component: AdminMetrics },
      { path: "logs", Component: AdminLogs },
      { path: "usuarios", Component: AdminUsers },
      { path: "ofertas", Component: AdminOffers },
      { path: "sesiones-grupales", Component: AdminGroupSessions },
    ],
  },
]);