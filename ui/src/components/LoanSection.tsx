import { useState } from 'react';
import type { LoanDetails, Collateral, LoanSplit } from '../types';
import { formatCurrency } from '../data/mockData';

interface LoanSectionProps {
  loan: LoanDetails;
  collaterals: Collateral[];
  onUpdate: (updates: Partial<LoanDetails>) => void;
  onUpdateCollateral?: (collateralId: string, updates: Partial<Collateral>) => void;
  onUpdateSplit?: (splitId: string, updates: Partial<LoanSplit>) => void;
}

export function LoanSection({ loan, collaterals, onUpdate, onUpdateCollateral, onUpdateSplit }: LoanSectionProps) {
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

  const handleSaveCollateral = (collateralId: string, field: keyof Collateral) => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue) && onUpdateCollateral) {
      onUpdateCollateral(collateralId, { [field]: numValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleSaveSplit = (splitId: string, field: keyof LoanSplit) => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue) && onUpdateSplit) {
      onUpdateSplit(splitId, { [field]: numValue });
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

  const handleKeyDownCollateral = (e: React.KeyboardEvent, collateralId: string, field: keyof Collateral) => {
    if (e.key === 'Enter') {
      handleSaveCollateral(collateralId, field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
  };

  const handleKeyDownSplit = (e: React.KeyboardEvent, splitId: string, field: keyof LoanSplit) => {
    if (e.key === 'Enter') {
      handleSaveSplit(splitId, field);
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
                  {col.value !== undefined && (
                    <div
                      className="text-right cursor-pointer hard-shadow-hover p-2 -m-2"
                      onClick={() => handleEdit(`collateral-${col.id}-value`, col.value!)}
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                        Est. Value
                      </div>
                      {editingField === `collateral-${col.id}-value` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveCollateral(col.id, 'value')}
                          onKeyDown={(e) => handleKeyDownCollateral(e, col.id, 'value')}
                          className="w-32 font-mono text-xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0 text-right"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-xl font-bold">
                          {formatCurrency(col.value)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loan Splits / Products */}
        {loan.splits && loan.splits.length > 0 && (
          <div className="mt-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
              Loan Products
            </h3>
            <div className="space-y-3">
              {loan.splits.map((split) => (
                <div key={split.id} className="border border-[#111111] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-body text-base font-semibold">{split.productName}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`font-mono text-xs px-2 py-0.5 border ${split.isFixed ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-green-50 border-green-300 text-green-700'}`}>
                          {split.isFixed ? `FIXED ${split.fixedPeriod}yr` : 'VARIABLE'}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 border bg-neutral-50 border-neutral-300">
                          {split.repaymentType}
                        </span>
                      </div>
                    </div>
                    <div
                      className="text-right cursor-pointer hard-shadow-hover p-2 -m-2"
                      onClick={() => handleEdit(`split-${split.id}-amount`, split.amount)}
                    >
                      {editingField === `split-${split.id}-amount` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveSplit(split.id, 'amount')}
                          onKeyDown={(e) => handleKeyDownSplit(e, split.id, 'amount')}
                          className="w-32 font-mono text-xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0 text-right"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-xl font-bold">
                          {formatCurrency(split.amount)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-dashed border-neutral-300">
                    <div
                      className="cursor-pointer"
                      onClick={() => handleEdit(`split-${split.id}-interestRate`, split.interestRate)}
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Rate</div>
                      {editingField === `split-${split.id}-interestRate` ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveSplit(split.id, 'interestRate')}
                          onKeyDown={(e) => handleKeyDownSplit(e, split.id, 'interestRate')}
                          className="w-16 font-mono text-base font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-base font-bold">{split.interestRate.toFixed(2)}%</div>
                      )}
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => handleEdit(`split-${split.id}-loanTerm`, split.loanTerm)}
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">Term</div>
                      {editingField === `split-${split.id}-loanTerm` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveSplit(split.id, 'loanTerm')}
                          onKeyDown={(e) => handleKeyDownSplit(e, split.id, 'loanTerm')}
                          className="w-12 font-mono text-base font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-base font-bold">{split.loanTerm} yrs</div>
                      )}
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => handleEdit(`split-${split.id}-interestOnlyPeriod`, split.interestOnlyPeriod ?? 0)}
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">IO Period</div>
                      {editingField === `split-${split.id}-interestOnlyPeriod` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveSplit(split.id, 'interestOnlyPeriod')}
                          onKeyDown={(e) => handleKeyDownSplit(e, split.id, 'interestOnlyPeriod')}
                          className="w-12 font-mono text-base font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-base font-bold">{split.interestOnlyPeriod ?? 0} yrs</div>
                      )}
                    </div>
                  </div>
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
