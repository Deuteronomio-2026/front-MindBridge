import { createBrowserRouter, Navigate } from "react-router";

// import Root from "./pages/Root";
// import Home from "./pages/Home";
// import Psychologists from "./pages/Psychologists";
// import PsychologistDetail from "./pages/PsychologistDetail";
// import Booking from "./pages/Booking";
import UserProfile from "../pages/UserProfile";
// import Appointments from "./pages/Appointments";
// import NotFound from "./pages/NotFound";
// import ChatSession from "./pages/ChatSession";
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    Component: Auth,
  },
  // {
  //   path: "/chat/:id",
  //   Component: ChatSession,
  // },
  // {
  //   path: "/",
  //   Component: Root,
  //   children: [
  //     { index: true, Component: Home },
  //     { path: "psicologos", Component: Psychologists },
  //     { path: "psicologo/:id", Component: PsychologistDetail },
  //     { path: "reservar/:id", Component: Booking },
  //     { path: "perfil", Component: UserProfile },
  //     { path: "mis-citas", Component: Appointments },
  //     { path: "*", Component: NotFound },
  //   ],
  // },
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
  {
    path: "/admin",
    Component: AdminRoot,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "metricas", Component: AdminMetrics },
      { path: "logs", Component: AdminLogs },
      { path: "usuarios", Component: AdminUsers },
      { path: "ofertas", Component: AdminOffers},
    ],
  },
]);