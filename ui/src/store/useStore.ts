import { useState, useCallback } from 'react';
import type {
  ApplicationState,
  CalculationResult,
  ChangeLogEntry,
  Scenario,
  LoanDetails,
  Employment,
  Expense,
  OtherDebt,
  OtherMortgage,
} from '../types';
import {
  mockApplication,
  mockCalculationResult,
  mockChangeLog,
  mockBaselineScenario,
  formatCurrency,
} from '../data/mockData';

interface Store {
  // State
  application: ApplicationState;
  result: CalculationResult | null;
  changeLog: ChangeLogEntry[];
  baseline: Scenario | null;
  activeTab: 'loan' | 'income' | 'expenses' | 'liabilities';

  // Actions
  updateLoan: (updates: Partial<LoanDetails>) => void;
  updateEmployment: (applicantId: string, employmentId: string, updates: Partial<Employment>) => void;
  updateExpense: (applicantId: string, expenseId: string, updates: Partial<Expense>) => void;
  updateDebt: (debtId: string, updates: Partial<OtherDebt>) => void;
  updateMortgage: (mortgageId: string, updates: Partial<OtherMortgage>) => void;
  addChangeLogEntry: (entry: Omit<ChangeLogEntry, 'id' | 'timestamp'>) => void;
  setActiveTab: (tab: 'loan' | 'income' | 'expenses' | 'liabilities') => void;
  resetToBaseline: () => void;
}

export function useStore(): Store {
  const [application, setApplication] = useState<ApplicationState>(mockApplication);
  const [result, setResult] = useState<CalculationResult | null>(mockCalculationResult);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>(mockChangeLog);
  const [baseline] = useState<Scenario | null>(mockBaselineScenario);
  const [activeTab, setActiveTab] = useState<'loan' | 'income' | 'expenses' | 'liabilities'>('loan');

  const addChangeLogEntry = useCallback((entry: Omit<ChangeLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ChangeLogEntry = {
      ...entry,
      id: `change-${Date.now()}`,
      timestamp: new Date(),
    };
    setChangeLog((prev) => [newEntry, ...prev]);
  }, []);

  const updateLoan = useCallback((updates: Partial<LoanDetails>) => {
    setApplication((prev) => {
      const oldLoan = prev.loan;
      const newLoan = { ...oldLoan, ...updates };

      // Log changes
      Object.keys(updates).forEach((key) => {
        const oldVal = oldLoan[key as keyof LoanDetails];
        const newVal = updates[key as keyof LoanDetails];
        if (oldVal !== newVal) {
          const fieldLabels: Record<string, string> = {
            loanAmount: 'Loan amount',
            loanTerm: 'Loan term',
            interestRateOngoing: 'Interest rate',
            interestOnlyPeriod: 'Interest-only period',
          };
          addChangeLogEntry({
            field: `loan.${key}`,
            category: 'loan',
            description: `${fieldLabels[key] || key} updated`,
            previousValue: typeof oldVal === 'number' && key === 'loanAmount'
              ? formatCurrency(oldVal)
              : oldVal !== undefined && oldVal !== null ? String(oldVal) : null,
            newValue: typeof newVal === 'number' && key === 'loanAmount'
              ? formatCurrency(newVal)
              : newVal !== undefined && newVal !== null ? String(newVal) : null,
            impactOnSurplus: key === 'loanAmount' && typeof oldVal === 'number' && typeof newVal === 'number'
              ? Math.round((oldVal - newVal) / 100) * 8
              : undefined,
          });
        }
      });

      return { ...prev, loan: newLoan };
    });

    // Simulate recalculation
    simulateRecalculation();
  }, [addChangeLogEntry]);

  const updateEmployment = useCallback((
    applicantId: string,
    employmentId: string,
    updates: Partial<Employment>
  ) => {
    setApplication((prev) => {
      const newApplicants = prev.applicants.map((app) => {
        if (app.partyId !== applicantId) return app;

        const newEmployments = app.incomes.employments.map((emp) => {
          if (emp.id !== employmentId) return emp;

          // Log changes
          Object.keys(updates).forEach((key) => {
            const oldVal = emp[key as keyof Employment];
            const newVal = updates[key as keyof Employment];
            if (oldVal !== newVal && key !== 'id') {
              addChangeLogEntry({
                field: `applicants.${applicantId}.employments.${employmentId}.${key}`,
                category: 'income',
                description: `${app.name}'s ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`,
                previousValue: typeof oldVal === 'number' ? formatCurrency(oldVal) : (oldVal ?? null),
                newValue: typeof newVal === 'number' ? formatCurrency(newVal) : (newVal ?? null),
              });
            }
          });

          return { ...emp, ...updates };
        });

        return {
          ...app,
          incomes: { ...app.incomes, employments: newEmployments },
        };
      });

      return { ...prev, applicants: newApplicants };
    });

    simulateRecalculation();
  }, [addChangeLogEntry]);

  const updateExpense = useCallback((
    applicantId: string,
    expenseId: string,
    updates: Partial<Expense>
  ) => {
    setApplication((prev) => {
      const newApplicants = prev.applicants.map((app) => {
        if (app.partyId !== applicantId) return app;

        const newExpenses = app.expenses.map((exp) => {
          if (exp.id !== expenseId) return exp;

          Object.keys(updates).forEach((key) => {
            const oldVal = exp[key as keyof Expense];
            const newVal = updates[key as keyof Expense];
            if (oldVal !== newVal && key !== 'id') {
              addChangeLogEntry({
                field: `applicants.${applicantId}.expenses.${expenseId}.${key}`,
                category: 'expense',
                description: `${app.name}'s ${exp.type.toLowerCase().replace(/_/g, ' ')} expense updated`,
                previousValue: typeof oldVal === 'number' ? formatCurrency(oldVal) : (oldVal ?? null),
                newValue: typeof newVal === 'number' ? formatCurrency(newVal) : (newVal ?? null),
              });
            }
          });

          return { ...exp, ...updates };
        });

        return { ...app, expenses: newExpenses };
      });

      return { ...prev, applicants: newApplicants };
    });

    simulateRecalculation();
  }, [addChangeLogEntry]);

  const updateDebt = useCallback((debtId: string, updates: Partial<OtherDebt>) => {
    setApplication((prev) => {
      const newDebts = prev.otherDebts.map((debt) => {
        if (debt.id !== debtId) return debt;

        Object.keys(updates).forEach((key) => {
          const oldVal = debt[key as keyof OtherDebt];
          const newVal = updates[key as keyof OtherDebt];
          if (oldVal !== newVal && key !== 'id') {
            addChangeLogEntry({
              field: `otherDebts.${debtId}.${key}`,
              category: 'liability',
              description: `${debt.description || debt.type} ${key === 'isBeingPaidOut' ? (newVal ? 'marked for payout' : 'payout cancelled') : 'updated'}`,
              previousValue: typeof oldVal === 'number' ? formatCurrency(oldVal) : (oldVal?.toString() ?? null),
              newValue: typeof newVal === 'number' ? formatCurrency(newVal) : (newVal?.toString() ?? null),
              impactOnSurplus: key === 'isBeingPaidOut' && newVal ? Math.round(debt.limitValue * 0.03) : undefined,
            });
          }
        });

        return { ...debt, ...updates };
      });

      return { ...prev, otherDebts: newDebts };
    });

    simulateRecalculation();
  }, [addChangeLogEntry]);

  const updateMortgage = useCallback((mortgageId: string, updates: Partial<OtherMortgage>) => {
    setApplication((prev) => {
      const newMortgages = prev.otherMortgages.map((mort) => {
        if (mort.id !== mortgageId) return mort;

        Object.keys(updates).forEach((key) => {
          const oldVal = mort[key as keyof OtherMortgage];
          const newVal = updates[key as keyof OtherMortgage];
          if (oldVal !== newVal && key !== 'id' && key !== 'ownerships') {
            addChangeLogEntry({
              field: `otherMortgages.${mortgageId}.${key}`,
              category: 'liability',
              description: `${mort.lender || 'Mortgage'} ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`,
              previousValue: typeof oldVal === 'number' ? formatCurrency(oldVal) : (oldVal?.toString() ?? null),
              newValue: typeof newVal === 'number' ? formatCurrency(newVal) : (newVal?.toString() ?? null),
            });
          }
        });

        return { ...mort, ...updates };
      });

      return { ...prev, otherMortgages: newMortgages };
    });

    simulateRecalculation();
  }, [addChangeLogEntry]);

  const resetToBaseline = useCallback(() => {
    if (baseline) {
      setApplication(baseline.application);
      setResult(baseline.result || null);
      setChangeLog([]);
      addChangeLogEntry({
        field: 'application',
        category: 'loan',
        description: 'Reset to baseline scenario',
        previousValue: 'Current',
        newValue: 'Baseline',
      });
    }
  }, [baseline, addChangeLogEntry]);

  // Simulate API recalculation (in reality this would call the API)
  const simulateRecalculation = () => {
    // This is mock - in reality we'd call the serviceability API
    setResult((prev) => {
      if (!prev) return prev;
      // Simulate small random changes to show the UI updating
      return {
        ...prev,
        netSurplusOrDeficit: prev.netSurplusOrDeficit + Math.floor(Math.random() * 200 - 100),
      };
    });
  };

  return {
    application,
    result,
    changeLog,
    baseline,
    activeTab,
    updateLoan,
    updateEmployment,
    updateExpense,
    updateDebt,
    updateMortgage,
    addChangeLogEntry,
    setActiveTab,
    resetToBaseline,
  };
}
