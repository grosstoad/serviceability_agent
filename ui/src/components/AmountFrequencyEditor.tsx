import type { Frequency } from '../types';
import { formatCurrency, formatFrequency, toAnnual } from '../data/mockData';

interface AmountFrequencyEditorProps {
  label: string;
  amount: number | undefined;
  frequency: Frequency | undefined;
  defaultFrequency?: Frequency;
  isEditing: boolean;
  tempAmount: string;
  tempFrequency: Frequency;
  onEdit: () => void;
  onAmountChange: (value: string) => void;
  onFrequencyChange: (freq: Frequency) => void;
  onSave: () => void;
  onCancel: () => void;
  showAnnual?: boolean;
  compact?: boolean;
}

export function AmountFrequencyEditor({
  label,
  amount,
  frequency,
  defaultFrequency = 'YEARLY',
  isEditing,
  tempAmount,
  tempFrequency,
  onEdit,
  onAmountChange,
  onFrequencyChange,
  onSave,
  onCancel,
  showAnnual = false,
  compact = false,
}: AmountFrequencyEditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const currentFreq = frequency || defaultFrequency;
  const annualAmount = amount ? toAnnual(amount, currentFreq) : 0;

  if (isEditing) {
    return (
      <div className={`${compact ? 'p-2' : 'p-4'} bg-neutral-50 border-2 border-[#111111]`}>
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={tempAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full font-mono text-lg font-bold bg-white border-b-2 border-[#111111] px-2 py-1"
              autoFocus
              placeholder="Amount"
            />
          </div>
          <select
            value={tempFrequency}
            onChange={(e) => onFrequencyChange(e.target.value as Frequency)}
            className="font-mono text-sm bg-white border-b-2 border-[#111111] px-2 py-1"
          >
            <option value="WEEKLY">Weekly</option>
            <option value="FORTNIGHTLY">Fortnightly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        {showAnnual && tempAmount && !isNaN(parseFloat(tempAmount)) && (
          <div className="font-mono text-xs text-neutral-500 mt-2">
            = {formatCurrency(toAnnual(parseFloat(tempAmount), tempFrequency))} p.a.
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onSave}
            className="px-3 py-1 text-xs font-mono uppercase bg-[#111111] text-white hover:bg-neutral-800"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs font-mono uppercase border border-[#111111] hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${compact ? 'p-2' : 'p-4'} hover:bg-neutral-50 cursor-pointer`}
      onClick={onEdit}
    >
      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
        {label}
      </div>
      <div className="font-mono text-xl font-bold">
        {amount ? (
          <>
            {formatCurrency(amount)}
            <span className="text-xs text-neutral-500 ml-1">
              {formatFrequency(currentFreq)}
            </span>
          </>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </div>
      {showAnnual && amount && (
        <div className="font-mono text-xs text-neutral-500 mt-1">
          {formatCurrency(annualAmount)} p.a.
        </div>
      )}
    </div>
  );
}
