'use client';

import React from 'react';

interface CardSectionProps {
  title?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const CardSection: React.FC<CardSectionProps> = ({
  title,
  icon,
  headerRight,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 space-y-3.5 sm:space-y-4 transition-colors ${className}`}>
      {title && (
        <div className={`flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800 text-primary-700 dark:text-primary-400 font-bold text-sm sm:text-base ${headerClassName}`}>
          <div className="flex items-center gap-2 sm:gap-2.5">
            {icon && <span className="shrink-0 [&>svg]:w-4.5 [&>svg]:h-4.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">{icon}</span>}
            <span className="leading-snug">{title}</span>
          </div>
          {headerRight}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
};
