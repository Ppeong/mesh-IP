import React from 'react';
import { IPStatus } from '../types';

interface StatusBadgeProps {
  status: IPStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  switch (status) {
    case 'Registered':
    case 'Active' as any:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-[#A7DEC6] bg-[#C1E9D7] text-[#164E39] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#164E39]" />
          Registered
        </span>
      );
    case 'Pending Examination':
    case 'Pending' as any:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-[#C5B3DC] bg-[#D9C9EB] text-[#3F2B5B] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#593E7C]" />
          Pending Examination
        </span>
      );
    case 'To Be Filed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-[#9ec8e4] bg-[#B2D4EB] text-[#1C4362] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#295F8A]" />
          To Be Filed
        </span>
      );
    case 'Refusal':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-[#F2B8B8] bg-[#FDF2F2] text-[#B91C1C] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
          Refusal
        </span>
      );
    case 'Refusal Responded':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
          Refusal Responded
        </span>
      );
    case 'Abandoned':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border border-[#4A6B82]/25 bg-[#F5F8FA] text-[#4A6B82] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B82]" />
          Abandoned
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
