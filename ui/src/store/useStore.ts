import { useState, useCallback, useMemo } from 'react';
import type {
  ApplicationState,
  CalculationResult,
  ChangeLogEntry,
  Scenario,
  LoanDetails,
  LoanSplit,
  Collateral,
  Employment,
  Expense,
  OtherDebt,
  OtherMortgage,
  RentalIncome,
  Applicant,
} from '../types';
import {
  mockApplication,
  mockCalculationResult,
  mockChangeLog,
  mockBaselineScenario,
  formatCurrency,
} from '../data/mockData';

// Helper to get a deep value from an object by path
const getValueByPath = (obj: unknown, path: string): unknown => {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
};

// Helper to compare values (handles objects)
const valuesEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.001;
  }
  return JSON.stringify(a) === JSON.stringify(b);
};

export type TabType = 'loan' | 'income' | 'expenses' | 'liabilities' | 'applicants' | 'changes';

interface Store {
  // State
  application: ApplicationState;
  result: CalculationResult | null;
  changeLog: ChangeLogEntry[];
  netChanges: ChangeLogEntry[];
  baseline: Scenario | null;
  activeTab: TabType;

  // Actions
  updateLoan: (updates: Partial<LoanDetails>) => void;
  updateCollateral: (collateralId: string, updates: Partial<Collateral>) => void;
  updateSplit: (splitId: string, updates: Partial<LoanSplit>) => void;
  updateEmployment: (applicantId: string, employmentId: string, updates: Partial<Employment>) => void;
  addRentalIncome: (applicantId: string, rental: Omit<RentalIncome, 'incomeId'>) => void;
  updateRentalIncome: (applicantId: string, incomeId: string, updates: Partial<RentalIncome>) => void;
  removeRentalIncome: (applicantId: string, incomeId: string) => void;
  updateExpense: (applicantId: string, expenseId: string, updates: Partial<Expense>) => void;
  updateDebt: (debtId: string, updates: Partial<OtherDebt>) => void;
  updateMortgage: (mortgageId: string, updates: Partial<OtherMortgage>) => void;
  updateApplicant: (applicantId: string, updates: Partial<Applicant>) => void;
  addChangeLogEntry: (entry: Omit<ChangeLogEntry, 'id' | 'timestamp'>) => void;
  setActiveTab: (tab: TabType) => void;
  resetToBaseline: () => void;
}

export function useStore(): Store {
  const [application, setApplication] = useState<ApplicationState>(mockApplication);
  const [result, setResult] = useState<CalculationResult | null>(mockCalculationResult);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>(mockChangeLog);
  const [baseline] = useState<Scenario | null>(mockBaselineScenario);
  const [activeTab, setActiveTab] = useState<TabType>('loan');

  // Compute net changes - only show changes where current value differs from baseline
  const netChanges = useMemo(() => {
    if (!baseline) return changeLog;

    // Group changes by field and keep only the latest for each field
    const latestByField = new Map<string, ChangeLogEntry>();
    // Process in reverse order (oldest first) so latest overwrites
    [...changeLog].reverse().forEach(entry => {
      latestByField.set(entry.field, entry);
    });

    // Filter out changes where current value matches baseline
    const filtered: ChangeLogEntry[] = [];
    latestByField.forEach((entry) => {
      // Get the baseline value for this field
      const baselineValue = getValueByPath(baseline.application, entry.field);
      // Get the current value (entry.newValue)
      const currentValue = entry.newValue;

      // Format baseline value for comparison
      let formattedBaseline: string | number | null = null;
      if (typeof baselineValue === 'number') {
        // Check if this is a currency field
        if (entry.field.includes('Amount') || entry.field.includes('salary') ||
            entry.field.includes('bonus') || entry.field.includes('Value') ||
            entry.field.includes('balance') || entry.field.includes('limit')) {
          formattedBaseline = formatCurrency(baselineValue);
        } else {
          formattedBaseline = baselineValue;
        }
      } else if (baselineValue !== undefined && baselineValue !== null) {
        formattedBaseline = String(baselineValue);
      }

      // Only include if values differ from baseline
      if (!valuesEqual(currentValue, formattedBaseline) &&
          !valuesEqual(currentValue, baselineValue)) {
        filtered.push({
          ...entry,
          // Update previousValue to show baseline value
          previousValue: formattedBaseline,
        });
      }
    });

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [changeLog, baseline]);

  // Simulate API recalculation (in reality this would call the API)
  const simulateRecalculation = useCallback(() => {
    // This is mock - in reality we'd call the serviceability API
    setResult((prev) => {
      if (!prev) return prev;
      // Simulate small random changes to show the UI updating
      return {
        ...prev,
        netSurplusOrDeficit: prev.netSurplusOrDeficit + Math.floor(Math.random() * 200 - 100),
      };
    });
  }, []);

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
  }, [addChangeLogEntry, simulateRecalculation]);

  const updateCollateral = useCallback((
    collateralId: string,
    updates: Partial<Collateral>
  ) => {
    setApplication((prev) => {
      const newCollaterals = prev.collaterals.map((col) => {
        if (col.id !== collateralId) return col;

        Object.keys(updates).forEach((key) => {
          const oldVal = col[key as keyof Collateral];
          const newVal = updates[key as keyof Collateral];
          if (oldVal !== newVal && key !== 'id') {
            addChangeLogEntry({
              field: `collaterals.${collateralId}.${key}`,
              category: 'loan',
              description: `Security property ${key === 'value' ? 'value' : key} updated`,
              previousValue: typeof oldVal === 'number' ? formatCurrency(oldVal) : (oldVal ?? null),
              newValue: typeof newVal === 'number' ? formatCurrency(newVal) : (newVal ?? null),
            });
          }
        });

        return { ...col, ...updates };
      });

      return { ...prev, collaterals: newCollaterals };
    });

    simulateRecalculation();
  }, [addChangeLogEntry, simulateRecalculation]);

  const updateSplit = useCallback((
    splitId: string,
    updates: Partial<LoanSplit>
  ) => {
    setApplication((prev) => {
      const newSplits = (prev.loan.splits ?? []).map((split) => {
        if (split.id !== splitId) return split;

        Object.keys(updates).forEach((key) => {
          const oldVal = split[key as keyof LoanSplit];
          const newVal = updates[key as keyof LoanSplit];
          if (oldVal !== newVal && key !== 'id') {
            const fieldLabels: Record<string, string> = {
              amount: 'amount',
              interestRate: 'interest rate',
              loanTerm: 'term',
              interestOnlyPeriod: 'IO period',
            };
            addChangeLogEntry({
              field: `loan.splits.${splitId}.${key}`,
              category: 'loan',
              description: `${split.productName} ${fieldLabels[key] || key} updated`,
              previousValue: typeof oldVal === 'number' && key === 'amount'
                ? formatCurrency(oldVal)
                : oldVal !== undefined && oldVal !== null ? String(oldVal) : null,
              newValue: typeof newVal === 'number' && key === 'amount'
                ? formatCurrency(newVal)
                : newVal !== undefined && newVal !== null ? String(newVal) : null,
            });
          }
        });

        return { ...split, ...updates };
      });

      // Recalculate total loan amount from splits
      const newLoanAmount = newSplits.reduce((sum, s) => sum + s.amount, 0);

      return {
        ...prev,
        loan: {
          ...prev.loan,
          splits: newSplits,
          loanAmount: newLoanAmount,
        },
      };
    });

    simulateRecalculation();
  }, [addChangeLogEntry, simulateRecalculation]);

  const updateApplicant = useCallback((
    applicantId: string,
    updates: Partial<Applicant>
  ) => {
    setApplication((prev) => {
      const newApplicants = prev.applicants.map((app) => {
        if (app.partyId !== applicantId) return app;

        Object.keys(updates).forEach((key) => {
          if (key === 'incomes' || key === 'expenses' || key === 'partyId') return;
          const oldVal = app[key as keyof Applicant];
          const newVal = updates[key as keyof Applicant];
          if (oldVal !== newVal) {
            const fieldLabels: Record<string, string> = {
              name: 'name',
              maritalStatus: 'marital status',
              noOfDependents: 'number of dependents',
              addressPostcode: 'postcode',
            };
            addChangeLogEntry({
              field: `applicants.${applicantId}.${key}`,
              category: 'applicant',
              description: `${app.name}'s ${fieldLabels[key] || key} updated`,
              previousValue: oldVal !== undefined && oldVal !== null ? String(oldVal) : null,
              newValue: newVal !== undefined && newVal !== null ? String(newVal) : null,
            });
          }
        });

        return { ...app, ...updates };
      });

      return { ...prev, applicants: newApplicants };
    });

    simulateRecalculation();
  }, [addChangeLogEntry, simulateRecalculation]);

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
  }, [addChangeLogEntry, simulateRecalculation]);

  const addRentalIncome = useCallback((
    applicantId: string,
    rental: Omit<RentalIncome, 'incomeId'>
  ) => {
    const newIncomeId = `rental-${Date.now()}`;

    setApplication((prev) => {
      const newApplicants = prev.applicants.map((app) => {
        if (app.partyId !== applicantId) return app;

        const newRental: RentalIncome = {
          ...rental,
          incomeId: newIncomeId,
        };

        addChangeLogEntry({
          field: `applicants.${applicantId}.rentals.${newIncomeId}`,
          category: 'income',
          description: `Added rental income for ${app.name}`,
          previousValue: null,
          newValue: formatCurrency(rental.proportionalAmount),
          impactOnSurplus: Math.round(rental.proportionalAmount * 0.8 * 0.6), // Rough estimate: 80% shading, 60% net
        });

        return {
          ...app,
          incomes: {
            ...app.incomes,
            rentals: [...app.incomes.rentals, newRental],
          },
        };
      });

      return { ...prev, applicants: newApplicants };
    });

    simulateRecalculation();
  }, [addChangeLogEntry, simulateRecalculation]);

  const updateRentalIncome = useCallback((
    applicantId: string,
    incomeId: string,
    updates: Partial<RentalIncome>
  ) => {
    setApplication((prev) => {
      const newApplicants = prev.applicants.map((app) => {
        if (app.partyId !== applicantId) return app;

        const newRentals = app.incomes.rentals.map((rental) => {
          if (rental.incomeId !== incomeId) return rental;

          Object.keys(updates).forEach((key) => {
            if (key === 'incomeId' || key === 'ownerships') return; // Skip ownership changes in log
            const oldVal = rental[key as keyof RentalIncome];
            const newVal = updates[key as keyof RentalIncome];
            if (oldVal !== newVal) {
              addChangeLogEntry({
                field: `applicants.${applicantId}.rentals.${incomeId}.${key}`,
                category: 'income',
                description: `${app.name}'s rental ${key === 'proportionalAmount' ? 'amount' : key.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`,
                previousValue: typeof oldVal === 'number' ? formatCurrency(oldVal) : (typeof oldVal === 'string' ? oldVal : null),
                newValue: typeof newVal === 'number' ? formatCurrency(newVal) : (typeof newVal === 'string' ? newVal : null),
              });
            }
          });

          return { ...rental, ...updates };
        });

        return {
          ...app,
          incomes: { ...app.incomes, rentals: newRentals },
        };
      });

      return { ...prev, applicants: newApplicants };
    });

    simulateRecalculation();
  }, [addChangeLogEntry, simulateRecalculation]);

  const removeRentalIncome = useCallback((
    applicantId: string,
    incomeId: string
  ) => {
    setApplication((prev) => {
      const newApplicants = prev.applicants.map((app) => {
        if (app.partyId !== applicantId) return app;

        const rentalToRemove = app.incomes.rentals.find((r) => r.incomeId === incomeId);
        if (rentalToRemove) {
          addChangeLogEntry({
            field: `applicants.${applicantId}.rentals.${incomeId}`,
            category: 'income',
            description: `Removed rental income for ${app.name}`,
            previousValue: formatCurrency(rentalToRemove.proportionalAmount),
            newValue: null,
            impactOnSurplus: -Math.round(rentalToRemove.proportionalAmount * 0.8 * 0.6),
          });
        }

        return {
          ...app,
          incomes: {
            ...app.incomes,
            rentals: app.incomes.rentals.filter((r) => r.incomeId !== incomeId),
          },
        };
      });

      return { ...prev, applicants: newApplicants };
    });

    simulateRecalculation();
  }, [addChangeLogEntry, simulateRecalculation]);

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
  }, [addChangeLogEntry, simulateRecalculation]);

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
  }, [addChangeLogEntry, simulateRecalculation]);

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
  }, [addChangeLogEntry, simulateRecalculation]);

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

  return {
    application,
    result,
    changeLog,
    netChanges,
    baseline,
    activeTab,
    updateLoan,
    updateCollateral,
    updateSplit,
    updateEmployment,
    addRentalIncome,
    updateRentalIncome,
    removeRentalIncome,
    updateExpense,
    updateDebt,
    updateMortgage,
    updateApplicant,
    addChangeLogEntry,
    setActiveTab,
    resetToBaseline,
  };
}
