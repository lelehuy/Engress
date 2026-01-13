import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Calendar, Save, Zap, Bell, Lock, Clock, Shield, User, Trash2, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { GetAppState, UpdateTestDate, UpdateReminders, UpdateProfileName, GetAppVersion, CheckUpdate, DownloadUpdate, ResetAppData, Notify } from "../../wailsjs/go/main/App";
import { WindowReload } from "../../wailsjs/runtime/runtime";
import EngressCalendar from '../components/EngressCalendar';
import appIcon from '../assets/images/appicon.png';

const Settings = ({ onRefresh }: { onRefresh?: () => void }) => {
    const [name, setName] = useState('');
    const [testDate, setTestDate] = useState('2026-03-01');
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingReminders, setIsSavingReminders] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderTimes, setReminderTimes] = useState<string[]>(['10:00', '22:00']);
    const [appVersion, setAppVersion] = useState('v0.0.0');

    // Update States
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<any>(null); // { available: bool, msg: string, url: string, version: string }

    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        GetAppState().then(state => {
            if (state.user_profile.name) {
                setName(state.user_profile.name);
            }
            if (state.user_profile.test_date) {
                setTestDate(state.user_profile.test_date);
            }
            if (state.user_profile.reminder_times) {
                setReminderTimes(state.user_profile.reminder_times);
            }
            setReminderEnabled(state.user_profile.reminder_enabled !== false);
        });

        GetAppVersion().then(v => setAppVersion(v));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        await UpdateProfileName(name);
        await UpdateTestDate(testDate);
        await UpdateReminders(reminderEnabled, reminderTimes);
        if (onRefresh) onRefresh();
        setTimeout(() => setIsSaving(false), 500);
    };

    const handleSaveReminders = async () => {
        setIsSavingReminders(true);
        await UpdateReminders(reminderEnabled, reminderTimes);
        if (onRefresh) onRefresh();
        setTimeout(() => setIsSavingReminders(false), 500);
    };

    const handleCheckUpdate = async () => {
        setCheckingUpdate(true);
        setUpdateStatus(null);
        try {
            const info = await CheckUpdate();
            setCheckingUpdate(false);
            if (info.error) {
                setUpdateStatus({ available: false, msg: info.error });
            } else if (info.available) {
                setUpdateStatus({ available: true, msg: `New Version ${info.version} Available`, url: info.download_url, version: info.version });
            } else {
                setUpdateStatus({ available: false, msg: "You are on the latest version." });
            }
        } catch (e) {
            setCheckingUpdate(false);
            setUpdateStatus({ available: false, msg: "Connection Error" });
        }
    };

    const handleDownloadUpdate = async () => {
        if (!updateStatus?.url) return;
        setDownloading(true);
        const result = await DownloadUpdate(updateStatus.url, updateStatus.version);
        setDownloading(false);
        if (result === "Success") {
            setUpdateStatus({ available: false, msg: "Update Installed. Please Restart App." });
        } else {
            setUpdateStatus({ available: false, msg: result });
        }
    };

    const [testSent, setTestSent] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleTestAlert = () => {
        setTestSent(true);
        Notify("Engress: Mission Ready", "Your focus plan is active. Stay disciplined and conquer your goals!");
        setTimeout(() => setTestSent(false), 3000);
    };

    const handleResetApp = async () => {
        const result = await ResetAppData();
        if (result === "Success") {
            WindowReload();
        } else {
            alert("Reset failed: " + result);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col overflow-hidden pb-4">
            <div className="flex flex-col gap-1 shrink-0">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white italic uppercase">System Settings</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Configure your Engress and mission parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                {/* Column 1: Core Config */}
                <div className="space-y-6">
                    {/* Mission Profile Card */}
                    <div className="glass p-6 sm:p-8 rounded-[2.5rem] space-y-6 border-indigo-500/10 relative z-20">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <Shield className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white uppercase tracking-tight italic">Mission Profile</h3>
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Identity Calibration</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.25em] ml-2">Your Name</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter name..."
                                        className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-white font-black outline-none focus:border-indigo-500/50 transition-all text-xs uppercase tracking-widest placeholder:text-zinc-800"
                                    />
                                </div>
                            </div>


                            <div className="space-y-2 relative">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.25em] ml-2">Official Test Date</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <button
                                        onClick={() => setShowCalendar(!showCalendar)}
                                        className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-black outline-none focus:border-indigo-500/50 transition-all cursor-pointer text-xs uppercase tracking-widest text-left flex items-center justify-between"
                                    >
                                        <span>{testDate ? new Date(testDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Set Date'}</span>
                                        <ChevronRight className={`w-4 h-4 text-zinc-700 transition-transform ${showCalendar ? 'rotate-90' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showCalendar && (
                                            <div className="absolute top-full left-0 right-0 mt-2 z-[100] flex justify-center">
                                                <EngressCalendar
                                                    selectedDate={testDate}
                                                    onDateSelect={(date) => {
                                                        setTestDate(date);
                                                        setShowCalendar(false);
                                                    }}
                                                    onClose={() => setShowCalendar(false)}
                                                />
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${isSaving ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30 active:scale-95'}`}
                        >
                            {isSaving ? 'Directives Updated' : 'Update Configuration'}
                            {!isSaving && <Save className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Column 2: Reminders */}
                <div className="space-y-6">
                    {/* Active Reminders Card */}
                    <div className="glass p-6 sm:p-8 rounded-[2.5rem] border-indigo-500/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                    <Bell className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-tight italic">Active Reminders</h3>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">Discipline Rules</p>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${reminderEnabled ? 'bg-indigo-600' : 'bg-zinc-800'}`} onClick={() => setReminderEnabled(!reminderEnabled)}>
                                <motion.div
                                    animate={{ x: reminderEnabled ? 28 : 4 }}
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-bold italic border-l-2 border-indigo-500/20 pl-4">
                                Engress will transmit priority alerts if your daily mission is incomplete by the specified checkpoints.
                            </p>

                            {reminderEnabled && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {reminderTimes.map((time, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-zinc-950 border border-white/5 rounded-xl group/rem transition-all hover:border-indigo-500/30">
                                                <Clock className="w-3.5 h-3.5 text-zinc-700 shrink-0 group-hover/rem:text-indigo-400" />
                                                <input
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => {
                                                        const newTimes = [...reminderTimes];
                                                        newTimes[index] = e.target.value;
                                                        setReminderTimes(newTimes);
                                                    }}
                                                    className="bg-transparent text-white font-black outline-none uppercase text-[9px] tracking-widest flex-1 min-w-0"
                                                />
                                                <button
                                                    onClick={() => setReminderTimes(reminderTimes.filter((_, i) => i !== index))}
                                                    className="p-1 text-zinc-800 hover:text-red-500 transition-colors opacity-0 group-hover/rem:opacity-100"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {reminderTimes.length < 4 && (
                                            <button
                                                onClick={() => setReminderTimes([...reminderTimes, '21:00'])}
                                                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/5 rounded-xl text-[9px] font-black text-zinc-700 uppercase tracking-widest hover:border-indigo-500/30 hover:text-indigo-400 transition-all bg-zinc-950/20"
                                            >
                                                <Zap className="w-3 h-3" />
                                                Add
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-widest text-center">Maximum 4 dynamic checkpoints allowed</p>
                                </div>
                            )}
                            <button
                                onClick={handleSaveReminders}
                                disabled={isSavingReminders}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3 transition-all ${isSavingReminders ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-95'}`}
                            >
                                {isSavingReminders ? 'Protocols Synced' : 'Update Checkpoints'}
                                {!isSavingReminders && <Save className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Column 3: System Status */}
                <div className="space-y-6 flex flex-col h-full">
                    {/* Privacy Mode Card */}
                    <div className="glass p-6 sm:p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-3xl shadow-indigo-600/30 border-none space-y-4 shrink-0">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-xl">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Secure Storage</h3>
                        <p className="text-white/70 text-[10px] leading-relaxed font-bold italic">
                            Mission analytics and history are stored exclusively on local system.
                        </p>
                    </div>

                    {/* App Info Card */}
                    <div className="glass p-6 sm:p-8 rounded-[2.5rem] border-dashed border-white/10 space-y-6 flex flex-col items-center flex-1 min-h-0">
                        <div className="w-full flex items-center gap-3">
                            <div className="p-1.5 bg-zinc-900 rounded-lg">
                                <SettingsIcon className="w-3 h-3 text-zinc-600" />
                            </div>
                            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">System Architecture</span>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-4 pt-2 w-full">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center p-3 shadow-2xl relative">
                                <img src={appIcon} className="w-full h-full object-contain relative z-10" alt="Engress Logo" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Engress</h4>
                                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-1">{appVersion}</p>
                            </div>
                        </div>

                        <div className="w-full space-y-3 pt-6 border-t border-white/5 mt-auto">
                            {!updateStatus ? (
                                <button
                                    onClick={handleCheckUpdate}
                                    disabled={checkingUpdate}
                                    className="w-full py-3 border border-white/5 bg-zinc-950 rounded-xl text-[8px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:bg-zinc-900 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    <Zap className={`w-3 h-3 ${checkingUpdate ? 'animate-pulse text-indigo-400' : ''}`} />
                                    {checkingUpdate ? 'Scanning...' : 'Check Update'}
                                </button>
                            ) : (
                                <div className={`w-full p-4 rounded-2xl border ${updateStatus.available ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-zinc-950 border-white/5'} flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-2`}>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${updateStatus.available ? 'text-white' : 'text-zinc-700'}`}>
                                        {updateStatus.msg}
                                    </span>
                                    {updateStatus.available && (
                                        <button onClick={handleDownloadUpdate} disabled={downloading} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50">
                                            {downloading ? 'Installing...' : 'Download & Install'}
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={() => setShowResetConfirm(true)}
                                    className="w-full py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 border border-red-500/10 rounded-xl text-[8px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Wipe System
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="glass max-w-sm w-full rounded-[3rem] p-10 border-red-500/20 space-y-8 text-center"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Wipe All Data</h3>
                                <p className="text-zinc-500 text-xs mt-3 font-bold italic leading-relaxed">This will permanently delete ALL logs, vocabulary, and user configurations. This mandate cannot be reversed.</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-5 bg-zinc-900 border border-white/5 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all text-[10px] uppercase tracking-widest">Abort</button>
                                <button onClick={handleResetApp} className="flex-1 py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all text-[10px] uppercase tracking-widest shadow-2xl shadow-red-600/40">Execute Wipe</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
