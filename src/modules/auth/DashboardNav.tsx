import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";

export function DashboardNav({
  active,
}: {
  active: "user" | "government";
}) {
  const navigate = useNavigate();
  const { logout, session } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="text-white/90 font-display font-bold">
          Reality <span className="text-primary">Translator</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/"
            className="text-white/60 hover:text-white"
            aria-label="Go to index"
          >
            Home
          </Link>
          <Link
            to="/dashboard-user"
            className={active === "user" ? "text-primary font-semibold" : "text-white/60 hover:text-white"}
          >
            User Dashboard
          </Link>
          <Link
            to="/dashboard-government"
            className={active === "government" ? "text-primary font-semibold" : "text-white/60 hover:text-white"}
          >
            Official Dashboard
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {session?.email && <div className="text-white/50 text-xs">{session.email}</div>}
        <Button variant="outline" onClick={onLogout} className="border-white/15 text-white/80 hover:text-white">
          Logout
        </Button>
      </div>
    </div>
  );
}

