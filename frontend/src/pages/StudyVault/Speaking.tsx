import { useState, useEffect, useRef } from 'react';
import { Mic, Play, Square, RotateCcw, Save, ChevronLeft, Volume2, Shield, Settings, Lightbulb, ExternalLink, X, Share2, Target, Star, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SessionTimer from '../../components/SessionTimer';
import { GetAppState, UpdateNotes, SetHUDScratchpadVisible } from "../../../wailsjs/go/main/App";
import { EventsOn } from '../../../wailsjs/runtime/runtime';
import { preparationTips } from '../../data/prepTips';

const Speaking = ({ onBack, onFinish, initialData, onUpdate }: {
    onBack: () => void;
    onFinish: (duration: number) => void;
    initialData?: any;
    onUpdate?: (data: any) => void;
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [duration, setDuration] = useState(initialData?.duration || 0);
    const [hasRecording, setHasRecording] = useState(initialData?.hasRecording || false);
    const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl || '');
    const [screenshot, setScreenshot] = useState(initialData?.screenshot || '');
    const [title, setTitle] = useState(initialData?.title || '');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [audioUrl, setAudioUrl] = useState<string | null>(initialData?.audioUrl || null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(50).fill(4));
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (onUpdate) {
            onUpdate({
                isRecording,
                duration,
                hasRecording,
                sourceUrl,
                screenshot,
                title,
                notes,
                audioUrl
            });
        }
        UpdateNotes(notes);
    }, [isRecording, duration, hasRecording, sourceUrl, screenshot, title, notes, audioUrl, onUpdate]);

    useEffect(() => {
        const handleBlur = () => {
            SetHUDScratchpadVisible(true);
        };
        const handleFocus = () => {
            SetHUDScratchpadVisible(false);
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        const unlisten = EventsOn("hud-notes-update", (newNotes: string) => {
            setNotes(newNotes);
        });

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            unlisten();
            SetHUDScratchpadVisible(false);
        };
    }, []);

    const updateVisualizer = () => {
        if (!analyserRef.current || !isRecording) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const step = Math.floor(dataArray.length / 50);
        const newData = [];
        for (let i = 0; i < 50; i++) {
            const val = dataArray[i * step] / 2;
            newData.push(Math.max(4, val));
        }
        setVisualizerData(newData);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup Visualization
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            audioChunksRef.current = [];

            // Enhanced compatibility for macOS/Wails
            const mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm';
            const recorder = new MediaRecorder(stream, { mimeType });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                setIsProcessing(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result as string;
                    setAudioUrl(base64Audio);
                    setHasRecording(true);
                    setIsProcessing(false);
                };

                if (audioContextRef.current) audioContextRef.current.close();
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setTimeout(() => {
                animationFrameRef.current = requestAnimationFrame(updateVisualizer);
            }, 100);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone Error: Please ensure you have given permission to access the mic.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const playRecording = () => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play();
        }
    };

    const handleReset = () => {
        setAudioUrl(null);
        setHasRecording(false);
        audioChunksRef.current = [];
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
            {/* Speaking Zen Bar */}
            <div className="flex items-center justify-between px-8 py-4 bg-zinc-950/50 border-b border-white/5">
                <div className="flex items-center justify-between gap-6">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
                        <div className="px-4 py-1.5 rounded-lg bg-rose-600 text-white shadow-lg shadow-rose-600/20 text-[10px] font-black uppercase tracking-widest">
                            Speaking Simulator
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <SessionTimer initialSeconds={duration} onTimeUpdate={setDuration} />
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900 rounded-xl border border-white/5">
                        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-zinc-700'}`} />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-white">{isRecording ? 'Capturing...' : 'Mic Ready'}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 overflow-hidden">
                {/* Sidebar Controls */}
                <div className="col-span-4 border-r border-white/5 flex flex-col bg-zinc-950/50 overflow-hidden">
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 w-fit">
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Training Instructions</span>
                            </div>
                            <div className="p-5 bg-zinc-900/50 rounded-[1.5rem] border border-white/5 relative overflow-hidden group">
                                <p className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Engress Brainstorm</p>
                                <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                                    Use the scratchpad below to map out your thoughts. Focus on using a diverse range of vocabulary and maintaining fluency.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Speaking Topic / Title</span>
                                <PenTool className="w-3.5 h-3.5 text-zinc-700" />
                            </div>
                            <div className="relative group">
                                <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Speaking Topic / Title..."
                                    className="w-full bg-zinc-900/30 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-300 outline-none focus:border-rose-500/30 transition-all placeholder:text-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Scratchpad & Notes</span>
                                <Lightbulb className="w-3.5 h-3.5 text-zinc-700" />
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Brainstorm ideas, key vocabulary, or bullet points here..."
                                className="w-full h-40 bg-zinc-900/30 border border-white/5 rounded-2xl p-5 text-xs text-zinc-300 outline-none focus:border-rose-500/30 transition-all resize-none placeholder:text-zinc-800"
                            />
                        </div>

                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Reference Context</span>
                                <Share2 className="w-3.5 h-3.5 text-zinc-700" />
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2 tracking-tighter">Source Link</label>
                                    <div className="relative group">
                                        <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-rose-500 transition-colors" />
                                        <input
                                            value={sourceUrl}
                                            onChange={(e) => setSourceUrl(e.target.value)}
                                            placeholder="Paste question URL..."
                                            className="w-full bg-zinc-900/30 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-zinc-300 outline-none focus:border-rose-500/30 transition-all placeholder:text-zinc-800"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2 tracking-tighter">Topic Screenshot</label>
                                    {screenshot ? (
                                        <div className="relative group overflow-hidden rounded-2xl border border-white/5">
                                            <img src={screenshot} className="w-full h-32 object-cover transition-transform duration-700 group-hover:scale-105" alt="Topic" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={() => setScreenshot('')} className="p-2 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-32 bg-zinc-900/20 border border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-rose-500/30 transition-all hover:bg-rose-500/5 group">
                                            <Share2 className="w-5 h-5 text-zinc-700 group-hover:text-rose-400 mb-2 transition-transform group-hover:scale-110" />
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Attach Material</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setScreenshot(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Recorder Engine */}
                <div className="col-span-8 flex flex-col items-center justify-center p-12 bg-white/[0.01] relative">
                    <div className="w-full max-w-2xl space-y-12 z-10">
                        {/* Waveform Visualization */}
                        <div className="h-64 glass rounded-[3rem] flex items-center justify-center gap-2 px-12 relative overflow-hidden border border-white/5 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-rose-500/5" />
                            {visualizerData.map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 4 }}
                                    animate={{
                                        height: height,
                                        opacity: isRecording ? 1 : 0.2
                                    }}
                                    transition={{
                                        duration: 0.1,
                                    }}
                                    className={`w-1 rounded-full ${isRecording ? 'bg-rose-500' : 'bg-zinc-700'}`}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-12">
                            <div className="flex flex-col items-center gap-2">
                                <span className={`text-7xl font-black italic tracking-tighter tabular-nums transition-colors ${isRecording ? 'text-rose-500' : 'text-white'}`}>
                                    {Math.floor(duration / 60).toString().padStart(2, '0')}:{(duration % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                                    {isProcessing ? 'Finalizing Audio...' : isRecording ? 'Live Feed Extraction' : 'Ready to record'}
                                </span>
                            </div>

                            <div className="flex items-center gap-8">
                                <button
                                    onClick={handleReset}
                                    disabled={isRecording || isProcessing}
                                    className={`p-5 rounded-3xl bg-zinc-900 border border-white/5 transition-all active:scale-95 group ${isRecording || isProcessing ? 'opacity-20' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    <RotateCcw className="w-6 h-6 group-hover:rotate-[-45deg] transition-transform" />
                                </button>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    disabled={isProcessing}
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group ${isProcessing ? 'opacity-50 cursor-wait' : ''} ${isRecording
                                        ? 'bg-rose-600 shadow-rose-600/40 rotate-90 scale-110'
                                        : 'bg-white shadow-white/10'
                                        }`}
                                >
                                    {isProcessing ? (
                                        <RotateCcw className="w-10 h-10 text-rose-500 animate-spin" />
                                    ) : isRecording ? (
                                        <Square className="w-10 h-10 text-white fill-current" />
                                    ) : (
                                        <Mic className="w-12 h-12 text-black group-hover:scale-110 transition-transform" />
                                    )}
                                </motion.button>

                                <button
                                    onClick={playRecording}
                                    disabled={!hasRecording}
                                    className={`p-5 rounded-3xl bg-zinc-900 border border-white/5 transition-all active:scale-95 ${hasRecording ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-800'}`}
                                >
                                    <Play className="w-6 h-6 fill-current" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Aesthetic Background Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

export default Speaking;
