interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-[#F9F9F7] border-2 border-[#111111] max-w-md w-full mx-4 shadow-[8px_8px_0_0_#111111]">
        {/* Header */}
        <div className="border-b border-[#111111] px-6 py-4">
          <h3 className="font-serif text-xl font-bold">{title}</h3>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="font-body text-base text-neutral-700">{message}</p>
        </div>

        {/* Actions */}
        <div className="border-t border-[#111111] px-6 py-4 flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 border border-[#111111] bg-transparent px-4 py-3 text-xs font-sans uppercase tracking-widest hover:bg-neutral-100"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#CC0000] text-white px-4 py-3 text-xs font-sans uppercase tracking-widest border border-[#CC0000] hover:bg-[#AA0000]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
