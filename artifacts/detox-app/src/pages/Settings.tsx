import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Settings2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [questionCount, setQuestionCount] = useState<number>(3);
  const [delay, setDelay] = useState<number>(3);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state with server data initially
  useEffect(() => {
    if (settings) {
      setQuestionCount(settings.questionCount);
      setDelay(settings.emergencyDelayMinutes);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      { data: { questionCount, emergencyDelayMinutes: delay } },
      { 
        onSuccess: () => {
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        }
      }
    );
  };

  const hasChanges = settings && (settings.questionCount !== questionCount || settings.emergencyDelayMinutes !== delay);

  if (isLoading) {
    return (
      <div className="p-6 md:p-12 max-w-3xl mx-auto flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto pb-24 md:pb-12">
      <header className="mb-10">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Detox Parameters</h1>
        <p className="text-muted-foreground">Tune the friction required to break your habits.</p>
      </header>

      <div className="space-y-8">
        <section className="bg-card border border-border rounded-3xl p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Question Requirement</h2>
              <p className="text-sm text-muted-foreground">Number of correct answers needed to unlock</p>
            </div>
          </div>
          
          <div className="pt-4 pb-2 px-2">
            <div className="flex justify-between items-end mb-4">
              <span className="text-4xl font-display font-bold text-primary">{questionCount}</span>
              <span className="text-muted-foreground font-medium">questions</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-3 font-medium">
              <span>Too easy (1)</span>
              <span>Intense (10)</span>
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-3xl p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Emergency Delay</h2>
              <p className="text-sm text-muted-foreground">Mandatory wait time before you can start answering</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[2, 3, 5].map((mins) => (
              <button
                key={mins}
                onClick={() => setDelay(mins)}
                className={cn(
                  "py-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-2",
                  delay === mins 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-border bg-background text-muted-foreground hover:border-border/80"
                )}
              >
                <span className="text-2xl font-bold">{mins}</span>
                <span className="text-sm font-medium">Minutes</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex items-start space-x-3 text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl">
             <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
             <p>A longer delay gives your brain more time to reconsider the impulse to check your device.</p>
          </div>
        </section>

        <div className="flex items-center justify-between pt-6 border-t border-border">
          {isSaved ? (
            <span className="text-primary font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Settings saved</span>
            </span>
          ) : (
            <span />
          )}
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
            className="px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50
              bg-foreground text-background hover:scale-[1.02] active:scale-95 shadow-lg
              disabled:hover:scale-100 disabled:shadow-none"
          >
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
