import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, LucideIcon } from 'lucide-react';

export interface PremiumSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string | number;
  icon?: LucideIcon;
}

export interface PremiumSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: PremiumSelectOption[];
  placeholder?: string;
  icon?: LucideIcon;
  badgeCount?: string | number;
  className?: string;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

export const PremiumSelect: React.FC<PremiumSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  icon: HeaderIcon,
  badgeCount,
  className = '',
  disabled = false,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Responsive and compact typography scaling
  const config = useMemo(() => {
    switch (size) {
      case 'xs':
        return {
          labelSize: '10px',
          badgeSize: '9px',
          triggerMinHeight: '34px',
          triggerPadding: '5px 8px',
          iconBox: '22px',
          iconSize: 12,
          chevronSize: 13,
          fontSize: '11.5px',
          sublabelSize: '10px',
          itemPadding: '6px 8px',
          itemIconBox: '20px',
          itemIconSize: 12,
          searchFontSize: '11.5px',
          searchInputPadding: '5px 8px 5px 26px',
          checkCircle: '16px',
          checkSize: 10
        };
      case 'sm':
        return {
          labelSize: '10.5px',
          badgeSize: '9.5px',
          triggerMinHeight: '40px',
          triggerPadding: '6px 11px',
          iconBox: '24px',
          iconSize: 13,
          chevronSize: 14,
          fontSize: '12.5px',
          sublabelSize: '10.5px',
          itemPadding: '7px 9px',
          itemIconBox: '22px',
          itemIconSize: 12,
          searchFontSize: '12px',
          searchInputPadding: '5px 8px 5px 28px',
          checkCircle: '17px',
          checkSize: 10
        };
      case 'md':
      default:
        return {
          labelSize: '11px',
          badgeSize: '10px',
          triggerMinHeight: '42px',
          triggerPadding: '7px 12px',
          iconBox: '26px',
          iconSize: 14,
          chevronSize: 15,
          fontSize: '13px',
          sublabelSize: '11px',
          itemPadding: '8px 10px',
          itemIconBox: '24px',
          itemIconSize: 13,
          searchFontSize: '12px',
          searchInputPadding: '6px 10px 6px 30px',
          checkCircle: '18px',
          checkSize: 11
        };
    }
  }, [size]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && options.length > 5) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, options.length]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const SelectedIcon = selectedOption?.icon || HeaderIcon;

  return (
    <div 
      ref={containerRef} 
      className={`premium-select-wrapper ${className}`}
      style={{ position: 'relative', width: '100%', zIndex: isOpen ? 60 : 1 }}
    >
      {label && (
        <div 
          className="flex items-center justify-between mb-1.5"
          style={{ fontSize: config.labelSize, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
        >
          <span className="flex items-center gap-1.5">
            {HeaderIcon && <HeaderIcon size={config.iconSize} color="var(--color-primary-700)" />}
            {label}
          </span>
          {badgeCount !== undefined && (
            <span 
              style={{
                fontSize: config.badgeSize,
                fontWeight: 700,
                color: 'var(--color-primary-800)',
                backgroundColor: 'var(--color-primary-50)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-primary-200)'
              }}
            >
              {badgeCount}
            </span>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          minHeight: config.triggerMinHeight,
          padding: config.triggerPadding,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          backgroundColor: '#ffffff',
          border: isOpen ? '1.5px solid var(--color-primary-600)' : '1.5px solid var(--color-primary-200)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: isOpen ? '0 0 0 3px rgba(4, 120, 87, 0.18)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all var(--transition-fast)',
          textAlign: 'left'
        }}
      >
        <div className="flex items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
          {SelectedIcon && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: config.iconBox,
                height: config.iconBox,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-700)',
                flexShrink: 0
              }}
            >
              <SelectedIcon size={config.iconSize} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }} title={selectedOption ? selectedOption.label : placeholder}>
            <div 
              style={{ 
                fontSize: config.fontSize, 
                fontWeight: 600, 
                color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3
              }}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </div>
            {selectedOption?.sublabel && (
              <div 
                style={{ 
                  fontSize: config.sublabelSize, 
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '1px',
                  lineHeight: 1.2
                }}
              >
                {selectedOption.sublabel}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selectedOption?.badge !== undefined && (
            <span 
              style={{
                fontSize: config.badgeSize,
                fontWeight: 700,
                color: 'var(--color-primary-800)',
                backgroundColor: 'var(--color-primary-50)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-primary-200)'
              }}
            >
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown 
            size={config.chevronSize} 
            color="var(--color-primary-700)" 
            style={{
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className="premium-select-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 100,
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--color-primary-300)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 10px 25px -4px rgba(4, 120, 87, 0.18), 0 6px 12px -3px rgba(15, 23, 42, 0.08)',
            padding: '5px',
            maxHeight: '320px',
            overflowY: 'auto',
            animation: 'dropdownFadeIn 0.15s ease-out'
          }}
        >
          {/* Optional Quick Search for long lists */}
          {options.length > 5 && (
            <div 
              style={{ 
                padding: '3px 4px 6px 4px', 
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '4px'
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search 
                  size={config.iconSize} 
                  style={{ 
                    position: 'absolute', 
                    left: '8px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} 
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ketik untuk memfilter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: config.searchInputPadding,
                    fontSize: config.searchFontSize,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    outline: 'none',
                    backgroundColor: 'var(--color-slate-50)'
                  }}
                />
              </div>
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div 
              style={{ 
                padding: '14px 10px', 
                textAlign: 'center', 
                fontSize: config.fontSize, 
                color: 'var(--text-muted)' 
              }}
            >
              Tidak ada opsi yang cocok dengan &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              const ItemIcon = option.icon || HeaderIcon;

              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  title={option.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: config.itemPadding,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--color-primary-50)' : 'transparent',
                    color: isSelected ? 'var(--color-primary-900)' : 'var(--text-primary)',
                    transition: 'all var(--transition-fast)',
                    borderLeft: isSelected ? '3px solid var(--color-primary-600)' : '3px solid transparent',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--color-slate-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
                    {ItemIcon && (
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: config.itemIconBox,
                          height: config.itemIconBox,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--color-primary-100)' : 'var(--color-slate-100)',
                          color: isSelected ? 'var(--color-primary-800)' : 'var(--text-secondary)',
                          flexShrink: 0
                        }}
                      >
                        <ItemIcon size={config.itemIconSize} />
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div 
                        style={{ 
                          fontSize: config.fontSize, 
                          fontWeight: isSelected ? 700 : 500,
                          lineHeight: 1.25
                        }}
                      >
                        {option.label}
                      </div>
                      {option.sublabel && (
                        <div 
                          style={{ 
                            fontSize: config.sublabelSize, 
                            color: isSelected ? 'var(--color-primary-700)' : 'var(--text-muted)',
                            marginTop: '1.5px',
                            lineHeight: 1.2
                          }}
                        >
                          {option.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {option.badge !== undefined && (
                      <span 
                        style={{
                          fontSize: config.badgeSize,
                          fontWeight: 700,
                          color: isSelected ? 'var(--color-primary-800)' : 'var(--text-muted)',
                          backgroundColor: isSelected ? '#ffffff' : 'var(--color-slate-100)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          border: isSelected ? '1px solid var(--color-primary-200)' : '1px solid var(--border-subtle)'
                        }}
                      >
                        {option.badge}
                      </span>
                    )}
                    {isSelected && (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: config.checkCircle, 
                          height: config.checkCircle, 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--color-primary-600)',
                          color: '#ffffff'
                        }}
                      >
                        <Check size={config.checkSize} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

