import { Outlet } from "react-router";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { UserProvider } from "../../context/UserProvider";

export default function Root() {
  return (
    <UserProvider>
      <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
}
