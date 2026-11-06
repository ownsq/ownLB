import React, { useState, useEffect } from 'react';
import { Bell, Clock, MapPin, X, ArrowRight, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import { TriggeredAlert, getNotificationSettings, requestBrowserPushPermission, getPushPermissionStatus } from '../../utils/eventNotificationSystem';
import { useNavigate } from 'react-router-dom';

export function EventReminderBanner() {
  const [activeAlert, setActiveAlert] = useState<TriggeredAlert | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const navigate = useNavigate();

  useEffect(() => {
    setPushStatus(getPushPermissionStatus());

    const handleAlert = (e: CustomEvent<{ alert: TriggeredAlert }>) => {
      if (e.detail && e.detail.alert) {
        setActiveAlert(e.detail.alert);
        // If push permission is default and not denied/granted, show the quick enable prompt
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          setShowPermissionPrompt(true);
        }
      }
    };

    window.addEventListener('lanka_event_1hr_alert', handleAlert as EventListener);
    return () => {
      window.removeEventListener('lanka_event_1hr_alert', handleAlert as EventListener);
    };
  }, []);

  const handleEnablePush = async () => {
    const granted = await requestBrowserPushPermission();
    setPushStatus(getPushPermissionStatus());
    if (granted) {
      setShowPermissionPrompt(false);
    }
  };

  const handleViewEvent = () => {
    if (!activeAlert) return;
    const eventId = activeAlert.eventId;
    setActiveAlert(null);
    navigate(`/events?selected=${eventId}`);
  };

  const handleSnooze = () => {
    setActiveAlert(null);
  };

  if (!activeAlert) return null;

  return (
    <div className="fixed top-20 right-4 md:right-8 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
      <div className="bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border-2 border-amber-500/80 overflow-hidden shadow-amber-500/10">
        {/* Top Header bar with glowing chime indicator */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-2 flex items-center justify-between text-xs font-bold tracking-wide text-amber-50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span className="uppercase text-[11px] tracking-wider font-extrabold flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 fill-white text-white" />
              1-Hour Event Reminder
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeAlert.isSimulated && (
              <span className="bg-black/30 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded-full border border-white/20 font-medium">
                Simulation Test
              </span>
            )}
            <button 
              onClick={() => setActiveAlert(null)}
              className="text-white/80 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-3">
          <div className="flex gap-3 items-start">
            {activeAlert.eventImg ? (
              <img 
                src={activeAlert.eventImg} 
                alt={activeAlert.eventTitle} 
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-700 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Bell className="w-7 h-7" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {activeAlert.eventCategory || 'Community Gathering'}
                </span>
                <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {activeAlert.timeUntilLabel}
                </span>
              </div>

              <h4 className="font-bold text-sm text-neutral-100 line-clamp-2 leading-tight">
                {activeAlert.eventTitle}
              </h4>

              <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{activeAlert.eventLoc}</span>
              </p>
            </div>
          </div>

          {/* Schedule string */}
          <div className="bg-neutral-800/80 rounded-xl px-3 py-2 text-xs flex items-center justify-between text-neutral-300 border border-neutral-700/60">
            <span className="text-neutral-400 font-medium">Scheduled Time:</span>
            <span className="font-semibold text-white">{activeAlert.eventDate}</span>
          </div>

          {/* Optional Push Permission prompt if not yet granted */}
          {showPermissionPrompt && pushStatus === 'default' && (
            <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-2.5 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-neutral-300 text-[11px] leading-tight">
                  Enable browser push to receive alerts even when tab is backgrounded.
                </span>
              </div>
              <button
                onClick={handleEnablePush}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shrink-0 transition-colors shadow-xs"
              >
                Enable
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSnooze}
              className="flex-1 py-2 px-3 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold transition-colors text-center"
            >
              Dismiss
            </button>
            <button
              onClick={handleViewEvent}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <span>View Gathering</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
