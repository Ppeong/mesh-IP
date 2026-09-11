import React from 'react';
import { IPType } from '../types';
import { ShieldCheck, Award, Layers } from 'lucide-react';

interface IPTypeBadgeProps {
  type: IPType;
}

export const IPTypeBadge: React.FC<IPTypeBadgeProps> = ({ type }) => {
  switch (type) {
    case 'Patent':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#B2D4EB]/40 text-[#1C4362] border border-[#B2D4EB]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4A6B82]" />
          Patent
        </span>
      );
    case 'Trademark':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D9C9EB]/40 text-[#3F2B5B] border border-[#D9C9EB]">
          <Award className="w-3.5 h-3.5 text-[#3F2B5B]" />
          Trademark
        </span>
      );
    case 'Design':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#C1E9D7]/40 text-[#164E39] border border-[#C1E9D7]">
          <Layers className="w-3.5 h-3.5 text-[#164E39]" />
          Design
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {type}
        </span>
      );
  }
};
