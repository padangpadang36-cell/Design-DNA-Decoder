
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');
  
  const isColorValue = (val: string) => val.startsWith('#');

  return (
    <div className="font-mono text-sm leading-relaxed space-y-0.5 select-all whitespace-pre-wrap">
      {lines.map((line, idx) => {
        const match = line.match(/^(\s*)/);
        const indentCount = match ? match[1].length : 0;
        const trimmed = line.trim();
        
        if (!trimmed) return <div key={idx} className="h-4" />;

        // Header sections like 【入力】 or 【デザインスタイル】
        if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
          return (
            <div key={idx} className="mt-8 mb-4 text-indigo-400 font-black text-base border-l-4 border-indigo-600 pl-3">
              {trimmed}
            </div>
          );
        }

        // YAML-like key-value pairs
        if (trimmed.includes(':') && !trimmed.startsWith('-')) {
          const colonIndex = trimmed.indexOf(':');
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          
          const isRoot = indentCount === 0;
          
          return (
            <div 
              key={idx} 
              className={`flex flex-col sm:flex-row sm:items-baseline gap-x-2 py-0.5 ${isRoot ? 'font-bold text-gray-200 mt-2' : ''}`}
              style={{ paddingLeft: `${indentCount * 0.5}rem` }}
            >
              <span className={`shrink-0 ${isRoot ? 'text-indigo-300' : 'text-gray-500 font-medium'}`}>
                {key}:
              </span>
              {value && (
                <span className={`${isColorValue(value) ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                  {value.replace(/^"(.*)"$/, '$1')}
                </span>
              )}
            </div>
          );
        }

        // List items or generic description lines
        return (
          <p 
            key={idx} 
            className={`${trimmed.startsWith('-') ? 'text-gray-400' : 'text-gray-300'} leading-relaxed`}
            style={{ paddingLeft: `${indentCount * 0.5}rem` }}
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};
