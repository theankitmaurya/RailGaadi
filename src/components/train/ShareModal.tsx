'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Copy, Check } from 'lucide-react';
import { Train } from '@/types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  train: Train;
}

export function ShareModal({ isOpen, onClose, train }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateShareLink = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/journeys/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainId: train.id }),
      });
      const json = await res.json();
      if (json.data?.shareUrl) {
        const fullUrl = `${window.location.origin}${json.data.shareUrl}`;
        setShareUrl(fullUrl);
      }
    } catch (err) {
      console.error('Failed to create share link:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      generateShareLink();
    } else {
      setCopied(false);
      setShareUrl('');
    }
  }, [isOpen]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for HTTP contexts or unsupported browsers
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      // Secondary fallback
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Live Journey">
      <div className="space-y-4 py-2">
        <p className="text-sm text-slate-600">
          Share this live tracking link for <span className="font-bold text-slate-900">{train.number} {train.name}</span>. Anyone with the link can view real-time location and station updates.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={isLoading ? 'Generating link...' : shareUrl}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 select-all outline-none"
          />
          <Button variant="primary" size="sm" onClick={handleCopy} disabled={isLoading || !shareUrl}>
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
