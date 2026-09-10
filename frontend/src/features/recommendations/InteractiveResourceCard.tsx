import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface InteractiveResourceCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  badgeText?: string;
  footerPrimary?: string;
  footerSecondary?: string;
  actionText: string;
  icon: React.ReactNode;
  accentColor: 'teal' | 'indigo' | 'sky' | 'amber';
  onClick: () => void;
  className?: string;
}

export const InteractiveResourceCard: React.FC<InteractiveResourceCardProps> = ({
  id,
  title,
  subtitle,
  description,
  badgeText,
  footerPrimary,
  footerSecondary,
  actionText,
  icon,
  accentColor,
  onClick,
  className = '',
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'indigo':
        return {
          iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          hoverBorder: 'hover:border-indigo-500/40 hover:shadow-indigo-500/5',
          ringFocus: 'focus-visible:ring-indigo-400',
          badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          actionText: 'text-indigo-400 group-hover:text-indigo-300',
          footerSecondary: 'text-indigo-300 font-semibold',
        };
      case 'sky':
        return {
          iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          hoverBorder: 'hover:border-sky-500/40 hover:shadow-sky-500/5',
          ringFocus: 'focus-visible:ring-sky-400',
          badge: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          actionText: 'text-sky-400 group-hover:text-sky-300',
          footerSecondary: 'text-sky-300 font-semibold',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          hoverBorder: 'hover:border-amber-500/40 hover:shadow-amber-500/5',
          ringFocus: 'focus-visible:ring-amber-400',
          badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          actionText: 'text-amber-400 group-hover:text-amber-300',
          footerSecondary: 'text-amber-300 font-semibold',
        };
      case 'teal':
      default:
        return {
          iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
          hoverBorder: 'hover:border-teal-500/40 hover:shadow-teal-500/5',
          ringFocus: 'focus-visible:ring-teal-400',
          badge: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
          actionText: 'text-teal-400 group-hover:text-teal-300',
          footerSecondary: 'text-teal-300 font-semibold',
        };
    }
  };

  const styles = getAccentStyles();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${title} - ${actionText}`}
      className={`group relative flex flex-col justify-between p-5 rounded-3xl bg-slate-900/80 border border-slate-800 text-left cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:bg-slate-800/60 active:scale-[0.99] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${styles.hoverBorder} ${styles.ringFocus} ${className}`}
    >
      <div className="space-y-3">
        {/* Header row: Icon & Title & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-105 shrink-0 ${styles.iconBg}`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-white/95">
                {title}
              </h3>
              {subtitle && (
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {badgeText && (
            <span
              className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${styles.badge}`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Optional Metadata Row */}
        {(footerPrimary || footerSecondary) && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            {footerPrimary && (
              <span className="text-slate-400 truncate pr-2" dangerouslySetInnerHTML={{ __html: footerPrimary }} />
            )}
            {footerSecondary && (
              <span className={styles.footerSecondary}>{footerSecondary}</span>
            )}
          </div>
        )}
      </div>

      {/* Action Affordance Footer */}
      <div className="pt-4 mt-2 flex items-center justify-end">
        <div
          className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-colors ${styles.actionText}`}
        >
          <span>{actionText}</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};
