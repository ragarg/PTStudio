import { useEffect, useRef, useState } from 'react';

export interface Option {
  value: number;
  label: string;
}

interface DropdownProps {
  value: number | null;
  onChange: (value: number) => void;
  options: Option[];
  placeholder?: string;
}

export default function Dropdown({ value, onChange, options, placeholder = 'Выберите'} : DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value);

  // закрытие по клику вне
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className="dropdown__button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {current?.label ?? placeholder}
        <span className={`dropdown__arrow ${open ? 'is-open' : ''}`}>▾</span>
      </button>

      {open && (
        <ul className="dropdown__menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`dropdown__item ${opt.value === value ? 'is-active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}