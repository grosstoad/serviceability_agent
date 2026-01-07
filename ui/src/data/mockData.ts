import type {
  ApplicationState,
  CalculationResult,
  ChangeLogEntry,
  Scenario,
} from '../types';

// Mock application data - a couple applying for a home loan
export const mockApplication: ApplicationState = {
  loan: {
    loanAmount: 850000,
    loanTerm: 30,
    interestRateOngoing: 6.29,
    interestOnlyPeriod: 0,
  },
  applicants: [
    {
      partyId: 'app-001',
      name: 'James Mitchell',
      applicantType: 'PRIMARY_APPLICANT',
      entityType: 'INDIVIDUAL',
      addressPostcode: '2000',
      maritalStatus: 'MARRIED',
      noOfDependents: 2,
      incomes: {
        employments: [
          {
            id: 'emp-001',
            jobType: 'FULL_TIME',
            employer: 'Westpac Banking Corp',
            salary: 145000,
            salaryFrequency: 'YEARLY',
            bonus: 15000,
            bonusFrequency: 'YEARLY',
          },
        ],
        rentals: [
          {
            incomeId: 'rent-001',
            propertyAddress: '42 Investment Ave, Parramatta',
            proportionalAmount: 2800,
            proportionalAmountFrequency: 'MONTHLY',
            propertyPostcode: '2150',
          },
        ],
        others: [
          {
            id: 'other-001',
            type: 'INVESTMENT_INCOME',
            description: 'Share dividends',
            proportionalAmount: 4500,
            proportionalAmountFrequency: 'YEARLY',
          },
        ],
      },
      expenses: [
        {
          id: 'exp-001',
          type: 'UTILITIES',
          amount: 350,
          amountFrequency: 'MONTHLY',
        },
        {
          id: 'exp-002',
          type: 'GROCERIES',
          amount: 1200,
          amountFrequency: 'MONTHLY',
        },
        {
          id: 'exp-003',
          type: 'TRANSPORT',
          amount: 600,
          amountFrequency: 'MONTHLY',
        },
        {
          id: 'exp-004',
          type: 'INSURANCE',
          amount: 280,
          amountFrequency: 'MONTHLY',
        },
        {
          id: 'exp-005',
          type: 'EDUCATION',
          description: 'Private school fees',
          amount: 2400,
          amountFrequency: 'MONTHLY',
        },
      ],
    },
    {
      partyId: 'app-002',
      name: 'Sarah Mitchell',
      applicantType: 'SECONDARY_APPLICANT',
      entityType: 'INDIVIDUAL',
      addressPostcode: '2000',
      maritalStatus: 'MARRIED',
      noOfDependents: 2,
      incomes: {
        employments: [
          {
            id: 'emp-002',
            jobType: 'PART_TIME',
            employer: 'Sydney Health Clinic',
            salary: 68000,
            salaryFrequency: 'YEARLY',
          },
        ],
        rentals: [],
        others: [
          {
            id: 'other-002',
            type: 'GOVERNMENT_FAMILY_PAYMENTS',
            description: 'Family Tax Benefit A',
            proportionalAmount: 180,
            proportionalAmountFrequency: 'FORTNIGHTLY',
          },
        ],
      },
      expenses: [
        {
          id: 'exp-006',
          type: 'MEDICAL',
          description: 'Regular prescriptions',
          amount: 150,
          amountFrequency: 'MONTHLY',
        },
        {
          id: 'exp-007',
          type: 'ENTERTAINMENT',
          amount: 400,
          amountFrequency: 'MONTHLY',
        },
      ],
    },
  ],
  households: [
    {
      householdId: 'hh-001',
      applicants: [{ partyId: 'app-001' }, { partyId: 'app-002' }],
      addressPostcode: '2000',
      relationshipBetweenApplicants: 'MARRIED',
      noOfDependents: 2,
    },
  ],
  relationshipBetweenApplicants: 'MARRIED',
  collaterals: [
    {
      id: 'col-001',
      address: '15 Dream Street, Surry Hills NSW 2010',
      postcode: '2010',
      value: 1150000,
    },
  ],
  ownerships: [
    { owner: 'PRIMARY_APPLICANT', proportion: 0.5 },
    { owner: 'SECONDARY_APPLICANT', proportion: 0.5 },
  ],
  otherMortgages: [
    {
      id: 'mort-001',
      lender: 'Commonwealth Bank',
      outstandingBalance: 320000,
      limitValue: 400000,
      customerDeclaredRepaymentAmount: 2100,
      repaymentFrequency: 'MONTHLY',
      purpose: 'INVESTMENT',
      repaymentType: 'P&I',
      remainingTerm: 22,
      interestRate: 6.45,
      ownerships: [{ owner: 'PRIMARY_APPLICANT', proportion: 1 }],
    },
  ],
  otherDebts: [
    {
      id: 'debt-001',
      type: 'CREDIT_CARD',
      description: 'Westpac Altitude Platinum',
      limitValue: 15000,
      balance: 3200,
      customerDeclaredRepaymentAmount: 450,
      repaymentFrequency: 'MONTHLY',
    },
    {
      id: 'debt-002',
      type: 'CREDIT_CARD',
      description: 'Amex Platinum',
      limitValue: 25000,
      balance: 0,
    },
    {
      id: 'debt-003',
      type: 'AUTOMOTIVE_LOAN',
      description: 'BMW Finance - X5',
      limitValue: 45000,
      balance: 28500,
      customerDeclaredRepaymentAmount: 850,
      repaymentFrequency: 'MONTHLY',
    },
  ],
};

// Mock calculation result
export const mockCalculationResult: CalculationResult = {
  netSurplusOrDeficit: -1240,
  debtIncomeRatio: 5.8,
  debtServiceRatio: 0.42,
  rateBuffer: 3.0,
  athBufferedRepayments: 6234,
  extBufferedDebtRepayments: 3850,
  applicants: [
    {
      partyId: 'app-001',
      grossIncome: 197900,
      shadedGrossTaxableIncome: 178110,
      shadedNetIncome: 128000,
      declaredFixedExpenses: 0,
      declaredLivingExpenses: 57960,
      hem: 42000,
      higherOfHemOrLivingExpenses: 57960,
      bufferedTotalExpenses: 57960,
    },
    {
      partyId: 'app-002',
      grossIncome: 72680,
      shadedGrossTaxableIncome: 65412,
      shadedNetIncome: 52000,
      declaredFixedExpenses: 0,
      declaredLivingExpenses: 6600,
      hem: 18000,
      higherOfHemOrLivingExpenses: 18000,
      bufferedTotalExpenses: 18000,
    },
  ],
};

// Mock change log entries
export const mockChangeLog: ChangeLogEntry[] = [
  {
    id: 'change-001',
    timestamp: new Date('2026-01-07T09:15:00'),
    field: 'loan.loanAmount',
    category: 'loan',
    description: 'Reduced loan amount',
    previousValue: 920000,
    newValue: 850000,
    impactOnSurplus: 580,
  },
  {
    id: 'change-002',
    timestamp: new Date('2026-01-07T09:18:00'),
    field: 'otherDebts.debt-002',
    category: 'liability',
    description: 'Marked Amex card for payout at settlement',
    previousValue: 'Active',
    newValue: 'Paying out',
    impactOnSurplus: 750,
  },
  {
    id: 'change-003',
    timestamp: new Date('2026-01-07T09:22:00'),
    field: 'applicants.app-001.incomes.employments.emp-001.bonus',
    category: 'income',
    description: 'Updated bonus based on latest payslip',
    previousValue: 12000,
    newValue: 15000,
    impactOnSurplus: 180,
  },
];

// Mock baseline scenario (original import)
export const mockBaselineScenario: Scenario = {
  id: 'scenario-baseline',
  name: 'Original Application',
  createdAt: new Date('2026-01-07T09:00:00'),
  updatedAt: new Date('2026-01-07T09:00:00'),
  application: {
    ...mockApplication,
    loan: {
      ...mockApplication.loan,
      loanAmount: 920000,
    },
  },
  result: {
    ...mockCalculationResult,
    netSurplusOrDeficit: -2750,
    debtIncomeRatio: 6.2,
  },
  isBaseline: true,
  changeLog: [],
};

// Mock current working scenario
export const mockCurrentScenario: Scenario = {
  id: 'scenario-current',
  name: 'Working Scenario',
  createdAt: new Date('2026-01-07T09:00:00'),
  updatedAt: new Date('2026-01-07T09:25:00'),
  application: mockApplication,
  result: mockCalculationResult,
  isBaseline: false,
  changeLog: mockChangeLog,
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format frequency
export const formatFrequency = (freq: string): string => {
  const map: Record<string, string> = {
    YEARLY: 'p.a.',
    MONTHLY: 'p.m.',
    FORTNIGHTLY: 'p.f.',
    WEEKLY: 'p.w.',
  };
  return map[freq] || freq;
};

// Helper to get annual amount
export const toAnnual = (amount: number, frequency: string): number => {
  const multipliers: Record<string, number> = {
    YEARLY: 1,
    MONTHLY: 12,
    FORTNIGHTLY: 26,
    WEEKLY: 52,
  };
  return amount * (multipliers[frequency] || 1);
};

// Helper to format job type
export const formatJobType = (jobType: string): string => {
  const map: Record<string, string> = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CASUAL: 'Casual',
    CONTRACT: 'Contract',
    VARIABLE_CONTRACT: 'Variable Contract',
    SOLE_TRADER: 'Sole Trader',
    SELF_EMPLOYED: 'Self-employed',
  };
  return map[jobType] || jobType;
};

// Helper to format expense type
export const formatExpenseType = (type: string): string => {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Helper to format debt type
export const formatDebtType = (type: string): string => {
  const map: Record<string, string> = {
    CREDIT_CARD: 'Credit Card',
    PERSONAL_LOAN: 'Personal Loan',
    AUTOMOTIVE_LOAN: 'Car Loan',
    LINE_OF_CREDIT: 'Line of Credit',
    STORE_CARD: 'Store Card',
    OVERDRAFTS: 'Overdraft',
    INVESTMENT: 'Investment Loan',
    OTHER_LOAN: 'Other Loan',
  };
  return map[type] || type;
};

// Helper to format other income type
export const formatOtherIncomeType = (type: string): string => {
  const map: Record<string, string> = {
    INVESTMENT_INCOME: 'Investment Income',
    INCOME_FROM_CASH_SAVINGS_OR_TERM_DEPOSITS: 'Term Deposits',
    SUPERANNUATION_INCOME: 'Superannuation',
    OTHER_INCOME: 'Other Income',
    CHILD_SUPPORT_INCOME: 'Child Support',
    GOVERNMENT_FAMILY_PAYMENTS: 'Family Payments',
    GOVERNMENT_PENSION: 'Government Pension',
    GOVERNMENT_BENEFITS_NEWSTART_OR_SICKNESS: 'Centrelink Benefits',
    COMPANY_PROFIT_AFTER_TAX: 'Company Profits',
    GOVERNMENT_INCOME_OTHER: 'Other Govt Income',
    FOREIGN_INCOME: 'Foreign Income',
  };
  return map[type] || type;
};
