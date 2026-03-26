import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/modules/auth/LoginForm";
import type { AuthRole } from "@/modules/auth/authTypes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function LoginGovernment() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (file) {
      toast.success("Model queued locally! Please login to immediately launch the simulation.");
    } else {
      toast.error("Please select a file first.");
    }
  };

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
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 pointer-events-none" />
        
        <div className="relative z-10">
          <LoginForm role="government" title="Official Login" />
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2 font-display">Fast Track Live Upload</h3>
            <p className="text-xs text-white/50 mb-4 leading-relaxed">
              Queue your secure structural real-life model (.csv) directly. It will seamlessly initialize in the engine upon login.
            </p>
            <div className="flex flex-col gap-3">
              <Input 
                type="file" 
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="bg-background/40 border-white/10 text-white/80 cursor-pointer text-xs" 
              />
              <Button onClick={handleUpload} variant="outline" className="w-full border-white/15 text-white/80 hover:text-white hover:bg-white/5 h-10">
                Queue Upload
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

