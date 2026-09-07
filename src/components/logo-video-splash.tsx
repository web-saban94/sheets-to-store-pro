import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";

interface LogoVideoSplashProps {
  onComplete?: () => void;
}

export function LogoVideoSplash({ onComplete }: LogoVideoSplashProps) {
  // Check if shown in current session to not annoy recurring navigations,
  // but allow replay via event or initial load
  const [stage, setStage] = useState<"initial" | "playing" | "opening" | "morphing" | "done">(
    "initial",
  );
  const [videoAvailable, setVideoAvailable] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check sessionStorage if already seen this session; if so, skip animation
    const hasSeen = sessionStorage.getItem("hsaban_splash_seen");
    if (hasSeen) {
      setStage("done");
      if (onComplete) onComplete();
    } else {
      setStage("playing");
    }

    // Allow user to trigger replay anytime via custom event
    const handleReplay = () => {
      setStage("playing");
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("replay-hsaban-intro", handleReplay);
    return () => window.removeEventListener("replay-hsaban-intro", handleReplay);
  }, [onComplete]);

  const triggerGatesOpening = useCallback(() => {
    setStage((currentStage) => {
      if (currentStage === "done" || currentStage === "opening" || currentStage === "morphing") {
        return currentStage;
      }
      return "opening";
    });

    // After gates slide open, start morphing/shrinking into header
    setTimeout(() => {
      setStage("morphing");
    }, 600);

    // Finish completely
    setTimeout(() => {
      setStage("done");
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hsaban_splash_seen", "true");
      }
      if (onComplete) onComplete();
    }, 1500);
  }, [onComplete]);

  // Handle video playback or timer fallback
  useEffect(() => {
    if (stage !== "playing") return;

    // Safety fallback timer in case video ends or doesn't autoplay/exist
    const safetyTimer = setTimeout(() => {
      triggerGatesOpening();
    }, 4200);

    return () => clearTimeout(safetyTimer);
  }, [stage, triggerGatesOpening]);

  const handleSkip = () => {
    triggerGatesOpening();
  };

  if (stage === "done") return null;

  const isOpening = stage === "opening" || stage === "morphing";
  const isMorphing = stage === "morphing";

  return (
    <div
      id="hsaban-intro-gate"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-700 pointer-events-auto ${
        isMorphing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Luxury Backdrop with ambient gold/steel spotlight */}
      <div className="absolute inset-0 bg-[#0B1120] opacity-98 backdrop-blur-3xl" />

      {/* Radiant luxury lighting glow behind logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-sky-600/20 via-amber-500/15 to-transparent blur-3xl pointer-events-none" />

      {/* =======================
          LUXURY SPLIT GATES (שער יוקרתי נפתח באמצע)
          ======================= */}
      {/* Left Door / Gate (חצי שער שמאלי) */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#070D18] via-[#0F172A] to-[#1E293B] border-r border-amber-500/30 shadow-[10px_0_30px_rgba(0,0,0,0.8)] z-10 transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isOpening ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Subtle decorative architectural steel grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        {/* Golden architectural accent seam */}
        <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
      </div>

      {/* Right Door / Gate (חצי שער ימני) */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-[#070D18] via-[#0F172A] to-[#1E293B] border-l border-amber-500/30 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-10 transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isOpening ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Subtle decorative architectural steel grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        {/* Golden architectural accent seam */}
        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
      </div>

      {/* =======================
          HERO VIDEO & LOGO CONTAINER
          Begins full-size in center, then scales & glides up to header
          ======================= */}
      <div
        className={`relative z-20 flex flex-col items-center justify-center p-4 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isMorphing
            ? "scale-25 -translate-y-[42vh] translate-x-[36vw] opacity-0"
            : "scale-100 translate-y-0 opacity-100"
        }`}
      >
        {/* Luxury Gold/Cobalt Halo Ring */}
        <div className="relative rounded-3xl p-1.5 bg-gradient-to-br from-amber-400 via-sky-500 to-amber-600 shadow-[0_0_60px_rgba(2,132,199,0.45)] animate-pulse">
          <div className="relative overflow-hidden rounded-[22px] bg-[#0A0F1D] w-[300px] sm:w-[420px] md:w-[480px] aspect-video flex items-center justify-center border border-white/10 shadow-2xl">
            {/* HTML5 Video Layer */}
            <video
              ref={videoRef}
              src="/hsaban_logo.mp4"
              playsInline
              autoPlay
              muted
              onEnded={triggerGatesOpening}
              onError={() => {
                // If video file is not yet placed, fallback visual runs seamlessly
                setVideoAvailable(false);
              }}
              onLoadedData={() => {
                setVideoAvailable(true);
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                videoAvailable ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />

            {/* Premium Elegant Fallback Visual (if video is still loading or rendering) */}
            {videoAvailable !== true && (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 select-none">
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-400 to-sky-500 blur-md opacity-70 animate-pulse" />
                  <span className="relative grid size-16 sm:size-20 place-items-center rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-3xl sm:text-4xl font-black text-white shadow-xl border border-white/20 tracking-wider">
                    ח.ס
                  </span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white drop-shadow-md">
                    ח. סבן חומרי בניין
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-300/90 uppercase">
                    (1994) בע״מ · הוד השרון
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-sky-200/80 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-500/30">
                  <Sparkles className="size-3 text-amber-400 animate-spin" />
                  <span>איכות, מקצועיות ושירות מנצח מאז 1994</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Brand Luxury Tagline under video box */}
        <div
          className={`mt-5 text-center transition-all duration-700 ${
            isOpening ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider shadow-lg">
            <span className="inline-block size-2 rounded-full bg-emerald-400 animate-ping" />
            <span>השער לעולם הבנייה והשיפוצים נפתח</span>
          </div>
        </div>

        {/* Skip button for user convenience */}
        <button
          type="button"
          onClick={handleSkip}
          className={`mt-4 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors ${
            isOpening ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          דלג ישירות לחנות ←
        </button>
      </div>
    </div>
  );
}
