import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";

export function AuthModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0a0a0e]/95 border-white/10 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />

        <div className="relative p-6 pt-8">
          <LoginForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
