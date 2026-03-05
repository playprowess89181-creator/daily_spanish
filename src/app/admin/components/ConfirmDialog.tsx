'use client';

import type { ReactNode } from 'react';

type ConfirmVariant = 'primary' | 'danger';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmStyle =
    variant === 'danger'
      ? ({ backgroundColor: '#ef4444' } as React.CSSProperties)
      : ({ backgroundColor: 'var(--azul-ultramar)' } as React.CSSProperties);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="text-lg font-extrabold text-gray-900 tracking-tight">{title}</div>
        </div>
        {description ? (
          <div className="px-5 py-4 text-sm font-semibold text-gray-700 leading-relaxed">{description}</div>
        ) : null}
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={busy}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-90 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            style={confirmStyle}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

