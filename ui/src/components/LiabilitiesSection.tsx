import { useState } from 'react';
import type { OtherDebt, OtherMortgage } from '../types';
import { formatCurrency, formatFrequency, formatDebtType } from '../data/mockData';

interface LiabilitiesSectionProps {
  otherDebts: OtherDebt[];
  otherMortgages: OtherMortgage[];
  onUpdateDebt: (debtId: string, updates: Partial<OtherDebt>) => void;
  onUpdateMortgage: (mortgageId: string, updates: Partial<OtherMortgage>) => void;
}

export function LiabilitiesSection({
  otherDebts,
  otherMortgages,
  onUpdateDebt,
  onUpdateMortgage,
}: LiabilitiesSectionProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEdit = (fieldKey: string, currentValue: number) => {
    setEditingField(fieldKey);
    setTempValue(currentValue.toString());
  };

  const handleSaveDebt = (debtId: string, field: keyof OtherDebt) => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue)) {
      onUpdateDebt(debtId, { [field]: numValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleSaveMortgage = (mortgageId: string, field: keyof OtherMortgage) => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue)) {
      onUpdateMortgage(mortgageId, { [field]: numValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDownDebt = (e: React.KeyboardEvent, debtId: string, field: keyof OtherDebt) => {
    if (e.key === 'Enter') {
      handleSaveDebt(debtId, field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
  };

  const handleKeyDownMortgage = (e: React.KeyboardEvent, mortgageId: string, field: keyof OtherMortgage) => {
    if (e.key === 'Enter') {
      handleSaveMortgage(mortgageId, field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
  };

  // Calculate totals
  const totalDebtLimit = otherDebts
    .filter((d) => !d.isBeingPaidOut)
    .reduce((sum, d) => sum + d.limitValue, 0);

  const totalDebtBalance = otherDebts
    .filter((d) => !d.isBeingPaidOut)
    .reduce((sum, d) => sum + (d.balance ?? 0), 0);

  const totalMortgageBalance = otherMortgages
    .filter((m) => !m.isBeingRefinanced)
    .reduce((sum, m) => sum + m.outstandingBalance, 0);

  const totalMonthlyRepayments =
    otherDebts
      .filter((d) => !d.isBeingPaidOut)
      .reduce((sum, d) => sum + (d.customerDeclaredRepaymentAmount ?? 0), 0) +
    otherMortgages
      .filter((m) => !m.isBeingRefinanced)
      .reduce((sum, m) => sum + m.customerDeclaredRepaymentAmount, 0);

  return (
    <section className="border border-[#111111] bg-[#F9F9F7]">
      {/* Section header */}
      <div className="border-b border-[#111111] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Liabilities</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mt-1">
              Fig. 3.0 — Existing Debts & Mortgages
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              Total Monthly Commitments
            </div>
            <div className="font-mono text-2xl font-bold text-[#CC0000]">
              {formatCurrency(totalMonthlyRepayments)}
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 divide-x divide-[#111111] border-b border-[#111111]">
        <div className="p-4">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
            Credit Limits
          </div>
          <div className="font-mono text-xl font-bold">{formatCurrency(totalDebtLimit)}</div>
        </div>
        <div className="p-4">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
            Debt Balance
          </div>
          <div className="font-mono text-xl font-bold">{formatCurrency(totalDebtBalance)}</div>
        </div>
        <div className="p-4">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
            Mortgage Balance
          </div>
          <div className="font-mono text-xl font-bold">{formatCurrency(totalMortgageBalance)}</div>
        </div>
        <div className="p-4">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
            Total Debt
          </div>
          <div className="font-mono text-xl font-bold">
            {formatCurrency(totalDebtBalance + totalMortgageBalance)}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Other Mortgages */}
        {otherMortgages.length > 0 && (
          <div className="mb-8">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#111111]"></span>
              Other Mortgages
            </h3>

            <div className="space-y-4">
              {otherMortgages.map((mortgage) => (
                <div
                  key={mortgage.id}
                  className={`border border-[#111111] ${mortgage.isBeingRefinanced ? 'opacity-50 bg-neutral-100' : ''}`}
                >
                  {/* Mortgage header */}
                  <div className="px-4 py-3 bg-neutral-50 border-b border-[#111111] flex items-center justify-between">
                    <div>
                      <div className="font-sans text-sm font-medium">{mortgage.lender || 'Other Lender'}</div>
                      <div className="font-mono text-xs text-neutral-500">
                        {mortgage.purpose === 'INVESTMENT' ? 'Investment Property' : 'Owner Occupied'} |{' '}
                        {mortgage.repaymentType || 'P&I'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {mortgage.isBeingRefinanced && (
                        <span className="font-mono text-xs uppercase tracking-widest px-2 py-1 bg-[#166534] text-white">
                          Refinancing
                        </span>
                      )}
                      <button
                        onClick={() =>
                          onUpdateMortgage(mortgage.id, { isBeingRefinanced: !mortgage.isBeingRefinanced })
                        }
                        className={`text-xs px-3 py-1 border border-[#111111] ${
                          mortgage.isBeingRefinanced
                            ? 'bg-[#111111] text-white'
                            : 'bg-transparent hover:bg-[#111111] hover:text-white'
                        }`}
                      >
                        {mortgage.isBeingRefinanced ? 'Keep' : 'Refinance'}
                      </button>
                    </div>
                  </div>

                  {/* Mortgage details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#111111]">
                    <div
                      className="p-4 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => handleEdit(`mort-${mortgage.id}-balance`, mortgage.outstandingBalance)}
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        Balance
                      </div>
                      {editingField === `mort-${mortgage.id}-balance` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveMortgage(mortgage.id, 'outstandingBalance')}
                          onKeyDown={(e) => handleKeyDownMortgage(e, mortgage.id, 'outstandingBalance')}
                          className="w-full font-mono text-lg font-bold"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-lg font-bold">
                          {formatCurrency(mortgage.outstandingBalance)}
                        </div>
                      )}
                    </div>

                    <div
                      className="p-4 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => handleEdit(`mort-${mortgage.id}-limit`, mortgage.limitValue)}
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        Limit
                      </div>
                      {editingField === `mort-${mortgage.id}-limit` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveMortgage(mortgage.id, 'limitValue')}
                          onKeyDown={(e) => handleKeyDownMortgage(e, mortgage.id, 'limitValue')}
                          className="w-full font-mono text-lg font-bold"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-lg font-bold">{formatCurrency(mortgage.limitValue)}</div>
                      )}
                    </div>

                    <div
                      className="p-4 hover:bg-neutral-50 cursor-pointer"
                      onClick={() =>
                        handleEdit(`mort-${mortgage.id}-repayment`, mortgage.customerDeclaredRepaymentAmount)
                      }
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        Repayment
                      </div>
                      {editingField === `mort-${mortgage.id}-repayment` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveMortgage(mortgage.id, 'customerDeclaredRepaymentAmount')}
                          onKeyDown={(e) =>
                            handleKeyDownMortgage(e, mortgage.id, 'customerDeclaredRepaymentAmount')
                          }
                          className="w-full font-mono text-lg font-bold"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-lg font-bold">
                          {formatCurrency(mortgage.customerDeclaredRepaymentAmount)}
                          <span className="text-xs text-neutral-500 ml-1">
                            {formatFrequency(mortgage.repaymentFrequency)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        Rate
                      </div>
                      <div className="font-mono text-lg font-bold">
                        {mortgage.interestRate?.toFixed(2) ?? '—'}%
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        Remaining
                      </div>
                      <div className="font-mono text-lg font-bold">{mortgage.remainingTerm ?? 25} years</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Debts */}
        {otherDebts.length > 0 && (
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#CC0000]"></span>
              Other Debts
              <span className="font-normal text-neutral-400 ml-2">(Credit cards, loans, etc.)</span>
            </h3>

            <div className="space-y-3">
              {otherDebts.map((debt) => (
                <div
                  key={debt.id}
                  className={`border border-[#111111] ${debt.isBeingPaidOut ? 'opacity-50 bg-neutral-100' : ''}`}
                >
                  <div className="grid grid-cols-12 divide-x divide-[#111111]">
                    {/* Debt info */}
                    <div className="col-span-4 p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 border border-[#111111] flex items-center justify-center font-mono text-xs font-bold ${
                            debt.type === 'CREDIT_CARD' ? 'bg-[#CC0000] text-white' : ''
                          }`}
                        >
                          {debt.type === 'CREDIT_CARD'
                            ? 'CC'
                            : debt.type === 'AUTOMOTIVE_LOAN'
                            ? 'CAR'
                            : debt.type === 'PERSONAL_LOAN'
                            ? 'PL'
                            : 'OTH'}
                        </div>
                        <div>
                          <div className="font-sans text-sm font-medium">
                            {debt.description || formatDebtType(debt.type)}
                          </div>
                          <div className="font-mono text-xs text-neutral-500">{formatDebtType(debt.type)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Limit */}
                    <div
                      className="col-span-2 p-4 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => handleEdit(`debt-${debt.id}-limit`, debt.limitValue)}
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        Limit
                      </div>
                      {editingField === `debt-${debt.id}-limit` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveDebt(debt.id, 'limitValue')}
                          onKeyDown={(e) => handleKeyDownDebt(e, debt.id, 'limitValue')}
                          className="w-full font-mono text-lg font-bold"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-lg font-bold">{formatCurrency(debt.limitValue)}</div>
                      )}
                    </div>

                    {/* Balance */}
                    <div
                      className="col-span-2 p-4 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => handleEdit(`debt-${debt.id}-balance`, debt.balance ?? 0)}
                    >
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        Balance
                      </div>
                      {editingField === `debt-${debt.id}-balance` ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onBlur={() => handleSaveDebt(debt.id, 'balance')}
                          onKeyDown={(e) => handleKeyDownDebt(e, debt.id, 'balance')}
                          className="w-full font-mono text-lg font-bold"
                          autoFocus
                        />
                      ) : (
                        <div className="font-mono text-lg font-bold">
                          {debt.balance !== undefined ? formatCurrency(debt.balance) : '—'}
                        </div>
                      )}
                    </div>

                    {/* Repayment */}
                    <div className="col-span-2 p-4">
                      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                        Repayment
                      </div>
                      <div className="font-mono text-lg font-bold">
                        {debt.customerDeclaredRepaymentAmount
                          ? `${formatCurrency(debt.customerDeclaredRepaymentAmount)} ${formatFrequency(
                              debt.repaymentFrequency || 'MONTHLY'
                            )}`
                          : '3% of limit'}
                      </div>
                    </div>

                    {/* Payout action */}
                    <div className="col-span-2 p-4 flex items-center justify-center">
                      <button
                        onClick={() => onUpdateDebt(debt.id, { isBeingPaidOut: !debt.isBeingPaidOut })}
                        className={`text-xs px-4 py-2 border border-[#111111] w-full ${
                          debt.isBeingPaidOut
                            ? 'bg-[#166534] text-white border-[#166534]'
                            : 'bg-transparent hover:bg-[#111111] hover:text-white'
                        }`}
                      >
                        {debt.isBeingPaidOut ? 'Paying Out' : 'Pay Out'}
                      </button>
                    </div>
                  </div>

                  {debt.isBeingPaidOut && (
                    <div className="px-4 py-2 bg-[#166534] text-white font-mono text-xs">
                      This debt will be paid out at settlement — removed from serviceability calculation
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="mt-6 border border-dashed border-neutral-400 p-4">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
            Workshop Tip
          </div>
          <p className="font-body text-sm text-neutral-600">
            Paying out credit cards removes 3% of the limit from monthly commitments.
            For a $25,000 card, this saves approximately $750/month in serviceability.
          </p>
        </div>
      </div>
    </section>
  );
}
