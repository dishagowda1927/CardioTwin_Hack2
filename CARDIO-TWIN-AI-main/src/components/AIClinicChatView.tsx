import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Send, Search, Mic, MicOff, Volume2, VolumeX, PhoneCall, PhoneOff, 
  Sparkles, Check, Info, ArrowRight, CornerDownLeft, Brain, User, Globe, AlertCircle, RefreshCw,
  Pause, Play, Square, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  citations?: { title: string; uri: string }[];
}

export default function AIClinicChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: "Hello! I am CardioTwin Consult AI, your clinical cardiology assistant. How can I assist you with your cardiovascular health questions, clinical variable interpretation, or preventative care guidelines today?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enableSearch, setEnableSearch] = useState(true);

  // Audio transcription states (Speech-To-Text STT)
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecordingTranscribe, setIsRecordingTranscribe] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const transcribeChunksRef = useRef<Blob[]>([]);

  // Text-To-Speech (TTS) states
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Live Voice API states
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat thread to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Init SpeechSynthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechRecognitionSupported(false);
    }
  }, []);

  // Cleanup Live audio & voice resources on unmount
  useEffect(() => {
    return () => {
      disconnectLive();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  // Text-To-Speech (TTS) Message Handler
  const handleSpeakMessage = (messageId: string, content: string) => {
    if (!synthRef.current) return;

    if (speakingMessageId === messageId) {
      if (isPausedSpeech) {
        synthRef.current.resume();
        setIsPausedSpeech(false);
        return;
      } else {
        synthRef.current.pause();
        setIsPausedSpeech(true);
        return;
      }
    }

    // New message speak
    synthRef.current.cancel();
    const cleanText = content
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/###/g, "")
      .replace(/##/g, "")
      .replace(/#/g, "")
      .replace(/- /g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/`/g, "")
      .replace(/\n+/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || 
                         voices.find(v => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    utterance.rate = 1.05;

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsPausedSpeech(false);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setIsPausedSpeech(false);
    };

    synthRef.current.speak(utterance);
    setSpeakingMessageId(messageId);
    setIsPausedSpeech(false);
  };

  const handleStopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setSpeakingMessageId(null);
    setIsPausedSpeech(false);
  };

  // 1. Text Chat Submission Handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    if (!textToSend) {
      setChatInput("");
    }

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          enableSearch
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI server.");
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "model",
        content: data.reply,
        citations: data.citations && data.citations.length > 0 ? data.citations : undefined
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat message failed:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "model",
          content: "⚠️ Connection Latency: I was unable to connect with the server. Please verify your internet connection or check your GEMINI_API_KEY environment variable."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Audio Transcription (STT): Real-time Web Speech Recognition with MediaRecorder fallback
  const toggleTranscriptionRecording = async () => {
    if (isRecordingTranscribe) {
      // Stop recording
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingTranscribe(false);
      return;
    }

    // Try Web Speech API SpeechRecognition for instant live STT
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsRecordingTranscribe(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setChatInput(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("SpeechRecognition error, falling back to server transcribe:", event.error);
          setIsRecordingTranscribe(false);
        };

        recognition.onend = () => {
          setIsRecordingTranscribe(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {
        console.warn("SpeechRecognition start failed, trying MediaRecorder fallback:", e);
      }
    }

    // Fallback to MediaRecorder + /api/transcribe
    transcribeChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          transcribeChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(transcribeChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64Payload = base64data.split(",")[1];
          
          setIsTranscribing(true);
          try {
            const res = await fetch("/api/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioBase64: base64Payload, mimeType: "audio/webm" })
            });
            
            if (!res.ok) throw new Error("Transcription server error.");
            const data = await res.json();
            if (data.transcription && data.transcription.trim() !== "[No speech detected]") {
              setChatInput(prev => (prev ? prev + " " + data.transcription : data.transcription));
            }
          } catch (err) {
            console.error("Transcription error:", err);
          } finally {
            setIsTranscribing(false);
          }
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingTranscribe(true);
    } catch (err: any) {
      console.error("Failed to access mic for transcription:", err);
      alert("Microphone permission denied or unsupported in this browser.");
    }
  };

  // 3. Live Voice Conversation (Live API)
  const connectLive = async () => {
    if (isLiveConnected || isLiveConnecting) return;
    setIsLiveConnecting(true);
    setLiveError(null);

    try {
      // Request mic access first
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      // Determine websocket protocol (ws vs wss)
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}`;
      console.log("Connecting to voice bridge WebSocket at", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Initialize local Web Audio context for input capture (16kHz PCM) and output playback (24kHz PCM)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputCtx;
      nextPlayTimeRef.current = outputCtx.currentTime;

      ws.onopen = () => {
        console.log("Live Voice bridge WebSocket connected.");
        setIsLiveConnected(true);
        setIsLiveConnecting(false);

        // Start capture mic data chunks and stream to WebSocket
        const micSource = inputCtx.createMediaStreamSource(micStream);
        micSourceRef.current = micSource;

        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        micProcessorRef.current = processor;

        micSource.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const float32Data = e.inputBuffer.getChannelData(0);
          const pcm16Buffer = float32To16BitPCM(float32Data);
          const base64Audio = arrayBufferToBase64(pcm16Buffer);
          
          ws.send(JSON.stringify({ audio: base64Audio }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            playLiveAudioChunk(msg.audio);
          }
          if (msg.interrupted) {
            // Cancel current scheduling queue to let user interrupt instantly
            nextPlayTimeRef.current = outputAudioCtxRef.current ? outputAudioCtxRef.current.currentTime : 0;
          }
          if (msg.error) {
            setLiveError(msg.error);
            disconnectLive();
          }
        } catch (err) {
          console.error("Error handling ws live message:", err);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        setLiveError("WebSocket connection lost or failed to handshake.");
        disconnectLive();
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
        disconnectLive();
      };

    } catch (err: any) {
      console.error("Failed to start Live session:", err);
      setLiveError(err.message || "Microphone access denied or websocket failure.");
      setIsLiveConnecting(false);
      setIsLiveConnected(false);
    }
  };

  const disconnectLive = () => {
    // 1. Close WebSocket
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    // 2. Stop microphone stream and capture nodes
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }
    if (micSourceRef.current) {
      micSourceRef.current.disconnect();
      micSourceRef.current = null;
    }

    // 3. Close AudioContexts
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(console.error);
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(console.error);
      outputAudioCtxRef.current = null;
    }

    setIsLiveConnected(false);
    setIsLiveConnecting(false);
  };

  // Conversions Float32 Array (Standard browser) into 16-bit Int PCM Array (Gemini standard)
  const float32To16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Play incoming 24kHz Base64-encoded PCM audio stream chunk smoothly
  const playLiveAudioChunk = (base64PCM: string) => {
    const outputCtx = outputAudioCtxRef.current;
    if (!outputCtx) return;

    try {
      const binary = window.atob(base64PCM);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const buffer = outputCtx.createBuffer(1, float32Array.length, 24000);
      buffer.getChannelData(0).set(float32Array);

      const source = outputCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(outputCtx.destination);

      const now = outputCtx.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + buffer.duration;
    } catch (err) {
      console.error("Audio chunk playback failed:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-rose-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-500 fill-rose-500/10" />
              Real-time Consultations
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            CardioTwin Consult AI
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Secure, full-stack multi-turn clinical chatbot, powered by Gemini 3.5 with real-time Google search grounding and low-latency live voice calls.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: Multi-turn chat & transcribing */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[640px]">
          {/* Top Panel Controls */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">CardioTwin Text Hub</span>
                <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">Clinical Advisor Chat Session</p>
              </div>
            </div>

            {/* Google Search Grounding toggle */}
            <label className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-3.5 py-2 cursor-pointer transition-colors select-none">
              <input 
                type="checkbox" 
                checked={enableSearch}
                onChange={() => setEnableSearch(!enableSearch)}
                className="accent-rose-500 w-3.5 h-3.5 rounded"
              />
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                Google Search Grounding
              </span>
            </label>
          </div>

          {/* Messages Scroll Thread */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-thin">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar Icon */}
                <div className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-between ${
                  m.role === "user" ? "bg-slate-900 text-white" : "bg-rose-50 text-rose-600"
                }`}>
                  {m.role === "user" ? <User className="w-5 h-5" /> : <Brain className="w-5 h-5 text-rose-600" />}
                </div>

                <div className="space-y-2">
                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border font-normal whitespace-pre-line relative group ${
                    m.role === "user" 
                      ? "bg-slate-900 text-slate-50 border-slate-900 shadow-sm rounded-tr-none" 
                      : "bg-slate-50/50 text-slate-800 border-slate-150 rounded-tl-none"
                  }`}>
                    {m.content}

                    {/* Text-To-Speech Button for Model Responses */}
                    {m.role === "model" && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(m.id, m.content)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            speakingMessageId === m.id
                              ? "bg-rose-500 text-white shadow-sm"
                              : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {speakingMessageId === m.id ? (
                            isPausedSpeech ? (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>Resume</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-3 h-3" />
                                <span>Pause TTS</span>
                              </>
                            )
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen (TTS)</span>
                            </>
                          )}
                        </button>

                        {speakingMessageId === m.id && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              <span className="w-1 h-3 bg-rose-500 rounded-full animate-[pulse_0.4s_infinite]" />
                              <span className="w-1 h-4 bg-rose-500 rounded-full animate-[pulse_0.6s_infinite_delay-100] [animation-delay:0.1s]" />
                              <span className="w-1 h-2 bg-rose-500 rounded-full animate-[pulse_0.5s_infinite_delay-200] [animation-delay:0.2s]" />
                            </div>
                            <button
                              type="button"
                              onClick={handleStopSpeech}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800"
                              title="Stop TTS"
                            >
                              <Square className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grounding citations panel */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 max-w-full">
                      <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider flex items-center gap-1.5 mb-2">
                        <Globe className="w-3.5 h-3.5" /> Verified Medical Sources
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {m.citations.map((c, idx) => (
                          <a 
                            key={idx}
                            href={c.uri}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="text-[11px] font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>[{idx + 1}] {c.title.slice(0, 30)}...</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Chat loading state */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <Brain className="w-5 h-5 text-rose-600 animate-pulse" />
                </div>
                <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-400 font-semibold ml-1">CardioTwin is processing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form / Inputs Console */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex gap-2.5 items-center relative">
              {/* Audio transcription input mic */}
              <button
                type="button"
                onClick={toggleTranscriptionRecording}
                disabled={isTranscribing}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  isRecordingTranscribe 
                    ? "bg-red-500 border-red-500 text-white shadow-lg animate-pulse" 
                    : isTranscribing 
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                }`}
                title={isRecordingTranscribe ? "Stop & Transcribe" : "Transcribe Question (Microphone)"}
              >
                {isRecordingTranscribe ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <div className="relative flex-1">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    isRecordingTranscribe 
                      ? "Listening to mic input... speak clearly." 
                      : isTranscribing 
                        ? "Transcribing with gemini-3.5-flash..." 
                        : "Query clinical variables, cardiovascular guidelines, risk scores..."
                  }
                  disabled={isRecordingTranscribe || isTranscribing}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:opacity-60 transition-all"
                />
                
                {/* Submit button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() || isRecordingTranscribe || isTranscribing}
                  className="absolute right-2 top-1.5 p-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 rounded-xl transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompts Panel */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-slate-400 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mr-1">Suggestions:</span>
              <button 
                onClick={() => handleSendMessage("Explain normal blood pressure guidelines according to AHA")}
                className="text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 transition-all cursor-pointer"
              >
                BP Guidelines
              </button>
              <button 
                onClick={() => handleSendMessage("What does a high cholesterol reading of 240 mg/dL signify?")}
                className="text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 transition-all cursor-pointer"
              >
                High Cholesterol
              </button>
              <button 
                onClick={() => handleSendMessage("How does smoking impact coronary blood vessels?")}
                className="text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 transition-all cursor-pointer"
              >
                Smoking Vessel Impact
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live voice consultation (Live API bridge) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[640px] justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md shadow-rose-100">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block leading-none">Gemini Live API</span>
                <h3 className="font-black text-slate-800 text-base mt-0.5">Live Voice Consultation</h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Bridge directly to the high-performance <b>gemini-3.1-flash-live-preview</b> voice model. Experience lightning-fast, bi-directional, conversational spoken consultations right inside your web browser.
            </p>

            {/* Connection state box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Live API Status</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    isLiveConnected 
                      ? "bg-emerald-500 animate-pulse" 
                      : isLiveConnecting 
                        ? "bg-amber-500 animate-ping" 
                        : "bg-slate-300"
                  }`} />
                  <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700">
                    {isLiveConnected ? "Connected" : isLiveConnecting ? "Connecting..." : "Offline"}
                  </span>
                </div>
              </div>

              {/* Real-time speech visualization loop */}
              {isLiveConnected ? (
                <div className="flex items-center justify-center gap-1.5 py-6 bg-slate-900 rounded-xl h-24 relative overflow-hidden border border-slate-800">
                  <span className="absolute top-2 left-3 text-[9px] uppercase font-bold text-rose-500 tracking-wider">Voice Stream Active</span>
                  <div className="w-1.5 h-10 bg-rose-500 rounded-full animate-[pulse_0.4s_infinite]" />
                  <div className="w-1.5 h-16 bg-rose-500 rounded-full animate-[pulse_0.6s_infinite_delay-100] [animation-delay:0.1s]" />
                  <div className="w-1.5 h-12 bg-rose-500 rounded-full animate-[pulse_0.5s_infinite_delay-200] [animation-delay:0.2s]" />
                  <div className="w-1.5 h-14 bg-rose-500 rounded-full animate-[pulse_0.4s_infinite_delay-100] [animation-delay:0.3s]" />
                  <div className="w-1.5 h-8 bg-rose-500 rounded-full animate-[pulse_0.3s_infinite_delay-300] [animation-delay:0.4s]" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6 bg-slate-100 border border-slate-200 border-dashed rounded-xl h-24 text-slate-400">
                  <PhoneOff className="w-5 h-5 text-slate-300 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Voice consultation is standby</span>
                </div>
              )}
            </div>

            {/* Error notifications */}
            {liveError && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-extrabold text-red-800">Voice connection failed</p>
                  <p className="text-[11px] text-red-600/90 font-medium mt-0.5 leading-relaxed">{liveError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action trigger call button */}
          <div className="space-y-4">
            <div className="bg-rose-50/40 p-4 border border-rose-100/50 rounded-2xl text-[11px] text-rose-800 leading-relaxed font-semibold">
              <span className="uppercase tracking-wide font-extrabold block text-rose-700 mb-1">Audio stream configurations</span>
              Microphone capture converts to 16-bit 16kHz PCM little-endian frames streamed via WebSocket pipeline. Output is received at 24kHz.
            </div>

            {isLiveConnected ? (
              <button
                type="button"
                onClick={disconnectLive}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-100"
              >
                <PhoneOff className="w-4 h-4" />
                Disconnect Voice Assistant
              </button>
            ) : (
              <button
                type="button"
                onClick={connectLive}
                disabled={isLiveConnecting}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold py-3.5 rounded-2xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-100"
              >
                {isLiveConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting voice pipeline...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    Start Live Spoken Call
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
