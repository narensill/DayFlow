import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronDown, IconCheck } from './Icons';

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  size,
  disabled = false,
  className = '',
  style,
}) {
  const normalized = options.map((o) =>
    typeof o === 'object' && o !== null ? o : { value: o, label: String(o) }
  );

  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [rect, setRect] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const selected = normalized.find((o) => String(o.value) === String(value));

  const close = useCallback(() => setOpen(false), []);

  const openMenu = () => {
    if (disabled) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    setDropUp(spaceBelow < 260 && r.top > spaceBelow);
    setRect(r);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        panelRef.current?.contains(e.target)
      ) {
        return;
      }
      close();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    const onScroll = () => close();
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, close]);

  const pick = (opt) => {
    onChange(opt.value);
    close();
  };

  return (
    <div className={`df-select ${className}`} style={style}>
      <button
        type="button"
        ref={triggerRef}
        className={`df-select__trigger ${size === 'sm' ? 'df-select__trigger--sm' : ''} ${open ? 'is-open' : ''}`}
        onClick={() => (open ? close() : openMenu())}
        disabled={disabled}
      >
        <span className={selected ? '' : 'df-select__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <IconChevronDown width="15" height="15" className="df-select__chevron" />
      </button>

      {open && rect &&
        createPortal(
          <div
            ref={panelRef}
            className={`df-select__panel glass-strong ${dropUp ? 'drop-up' : 'drop-down'}`}
            style={{
              position: 'fixed',
              left: rect.left,
              top: dropUp ? undefined : rect.bottom + 8,
              bottom: dropUp ? window.innerHeight - rect.top + 8 : undefined,
              width: rect.width,
            }}
          >
            {normalized.map((opt) => (
              <div
                key={opt.value}
                className={`df-select__option ${String(opt.value) === String(value) ? 'active' : ''}`}
                onClick={() => pick(opt)}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && <IconCheck width="14" height="14" />}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}