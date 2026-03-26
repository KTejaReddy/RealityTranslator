import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/modules/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LoginUser() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative font-body selection:bg-primary/30">
      <Button 
        variant="ghost" 
        className="absolute top-6 left-6 text-white/60 hover:text-white hover:bg-white/5"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Button>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
        <div className="relative z-10">
          <LoginForm role="user" title="User Login" />
        </div>
      </div>
    </div>
  );
}
