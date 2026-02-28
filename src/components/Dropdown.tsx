import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T extends string = string> {
  id: T;
  name: string;
  provider?: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;

  placeholder?: string;
  triggerClassName?: string;

  align?: 'left' | 'right';
  width?: string;

  showGroups?: boolean;
  showCheck?: boolean;
  disabled?: boolean;
}

function groupOptions<T extends string>(options: DropdownOption<T>[]) {
  return options.reduce<Record<string, DropdownOption<T>[]>>((acc, opt) => {
    const key = opt.provider ?? '__ungrouped__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(opt);
    return acc;
  }, {});
}

function hasMultipleGroups<T extends string>(options: DropdownOption<T>[]) {
  const groups = new Set(options.map(o => o.provider ?? '__ungrouped__'));
  return groups.size > 1;
}

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  triggerClassName = '',
  align = 'right',
  width = 'w-52',
  showGroups = true,
  showCheck = true,
  disabled = false,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find(o => o.id === value);
  const grouped = groupOptions(options);
  const multipleGroups = hasMultipleGroups(options);
  const shouldShowGroups = showGroups && multipleGroups;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
          bg-gray-50 dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          text-gray-700 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all cursor-pointer select-none
          ${triggerClassName}`}
      >
        {current?.icon && <span className="shrink-0">{current.icon}</span>}
        <span className="max-w-[140px] truncate">
          {current?.name ?? placeholder}
        </span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1.5 z-50 ${width}
            ${align === 'right' ? 'right-0' : 'left-0'}
            bg-white dark:bg-gray-900
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-lg shadow-black/8 dark:shadow-black/30
            overflow-hidden`}
        >
          <div className="py-1.5">
            {Object.entries(grouped).map(([group, groupOptions], groupIdx) => (
              <div key={group}>

                {shouldShowGroups && group !== '__ungrouped__' && (
                  <p className={`px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest
                    text-gray-400 dark:text-gray-500
                    ${groupIdx > 0 ? 'mt-2 pt-2 border-t border-gray-100 dark:border-gray-800' : 'pt-1.5'}`}
                  >
                    {group}
                  </p>
                )}

                {groupOptions.map((opt) => {
                  const isSelected = opt.id === value;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => { onChange(opt.id); setOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors
                        disabled:opacity-40 disabled:cursor-not-allowed
                        ${isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        }`}
                    >
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}

                      <div className="flex-1 min-w-0">
                        <span className="truncate block">{opt.name}</span>
                        {opt.description && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate block mt-0.5">
                            {opt.description}
                          </span>
                        )}
                      </div>

                      {showCheck && isSelected && (
                        <Check size={12} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}