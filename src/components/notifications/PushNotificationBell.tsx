'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, AlertCircle, Sparkles, Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface PushNotificationBellProps {
  trainNumber: string;
  trainName: string;
}

export function PushNotificationBell({ trainNumber, trainName }: PushNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [delayThreshold, setDelayThreshold] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          setIsSubscribed(true);
          setSubscription(sub);
        }
      } catch (err) {
        console.warn('Subscription check error:', err);
      }
    }
  };

  const subscribeToPush = async () => {
    setIsProcessing(true);
    setStatusMsg(null);

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatusMsg('Web Push notifications are not supported in this browser.');
        setIsProcessing(false);
        return;
      }

      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setStatusMsg('Notification permission was not granted.');
        setIsProcessing(false);
        return;
      }

      // 2. Register Service Worker
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 3. Subscribe with PushManager
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BCw_6l9fS_U5aRjKzR1g7d9PqN8mK2yU3wX4vB5nT7mK8rJ9sD0fG1hJ2kL3zX4cV5bN6mQ7wE8rT9yU0iO1p',
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // 4. Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainNumber,
          subscription: sub.toJSON(),
          delayThresholdMin: delayThreshold,
        }),
      });

      setStatusMsg('Alerts enabled! You will be notified on delays and station approach.');
    } catch (err: any) {
      console.error('Subscription error:', err);
      setStatusMsg(err.message || 'Failed to enable notifications.');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTestAlert = async () => {
    if (!subscription) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          trainNumber,
          trainName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Test notification sent! Check your notification panel.');
      } else {
        setStatusMsg(data.error?.message || 'Failed to send test alert.');
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Error triggering test.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
          isSubscribed
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
        title={isSubscribed ? 'Alerts active for this train' : 'Set journey delay alerts'}
      >
        {isSubscribed ? (
          <BellRing className="w-3.5 h-3.5 fill-amber-400" />
        ) : (
          <Bell className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{isSubscribed ? 'Alerts On' : 'Set Alert'}</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Live Journey Alerts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Train {trainNumber} · {trainName}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
            Receive native Web Push notifications on your device whenever the train experiences sudden delays or approaches halting stations.
          </p>

          {statusMsg && (
            <div className="mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Delay Threshold Setting */}
          <div className="mb-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Notify me if delay exceeds:
            </label>
            <div className="flex gap-2">
              {[10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDelayThreshold(mins)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono border transition-colors cursor-pointer ${
                    delayThreshold === mins
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  +{mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {!isSubscribed ? (
              <Button
                onClick={subscribeToPush}
                disabled={isProcessing}
                className="w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {isProcessing ? 'Enabling alerts...' : 'Enable Push Notifications'}
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  <Check className="w-4 h-4" /> Alerts active on this device
                </div>
                <Button
                  variant="outline"
                  onClick={sendTestAlert}
                  disabled={isProcessing}
                  className="w-full py-2 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Send Test Alert Now
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
