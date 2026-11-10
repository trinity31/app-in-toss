import React from 'react';
import { Icon } from '../../assets/icons/Icon.jsx';

/** Grey capsule search input with the standard 24px search glyph. */
export function SearchField({ value = '', placeholder = '검색어를 입력해주세요', onChange, onClear, style, ...rest }) {
  return (
    <div style={{ background: 'var(--semantic-background-default)', ...style }} {...rest}>
      <div style={{ padding: '14px 16px' }}>
        <div style={{
          boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 8,
          minHeight: 44, height: 44, padding: '8px 16px 8px 10px',
          borderRadius: 12, background: 'var(--semantic-background-lower)', overflow: 'hidden',
        }}>
          <span style={{ width: 24, height: 24, display: 'inline-flex', color: 'var(--semantic-text-tertiary)', flexShrink: 0 }}>
            <Icon name="IconSearchMonoSearchFind" size={24} />
          </span>
          <input
            value={value} placeholder={placeholder}
            onChange={(e) => onChange && onChange(e.target.value)}
            style={{
              flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent',
              fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.252,
              color: 'var(--semantic-text-primary)',
            }}
          />
          {value && (
            <span onClick={onClear} style={{ width: 20, height: 20, display: 'inline-flex', cursor: 'pointer', color: 'var(--semantic-icon-quaternary)', flexShrink: 0 }}>
              <Icon name="IconXCircleMonoX" size={20} />
            </span>
          )}
        </div>
      </div>
      <div style={{ height: 16, background: 'linear-gradient(180deg, var(--semantic-background-default) 0%, rgba(255,255,255,0) 100%)' }} />
    </div>
  );
}
