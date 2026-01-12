import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { SetPauseState, UpdateTrayTime } from '../../wailsjs/go/main/App';
import { EventsOn } from '../../wailsjs/runtime/runtime';

interface SessionTimerProps {
    initialSeconds?: number;
    onTimeUpdate?: (seconds: number) => void;
}

const SessionTimer = ({ initialSeconds = 0, onTimeUpdate }: SessionTimerProps) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        const off = EventsOn("pause-state-changed", (isPaused: boolean) => {
            setIsActive(!isPaused);
        });
        return () => {
            // Unsubscribe if EventsOn returns a cleanup, or just ignore if it doesn't
        };
    }, []);

    useEffect(() => {
        let interval: any = null;

        const updateHUD = (t: number) => {
            const hours = Math.floor(t / 3600);
            const minutes = Math.floor((t % 3600) / 60);
            const secs = t % 60;
            const timeStr = hours > 0
                ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                : `${minutes}:${secs.toString().padStart(2, '0')}`;
            UpdateTrayTime(timeStr);
        };

        if (isActive) {
            // Immediate update to show HUD right away (remove "HIDDEN" status)
            updateHUD(seconds);

            interval = setInterval(() => {
                setSeconds(s => {
                    const newTime = s + 1;
                    if (onTimeUpdate) onTimeUpdate(newTime);
                    updateHUD(newTime);
                    return newTime;
                });
            }, 1000);
        } else {
            if (interval) clearInterval(interval);
            UpdateTrayTime("");
        }
        return () => {
            if (interval) clearInterval(interval);
            UpdateTrayTime("");
        };
    }, [isActive, onTimeUpdate]); // seconds exclusion is intentional to avoid resetting interval

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 bg-zinc-900/50 rounded-full px-4 py-2 border border-white/5">
            <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="font-mono text-lg font-bold text-white tabular-nums tracking-widest">
                {formatTime(seconds)}
            </span>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <button
                onClick={() => {
                    const nextState = !isActive;
                    setIsActive(nextState);
                    SetPauseState(!nextState); // backend 'paused' means !isActive
                }}
                className="hover:text-emerald-400 transition-colors"
            >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
        </div>
    );
};

export default SessionTimer;
