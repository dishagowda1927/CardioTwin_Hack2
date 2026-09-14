import React, { useState, useEffect, useRef } from "react";
import { 
  Volume2, VolumeX, Play, Pause, Square, MessageSquareText, 
  RotateCcw, Sparkles, Sliders, ChevronDown, Check, FastForward, Activity, Globe
} from "lucide-react";
import { Language, getVoiceLangCode } from "../i18n";

interface VoiceAssistantProps {
  textToSpeak: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  language?: Language;
}

export default function VoiceAssistant({ 
  textToSpeak, 
  title = "AI Clinical Narrator", 
  subtitle = "Interactive Spoken Briefing (TTS)",
  compact = false,
  language = "en"
}: VoiceAssistantProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<any>(null);

  // Initialize SpeechSynthesis and load available voices matching current language
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const s = window.speechSynthesis;
      setSynth(s);

      const updateVoices = () => {
        const available = s.getVoices();
        if (available && available.length > 0) {
          const langCode = getVoiceLangCode(language);
          const langPrefix = language === "en" ? "en" : language === "kn" ? "kn" : "hi";
          
          // Match by exact or prefix
          const matchedVoices = available.filter(v => 
            v.lang.toLowerCase().startsWith(langPrefix) || 
            v.lang.toLowerCase().includes(langPrefix)
          );
          
          const bestList = matchedVoices.length > 0 ? matchedVoices : available;
          setVoices(bestList);

          // Select preferred high-quality voice for the target language
          const preferred = bestList.find(v => 
            v.lang.toLowerCase().startsWith(langPrefix) && 
            (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("India") || v.name.includes("Neural"))
          ) || bestList[0];
          
          setSelectedVoice(preferred || null);
        }
      };

      updateVoices();
      s.onvoiceschanged = updateVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [language]);

  // Stop current speech if target text changed drastically
  useEffect(() => {
    if (isPlaying && synth) {
      synth.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setProgressPercent(0);
    }
  }, [textToSpeak]);

  // Strip markdown, asterisks, brackets for natural phonetics
  const cleanSpeechText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/###/g, "")
      .replace(/##/g, "")
      .replace(/#/g, "")
      .replace(/- /g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/\{.*?\}/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/`/g, "")
      .replace(/\n+/g, ". ");
  };

  const startSpeaking = () => {
    if (!synth) return;

    if (isPaused) {
      synth.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    synth.cancel(); // Reset any active queue

    const readableText = cleanSpeechText(textToSpeak);
    if (!readableText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(readableText);
    utterance.lang = getVoiceLangCode(language);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = isMuted ? 0 : volume;

    // Estimate duration for progress animation
    const words = readableText.split(/\s+/).length;
    const estimatedSeconds = Math.max(2, (words / (150 * speechRate)) * 60);
    const startTime = Date.now();

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgressPercent(0);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(95, Math.round((elapsed / estimatedSeconds) * 100));
      setProgressPercent(pct);
    }, 250);

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgressPercent(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setTimeout(() => setProgressPercent(0), 1000);
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis utterance error:", e);
      setIsPlaying(false);
      setIsPaused(false);
      setProgressPercent(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pauseSpeaking = () => {
    if (!synth) return;
    synth.pause();
    setIsPlaying(false);
    setIsPaused(true);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const stopSpeaking = () => {
    if (!synth) return;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgressPercent(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const restartSpeaking = () => {
    stopSpeaking();
    setTimeout(() => {
      startSpeaking();
    }, 100);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      // Re-trigger with updated volume
      const currentProgress = progressPercent;
      restartSpeaking();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-all">
        {isPlaying ? (
          <button
            type="button"
            onClick={pauseSpeaking}
            className="p-1 text-rose-600 hover:text-rose-700 transition-colors"
            title="Pause speech"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startSpeaking}
            className="p-1 text-slate-700 hover:text-rose-600 transition-colors"
            title="Listen with TTS"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
        <span className="text-[11px] font-bold text-slate-600">
          {isPlaying ? "Speaking..." : "Read Aloud"}
        </span>
        {isPlaying && (
          <div className="flex items-center gap-0.5 ml-1">
            <span className="w-1 h-3 bg-rose-500 rounded-full animate-[pulse_0.4s_infinite]" />
            <span className="w-1 h-4 bg-rose-500 rounded-full animate-[pulse_0.6s_infinite_delay-100] [animation-delay:0.1s]" />
            <span className="w-1 h-2 bg-rose-500 rounded-full animate-[pulse_0.5s_infinite_delay-200] [animation-delay:0.2s]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-3xl space-y-4 shadow-sm">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl transition-all ${
            isPlaying 
              ? "bg-rose-500 text-white shadow-md shadow-rose-200 animate-pulse" 
              : "bg-rose-50 text-rose-600"
          }`}>
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">
                {subtitle}
              </span>
              {isPlaying && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-extrabold uppercase rounded-full animate-pulse">
                  Live Playback
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{title}</h4>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Settings button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showSettings 
                ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            title="Configure Voice & Speed Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[11px]">{speechRate}x</span>
          </button>

          {/* Mute button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted 
                ? "bg-amber-50 border-amber-200 text-amber-700" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Play/Pause Main Button */}
          {isPlaying ? (
            <button
              type="button"
              onClick={pauseSpeaking}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-rose-700 transition-all cursor-pointer active:scale-95"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Speech</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startSpeaking}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? "Resume Audio" : "Listen to Analysis"}</span>
            </button>
          )}

          {/* Restart / Stop */}
          {(isPlaying || isPaused) && (
            <>
              <button
                type="button"
                onClick={restartSpeaking}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                title="Restart from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={stopSpeaking}
                className="p-2 bg-white hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                title="Stop Narrator"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress & Waveform Graphic */}
      {isPlaying && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-rose-600 font-extrabold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Narrating Clinical Brief
              </span>
            </div>
            <span>{selectedVoice?.name.slice(0, 24) || "Default Voice"}</span>
          </div>

          <div className="relative w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Dynamic Audio Equalizer Bars */}
          <div className="flex items-center justify-center gap-1 py-1.5 bg-slate-900 rounded-xl">
            <span className="w-1 h-3 bg-rose-400 rounded-full animate-[pulse_0.4s_infinite]" />
            <span className="w-1 h-5 bg-rose-400 rounded-full animate-[pulse_0.6s_infinite_delay-100] [animation-delay:0.1s]" />
            <span className="w-1 h-7 bg-rose-400 rounded-full animate-[pulse_0.5s_infinite_delay-200] [animation-delay:0.2s]" />
            <span className="w-1 h-4 bg-rose-400 rounded-full animate-[pulse_0.7s_infinite_delay-300] [animation-delay:0.3s]" />
            <span className="w-1 h-6 bg-rose-400 rounded-full animate-[pulse_0.4s_infinite_delay-150] [animation-delay:0.15s]" />
            <span className="w-1 h-8 bg-rose-400 rounded-full animate-[pulse_0.5s_infinite_delay-250] [animation-delay:0.25s]" />
            <span className="w-1 h-4 bg-rose-400 rounded-full animate-[pulse_0.3s_infinite_delay-350] [animation-delay:0.35s]" />
          </div>
        </div>
      )}

      {/* Expanded Voice & Speed Customization Panel */}
      {showSettings && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 pt-4 mt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              TTS Synthesizer Settings
            </span>
            <span className="text-[10px] text-slate-400 font-bold">{voices.length} Voices Found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Voice Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">Select Voice Profile</label>
              <select
                value={selectedVoice?.name || ""}
                onChange={(e) => {
                  const v = voices.find(voice => voice.name === e.target.value);
                  if (v) setSelectedVoice(v);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {voices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Speech Rate Controls */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">Playback Speed</label>
              <div className="flex gap-1.5">
                {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setSpeechRate(rate)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      speechRate === rate 
                        ? "bg-rose-500 text-white shadow-sm" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
