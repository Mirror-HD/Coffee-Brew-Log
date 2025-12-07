import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string | number;
  label: React.ReactNode;
}

interface CustomSelectProps {
  value: string | number | undefined;
  onChange: (value: any) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = '请选择', 
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 bg-white border rounded-xl text-left transition-all duration-200 outline-none select-none
          ${isOpen ? 'border-amber-500 ring-4 ring-amber-500/10' : 'border-slate-200 hover:border-amber-400'}
          ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'cursor-pointer shadow-sm'}
        `}
      >
        <span className={`text-sm font-medium truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-700'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-[100] max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200 p-1">
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors mb-0.5 last:mb-0
                  ${option.value === value 
                    ? 'bg-amber-50 text-amber-700 font-bold' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'}
                `}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check size={16} className="text-amber-600 shrink-0 ml-2" />}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-slate-400 text-center">无选项</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;