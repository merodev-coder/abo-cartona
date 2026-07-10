'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TechSpecsTableProps {
  specs: Record<string, string>;
}

export default function TechSpecsTable({ specs }: TechSpecsTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const specEntries = Object.entries(specs);
  const visibleSpecs = isExpanded ? specEntries : specEntries.slice(0, 8);
  const hasMoreSpecs = specEntries.length > 8;

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-text-primary mb-6">المواصفات التقنية</h3>

      <div className="border border-border rounded-glass overflow-hidden">
        {visibleSpecs.map(([key, value], index) => (
          <div
            key={key}
            className={`flex justify-between items-center p-4 ${
              index % 2 === 0 ? 'bg-surface' : 'bg-surface-card'
            } ${index !== visibleSpecs.length - 1 ? 'border-b border-border' : ''}`}
          >
            <span className="text-text-muted">{key}</span>
            <span className="text-text-primary font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {hasMoreSpecs && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 mx-auto mt-4 px-6 py-2 
                     text-accent hover:text-accent/80 transition-colors
                     font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              عرض أقل
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              عرض كل المواصفات ({specEntries.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}
