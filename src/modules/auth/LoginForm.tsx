import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthLoginInput } from "./authTypes";
import { useAuth } from "./AuthContext";
import { Info } from "lucide-react";

export function LoginForm({ role = "user", title }: { role?: "user" | "government", title?: string }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const input: AuthLoginInput = { email: email.trim(), password };

    if (!input.email || !input.password) {
      setError("Please enter email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(input);
      if (role === "government" || input.email === "gov@example.com") {
        navigate("/dashboard-government", { replace: true });
      } else {
        navigate("/simulate", { replace: true });
      }
    } catch {
      setError(isSignUp ? "Sign up failed. Please try again." : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-white/50">
          Access the Reality Translator simulator
        </p>
      </div>

      {!isSignUp && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
            <Info className="w-3 h-3" /> Test Credentials
          </div>
          <div className="text-sm text-white/70 space-y-1">
            <div className="flex justify-between items-center cursor-pointer hover:text-white transition-colors" onClick={() => setEmail("user@example.com")}>
              <span>Citizen:</span>
              <code className="text-primary bg-primary/20 px-2 py-0.5 rounded">user@example.com</code>
            </div>
            <div className="flex justify-between items-center cursor-pointer hover:text-white transition-colors" onClick={() => setEmail("gov@example.com")}>
              <span>Official:</span>
              <code className="text-cyan-400 bg-cyan-400/20 px-2 py-0.5 rounded">gov@example.com</code>
            </div>
            <div className="text-xs text-white/40 pt-1 mt-1 border-t border-white/10 text-right">
              Password: password
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-white/80 font-medium">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="name@example.com"
            className="bg-background/30 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-white/80 font-medium">Password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            className="bg-background/30 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isSubmitting ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Sign up" : "Sign in")}
        </Button>

        <div className="pt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "First time user? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
