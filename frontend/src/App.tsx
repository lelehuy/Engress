import { useState, useEffect } from 'react';
import { Layout, Zap, Home, BookOpen, Calendar, BarChart3, Settings as SettingsIcon, CreditCard, Clock, Shield, PenTool, Mic, Book, ChevronLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import StudyVault from './pages/StudyVault';
import Analytics from './pages/Analytics';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import Notebook from './pages/Notebook';
import Onboarding from './pages/Onboarding';
import Summary from './pages/Summary';
import Briefing from './pages/Briefing';
import { EventsOn } from "../wailsjs/runtime/runtime";
import { LogSession, GetAppState, SetPauseState, SetSessionCategory } from "../wailsjs/go/main/App";
import { getLocalDateString } from './utils/dateUtils';
import { useRef } from 'react';
import AppIcon from './assets/images/appicon.png';

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [vaultCategory, setVaultCategory] = useState<string | null>(null);
    const [activeUrl, setActiveUrl] = useState('');
    const [testDate, setTestDate] = useState<string | null>(null);
    const [daysLeft, setDaysLeft] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [lastDuration, setLastDuration] = useState(0);
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [notebookItemId, setNotebookItemId] = useState<string | null>(null);
    const [notebookSearch, setNotebookSearch] = useState('');
    const [lastSessionData, setLastSessionData] = useState<any>(null);
    const [notebookTab, setNotebookTab] = useState<'vocabulary' | 'sessions'>('sessions');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showDeadlinePopup, setShowDeadlinePopup] = useState(false);
    const [activeSession, setActiveSession] = useState<{
        category: string | null;
        startTime: number;
        data: any;
        isActive: boolean;
    }>(() => {
        const saved = localStorage.getItem('engress_active_session');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved session", e);
            }
        }
        return {
            category: null,
            startTime: 0,
            data: null,
            isActive: false
        };
    });

    useEffect(() => {
        localStorage.setItem('engress_active_session', JSON.stringify(activeSession));
    }, [activeSession]);

    const sessionRef = useRef(activeSession);
    useEffect(() => {
        sessionRef.current = activeSession;
    }, [activeSession]);

    const refreshAppState = () => {
        GetAppState().then(state => {
            if (!state.user_profile.is_setup_complete) {
                setCurrentPage('onboarding');
            }
            if (state.user_profile.test_date) {
                setTestDate(state.user_profile.test_date);
                const date = new Date(state.user_profile.test_date);
                const diff = date.getTime() - new Date().getTime();
                setDaysLeft(Math.ceil(diff / (1000 * 3600 * 24)));
            }

            const today = getLocalDateString();
            const total = (state.daily_logs || [])
                .filter((log: any) => log.date === today)
                .reduce((acc: number, log: any) => acc + (log.duration || 0), 0);
            setTodayMinutes(total);

            setIsLoading(false);
        });
    };

    useEffect(() => {
        refreshAppState();

        const unlistenUrl = EventsOn("url-active", (url: string) => {
            setActiveUrl(url);
        });

        const unlistenStop = EventsOn("hud-stop", () => {
            if (sessionRef.current.isActive) {
                handleFinish();
            }
        });

        return () => {
            unlistenUrl();
            unlistenStop();
        };
    }, []);

    useEffect(() => {
        if (activeSession.isActive && activeSession.category) {
            // Mockup component handles its own specific HUD updates (Listening, Reading, etc.)
            // So we don't overwrite it here with just "MOCKUP"
            if (activeSession.category !== 'mockup') {
                SetSessionCategory(activeSession.category.toUpperCase());
            }
        } else {
            SetSessionCategory('');
        }
    }, [activeSession.isActive, activeSession.category]);

    const handleFinish = async () => {
        // Capture session data immediately from ref to get the absolute latest state
        const sessionToSave = { ...sessionRef.current };
        const category = sessionToSave.category;
        const sessionData = sessionToSave.data;

        let duration = sessionData?.duration || 0;
        if (duration === 0 && sessionToSave.startTime > 0) {
            duration = Math.floor((Date.now() - sessionToSave.startTime) / 1000);
        }
        duration = Math.ceil(duration / 60);

        // 1. IMMEDIATE UI TRANSITION (Crucial for "One Click" feel)
        setActiveSession({ category: null, startTime: 0, data: null, isActive: false });
        setVaultCategory(null);
        setSidebarCollapsed(false);
        setCurrentPage('summary');
        setLastDuration(duration);

        // Push initial data to summary (content will be refined in background)
        setLastSessionData({
            category,
            duration,
            data: sessionData
        });

        // 2. BACKGROUND DATA EXTRACTION & SAVE
        let content = "";
        if (category === 'writing') {
            const essays = sessionData?.submittedEssays || [];
            content = essays.map((e: any) => `TITLE: ${e.title}\n${e.content}`).join('\n\n---\n\n');

            // Log Unfinished Task 1
            if (sessionData?.task1Data?.text && !content.includes(sessionData.task1Data.text)) {
                content += content ? '\n\n---\n\n' : '';
                content += `UNFINISHED TASK 1:\nPREMISE: ${sessionData.task1Data.premise || 'N/A'}\n${sessionData.task1Data.text}`;
            }
            // Log Unfinished Task 2
            if (sessionData?.task2Data?.text && !content.includes(sessionData.task2Data.text)) {
                content += content ? '\n\n---\n\n' : '';
                content += `UNFINISHED TASK 2:\nPREMISE: ${sessionData.task2Data.premise || 'N/A'}\n${sessionData.task2Data.text}`;
            }
            // Fallback for old data format
            if (sessionData?.text && !sessionData?.task1Data && !sessionData?.task2Data && !content.includes(sessionData.text)) {
                content += content ? '\n\n---\n\n' : '';
                content += `UNFINISHED DRAFT:\n${sessionData.text}`;
            }
        } else if (category === 'vocabulary') {
            const state = await GetAppState();
            const today = getLocalDateString();
            const words = (state.vocabulary || []).filter((v: any) => v.date_added === today);
            content = words.length > 0 ? "WORDS FORGED:\n" + words.map((w: any) => `- ${w.word.toUpperCase()}: ${w.def}`).join('\n') : "Vocabulary session.";
        } else if (category === 'speaking') {
            const speakingData = {
                title: sessionData?.title || 'Untitled Speaking Task',
                notes: sessionData?.notes || '',
                audioUrl: sessionData?.audioUrl || null
            };
            content = JSON.stringify(speakingData);
        } else {
            content = sessionData?.text || sessionData?.premise || sessionData?.notes || "No specific content recorded.";
        }

        await LogSession(
            category || 'General',
            "", // reflection
            0,  // score
            "", // homework
            duration,
            "", // learnings
            content,
            sessionData?.sourceUrl || "",
            sessionData?.screenshot || ""
        );

        // Update Summary view with the final extracted content
        setLastSessionData((prev: any) => prev ? { ...prev, data: { ...prev.data, content } } : prev);
        refreshAppState();
    };

    const getDeadlineMessage = () => {
        if (!testDate) {
            return "You haven't set a test date yet. Set one in Settings to track your progress!";
        }
        if (daysLeft <= 0) {
            return "Your test date has passed or is today! Time to review and apply your knowledge.";
        }
        if (daysLeft <= 7) {
            return `Your test is in ${daysLeft} day(s)! Focus on high-impact review and practice.`;
        }
        if (daysLeft <= 30) {
            return `Your test is in ${daysLeft} days. Keep up the consistent effort and target your weaknesses.`;
        }
        return `Your test is in ${daysLeft} days. You have time to build a strong foundation. Stay consistent!`;
    };

    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'vault', icon: Zap, label: 'Focus Lab' },
        { id: 'schedule', icon: Calendar, label: 'Schedule' },
        { id: 'notebook', icon: Book, label: 'Notebook' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    ];

    if (isLoading) return <div className="h-screen w-full bg-zinc-950 flex items-center justify-center text-zinc-500 uppercase tracking-widest font-black italic">Initializing Engress Protocol...</div>;

    if (currentPage === 'onboarding') {
        return <Onboarding onComplete={() => {
            refreshAppState();
            setCurrentPage('briefing');
        }} />;
    }

    if (currentPage === 'briefing') {
        return <Briefing onComplete={() => {
            refreshAppState();
            setCurrentPage('dashboard');
        }} />;
    }

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden">
            {/* Sidebar - Hide during focus modules or on small screens */}
            {(!activeSession.isActive || !activeSession.category) && (
                <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} glass border-r h-full flex-col p-4 transition-all duration-300 relative group`}>
                    <div className={`flex items-center gap-3 mb-10 px-2 pt-6 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="shrink-0 w-10 h-10">
                            <img src={AppIcon} alt="Engress Logo" className="w-full h-full object-contain rounded-xl shadow-lg shadow-indigo-500/10" />
                        </div>
                        {!sidebarCollapsed && <span className="text-xl font-bold tracking-tight italic uppercase animate-in fade-in duration-500">Engress</span>}
                    </div>

                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setVaultCategory(null);
                                    setCurrentPage(item.id);
                                }}
                                title={sidebarCollapsed ? item.label : ""}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === item.id
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {!sidebarCollapsed && <span className="font-medium text-sm tracking-tight animate-in fade-in duration-500">{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-6 border-t border-zinc-800/50 px-2 pb-4 space-y-2">
                        <button
                            onClick={() => setCurrentPage('settings')}
                            title={sidebarCollapsed ? "Settings" : ""}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === 'settings' ? 'bg-indigo-600/20 text-indigo-400' : 'text-zinc-500 hover:text-white'} ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                        >
                            <SettingsIcon className="w-5 h-5 shrink-0" />
                            {!sidebarCollapsed && <span className="font-medium text-sm animate-in fade-in duration-500">Settings</span>}
                        </button>

                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-zinc-500 hover:text-white hover:bg-zinc-900/50 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                        >
                            <div className={`transition-transform duration-500 ${sidebarCollapsed ? 'rotate-180' : ''}`}>
                                <ChevronLeft className="w-5 h-5 shrink-0" />
                            </div>
                            {!sidebarCollapsed && <span className="font-medium text-sm animate-in fade-in duration-500">Collapse Menu</span>}
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Bottom Nav */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass border-t z-50 flex items-center justify-around px-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setVaultCategory(null);
                                setCurrentPage(item.id);
                            }}
                            className={`flex flex-col items-center justify-center gap-1 transition-all ${currentPage === item.id ? 'text-indigo-400 scale-110' : 'text-zinc-500'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">{item.label.split(' ')[0]}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage('settings')}
                        className={`flex flex-col items-center justify-center gap-1 transition-all ${currentPage === 'settings' ? 'text-indigo-400 scale-110' : 'text-zinc-500'}`}
                    >
                        <SettingsIcon className="w-5 h-5" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Settings</span>
                    </button>
                </div>

                <header className={`flex items-center justify-between px-4 sm:px-8 z-20 transition-all ${activeSession.isActive && activeSession.category ? 'h-16 bg-zinc-950 border-b border-white/5' : 'h-20'}`}>
                    <div className="flex items-center gap-6">
                        {/* Mobile Logo */}
                        <div className="md:hidden w-8 h-8 shrink-0">
                            <img src={AppIcon} alt="Engress Logo" className="w-full h-full object-contain rounded-lg shadow-lg" />
                        </div>

                        {activeSession.category ? (
                            !activeSession.isActive && (
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg shadow-lg transition-colors bg-amber-500 shadow-amber-500/20">
                                        <Zap className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col cursor-pointer" onClick={() => {
                                        setCurrentPage('vault');
                                        setVaultCategory(activeSession.category);
                                    }}>
                                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white truncate max-w-[150px] group-hover:text-indigo-400 transition-colors">
                                            {activeSession.category}
                                        </span>
                                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter group-hover:text-white transition-colors">Resume Session</span>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div
                                onClick={() => setShowDeadlinePopup(true)}
                                className="glass px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-white/5 transition-all"
                            >
                                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                                <span className="text-[10px] sm:text-sm font-semibold truncate max-w-[80px] sm:max-w-none">{testDate ? new Date(testDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() : 'SET DATE'}</span>
                                <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
                                <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase hidden sm:block whitespace-nowrap">{daysLeft}D Left</span>
                                <div className="w-px h-4 bg-zinc-700 hidden sm:block" />
                                <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase whitespace-nowrap">{todayMinutes}m<span className="hidden sm:inline"> / 120m</span></span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {activeSession.category && (
                            <div className="flex items-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-right duration-700">
                                {!activeSession.isActive && (
                                    <div className="hidden lg:flex text-[10px] font-bold text-zinc-500 uppercase tracking-widest items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        Paused
                                    </div>
                                )}
                                <button
                                    onClick={handleFinish}
                                    className="px-4 sm:px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-500/20 border border-white/10"
                                >
                                    Finish
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <div className={`flex-1 ${currentPage === 'dashboard' ? 'overflow-hidden' : 'overflow-y-auto'} p-4 sm:p-8 pt-2 sm:pt-4 pb-20 md:pb-8`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {currentPage === 'dashboard' && (
                                <Dashboard
                                    activeSession={activeSession}
                                    testDateProps={testDate}
                                    daysLeftProps={daysLeft}
                                    onNavigate={(page: string, params?: string, query?: string) => {
                                        setCurrentPage(page);
                                        if (page === 'vault' && params) setVaultCategory(params);
                                        if (page === 'notebook') {
                                            if (params) setNotebookTab(params as 'vocabulary' | 'sessions');
                                            if (query && query.length > 10 && /^\d+$/.test(query)) {
                                                setNotebookItemId(query);
                                                setNotebookSearch('');
                                            } else {
                                                setNotebookSearch(query || '');
                                                setNotebookItemId(null);
                                            }
                                        }
                                    }}
                                    onShowDeadlinePopup={() => setShowDeadlinePopup(true)}
                                />
                            )}
                            {currentPage === 'vault' && (
                                <StudyVault
                                    initialCategory={vaultCategory}
                                    sessionState={activeSession}
                                    onBack={() => {
                                        // Keep activeSession so users can "continue" later
                                        setVaultCategory(null);
                                        setCurrentPage('dashboard');
                                    }}
                                    onUpdateSession={(data: any) => {
                                        setActiveSession((prev: any) => {
                                            // 1. Explicit clear
                                            if (data.category === null) {
                                                return { category: null, startTime: 0, data: null, isActive: false };
                                            }

                                            // 2. Allow if we are starting a new session OR if we are currently in an active session
                                            // This prevents "revival" because after Finish, prev.category is null,
                                            // and if data.isActive is not explicitly true, it won't pass.
                                            const isStarting = data.isActive === true;
                                            const isContinuing = prev.category !== null;

                                            if (!isStarting && !isContinuing) {
                                                return prev;
                                            }

                                            // 3. Auto-collapse sidebar
                                            if (data.isActive && !prev.isActive) {
                                                setSidebarCollapsed(true);
                                                // Reset backend pause state when starting/resuming
                                                SetPauseState(false);
                                            }

                                            return {
                                                ...prev,
                                                category: data.category || prev.category || vaultCategory,
                                                data: { ...prev.data, ...data },
                                                isActive: data.isActive !== undefined ? data.isActive : (prev.category ? prev.isActive : true)
                                            };
                                        });
                                    }}
                                    onTriggerReflection={(duration?: number) => {
                                        handleFinish();
                                    }}
                                />
                            )}
                            {currentPage === 'summary' && (
                                <Summary
                                    lastSession={lastSessionData}
                                    todayMinutes={todayMinutes}
                                    onComplete={() => {
                                        setCurrentPage('vault');
                                        setVaultCategory(null);
                                        refreshAppState();
                                    }}
                                    onStartNew={() => {
                                        setCurrentPage('vault');
                                        setVaultCategory(null);
                                    }}
                                />
                            )}
                            {currentPage === 'analytics' && (
                                <Analytics
                                    onNavigate={(page: string, params?: string, query?: string) => {
                                        setCurrentPage(page);
                                        if (page === 'notebook') {
                                            if (params) setNotebookTab(params as 'vocabulary' | 'sessions');
                                            if (query && query.length > 10 && /^\d+$/.test(query)) {
                                                setNotebookItemId(query);
                                                setNotebookSearch('');
                                            } else {
                                                setNotebookSearch(query || '');
                                                setNotebookItemId(null);
                                            }
                                        }
                                    }}
                                />
                            )}
                            {currentPage === 'schedule' && (
                                <Schedule
                                    onNavigate={(page: string, category?: string) => {
                                        setCurrentPage(page);
                                        if (category) setVaultCategory(category);
                                    }}
                                />
                            )}
                            {currentPage === 'notebook' && <Notebook initialTab={notebookTab} initialSearch={notebookSearch} initialId={notebookItemId} />}
                            {currentPage === 'settings' && <Settings onRefresh={refreshAppState} />}
                            {currentPage !== 'dashboard' && currentPage !== 'vault' && currentPage !== 'analytics' && currentPage !== 'schedule' && currentPage !== 'notebook' && currentPage !== 'settings' && (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                                    <Layout className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm font-medium">Coming Soon</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {showDeadlinePopup && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeadlinePopup(false)}
                            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="glass max-w-sm w-full rounded-[2.5rem] p-8 border-indigo-500/30 text-center space-y-6"
                            >
                                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
                                    <AlertCircle className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Strategic Alert</h3>
                                    <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                                        {getDeadlineMessage()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDeadlinePopup(false)}
                                    className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                                >
                                    Focus & Execute
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default App;
