import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function IndexLinks({
  compact = false,
}: {
  compact?: boolean;
}) {
  const btnClass = compact ? "h-9 px-3 text-xs" : "h-10 px-4 text-sm";

  return (
    <div className="flex items-center gap-2">
      <Link to="/" aria-label="Home">
        <Button variant="outline" className={btnClass + " border-white/15 text-white/85 hover:text-white"}>
          Home
        </Button>
      </Link>

      <Link to="/login-user">
        <Button variant="outline" className={btnClass + " border-white/15 text-white/85 hover:text-white"}>
          User
        </Button>
      </Link>
      <Link to="/login-government">
        <Button variant="outline" className={btnClass + " border-white/15 text-white/85 hover:text-white"}>
          Official
        </Button>
      </Link>
    </div>
  );
}

