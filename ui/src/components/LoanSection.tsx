import { useState } from 'react';
import type { LoanDetails, Collateral } from '../types';
import { formatCurrency } from '../data/mockData';

interface LoanSectionProps {
  loan: LoanDetails;
  collaterals: Collateral[];
  onUpdate: (updates: Partial<LoanDetails>) => void;
}

export function LoanSection({ loan, collaterals, onUpdate }: LoanSectionProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEdit = (field: string, currentValue: number) => {
    setEditingField(field);
    setTempValue(currentValue.toString());
  };

  const handleSave = (field: keyof LoanDetails) => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue)) {
      onUpdate({ [field]: numValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: keyof LoanDetails) => {
    if (e.key === 'Enter') {
      handleSave(field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
  };

  return (
    <section className="border border-[#111111] bg-[#F9F9F7]">
      {/* Section header */}
      <div className="border-b border-[#111111] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Proposed Loan</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mt-1">
            Fig. 1.0 — Loan Structure
          </p>
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          Click values to edit
        </div>
      </div>

      {/* Loan details grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {/* Loan Amount */}
          <div className="border border-[#111111] p-4 -mt-px -ml-px hard-shadow-hover cursor-pointer"
            onClick={() => handleEdit('loanAmount', loan.loanAmount)}
          >
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
              Loan Amount
            </div>
            {editingField === 'loanAmount' ? (
              <input
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => handleSave('loanAmount')}
                onKeyDown={(e) => handleKeyDown(e, 'loanAmount')}
                className="w-full font-mono text-3xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                autoFocus
              />
            ) : (
              <div className="font-mono text-3xl font-bold">
                {formatCurrency(loan.loanAmount)}
              </div>
            )}
          </div>

          {/* Loan Term */}
          <div className="border border-[#111111] p-4 -mt-px -ml-px hard-shadow-hover cursor-pointer"
            onClick={() => handleEdit('loanTerm', loan.loanTerm)}
          >
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
              Loan Term
            </div>
            {editingField === 'loanTerm' ? (
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleSave('loanTerm')}
                  onKeyDown={(e) => handleKeyDown(e, 'loanTerm')}
                  className="w-20 font-mono text-3xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                  autoFocus
                  min={1}
                  max={30}
                />
                <span className="font-mono text-lg text-neutral-500">years</span>
              </div>
            ) : (
              <div className="font-mono text-3xl font-bold">
                {loan.loanTerm} <span className="text-lg text-neutral-500">years</span>
              </div>
            )}
          </div>

          {/* Interest Rate */}
          <div className="border border-[#111111] p-4 -mt-px -ml-px hard-shadow-hover cursor-pointer"
            onClick={() => handleEdit('interestRateOngoing', loan.interestRateOngoing)}
          >
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
              Interest Rate
            </div>
            {editingField === 'interestRateOngoing' ? (
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleSave('interestRateOngoing')}
                  onKeyDown={(e) => handleKeyDown(e, 'interestRateOngoing')}
                  className="w-20 font-mono text-3xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                  autoFocus
                />
                <span className="font-mono text-lg text-neutral-500">% p.a.</span>
              </div>
            ) : (
              <div className="font-mono text-3xl font-bold">
                {loan.interestRateOngoing.toFixed(2)}<span className="text-lg text-neutral-500">%</span>
              </div>
            )}
          </div>

          {/* IO Period */}
          <div className="border border-[#111111] p-4 -mt-px -ml-px hard-shadow-hover cursor-pointer"
            onClick={() => handleEdit('interestOnlyPeriod', loan.interestOnlyPeriod ?? 0)}
          >
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
              Interest-Only
            </div>
            {editingField === 'interestOnlyPeriod' ? (
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleSave('interestOnlyPeriod')}
                  onKeyDown={(e) => handleKeyDown(e, 'interestOnlyPeriod')}
                  className="w-16 font-mono text-3xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                  autoFocus
                  min={0}
                  max={10}
                />
                <span className="font-mono text-lg text-neutral-500">years</span>
              </div>
            ) : (
              <div className="font-mono text-3xl font-bold">
                {loan.interestOnlyPeriod ?? 0} <span className="text-lg text-neutral-500">years</span>
              </div>
            )}
          </div>
        </div>

        {/* Collateral / Security */}
        {collaterals.length > 0 && (
          <div className="mt-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
              Security Property
            </h3>
            <div className="space-y-3">
              {collaterals.map((col) => (
                <div key={col.id} className="border border-[#111111] p-4 flex items-center justify-between">
                  <div>
                    <div className="font-body text-base">{col.address}</div>
                    <div className="font-mono text-xs text-neutral-500 mt-1">
                      Postcode {col.postcode}
                    </div>
                  </div>
                  {col.value && (
                    <div className="text-right">
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                        Est. Value
                      </div>
                      <div className="font-mono text-xl font-bold">
                        {formatCurrency(col.value)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LVR calculation */}
        {collaterals[0]?.value && (
          <div className="mt-4 border-t border-dashed border-neutral-300 pt-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                Loan-to-Value Ratio (LVR)
              </div>
              <div className="font-mono text-lg font-bold">
                {((loan.loanAmount / collaterals[0].value) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
