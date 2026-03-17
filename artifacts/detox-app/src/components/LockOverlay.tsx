import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Clock, Unlock, AlertTriangle, KeyRound } from "lucide-react";
import { useLockState, useSetLockState } from "@/hooks/use-lock";
import { useQuestions } from "@/hooks/use-questions";
import { useSettings } from "@/hooks/use-settings";
import { useProgress, useSaveAnswer, useResetProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

export function LockOverlay() {
  const { data: lockState } = useLockState();
  const { data: settings } = useSettings();
  const { data: questions } = useQuestions();
  const { data: progress } = useProgress();
  
  const setLock = useSetLockState();
  const saveAnswer = useSaveAnswer();
  const resetProgress = useResetProgress();

  const [emergencyRequested, setEmergencyRequested] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answerError, setAnswerError] = useState(false);

  // Time remaining logic
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!lockState?.isLocked) {
      setEmergencyRequested(false);
      setTimeLeft(null);
      return;
    }

    if (lockState.emergencyUnlockAt) {
      const targetTime = new Date(lockState.emergencyUnlockAt).getTime();
      
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
        setTimeLeft(diff);
        
        if (diff === 0) {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [lockState?.isLocked, lockState?.emergencyUnlockAt]);

  const handleRequestEmergency = () => {
    if (!settings) return;
    setLock.mutate({ 
      data: { 
        isLocked: true, 
        emergencyDelayMinutes: settings.emergencyDelayMinutes 
      } 
    });
  };

  const answeredQuestionIds = useMemo(() => {
    return progress?.filter(p => p.answeredCorrectly).map(p => p.questionId) || [];
  }, [progress]);

  const correctlyAnsweredCount = answeredQuestionIds.length;
  const questionsRequired = settings?.questionCount || 0;
  
  const currentQuestion = useMemo(() => {
    if (!questions) return null;
    return questions.find(q => !answeredQuestionIds.includes(q.id));
  }, [questions, answeredQuestionIds]);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;
    
    if (currentAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase()) {
      setAnswerError(false);
      saveAnswer.mutate(
        { data: { questionId: currentQuestion.id, answeredCorrectly: true } },
        {
          onSuccess: () => {
            setCurrentAnswer("");
            // Check if we met the requirement (add 1 for the one we just answered)
            if (correctlyAnsweredCount + 1 >= questionsRequired) {
              setLock.mutate({ data: { isLocked: false } });
              resetProgress.mutate(undefined);
            }
          }
        }
      );
    } else {
      setAnswerError(true);
      setTimeout(() => setAnswerError(false), 2000);
    }
  };

  // If there are no questions configured but user needs to unlock, allow free unlock
  const handleFreeUnlock = () => {
    setLock.mutate({ data: { isLocked: false } });
    resetProgress.mutate(undefined);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!lockState?.isLocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen">
           <img 
              src={`${import.meta.env.BASE_URL}images/serene-bg.png`}
              alt="Serene Background"
              className="w-full h-full object-cover"
           />
        </div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
          
          {/* STATE 1: Locked, no emergency requested */}
          {!lockState.emergencyUnlockAt && !emergencyRequested && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(26,188,156,0.15)]">
                <ShieldAlert className="w-12 h-12 text-primary" />
              </div>
              <h1 className="font-display text-5xl font-bold text-foreground mb-4">Detox Active</h1>
              <p className="text-muted-foreground text-lg mb-12">
                Your screen is locked to help you focus and stay present. Take a deep breath.
              </p>
              
              <button
                onClick={() => setEmergencyRequested(true)}
                className="group relative px-8 py-4 w-full rounded-2xl overflow-hidden bg-secondary border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <div className="relative flex items-center justify-center space-x-3 text-foreground font-medium">
                  <Unlock className="w-5 h-5 opacity-70" />
                  <span>I need to unlock</span>
                </div>
              </button>
            </motion.div>
          )}

          {/* STATE 2: Emergency Request Confirmation */}
          {!lockState.emergencyUnlockAt && emergencyRequested && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col items-center w-full bg-card p-8 rounded-3xl border border-border shadow-2xl"
            >
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-6" />
              <h2 className="font-display text-2xl font-bold mb-2">Emergency Bypass</h2>
              <p className="text-muted-foreground mb-8">
                Initiating bypass will start a {settings?.emergencyDelayMinutes}-minute mandatory wait period. After waiting, you must answer {settings?.questionCount} questions to unlock.
              </p>
              
              <div className="flex flex-col space-y-3 w-full">
                <button
                  onClick={handleRequestEmergency}
                  disabled={setLock.isPending}
                  className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(26,188,156,0.3)] transition-all"
                >
                  {setLock.isPending ? "Initiating..." : "Start Unlock Timer"}
                </button>
                <button
                  onClick={() => setEmergencyRequested(false)}
                  className="w-full px-6 py-4 rounded-xl bg-transparent text-muted-foreground font-medium hover:bg-secondary transition-all"
                >
                  Cancel & Continue Detox
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 3: Countdown Active */}
          {lockState.emergencyUnlockAt && timeLeft !== null && timeLeft > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              <Clock className="w-16 h-16 text-primary mb-8 animate-pulse" />
              <h2 className="font-display text-3xl text-muted-foreground mb-2">Mandatory Wait</h2>
              <div className="text-8xl font-display font-bold tracking-tighter text-foreground mb-8 tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <p className="text-muted-foreground">
                Take this time to consider if you really need your device right now.
              </p>
            </motion.div>
          )}

          {/* STATE 4: Questions (Delay passed) */}
          {lockState.emergencyUnlockAt && timeLeft === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="bg-card w-full p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(5, (correctlyAnsweredCount / questionsRequired) * 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2 text-primary">
                    <KeyRound className="w-5 h-5" />
                    <span className="font-semibold text-sm tracking-wider uppercase">Unlock Challenge</span>
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">
                    {correctlyAnsweredCount} / {questionsRequired}
                  </span>
                </div>

                {questions && questions.length === 0 ? (
                   <div className="py-8 text-center">
                     <p className="text-muted-foreground mb-6">No custom questions configured.</p>
                     <button
                        onClick={handleFreeUnlock}
                        className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold w-full"
                      >
                        Unlock Now
                      </button>
                   </div>
                ) : currentQuestion ? (
                  <form onSubmit={handleAnswerSubmit} className="text-left w-full">
                    <label className="block text-lg font-medium text-foreground mb-4 leading-snug">
                      {currentQuestion.question}
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Your answer..."
                      className={cn(
                        "w-full bg-background border-2 rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 transition-all",
                        answerError 
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20 text-destructive" 
                          : "border-border focus:border-primary focus:ring-primary/20"
                      )}
                    />
                    {answerError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm mt-2 font-medium"
                      >
                        Incorrect. Take a breath and try again.
                      </motion.p>
                    )}
                    <button
                      type="submit"
                      disabled={!currentAnswer.trim() || saveAnswer.isPending}
                      className="mt-6 w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all"
                    >
                      {saveAnswer.isPending ? "Checking..." : "Submit Answer"}
                    </button>
                  </form>
                ) : (
                   <div className="py-12 flex flex-col items-center justify-center">
                     <ShieldCheck className="w-16 h-16 text-primary mb-4" />
                     <p className="text-xl font-medium text-foreground">Verifying...</p>
                   </div>
                )}
              </div>
            </motion.div>
          )}
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
