// Frequency enum
export type Frequency = 'YEARLY' | 'MONTHLY' | 'FORTNIGHTLY' | 'WEEKLY';

// Relationship types
export type RelationshipType =
  | 'MARRIED'
  | 'DEFACTO'
  | 'RELATIVE'
  | 'FRIENDS'
  | 'BUSINESS_PARTNERS'
  | 'OTHER';

// Applicant types
export type ApplicantType = 'PRIMARY_APPLICANT' | 'SECONDARY_APPLICANT' | 'NON_BORROWER';
export type EntityType = 'INDIVIDUAL' | 'NON_INDIVIDUAL';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DEFACTO' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';

// Job types
export type JobType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CASUAL'
  | 'CONTRACT'
  | 'VARIABLE_CONTRACT'
  | 'SOLE_TRADER'
  | 'SELF_EMPLOYED';

// Other income types
export type OtherIncomeType =
  | 'INVESTMENT_INCOME'
  | 'INCOME_FROM_CASH_SAVINGS_OR_TERM_DEPOSITS'
  | 'SUPERANNUATION_INCOME'
  | 'OTHER_INCOME'
  | 'CHILD_SUPPORT_INCOME'
  | 'GOVERNMENT_FAMILY_PAYMENTS'
  | 'GOVERNMENT_PENSION'
  | 'GOVERNMENT_BENEFITS_NEWSTART_OR_SICKNESS'
  | 'COMPANY_PROFIT_AFTER_TAX'
  | 'GOVERNMENT_INCOME_OTHER'
  | 'FOREIGN_INCOME';

// Expense types
export type ExpenseType =
  | 'ENTERTAINMENT'
  | 'MEDIA'
  | 'CHILD_SUPPORT'
  | 'RENT_OR_BOARD'
  | 'UTILITIES'
  | 'GROCERIES'
  | 'CLOTHING'
  | 'EDUCATION'
  | 'TRANSPORT'
  | 'MEDICAL'
  | 'INSURANCE'
  | 'OTHER_EXPENSES'
  | 'INVESTMENT_PROPERTY_EXPENSES';

// Debt types
export type DebtType =
  | 'CREDIT_CARD'
  | 'PERSONAL_LOAN'
  | 'AUTOMOTIVE_LOAN'
  | 'LINE_OF_CREDIT'
  | 'STORE_CARD'
  | 'OVERDRAFTS'
  | 'INVESTMENT'
  | 'OTHER_LOAN';

// Mortgage purpose
export type MortgagePurpose = 'INVESTMENT' | 'OWNER_OCCUPIED';
export type RepaymentType = 'P&I' | 'IO';

// Ownership structure
export interface Ownership {
  owner: ApplicantType;
  proportion: number;
}

// Employment income
export interface Employment {
  id: string;
  jobType: JobType;
  employer?: string;
  salary: number;
  salaryFrequency: Frequency;
  bonus?: number;
  bonusFrequency?: Frequency;
  regularOvertimeAndShiftAllowance?: number;
  regularOvertimeAndShiftAllowanceFrequency?: Frequency;
  commission?: number;
  commissionFrequency?: Frequency;
  carAllowance?: number;
  carAllowanceFrequency?: Frequency;
}

// Rental income ownership share
export interface RentalOwnership {
  partyId: string;
  proportion: number; // 0-1
}

// Rental income
export interface RentalIncome {
  incomeId: string;
  propertyAddress?: string;
  proportionalAmount: number;
  proportionalAmountFrequency: Frequency;
  propertyPostcode?: string;
  ownerships?: RentalOwnership[]; // If not specified, assumed 100% to the applicant holding it
}

// Other income
export interface OtherIncome {
  id: string;
  type: OtherIncomeType;
  description?: string;
  proportionalAmount: number;
  proportionalAmountFrequency: Frequency;
}

// Expense
export interface Expense {
  id: string;
  type: ExpenseType;
  description?: string;
  amount: number;
  amountFrequency: Frequency;
}

// Other debt (non-mortgage)
export interface OtherDebt {
  id: string;
  type: DebtType;
  description?: string;
  limitValue: number;
  balance?: number;
  customerDeclaredRepaymentAmount?: number;
  repaymentFrequency?: Frequency;
  isBeingPaidOut?: boolean;
}

// Other mortgage
export interface OtherMortgage {
  id: string;
  lender?: string;
  outstandingBalance: number;
  limitValue: number;
  customerDeclaredRepaymentAmount: number;
  repaymentFrequency: Frequency;
  purpose?: MortgagePurpose;
  repaymentType?: RepaymentType;
  remainingTerm?: number;
  interestRate?: number;
  isBeingRefinanced?: boolean;
  ownerships: Ownership[];
}

// Applicant
export interface Applicant {
  partyId: string;
  name: string;
  applicantType: ApplicantType;
  entityType: EntityType;
  addressPostcode?: string;
  maritalStatus?: MaritalStatus;
  noOfDependents?: number;
  hem?: number;
  incomes: {
    employments: Employment[];
    rentals: RentalIncome[];
    others: OtherIncome[];
  };
  expenses: Expense[];
}

// Household
export interface Household {
  householdId: string;
  applicants: { partyId: string }[];
  addressPostcode: string;
  relationshipBetweenApplicants?: RelationshipType;
  noOfDependents?: number;
}

// Collateral
export interface Collateral {
  id: string;
  address?: string;
  postcode?: string;
  value?: number;
}

// Loan product/split
export interface LoanSplit {
  id: string;
  productName: string;
  amount: number;
  interestRate: number;
  loanTerm: number;
  interestOnlyPeriod?: number;
  repaymentType: RepaymentType;
  isFixed?: boolean;
  fixedPeriod?: number;
}

// Loan details
export interface LoanDetails {
  loanAmount: number;
  loanTerm: number;
  interestRateOngoing: number;
  interestOnlyPeriod?: number;
  negativeGearingPercentage?: number;
  shouldUseLowerRateBuffer?: boolean;
  splits?: LoanSplit[];
}

// Full application state
export interface ApplicationState {
  loan: LoanDetails;
  applicants: Applicant[];
  households: Household[];
  relationshipBetweenApplicants?: RelationshipType;
  collaterals: Collateral[];
  ownerships: Ownership[];
  otherMortgages: OtherMortgage[];
  otherDebts: OtherDebt[];
}

// Calculation result (from API)
export interface CalculationResult {
  netSurplusOrDeficit: number;
  debtIncomeRatio: number;
  debtServiceRatio: number;
  rateBuffer: number;
  athBufferedRepayments: number;
  extBufferedDebtRepayments: number;
  applicants: ApplicantResult[];
}

export interface ApplicantResult {
  partyId: string;
  grossIncome: number;
  shadedGrossTaxableIncome: number;
  shadedNetIncome: number;
  declaredFixedExpenses: number;
  declaredLivingExpenses: number;
  hem: number;
  higherOfHemOrLivingExpenses: number;
  bufferedTotalExpenses: number;
}

// Change log entry
export interface ChangeLogEntry {
  id: string;
  timestamp: Date;
  field: string;
  category: 'loan' | 'income' | 'expense' | 'liability' | 'applicant';
  description: string;
  previousValue: string | number | null;
  newValue: string | number | null;
  impactOnSurplus?: number;
}

// Scenario
export interface Scenario {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  application: ApplicationState;
  result?: CalculationResult;
  isBaseline: boolean;
  changeLog: ChangeLogEntry[];
}

// UI Status
export type ApplicationStatus = 'APPROVED' | 'REFER' | 'DECLINED' | 'PENDING';
