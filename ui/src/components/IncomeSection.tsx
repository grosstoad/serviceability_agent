import { useState } from 'react';
import type { Applicant, Employment } from '../types';
import {
  formatCurrency,
  formatFrequency,
  formatJobType,
  formatOtherIncomeType,
  toAnnual,
} from '../data/mockData';

interface IncomeSectionProps {
  applicants: Applicant[];
  onUpdateEmployment: (applicantId: string, employmentId: string, updates: Partial<Employment>) => void;
}

export function IncomeSection({ applicants, onUpdateEmployment }: IncomeSectionProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEdit = (fieldKey: string, currentValue: number) => {
    setEditingField(fieldKey);
    setTempValue(currentValue.toString());
  };

  const handleSave = (applicantId: string, employmentId: string, field: keyof Employment) => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue)) {
      onUpdateEmployment(applicantId, employmentId, { [field]: numValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    applicantId: string,
    employmentId: string,
    field: keyof Employment
  ) => {
    if (e.key === 'Enter') {
      handleSave(applicantId, employmentId, field);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
  };

  // Calculate total income across all applicants
  const totalAnnualIncome = applicants.reduce((total, app) => {
    const empIncome = app.incomes.employments.reduce((sum, emp) => {
      let empTotal = toAnnual(emp.salary, emp.salaryFrequency);
      if (emp.bonus) empTotal += toAnnual(emp.bonus, emp.bonusFrequency || 'YEARLY');
      if (emp.commission) empTotal += toAnnual(emp.commission, emp.commissionFrequency || 'YEARLY');
      if (emp.regularOvertimeAndShiftAllowance) {
        empTotal += toAnnual(emp.regularOvertimeAndShiftAllowance, emp.regularOvertimeAndShiftAllowanceFrequency || 'YEARLY');
      }
      return sum + empTotal;
    }, 0);

    const rentalIncome = app.incomes.rentals.reduce(
      (sum, r) => sum + toAnnual(r.proportionalAmount, r.proportionalAmountFrequency),
      0
    );

    const otherIncome = app.incomes.others.reduce(
      (sum, o) => sum + toAnnual(o.proportionalAmount, o.proportionalAmountFrequency),
      0
    );

    return total + empIncome + rentalIncome + otherIncome;
  }, 0);

  return (
    <section className="border border-[#111111] bg-[#F9F9F7]">
      {/* Section header */}
      <div className="border-b border-[#111111] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Employment & Income</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mt-1">
            Fig. 2.0 — Income Sources
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Total Annual Income
          </div>
          <div className="font-mono text-2xl font-bold text-[#166534]">
            {formatCurrency(totalAnnualIncome)}
          </div>
        </div>
      </div>

      {/* Applicants income breakdown */}
      <div className="divide-y divide-[#111111]">
        {applicants.map((applicant, appIdx) => (
          <div key={applicant.partyId} className="p-6">
            {/* Applicant header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 border border-[#111111] flex items-center justify-center font-serif text-xl font-bold">
                {appIdx + 1}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">{applicant.name}</h3>
                <div className="font-mono text-xs uppercase tracking-widest text-[#CC0000]">
                  {applicant.applicantType === 'PRIMARY_APPLICANT' ? 'Primary Applicant' : 'Secondary Applicant'}
                </div>
              </div>
            </div>

            {/* Employment income */}
            {applicant.incomes.employments.length > 0 && (
              <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300">
                  Employment Income
                </h4>
                <div className="space-y-4">
                  {applicant.incomes.employments.map((emp) => (
                    <div key={emp.id} className="border border-[#111111]">
                      {/* Employment header */}
                      <div className="px-4 py-3 bg-neutral-100 border-b border-[#111111] flex items-center justify-between">
                        <div>
                          <div className="font-sans text-sm font-medium">{emp.employer}</div>
                          <div className="font-mono text-xs text-neutral-500">{formatJobType(emp.jobType)}</div>
                        </div>
                        <div className="font-mono text-xs uppercase tracking-widest px-2 py-1 border border-[#111111]">
                          Active
                        </div>
                      </div>

                      {/* Income breakdown grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#111111]">
                        {/* Salary */}
                        <div
                          className="p-4 hover:bg-neutral-50 cursor-pointer"
                          onClick={() => handleEdit(`${applicant.partyId}-${emp.id}-salary`, emp.salary)}
                        >
                          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                            Base Salary
                          </div>
                          {editingField === `${applicant.partyId}-${emp.id}-salary` ? (
                            <input
                              type="number"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onBlur={() => handleSave(applicant.partyId, emp.id, 'salary')}
                              onKeyDown={(e) => handleKeyDown(e, applicant.partyId, emp.id, 'salary')}
                              className="w-full font-mono text-xl font-bold"
                              autoFocus
                            />
                          ) : (
                            <div className="font-mono text-xl font-bold">
                              {formatCurrency(emp.salary)}
                              <span className="text-xs text-neutral-500 ml-1">
                                {formatFrequency(emp.salaryFrequency)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bonus */}
                        <div
                          className="p-4 hover:bg-neutral-50 cursor-pointer"
                          onClick={() => handleEdit(`${applicant.partyId}-${emp.id}-bonus`, emp.bonus ?? 0)}
                        >
                          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                            Bonus
                          </div>
                          {editingField === `${applicant.partyId}-${emp.id}-bonus` ? (
                            <input
                              type="number"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onBlur={() => handleSave(applicant.partyId, emp.id, 'bonus')}
                              onKeyDown={(e) => handleKeyDown(e, applicant.partyId, emp.id, 'bonus')}
                              className="w-full font-mono text-xl font-bold"
                              autoFocus
                            />
                          ) : (
                            <div className="font-mono text-xl font-bold">
                              {emp.bonus ? (
                                <>
                                  {formatCurrency(emp.bonus)}
                                  <span className="text-xs text-neutral-500 ml-1">
                                    {formatFrequency(emp.bonusFrequency || 'YEARLY')}
                                  </span>
                                </>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Commission */}
                        <div
                          className="p-4 hover:bg-neutral-50 cursor-pointer"
                          onClick={() => handleEdit(`${applicant.partyId}-${emp.id}-commission`, emp.commission ?? 0)}
                        >
                          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                            Commission
                          </div>
                          {editingField === `${applicant.partyId}-${emp.id}-commission` ? (
                            <input
                              type="number"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onBlur={() => handleSave(applicant.partyId, emp.id, 'commission')}
                              onKeyDown={(e) => handleKeyDown(e, applicant.partyId, emp.id, 'commission')}
                              className="w-full font-mono text-xl font-bold"
                              autoFocus
                            />
                          ) : (
                            <div className="font-mono text-xl font-bold">
                              {emp.commission ? (
                                <>
                                  {formatCurrency(emp.commission)}
                                  <span className="text-xs text-neutral-500 ml-1">
                                    {formatFrequency(emp.commissionFrequency || 'YEARLY')}
                                  </span>
                                </>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Overtime */}
                        <div
                          className="p-4 hover:bg-neutral-50 cursor-pointer"
                          onClick={() =>
                            handleEdit(
                              `${applicant.partyId}-${emp.id}-overtime`,
                              emp.regularOvertimeAndShiftAllowance ?? 0
                            )
                          }
                        >
                          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                            Overtime/Allowances
                          </div>
                          {editingField === `${applicant.partyId}-${emp.id}-overtime` ? (
                            <input
                              type="number"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onBlur={() =>
                                handleSave(applicant.partyId, emp.id, 'regularOvertimeAndShiftAllowance')
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(e, applicant.partyId, emp.id, 'regularOvertimeAndShiftAllowance')
                              }
                              className="w-full font-mono text-xl font-bold"
                              autoFocus
                            />
                          ) : (
                            <div className="font-mono text-xl font-bold">
                              {emp.regularOvertimeAndShiftAllowance ? (
                                <>
                                  {formatCurrency(emp.regularOvertimeAndShiftAllowance)}
                                  <span className="text-xs text-neutral-500 ml-1">
                                    {formatFrequency(emp.regularOvertimeAndShiftAllowanceFrequency || 'YEARLY')}
                                  </span>
                                </>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rental income */}
            {applicant.incomes.rentals.length > 0 && (
              <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300">
                  Rental Income
                </h4>
                <div className="space-y-3">
                  {applicant.incomes.rentals.map((rental) => (
                    <div key={rental.incomeId} className="border border-[#111111] p-4 flex items-center justify-between">
                      <div>
                        <div className="font-body text-base">{rental.propertyAddress || 'Investment Property'}</div>
                        <div className="font-mono text-xs text-neutral-500 mt-1">
                          Postcode {rental.propertyPostcode}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold">
                          {formatCurrency(rental.proportionalAmount)}
                          <span className="text-xs text-neutral-500 ml-1">
                            {formatFrequency(rental.proportionalAmountFrequency)}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-neutral-500">
                          {formatCurrency(toAnnual(rental.proportionalAmount, rental.proportionalAmountFrequency))} p.a.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other income */}
            {applicant.incomes.others.length > 0 && (
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300">
                  Other Income
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {applicant.incomes.others.map((other) => (
                    <div key={other.id} className="border border-[#111111] p-4 flex items-center justify-between">
                      <div>
                        <div className="font-sans text-sm font-medium">
                          {formatOtherIncomeType(other.type)}
                        </div>
                        {other.description && (
                          <div className="font-mono text-xs text-neutral-500 mt-1">{other.description}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">
                          {formatCurrency(other.proportionalAmount)}
                          <span className="text-xs text-neutral-500 ml-1">
                            {formatFrequency(other.proportionalAmountFrequency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
