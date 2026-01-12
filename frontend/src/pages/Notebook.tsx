import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar as CalendarIcon, Clock, ChevronRight, Book, Lightbulb, X, Image as ImageIcon, ExternalLink, ChevronLeft, PenTool, Mic, BookOpen, Headphones, Trophy, Zap, Trash2 } from 'lucide-react';
import { GetAppState, DeleteLog, DeleteVocabulary } from "../../wailsjs/go/main/App";

const Notebook = ({ initialTab = 'sessions', initialSearch = '', initialId = null }: { initialTab?: 'vocabulary' | 'sessions', initialSearch?: string, initialId?: string | null }) => {
    const [activeTab, setActiveTab] = useState<'vocabulary' | 'sessions'>(initialTab);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [vocabList, setVocabList] = useState<any[]>([]);
    const [sessionLogs, setSessionLogs] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const fetchData = async () => {
        const state = await GetAppState();
        setVocabList(state.vocabulary || []);
        setSessionLogs(state.daily_logs || []);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setActiveTab(initialTab);
        setSearchQuery(initialSearch);
    }, [initialTab, initialSearch]);

    useEffect(() => {
        if (initialId && (sessionLogs.length > 0 || vocabList.length > 0)) {
            // Check logs first
            let item = sessionLogs.find(l => l.id === initialId);
            if (item) {
                setSelectedItem(item);
                setShowDetail(true);
                if (item.module) setSelectedCategory(item.module.toLowerCase());
                return;
            }

            // Check vocab
            item = vocabList.find(v => v.id === initialId);
            if (item) {
                setSelectedItem({ ...item, type: 'vocab' });
                setShowDetail(true);
                setActiveTab('vocabulary');
            }
        }
    }, [initialId, sessionLogs.length, vocabList.length]);

    const handleDelete = async () => {
        if (!selectedItem) return;

        try {
            const confirmName = selectedItem.type === 'vocab' ? `the vocabulary word "${selectedItem.word}"` : "this session log";
            const confirm = window.confirm(`Are you absolutely sure you want to erase ${confirmName}? This action is permanent and will affect your analytics.`);
            if (!confirm) return;

            if (selectedItem.type === 'vocab' || (!selectedItem.module && selectedItem.word)) {
                await DeleteVocabulary(selectedItem.id);
            } else {
                if (selectedItem.id) {
                    await DeleteLog(selectedItem.id);
                } else {
                    alert("This is an older legacy log without a unique ID and cannot be deleted individually. Only new logs support deletion.");
                    return;
                }
            }

            setSelectedItem(null);
            setShowDetail(false);
            await fetchData();
        } catch (error) {
            console.error("Failed to delete entry:", error);
            alert("System error preventing deletion. Please check logs.");
        }
    };

    const categories = [
        { id: 'vocabulary', name: 'Vocabulary', icon: Book, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { id: 'writing', name: 'Writing', icon: PenTool, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { id: 'speaking', name: 'Speaking', icon: Mic, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { id: 'reading', name: 'Reading', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { id: 'listening', name: 'Listening', icon: Headphones, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { id: 'mockup', name: 'Mock Simulation', icon: Trophy, color: 'text-white', bg: 'bg-indigo-600/20' },
    ];

    const filteredVocab = vocabList.filter(item =>
        item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.def.toLowerCase().includes(searchQuery.toLowerCase())
    ).reverse();

    const filteredLogs = sessionLogs.filter(log => {
        const matchesSearch = (log.reflection || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.module || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.date || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.id || '').toLowerCase() === searchQuery.toLowerCase();
        const matchesCategory = selectedCategory ? (log.module || '').toLowerCase() === selectedCategory : true;
        return matchesSearch && matchesCategory;
    }).reverse();

    const [showDetail, setShowDetail] = useState(false);

    return (
        <div className="flex flex-col xl:flex-row h-full gap-4 sm:gap-8 overflow-hidden">
            {/* Left: Archive Navigation */}
            <div className={`w-full xl:w-[400px] flex flex-col gap-4 sm:gap-6 ${showDetail ? 'hidden xl:flex' : 'flex'}`}>
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase">Notebook</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-zinc-600 uppercase tracking-widest">All knowledge stored locally.</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors group-focus-within:text-indigo-500" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your mind..."
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 sm:py-4 pl-12 pr-4 text-sm text-zinc-300 outline-none focus:border-indigo-500/30 transition-all placeholder:text-zinc-800"
                    />
                </div>

                <div className="flex p-1 bg-zinc-900 rounded-2xl border border-white/5">
                    <button
                        onClick={() => { setActiveTab('vocabulary'); setSelectedCategory(null); }}
                        className={`flex-1 py-2 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vocabulary' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Vocabulary
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`flex-1 py-2 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sessions' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Sessions
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-20 lg:pb-10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'sessions' && (!selectedCategory && !searchQuery) ? (
                            <motion.div
                                key="categories"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 gap-3"
                            >
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className="glass p-4 sm:p-5 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className={`p-2.5 sm:p-3 rounded-xl ${cat.bg}`}>
                                                <cat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${cat.color}`} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs sm:text-sm font-bold text-white uppercase italic">{cat.name}</p>
                                                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                                    {sessionLogs.filter(l => l.module?.toLowerCase() === cat.id).length} Entries
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </motion.div>
                        ) : activeTab === 'sessions' ? (
                            <motion.div
                                key="logs"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3"
                            >
                                <button
                                    onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white mb-4 transition-colors group"
                                >
                                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Back to Categories
                                </button>
                                {filteredLogs.length === 0 ? (
                                    <div className="text-center py-10 sm:py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-white/5">
                                        <p className="text-[10px] sm:text-xs font-bold text-zinc-700 uppercase tracking-widest">No sessions found</p>
                                    </div>
                                ) : (
                                    filteredLogs.map((log, i) => {
                                        let displayTitle = `${log.module} Session`;
                                        let displaySub = log.reflection || "No obstacles reported for this session.";

                                        if (log.module?.toLowerCase() === 'speaking' && log.content) {
                                            try {
                                                const data = JSON.parse(log.content);
                                                displayTitle = data.title || displayTitle;
                                            } catch (e) { }
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => { setSelectedItem(log); setShowDetail(true); }}
                                                className={`w-full glass p-4 sm:p-5 rounded-3xl text-left transition-all border group ${selectedItem?.id === log.id ? 'bg-white/10 border-indigo-500/30' : 'border-transparent hover:bg-white/5'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${log.module?.toLowerCase() === 'writing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                        log.module?.toLowerCase() === 'speaking' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                            'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                        }`}>
                                                        {displayTitle}
                                                    </span>
                                                    <span className="text-[9px] font-mono text-zinc-600">{log.date}</span>
                                                </div>
                                                <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-2 font-medium leading-relaxed italic border-l-2 border-indigo-500/20 pl-3">
                                                    {displaySub}
                                                </p>
                                            </button>
                                        );
                                    })
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="vocab"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-3"
                            >
                                {filteredVocab.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setSelectedItem({ ...item, type: 'vocab' }); setShowDetail(true); }}
                                        className={`w-full glass p-4 sm:p-6 rounded-3xl text-left transition-all border group ${selectedItem?.id === item.id ? 'bg-white/10 border-emerald-500/30' : 'border-transparent hover:bg-white/5'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="text-base sm:text-lg font-black italic text-white tracking-tight uppercase group-hover:text-emerald-400 transition-colors">{item.word}</h4>
                                            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{item.date_added}</span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-zinc-500 line-clamp-2 font-medium leading-relaxed">{item.def}</p>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right: Detail View */}
            <div className={`flex-1 ring-1 ring-white/5 rounded-[2rem] lg:rounded-[3.5rem] bg-zinc-900/10 flex flex-col p-4 sm:p-8 xl:p-12 overflow-y-auto custom-scrollbar relative ${showDetail ? 'flex' : 'hidden xl:flex'}`}>
                {/* Mobile/Tablet Back Button */}
                <button
                    onClick={() => setShowDetail(false)}
                    className="xl:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6 bg-zinc-900 w-fit px-4 py-2 rounded-full border border-white/5"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Archive
                </button>
                {selectedItem ? (
                    <motion.div
                        key={selectedItem.id || selectedItem.date + selectedItem.module}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-12"
                    >
                        {selectedItem.type === 'vocab' ? (
                            <>
                                <div className="space-y-6 border-b border-white/5 pb-12">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Vocabulary Entry</span>
                                        <span className="text-zinc-500 text-xs font-mono">{selectedItem.date_added}</span>
                                    </div>
                                    <h1 className="text-4xl sm:text-5xl xl:text-7xl font-black text-white italic tracking-tighter uppercase break-words leading-none">{selectedItem.word}</h1>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        <Book className="w-4 h-4" /> Formal Definition
                                    </h3>
                                    <div className="bg-emerald-500/5 rounded-2xl p-8 border border-emerald-500/10">
                                        <p className="text-2xl font-bold text-emerald-100 leading-relaxed italic">"{selectedItem.def}"</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4" /> Contextual Usage
                                    </h3>
                                    <div className="bg-zinc-900/50 rounded-[2.5rem] p-10 border border-white/5">
                                        <p className="text-lg text-zinc-300 leading-relaxed whitespace-pre-wrap font-serif">
                                            {selectedItem.sentences}
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-4 border-b border-white/10 pb-8">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${selectedItem.module?.toLowerCase() === 'writing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                            selectedItem.module?.toLowerCase() === 'speaking' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                selectedItem.module?.toLowerCase() === 'reading' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                    'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                            }`}>
                                            {selectedItem.module || 'General'} Session
                                        </span>
                                        <span className="text-zinc-500 text-xs font-mono">{selectedItem.date}</span>
                                    </div>
                                    <h1 className="text-4xl font-bold text-white tracking-tight">
                                        {selectedItem.content ? (
                                            (() => {
                                                try {
                                                    // Writing mode: Title is often in content "TITLE: ..."
                                                    if (selectedItem.module?.toLowerCase() === 'writing') {
                                                        const match = selectedItem.content.match(/TITLE: (.*?)(\n|$)/);
                                                        return match ? match[1] : "Writing Session";
                                                    }
                                                    // Speaking mode: JSON
                                                    if (selectedItem.module?.toLowerCase() === 'speaking') {
                                                        const data = JSON.parse(selectedItem.content);
                                                        return data.title || "Speaking Session";
                                                    }
                                                    // Others
                                                    return selectedItem.module ? `${selectedItem.module} Session` : "Daily Reflection";
                                                } catch (e) {
                                                    // Fallback if parsing fails or not structured
                                                    return selectedItem.module ? `${selectedItem.module} Session` : "Daily Reflection";
                                                }
                                            })()
                                        ) : (selectedItem.module ? `${selectedItem.module} Session` : "Daily Reflection")}
                                    </h1>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                    <div className="p-4 sm:p-6 bg-zinc-900/30 rounded-2xl border border-white/5 space-y-2">
                                        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">Score / Rating</p>
                                        <p className="text-2xl sm:text-3xl font-black text-white">{selectedItem.score}</p>
                                    </div>
                                    <div className="p-4 sm:p-6 bg-zinc-900/30 rounded-2xl border border-white/5 space-y-2">
                                        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">Duration</p>
                                        <p className="text-2xl sm:text-3xl font-black text-white">{selectedItem.duration || 45} min</p>
                                    </div>
                                </div>

                                {selectedItem.module?.toLowerCase() === 'speaking' && selectedItem.content && (
                                    (() => {
                                        try {
                                            const data = JSON.parse(selectedItem.content);
                                            if (!data.audioUrl) return null;
                                            return (
                                                <div className="space-y-6">
                                                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Mic className="w-4 h-4" /> Captured Response
                                                    </h3>
                                                    <div className="bg-rose-500/10 rounded-[2.5rem] p-8 border border-rose-500/20 flex flex-col items-center gap-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Voice Record Archive</span>
                                                        </div>
                                                        <audio
                                                            src={data.audioUrl}
                                                            controls
                                                            onError={(e) => console.error("Audio playback error:", e)}
                                                            className="w-full max-w-md filter invert hue-rotate-180 opacity-80"
                                                        />
                                                        <div className="flex justify-center">
                                                            <a
                                                                href={data.audioUrl}
                                                                download={`speaking-${selectedItem.date}.mp4`}
                                                                className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-white transition-all bg-rose-500/5 px-4 py-2 rounded-xl border border-rose-500/20"
                                                            >
                                                                Download Record Fallback
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } catch (e) { return null; }
                                    })()
                                )}

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                        <X className="w-4 h-4" /> Obstacles & Challenges
                                    </h3>
                                    <div className="bg-rose-500/5 rounded-2xl p-8 border border-rose-500/10">
                                        <p className="text-base text-rose-100 leading-relaxed whitespace-pre-wrap italic opacity-80">
                                            {selectedItem.reflection || "No specific obstacles reported for this session."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4" /> Key Learnings
                                    </h3>
                                    <div className="bg-zinc-900/50 rounded-2xl p-8 border border-white/5">
                                        <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                            {selectedItem.learnings || "No specific learning points documented."}
                                        </p>
                                    </div>
                                </div>

                                {(selectedItem.source_url || selectedItem.screenshot) && (
                                    <div className="space-y-6 pt-8 border-t border-white/5">
                                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> Session Context
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {selectedItem.source_url && (
                                                <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-3">
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Source Material</p>
                                                    <a
                                                        href={selectedItem.source_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors group"
                                                    >
                                                        <span className="text-sm font-medium truncate flex-1 underline decoration-emerald-500/30">{selectedItem.source_url}</span>
                                                        <ExternalLink className="w-4 h-4 shrink-0" />
                                                    </a>
                                                </div>
                                            )}
                                            {selectedItem.screenshot && (
                                                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 group relative overflow-hidden">
                                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Question Screenshot</p>
                                                    <img
                                                        src={selectedItem.screenshot}
                                                        className="w-full h-auto rounded-xl border border-white/10 group-hover:scale-105 transition-transform duration-700 cursor-zoom-in"
                                                        alt="Session screenshot"
                                                        onClick={() => window.open(selectedItem.screenshot, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4" /> Tomorrow's Focus
                                    </h3>
                                    <div className="bg-emerald-500/5 rounded-2xl p-8 border border-emerald-500/10">
                                        <p className="text-lg text-emerald-100 font-medium leading-relaxed">
                                            {selectedItem.homework || "Maintain current standards."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-8 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                        <Book className="w-4 h-4" /> Work Content / Archive
                                    </h3>
                                    <div className="bg-zinc-900/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-white/10 min-h-[200px] flex items-center justify-center">
                                        <p className={`text-zinc-300 leading-relaxed whitespace-pre-wrap font-serif break-words ${selectedItem.content ? 'text-base sm:text-lg w-full text-left' : 'text-sm italic opacity-30'}`}>
                                            {selectedItem.module?.toLowerCase() === 'speaking' && selectedItem.content ? (
                                                (() => {
                                                    try {
                                                        const data = JSON.parse(selectedItem.content);
                                                        return data.notes || "No scratchpad notes were recorded for this session.";
                                                    } catch (e) { return selectedItem.content; }
                                                })()
                                            ) : (selectedItem.content || "No work content was archived during this session. Ensure you submit drafts or forge vocabulary entries to see them here.")}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-6 pt-12 border-t border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center justify-between p-8 bg-rose-500/5 rounded-[2.5rem] border border-rose-500/10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Danger Zone</p>
                                            <p className="text-xs text-zinc-500">Permanently delete this entry from your Notebook.</p>
                                        </div>
                                        <button
                                            onClick={handleDelete}
                                            className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                                            Erase Entry
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 space-y-4">
                        <CalendarIcon className="w-16 h-16 opacity-20" />
                        <p className="text-sm font-medium uppercase tracking-widest">Select an item from your Notebook</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notebook;
