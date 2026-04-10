import { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { UserProvider } from "../../context/UserProvider";
import { useEventNotifications } from "../../context/EventNotificationContext";
import { featureFlags } from "../../config/featureFlags";
import { GroupEventPopup } from "../../components/GroupEventPopup";

export default function Root() {
  const navigate = useNavigate();
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  const { notifications } = useEventNotifications();

  const pendingPopup = useMemo(() => {
    if (!featureFlags.eventNotifications) {
      return null;
    }

    return notifications.find((notification) => {
      if (notification.read) {
        return false;
      }
      return !dismissedNotificationIds.includes(notification.id);
    }) || null;
  }, [dismissedNotificationIds, notifications]);

  const dismissPopup = () => {
    if (!pendingPopup) {
      return;
    }

    setDismissedNotificationIds((prev) => [...prev, pendingPopup.id]);
  };

  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
        {pendingPopup && (
          <GroupEventPopup
            title={pendingPopup.title || "Evento grupal"}
            message={pendingPopup.message}
            onClose={dismissPopup}
            onOpen={() => {
              dismissPopup();
              navigate("/paciente/mis-citas");
            }}
          />
        )}
      </div>
    </UserProvider>
  );
}
