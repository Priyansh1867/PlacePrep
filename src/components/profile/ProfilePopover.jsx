import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ProfilePopover({ anchorRef, onClose, children }) {
  const [position, setPosition] = useState(null);
  useLayoutEffect(() => {
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(320, window.innerWidth - 24);
      const top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 160));
      setPosition({ top, left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)), width, maxHeight: Math.max(120, window.innerHeight - top - 12) });
    };
    const handleKey = event => { if (event.key === 'Escape') { onClose(); anchorRef.current?.focus(); } };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    document.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); document.removeEventListener('keydown', handleKey); };
  }, [anchorRef,onClose]);
  return createPortal(<>
    <div className="fixed inset-0 z-[900]" onClick={onClose} aria-hidden="true" />
    {position && <div className="pp-profile-popover" role="region" aria-label="Profile menu" style={{ position: 'fixed', zIndex: 901, overflowY: 'auto', borderRadius: 24, boxShadow: '0 16px 48px #0f172a33', ...position }}>{children}</div>}
  </>, document.body);
}
