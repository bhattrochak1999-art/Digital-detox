import { useLockState, useSetLockState } from "@/hooks/use-lock";
import { useProgress } from "@/hooks/use-progress";
import { useSettings } from "@/hooks/use-settings";
import { Shield, Battery, Target, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: lockState } = useLockState();
  const { data: settings } = useSettings();
  const { data: progress } = useProgress();
  const setLock = useSetLockState();

  const handleStartDetox = () => {
    setLock.mutate({ data: { isLocked: true, emergencyDelayMinutes: null } });
  };

  const isLocked = lockState?.isLocked;
  const answeredCount = progress?.filter(p => p.answeredCorrectly).length || 0;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto pb-24 md:pb-12">
      <header className="mb-12">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-lg">Your digital sanctuary awaits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-gradient-to-br from-card to-background border border-border rounded-3xl p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-display font-semibold">Detox Status</h2>
              </div>
              <p className="text-4xl font-bold text-foreground mb-2">
                {isLocked ? "Active" : "Ready"}
              </p>
              <p className="text-muted-foreground">
                {isLocked 
                  ? "You are currently disconnected from distractions." 
                  : "Start a session when you need deep focus."}
              </p>
            </div>
            
            <button
              onClick={handleStartDetox}
              disabled={isLocked || setLock.isPending}
              className="group relative overflow-hidden rounded-2xl px-8 py-5 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="relative z-10 flex items-center space-x-2 text-lg">
                <Lock className="w-5 h-5" />
                <span>{isLocked ? "Locked" : "Start Detox"}</span>
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-6 text-muted-foreground">
            <Target className="w-5 h-5" />
            <h3 className="font-medium">Current Goal</h3>
          </div>
          <div>
            <div className="text-5xl font-display font-bold text-foreground mb-2">
              {settings?.questionCount || 0}
            </div>
            <p className="text-sm text-muted-foreground">questions to unlock</p>
          </div>
          <div className="mt-6 w-full h-2 bg-secondary rounded-full overflow-hidden">
             <div 
               className="h-full bg-primary" 
               style={{ width: `${Math.min(100, (answeredCount / (settings?.questionCount || 1)) * 100)}%` }} 
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-start space-x-4">
          <div className="p-3 bg-secondary rounded-xl">
            <Battery className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Recharge Mind</h4>
            <p className="text-sm text-muted-foreground">Locking your screen reduces cognitive load and prevents doomscrolling.</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 flex items-start space-x-4">
          <div className="p-3 bg-secondary rounded-xl">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Intentional Friction</h4>
            <p className="text-sm text-muted-foreground">The delay and questions create a barrier that breaks unconscious habits.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
