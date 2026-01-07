import { useState } from 'react';
import type { Applicant, Expense, CalculationResult } from '../types';
import { formatCurrency, formatFrequency, formatExpenseType, toAnnual } from '../data/mockData';

interface ExpensesSectionProps {
  applicants: Applicant[];
  result: CalculationResult | null;
  onUpdateExpense: (applicantId: string, expenseId: string, updates: Partial<Expense>) => void;
}

// Fixed vs Living expenses categorization
const FIXED_EXPENSES = ['CHILD_SUPPORT', 'RENT_OR_BOARD'];

export function ExpensesSection({ applicants, result, onUpdateExpense }: ExpensesSectionProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEdit = (fieldKey: string, currentValue: number) => {
    setEditingField(fieldKey);
    setTempValue(currentValue.toString());
  };

  const handleSave = (applicantId: string, expenseId: string) => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue)) {
      onUpdateExpense(applicantId, expenseId, { amount: numValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, applicantId: string, expenseId: string) => {
    if (e.key === 'Enter') {
      handleSave(applicantId, expenseId);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
  };

  // Calculate totals
  const allExpenses = applicants.flatMap((app) =>
    app.expenses.map((exp) => ({ ...exp, applicantId: app.partyId, applicantName: app.name }))
  );

  const totalDeclaredMonthly = allExpenses.reduce((sum, exp) => {
    const monthly = exp.amountFrequency === 'MONTHLY' ? exp.amount
      : exp.amountFrequency === 'FORTNIGHTLY' ? (exp.amount * 26) / 12
      : exp.amountFrequency === 'WEEKLY' ? (exp.amount * 52) / 12
      : exp.amount / 12;
    return sum + monthly;
  }, 0);

  const totalDeclaredAnnual = allExpenses.reduce(
    (sum, exp) => sum + toAnnual(exp.amount, exp.amountFrequency),
    0
  );

  // Get HEM from result if available
  const totalHEM = result?.applicants.reduce((sum, app) => sum + app.hem, 0) ?? 0;

  const fixedExpenses = allExpenses.filter((exp) => FIXED_EXPENSES.includes(exp.type));
  const livingExpenses = allExpenses.filter((exp) => !FIXED_EXPENSES.includes(exp.type));

  // Group living expenses by type
  const expensesByType = livingExpenses.reduce((acc, exp) => {
    if (!acc[exp.type]) {
      acc[exp.type] = [];
    }
    acc[exp.type].push(exp);
    return acc;
  }, {} as Record<string, typeof livingExpenses>);

  return (
    <section className="border border-[#111111] bg-[#F9F9F7]">
      {/* Section header */}
      <div className="border-b border-[#111111] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Declared Expenses</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mt-1">
              Fig. 4.0 — Living & Fixed Expenses
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              Total Monthly
            </div>
            <div className="font-mono text-2xl font-bold text-[#CC0000]">
              {formatCurrency(totalDeclaredMonthly)}
            </div>
          </div>
        </div>
      </div>

      {/* HEM Comparison Banner */}
      <div className="px-6 py-4 bg-neutral-100 border-b border-[#111111]">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
              Declared Living Expenses
            </div>
            <div className="font-mono text-xl font-bold">
              {formatCurrency(totalDeclaredAnnual)} <span className="text-sm text-neutral-500">p.a.</span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
              HEM Benchmark
            </div>
            <div className="font-mono text-xl font-bold">
              {formatCurrency(totalHEM)} <span className="text-sm text-neutral-500">p.a.</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
              Used for Calculation
            </div>
            <div className="font-mono text-xl font-bold">
              {formatCurrency(Math.max(totalDeclaredAnnual, totalHEM))} <span className="text-sm text-neutral-500">p.a.</span>
            </div>
            <div className="font-mono text-xs text-neutral-500 mt-1">
              (Higher of declared or HEM)
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Fixed Expenses */}
        {fixedExpenses.length > 0 && (
          <div className="mb-8">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#CC0000]"></span>
              Fixed Expenses
              <span className="font-normal text-neutral-400 ml-2">(Always counted in full)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fixedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="border border-[#111111] p-4 flex items-center justify-between hover:bg-neutral-50 cursor-pointer"
                  onClick={() => handleEdit(`${exp.applicantId}-${exp.id}`, exp.amount)}
                >
                  <div>
                    <div className="font-sans text-sm font-medium">{formatExpenseType(exp.type)}</div>
                    <div className="font-mono text-xs text-neutral-500 mt-1">{exp.applicantName}</div>
                  </div>
                  <div className="text-right">
                    {editingField === `${exp.applicantId}-${exp.id}` ? (
                      <input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => handleSave(exp.applicantId, exp.id)}
                        onKeyDown={(e) => handleKeyDown(e, exp.applicantId, exp.id)}
                        className="w-32 font-mono text-xl font-bold text-right"
                        autoFocus
                      />
                    ) : (
                      <div className="font-mono text-xl font-bold">
                        {formatCurrency(exp.amount)}
                        <span className="text-xs text-neutral-500 ml-1">
                          {formatFrequency(exp.amountFrequency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Living Expenses by Category */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#111111]"></span>
            Living Expenses
            <span className="font-normal text-neutral-400 ml-2">(Compared to HEM)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {Object.entries(expensesByType).map(([type, expenses]) => {
              const totalForType = expenses.reduce(
                (sum, exp) => sum + toAnnual(exp.amount, exp.amountFrequency) / 12,
                0
              );

              return (
                <div key={type} className="border border-[#111111] -mt-px -ml-px">
                  {/* Category header */}
                  <div className="px-4 py-3 bg-neutral-50 border-b border-[#111111] flex items-center justify-between">
                    <div className="font-sans text-sm font-medium">{formatExpenseType(type)}</div>
                    <div className="font-mono text-sm font-bold">{formatCurrency(totalForType)}/mo</div>
                  </div>

                  {/* Individual expenses */}
                  <div className="divide-y divide-neutral-200">
                    {expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50 cursor-pointer"
                        onClick={() => handleEdit(`${exp.applicantId}-${exp.id}`, exp.amount)}
                      >
                        <div>
                          <div className="font-mono text-xs text-neutral-500">{exp.applicantName}</div>
                          {exp.description && (
                            <div className="font-body text-xs text-neutral-600 mt-0.5">{exp.description}</div>
                          )}
                        </div>
                        {editingField === `${exp.applicantId}-${exp.id}` ? (
                          <input
                            type="number"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => handleSave(exp.applicantId, exp.id)}
                            onKeyDown={(e) => handleKeyDown(e, exp.applicantId, exp.id)}
                            className="w-24 font-mono text-base font-bold text-right"
                            autoFocus
                          />
                        ) : (
                          <div className="font-mono text-base font-bold">
                            {formatCurrency(exp.amount)}
                            <span className="text-xs text-neutral-500 ml-1">
                              {formatFrequency(exp.amountFrequency)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary bar */}
        <div className="mt-6 border-t-4 border-[#111111] pt-4">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              Total Declared Expenses
            </div>
            <div className="font-mono text-2xl font-bold">
              {formatCurrency(totalDeclaredAnnual)} <span className="text-sm text-neutral-500">p.a.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
