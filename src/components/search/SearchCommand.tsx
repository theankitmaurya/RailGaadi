'use client';

import React, { useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from './SearchInput';
import { Train } from '@/types';
import { useRouter } from 'next/navigation';

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent state
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (train: Train) => {
    onClose();
    router.push(`/journey/${train.id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Train">
      <div className="py-2">
        <SearchInput autoFocus onSelectTrain={handleSelect} />
      </div>
    </Modal>
  );
}
