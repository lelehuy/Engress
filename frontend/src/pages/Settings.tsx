import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Calendar, Save, Zap, Bell, Lock, Clock, Shield, User, Trash2, AlertTriangle } from 'lucide-react';
import { GetAppState, UpdateTestDate, UpdateReminders, UpdateProfileName, GetAppVersion, CheckUpdate, DownloadUpdate, ResetAppData } from "../../wailsjs/go/main/App";
import { WindowReload } from "../../wailsjs/runtime/runtime";
import logoUniversal from '../assets/images/logo-universal.png';
import appIcon from '../assets/images/appicon.png';

const Settings = () => {
    const [name, setName] = useState('');
    const [testDate, setTestDate] = useState('2026-03-01');
    const [isSaving, setIsSaving] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderTime, setReminderTime] = useState('10:00');
    const [appVersion, setAppVersion] = useState('v0.0.0');

    // Update States
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<any>(null); // { available: bool, msg: string, url: string, version: string }

    useEffect(() => {
        GetAppState().then(state => {
            if (state.user_profile.name) {
                setName(state.user_profile.name);
            }
            if (state.user_profile.test_date) {
                setTestDate(state.user_profile.test_date);
            }
            if (state.user_profile.reminder_time) {
                setReminderTime(state.user_profile.reminder_time);
            }
            setReminderEnabled(state.user_profile.reminder_enabled !== false);
        });

        GetAppVersion().then(v => setAppVersion(v));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        await UpdateProfileName(name);
        await UpdateTestDate(testDate);
        await UpdateReminders(reminderEnabled, reminderTime);
        setTimeout(() => setIsSaving(false), 500);
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
        await DownloadUpdate(updateStatus.url, updateStatus.version);
        setDownloading(false);
        setUpdateStatus({ available: false, msg: "Installer Launched" });
    };

    const [testSent, setTestSent] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleTestAlert = () => {
        setTestSent(true);
        import('../../wailsjs/go/main/App').then(({ Notify }) => {
            Notify("Engress Protocol", "Communication link active. Message received.");
        });
        setTimeout(() => setTestSent(false), 2000);
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
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-bold tracking-tight text-white">Application Settings</h1>
                <p className="text-zinc-500 font-medium italic">Configure your Engress and mission parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Settings */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <Shield className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">Mission Profile</h3>
                                <p className="text-[10px] sm:text-xs text-zinc-500">Initialize identity and timing calibration.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Commander Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name..."
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all text-sm uppercase tracking-widest placeholder:text-zinc-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Official Test Date</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="date"
                                        value={testDate}
                                        onChange={(e) => setTestDate(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500/50 transition-all cursor-pointer text-sm uppercase tracking-widest"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`w-full py-3 sm:py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 transition-all ${isSaving ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 active:scale-95'}`}
                        >
                            {isSaving ? 'Directives Updated' : 'Update Configuration'}
                            {!isSaving && <Save className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-indigo-600/5 border-indigo-500/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">Active Reminders</h3>
                            </div>
                            <div className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full relative cursor-pointer transition-colors ${reminderEnabled ? 'bg-indigo-600' : 'bg-zinc-800'}`} onClick={() => setReminderEnabled(!reminderEnabled)}>
                                <motion.div
                                    animate={{ x: reminderEnabled ? (window.innerWidth < 640 ? 20 : 24) : 4 }}
                                    className="absolute top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] sm:text-xs text-zinc-500 leading-relaxed font-medium">
                                Engress will transmit a priority alert if your daily study goal is not yet achieved by the specified timestamp.
                            </p>

                            {reminderEnabled && (
                                <div className="flex items-center gap-3 sm:gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl">
                                    <Clock className="w-4 h-4 text-zinc-600 shrink-0" />
                                    <input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="bg-transparent text-white font-black outline-none uppercase text-xs sm:text-sm tracking-widest"
                                    />
                                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest ml-auto hidden sm:inline">Daily Checkpoint</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-indigo-600 text-white shadow-22xl shadow-indigo-600/20 border-none space-y-4">
                        <Lock className="w-6 sm:w-8 h-6 sm:h-8 opacity-50" />
                        <h3 className="text-lg sm:text-xl font-bold leading-tight italic uppercase italic">Privacy Mode</h3>
                        <p className="text-white/60 text-[10px] sm:text-xs leading-relaxed font-medium">
                            Mission analytics and history are stored exclusively on your local system. No data transmission occurs beyond your authorization.
                        </p>
                    </div>

                    <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-dashed border-white/10 space-y-4">
                        <div className="flex items-center gap-2">
                            <SettingsIcon className="w-4 h-4 text-zinc-500" />
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">About Engress</span>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-4 py-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center p-3 border border-white/5 shadow-2xl">
                                <img src={appIcon} className="w-full h-full object-contain opacity-80" alt="Engress Logo" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Engress</h4>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Version {appVersion}</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            {!updateStatus ? (
                                <button
                                    onClick={handleCheckUpdate}
                                    disabled={checkingUpdate}
                                    className="w-full py-3 border border-white/5 bg-zinc-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                                >
                                    <Zap className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-pulse text-indigo-400' : ''}`} />
                                    {checkingUpdate ? 'Scanning Frequency...' : 'Check for Updates'}
                                </button>
                            ) : (
                                <div className={`w-full p-4 rounded-xl border ${updateStatus.available ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-zinc-900 border-white/5'} flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-2`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${updateStatus.available ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-500'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${updateStatus.available ? 'text-white' : 'text-zinc-500'}`}>
                                            {updateStatus.msg}
                                        </span>
                                    </div>

                                    {updateStatus.available && (
                                        <button
                                            onClick={handleDownloadUpdate}
                                            disabled={downloading}
                                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {downloading ? 'Downloading Installer...' : 'Download & Install'}
                                        </button>
                                    )}

                                    {!updateStatus.available && (
                                        <button
                                            onClick={() => setUpdateStatus(null)}
                                            className="text-[9px] font-bold text-zinc-600 hover:text-zinc-400 uppercase tracking-widest"
                                        >
                                            Check Again
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleTestAlert}
                                className={`w-full py-3 border rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${testSent ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'}`}
                            >
                                {testSent ? 'System Alert Sent' : 'Test Notifications'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Settings;
