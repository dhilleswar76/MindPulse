import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Sparkles } from 'lucide-react';
import { SupportChatPanel } from './SupportChatPanel';
import { useAuth } from '../../hooks/useAuth';

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = 'mindpulse_support_bot_pos';
const BUTTON_SIZE = 56; // 56px (w-14 h-14)
const DRAG_THRESHOLD = 6; // px to distinguish click vs drag

export const FloatingSupportChatbot: React.FC = () => {
  const { user } = useAuth();
  // Show for users (Victim/Witness Portal)
  const isVictimRole = !user || user.role === 'USER';

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    hasMoved: boolean;
  } | null>(null);

  const buttonRef = useRef<HTMLDivElement>(null);

  // Helper to clamp position within viewport bounds
  const getClampedPosition = useCallback((x: number, y: number): Position => {
    const minX = 16;
    const maxX = Math.max(16, window.innerWidth - BUTTON_SIZE - 16);
    const minY = 64; // below navbar
    const maxY = Math.max(64, window.innerHeight - BUTTON_SIZE - 16);

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }, []);

  // Initialize position from sessionStorage or default to bottom-right
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(getClampedPosition(parsed.x, parsed.y));
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default: bottom-right
    const defaultX = window.innerWidth - BUTTON_SIZE - 24;
    const defaultY = window.innerHeight - BUTTON_SIZE - 28;
    setPosition(getClampedPosition(defaultX, defaultY));
  }, [getClampedPosition]);

  // Handle window resize to keep button inside viewport
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        return getClampedPosition(prev.x, prev.y);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getClampedPosition]);

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary mouse button (0) or touch
    if (e.button !== 0) return;
    if (!position) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
      hasMoved: false,
    };
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance >= DRAG_THRESHOLD) {
      dragStartRef.current.hasMoved = true;
      setIsDragging(true);

      const newPos = getClampedPosition(
        dragStartRef.current.initialPosX + deltaX,
        dragStartRef.current.initialPosY + deltaY
      );
      setPosition(newPos);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }

    const wasDragging = dragStartRef.current.hasMoved;
    const finalPos = position;

    dragStartRef.current = null;
    setIsDragging(false);

    if (wasDragging) {
      // Save updated position to session storage
      if (finalPos) {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
        } catch {
          // Ignore storage errors
        }
      }
    } else {
      // Was a simple click/tap -> toggle chat modal
      setIsOpen((prev) => !prev);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  if (!isVictimRole || !position) return null;

  return (
    <>
      {/* Floating Draggable Trigger Button */}
      <div
        ref={buttonRef}
        role="button"
        tabIndex={0}
        aria-label="Open MindPulse Support Assistant"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none',
        }}
        className={`fixed top-0 left-0 z-40 select-none group cursor-grab active:cursor-grabbing transition-shadow ${
          isDragging ? 'opacity-90 scale-105' : 'transition-transform duration-75'
        }`}
      >
        <div className="relative">
          {/* Pulsing ring indicator */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 opacity-60 blur-sm group-hover:opacity-100 animate-pulse transition duration-300" />

          {/* Main Button Body */}
          <div
            className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl border border-teal-400/40 bg-gradient-to-tr ${
              isOpen
                ? 'from-indigo-600 to-slate-900 border-indigo-400/50'
                : 'from-teal-600 via-teal-500 to-indigo-600 hover:from-teal-500 hover:to-indigo-500'
            } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950`}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white transition-transform transform rotate-0 group-hover:scale-110" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Bot className="w-7 h-7 text-white transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
            )}
          </div>

          {/* Tooltip */}
          {showTooltip && !isDragging && !isOpen && (
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-slate-900/95 text-slate-100 text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1.5 z-50">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Support Assistant (Draggable)</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <>
          {/* Backdrop on mobile screens to ensure focus and easy dismiss */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="MindPulse Support Assistant Chat Window"
            className="fixed z-50 sm:bottom-6 sm:right-6 bottom-2 left-2 right-2 sm:left-auto w-auto sm:w-[410px] h-[580px] max-h-[calc(100vh-80px)] flex flex-col shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          >
            <SupportChatPanel
              isFloating={true}
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
};
