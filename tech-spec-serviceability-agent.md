# Technical Architecture Document
## Agentic Serviceability Calculator

**Version:** 1.0  
**Author:** [Your Name]  
**Date:** January 2026  
**Status:** Draft  
**Related PRD:** prd-serviceability-agent.md v1.4

---

## 1. Overview

This document describes the technical architecture for the Agentic Serviceability Calculator. For product requirements, user personas, and business context, see the PRD.

### 1.1 System Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS                                          │
│                                                                             │
│    Credit Assessors              Loan Experts              Operations       │
│    (Import & Workshop)           (Conversational)          (Audit/Review)   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SERVICEABILITY WORKSHOP APPLICATION                      │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   React UI      │  │   LLM Agent     │  │   State Management          │  │
│  │   (Chat + Form) │◄─┤   (Claude)      │◄─┤   (Scenarios, Deltas)       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                    │
│                                                                             │
│    Serviceability API (V7)              Core System (Application Export)    │
│    POST /api/serviceability/v7/calculate                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER EXPERIENCE LAYER                             │
├─────────────────────────────────┬───────────────────────────────────────────┤
│     IMPORT & WORKSHOP MODE      │      CONVERSATIONAL CAPTURE MODE          │
│     (Credit Assessors)          │      (Loan Experts)                       │
├─────────────────────────────────┼───────────────────────────────────────────┤
│ Mode-specific tools:            │ Mode-specific behavior:                   │
│ • import_application            │ • NL extraction from chat                 │
│ • lock_baseline                 │ • Progressive data capture                │
│ • generate_remediation_summary  │ • Guided questioning                      │
│                                 │ • Plain language explanations             │
│ Mode-specific UI:               │                                           │
│ • JSON import textarea          │ Mode-specific UI:                         │
│ • Baseline vs Current comparison│ • Conversation-first layout               │
│ • Change log / audit trail      │ • "What's missing" prompts                │
│ • Export recommendations        │ • Save for handoff                        │
└─────────────────────────────────┴───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SHARED CAPABILITY LAYER                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Scenario State Management:      │ Core Tools:                               │
│ • Current scenario state        │ • add_applicant, set_applicant_details    │
│ • Saved scenarios (baseline + n)│ • add_employment, add_rental_income       │
│ • Delta calculation engine      │ • add_other_income, add_expense           │
│ • Undo/redo stack               │ • add_other_debt, add_other_mortgage      │
│                                 │ • set_loan, add_collateral                │
├─────────────────────────────────┼───────────────────────────────────────────┤
│ Scenario Operations:            │ Calculation:                              │
│ • save_scenario                 │ • validate_application                    │
│ • load_scenario                 │ • calculate_serviceability                │
│ • compare_scenarios             │ • explain_results                         │
│ • export_scenario               │                                           │
└─────────────────────────────────┴───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVICEABILITY API (V7)                              │
│                                                                             │
│  Endpoint: POST /api/serviceability/v7/calculate                            │
│  Request:  { loanTerm, loanAmount, interestRateOngoing, ownerships[],       │
│              applicants[], households[], collaterals[], otherMortgages[],   │
│              otherDebts[] }                                                 │
│  Response: { applicants[], netSurplusOrDeficit, debtIncomeRatio,            │
│              debtServiceRatio, athBufferedRepayments, ... }                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Integration

### 2.1 Serviceability API V7

**Base URLs:**
- Dev: `https://serverability.athena-dev.com.au/api/serviceability`
- UAT: `https://serverability.athena-test.com.au/api/serviceability`
- Prod: `https://serverability.athena-prod.com.au/api/serviceability`

**Endpoint:** `POST /v7/calculate`

### 2.2 Request Schema

```typescript
interface ServiceabilityRequestV7 {
  // Required fields
  loanTerm: number;                        // 1-30 years
  loanAmount: number;                      // 0-99999999
  interestRateOngoing: number;             // 0-20 percentage
  ownerships: Ownership[];                 // Who owns the loan
  applicants: Applicant[];                 // Min 1
  households: Household[];                 // Min 1 (V7 addition)
  
  // Optional fields
  id?: string;
  interestOnlyPeriod?: number;             // 0-10 years, null for P&I
  negativeGearingPercentage?: number;      // 0-1 decimal
  relationshipBetweenApplicants?: RelationshipType;
  collaterals?: Collateral[];
  otherMortgages?: OtherMortgage[];
  otherDebts?: OtherDebt[];
  shouldUseLowerRateBuffer?: boolean;
}

type RelationshipType = "MARRIED" | "DEFACTO" | "RELATIVE" | "FRIENDS" | 
                        "FRIEND" | "BUSINESS_PARTNERS" | "TRUST" | 
                        "COMPANY" | "OTHER";
```

### 2.3 Response Schema

```typescript
interface ServiceabilityResponseV7 {
  applicants: ApplicantResponse[];
  extBufferedDebtRepayments: number;       // External debt repayments (monthly)
  athBufferedRepayments: number;           // Athena loan repayment (monthly)
  rateBuffer: number;                      // Buffer rate used
  netSurplusOrDeficit: number;             // Key metric: positive = services
  debtIncomeRatio: number;                 // DTI ratio
  debtServiceRatio: number;                // DSR ratio
  collaterals?: CollateralResponse[];
  versions: {
    api: string;
    logic: string;
  };
}

interface ApplicantResponse {
  partyId: string;
  applicantType: "PRIMARY_APPLICANT" | "SECONDARY_APPLICANT";
  grossIncome: number;
  grossTaxableIncome: number;
  shadedGrossTaxableIncome: number;
  deductibleInterest: number;
  grossIncomeAfterDeductible: number;
  shadedGrossTaxableIncomeAfterDeductible: number;
  shadedNetIncome: number;
  declaredFixedExpenses: number;
  declaredLivingExpenses: number;
  hem: number;
  higherOfHemOrLivingExpenses: number;
  bufferedTotalExpenses: number;
  rentalProperties: RentalPropertyResponse[];
}
```

### 2.4 Minimum Required Fields

| Field | Required | Constraint | Notes |
|-------|----------|------------|-------|
| `loanTerm` | ✅ | 1-30 | Years |
| `loanAmount` | ✅ | 0-99999999 | Dollars |
| `interestRateOngoing` | ✅ | 0-20 | Percentage |
| `ownerships[]` | ✅ | Min 1 | owner + proportion (0-1) |
| `applicants[]` | ✅ | Min 1 | See Applicant schema |
| `applicants[].partyId` | ✅ | string | Unique identifier |
| `applicants[].applicantType` | ✅ | enum | PRIMARY/SECONDARY/NON_BORROWER |
| `applicants[].entityType` | ✅ | enum | INDIVIDUAL/NON_INDIVIDUAL |
| `applicants[].incomes` | ✅ | object | employments[], rentals[], others[] |
| `applicants[].expenses` | ✅ | array | Can be empty |
| `households[]` | ✅ | Min 1 | V7 requirement |
| `households[].householdId` | ✅ | string | Unique identifier |
| `households[].addressPostcode` | ✅ | 4 digits | For HEM lookup |
| `households[].applicants[]` | ✅ | array | partyId references |

---

## 3. Component Schemas

### 3.1 Frequency Enum

```typescript
type Frequency = "YEARLY" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY";
```

### 3.2 Ownership

```typescript
interface Ownership {
  owner: "PRIMARY_APPLICANT" | "SECONDARY_APPLICANT";
  proportion: number;  // 0-1 decimal (e.g., 0.5 = 50%)
}
```

### 3.3 Employment

```typescript
interface Employment {
  // Required
  jobType: "CASUAL" | "CONTRACT" | "VARIABLE_CONTRACT" | "SOLE_TRADER" | 
           "FULL_TIME" | "PART_TIME" | "SELF_EMPLOYED";
  salary: number;                          // -99999999 to 99999999
  salaryFrequency: Frequency;
  
  // Optional
  bonus?: number;
  bonusFrequency?: Frequency;
  regularOvertimeAndShiftAllowance?: number;
  regularOvertimeAndShiftAllowanceFrequency?: Frequency;
  commission?: number;
  commissionFrequency?: Frequency;
  carAllowance?: number;
  carAllowanceFrequency?: Frequency;
}
```

### 3.4 Rental Income

```typescript
interface RentalIncomeBeforeTier {
  incomeId: string;                        // Required, unique
  proportionalAmount: number;              // Required, 0-99999999
  proportionalAmountFrequency: Frequency;  // Required
  propertyPostcode?: string;               // Optional, 4 digits
}
```

### 3.5 Other Income

```typescript
interface OtherIncome {
  type: "INVESTMENT_INCOME" | 
        "INCOME_FROM_CASH_SAVINGS_OR_TERM_DEPOSITS" | 
        "SUPERANNUATION_INCOME" | 
        "OTHER_INCOME" | 
        "CHILD_SUPPORT_INCOME" | 
        "GOVERNMENT_FAMILY_PAYMENTS" | 
        "GOVERNMENT_PENSION" | 
        "GOVERNMENT_BENEFITS_NEWSTART_OR_SICKNESS" | 
        "COMPANY_PROFIT_AFTER_TAX" |        // V7 only
        "GOVERNMENT_INCOME_OTHER" | 
        "FOREIGN_INCOME";                   // V7 only
  proportionalAmount: number;
  proportionalAmountFrequency: Frequency;
}
```

### 3.6 Expense

```typescript
interface Expense {
  type: "ENTERTAINMENT" | "MEDIA" | "CHILD_SUPPORT" | "RENT_OR_BOARD" | 
        "UTILITIES" | "GROCERIES" | "CLOTHING" | "EDUCATION" | 
        "TRANSPORT" | "MEDICAL" | "INSURANCE" | "OTHER_EXPENSES" | 
        "INVESTMENT_PROPERTY_EXPENSES";
  amount: number;                          // 0-99999999
  amountFrequency: Frequency;
}

// Note: CHILD_SUPPORT and RENT_OR_BOARD are "fixed" expenses (always counted)
// All others are "living" expenses (compared to HEM - higher is used)
```

### 3.7 Other Debt

```typescript
interface OtherDebt {
  type: "CREDIT_CARD" | "PERSONAL_LOAN" | "AUTOMOTIVE_LOAN" | 
        "LINE_OF_CREDIT" | "STORE_CARD" | "OVERDRAFTS" | 
        "INVESTMENT" | "OTHER_LOAN";
  limitValue: number;                      // Required, 0-99999999
  balance?: number;
  customerDeclaredRepaymentAmount?: number;
  repaymentFrequency?: Frequency;
}
```

### 3.8 Other Mortgage

```typescript
interface OtherMortgage {
  // Required
  outstandingBalance: number;
  limitValue: number;
  customerDeclaredRepaymentAmount: number;
  repaymentFrequency: Frequency;
  ownerships: Ownership[];
  
  // Optional
  purpose?: "INVESTMENT" | "OWNER_OCCUPIED";
  repaymentType?: "P&I" | "IO";
  remainingTerm?: number | null;           // Years, defaults to 25
  interestRate?: number;                   // 0-20 percentage
  negativeGearingPercentage?: number;      // 0-1 decimal
}
```

### 3.9 Applicant

```typescript
interface Applicant {
  // Required
  partyId: string;
  applicantType: "PRIMARY_APPLICANT" | "SECONDARY_APPLICANT" | "NON_BORROWER";
  entityType: "INDIVIDUAL" | "NON_INDIVIDUAL";
  incomes: {
    employments: Employment[];
    rentals: RentalIncomeBeforeTier[];
    others: OtherIncome[];
  };
  expenses: Expense[];
  
  // Optional (for HEM calculation - ignored if hem provided)
  hem?: number;                            // Annual HEM override
  addressPostcode?: string;
  maritalStatus?: "SINGLE" | "MARRIED" | "DEFACTO" | "DIVORCED" | 
                  "WIDOWED" | "SEPARATED" | "TRUST" | "COMPANY";
  noOfDependents?: number;                 // 0-10
}
```

### 3.10 Household (V7)

```typescript
interface Household {
  householdId: string;                     // Required
  applicants: { partyId: string }[];       // Required
  addressPostcode: string;                 // Required, 4 digits
  relationshipBetweenApplicants?: RelationshipType;
  noOfDependents?: number;                 // Defaults to 0, capped at 3 for HEM
}
```

### 3.11 Collateral

```typescript
interface Collateral {
  id: string;                              // Required
  postcode?: string;                       // For tier calculation
}
```

---

## 4. Agent Tool Definitions

### 4.1 Tool Inventory

| Tool | Category | Required for Calc? | Maps to API |
|------|----------|-------------------|-------------|
| **Import/Export** |
| `import_application` | Import | No | — |
| `export_scenario` | Export | No | — |
| `generate_remediation_summary` | Export | No | — |
| `lock_baseline` | Scenario | No | — |
| **Applicants** |
| `add_applicant` | Applicant | ✅ (min 1) | `applicants[]` |
| `set_applicant_details` | Applicant | No | `applicants[].hem`, etc. |
| `set_household` | Household | ✅ (V7) | `households[]` |
| `remove_applicant` | Applicant | No | — |
| **Income** |
| `add_employment` | Income | ✅ (min 1) | `applicants[].incomes.employments[]` |
| `add_rental_income` | Income | No | `applicants[].incomes.rentals[]` |
| `add_other_income` | Income | No | `applicants[].incomes.others[]` |
| `update_employment` | Income | No | — |
| `remove_employment` | Income | No | — |
| **Expenses** |
| `add_expense` | Expense | No | `applicants[].expenses[]` |
| `set_hem` | Expense | No | `applicants[].hem` |
| `remove_expense` | Expense | No | — |
| **Liabilities** |
| `add_other_debt` | Liability | No | `otherDebts[]` |
| `add_other_mortgage` | Liability | No | `otherMortgages[]` |
| `remove_other_debt` | Liability | No | — |
| `remove_other_mortgage` | Liability | No | — |
| **Loan** |
| `set_loan` | Loan | ✅ | `loanAmount`, `loanTerm`, `interestRateOngoing` |
| `set_ownership` | Loan | ✅ | `ownerships[]` |
| `add_collateral` | Property | No | `collaterals[]` |
| **Calculation** |
| `validate_application` | Calc | No | — |
| `calculate_serviceability` | Calc | — | `POST /v7/calculate` |
| **Scenarios** |
| `save_scenario` | Scenario | No | — |
| `load_scenario` | Scenario | No | — |
| `compare_scenarios` | Scenario | No | — |
| `clear_application` | Scenario | No | — |


### 4.2 Tool Definitions (Detailed)

#### 4.2.1 Import & Export Tools

```javascript
{
  name: "import_application",
  description: "Import application data from JSON export. Validates structure and populates all fields.",
  input_schema: {
    type: "object",
    properties: {
      json_data: { type: "string", description: "JSON string containing application data" },
      auto_lock_baseline: { type: "boolean", default: true }
    },
    required: ["json_data"]
  }
}

{
  name: "lock_baseline",
  description: "Lock the current scenario state as the baseline for comparison.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", default: "Baseline" }
    }
  }
}

{
  name: "generate_remediation_summary",
  description: "Generate a summary of all changes made from baseline.",
  input_schema: {
    type: "object",
    properties: {
      include_impact: { type: "boolean", default: true },
      format: { type: "string", enum: ["text", "markdown", "json"], default: "markdown" }
    }
  }
}
```

#### 4.2.2 Applicant Tools

```javascript
{
  name: "add_applicant",
  description: "Add an applicant to the serviceability assessment.",
  input_schema: {
    type: "object",
    properties: {
      applicant_type: { 
        type: "string", 
        enum: ["PRIMARY_APPLICANT", "SECONDARY_APPLICANT", "NON_BORROWER"] 
      },
      entity_type: { type: "string", enum: ["INDIVIDUAL", "NON_INDIVIDUAL"] },
      name: { type: "string", description: "Display name (e.g., 'You', 'Partner')" }
    },
    required: ["applicant_type"]
  }
}

{
  name: "set_household",
  description: "Configure household details. Required for V7 API.",
  input_schema: {
    type: "object",
    properties: {
      address_postcode: { type: "string", pattern: "^[0-9]{4}$" },
      no_of_dependents: { type: "number", minimum: 0 },
      relationship_between_applicants: { 
        type: "string", 
        enum: ["MARRIED", "DEFACTO", "RELATIVE", "FRIENDS", "BUSINESS_PARTNERS", "OTHER"] 
      }
    },
    required: ["address_postcode"]
  }
}
```

#### 4.2.3 Income Tools

```javascript
{
  name: "add_employment",
  description: "Add employment income for an applicant.",
  input_schema: {
    type: "object",
    properties: {
      party_id: { type: "string" },
      job_type: { 
        type: "string", 
        enum: ["FULL_TIME", "PART_TIME", "CASUAL", "CONTRACT", "VARIABLE_CONTRACT", 
               "SOLE_TRADER", "SELF_EMPLOYED"] 
      },
      salary: { type: "number", minimum: -99999999, maximum: 99999999 },
      salary_frequency: { type: "string", enum: ["YEARLY", "MONTHLY", "FORTNIGHTLY", "WEEKLY"] },
      bonus: { type: "number" },
      bonus_frequency: { type: "string", enum: ["YEARLY", "MONTHLY", "FORTNIGHTLY", "WEEKLY"] },
      regular_overtime_and_shift_allowance: { type: "number" },
      commission: { type: "number" },
      car_allowance: { type: "number" }
    },
    required: ["party_id", "job_type", "salary", "salary_frequency"]
  }
}

{
  name: "add_rental_income",
  description: "Add rental income from an investment property.",
  input_schema: {
    type: "object",
    properties: {
      party_id: { type: "string" },
      income_id: { type: "string" },
      proportional_amount: { type: "number", minimum: 0, maximum: 99999999 },
      proportional_amount_frequency: { type: "string", enum: ["YEARLY", "MONTHLY", "FORTNIGHTLY", "WEEKLY"] },
      property_postcode: { type: "string", pattern: "^[0-9]{4}$" }
    },
    required: ["party_id", "income_id", "proportional_amount", "proportional_amount_frequency"]
  }
}

{
  name: "add_other_income",
  description: "Add non-employment income (dividends, government payments, etc.).",
  input_schema: {
    type: "object",
    properties: {
      party_id: { type: "string" },
      type: { 
        type: "string", 
        enum: ["INVESTMENT_INCOME", "INCOME_FROM_CASH_SAVINGS_OR_TERM_DEPOSITS", 
               "SUPERANNUATION_INCOME", "OTHER_INCOME", "CHILD_SUPPORT_INCOME",
               "GOVERNMENT_FAMILY_PAYMENTS", "GOVERNMENT_PENSION", 
               "GOVERNMENT_BENEFITS_NEWSTART_OR_SICKNESS", "COMPANY_PROFIT_AFTER_TAX",
               "GOVERNMENT_INCOME_OTHER", "FOREIGN_INCOME"] 
      },
      proportional_amount: { type: "number" },
      proportional_amount_frequency: { type: "string", enum: ["YEARLY", "MONTHLY", "FORTNIGHTLY", "WEEKLY"] }
    },
    required: ["party_id", "type", "proportional_amount", "proportional_amount_frequency"]
  }
}
```

#### 4.2.4 Expense Tools

```javascript
{
  name: "add_expense",
  description: "Add a declared expense. Fixed expenses always count; living expenses compared to HEM.",
  input_schema: {
    type: "object",
    properties: {
      party_id: { type: "string" },
      type: { 
        type: "string", 
        enum: ["RENT_OR_BOARD", "CHILD_SUPPORT", "UTILITIES", "GROCERIES", "CLOTHING",
               "TRANSPORT", "EDUCATION", "MEDICAL", "INSURANCE", "ENTERTAINMENT",
               "MEDIA", "OTHER_EXPENSES", "INVESTMENT_PROPERTY_EXPENSES"] 
      },
      amount: { type: "number", minimum: 0, maximum: 99999999 },
      amount_frequency: { type: "string", enum: ["YEARLY", "MONTHLY", "FORTNIGHTLY", "WEEKLY"] }
    },
    required: ["type", "amount", "amount_frequency"]
  }
}
```

#### 4.2.5 Liability Tools

```javascript
{
  name: "add_other_debt",
  description: "Add a non-mortgage liability (credit cards, personal loans, etc.).",
  input_schema: {
    type: "object",
    properties: {
      type: { 
        type: "string", 
        enum: ["CREDIT_CARD", "PERSONAL_LOAN", "AUTOMOTIVE_LOAN", "LINE_OF_CREDIT",
               "STORE_CARD", "OVERDRAFTS", "INVESTMENT", "OTHER_LOAN"] 
      },
      limit_value: { type: "number", minimum: 0, maximum: 99999999 },
      balance: { type: "number" },
      customer_declared_repayment_amount: { type: "number" },
      repayment_frequency: { type: "string", enum: ["YEARLY", "MONTHLY", "FORTNIGHTLY", "WEEKLY"] },
      is_being_paid_out: { type: "boolean" }
    },
    required: ["type", "limit_value"]
  }
}

{
  name: "add_other_mortgage",
  description: "Add an existing mortgage with another financial institution.",
  input_schema: {
    type: "object",
    properties: {
      outstanding_balance: { type: "number", minimum: 0, maximum: 99999999 },
      limit_value: { type: "number" },
      customer_declared_repayment_amount: { type: "number" },
      repayment_frequency: { type: "string", enum: ["YEARLY", "MONTHLY", "FORTNIGHTLY", "WEEKLY"] },
      purpose: { type: "string", enum: ["INVESTMENT", "OWNER_OCCUPIED"] },
      repayment_type: { type: "string", enum: ["P&I", "IO"] },
      remaining_term: { type: "number", minimum: 0, maximum: 40 },
      interest_rate: { type: "number", minimum: 0, maximum: 20 },
      is_being_refinanced: { type: "boolean" }
    },
    required: ["outstanding_balance", "limit_value", "customer_declared_repayment_amount", "repayment_frequency"]
  }
}
```

#### 4.2.6 Loan & Calculation Tools

```javascript
{
  name: "set_loan",
  description: "Set the proposed loan details.",
  input_schema: {
    type: "object",
    properties: {
      loan_amount: { type: "number", minimum: 0, maximum: 99999999 },
      loan_term: { type: "number", minimum: 1, maximum: 30 },
      interest_rate_ongoing: { type: "number", minimum: 0, maximum: 20 },
      interest_only_period: { type: "number", minimum: 0, maximum: 10 },
      negative_gearing_percentage: { type: "number", minimum: 0, maximum: 1 },
      should_use_lower_rate_buffer: { type: "boolean" }
    },
    required: ["loan_amount", "loan_term", "interest_rate_ongoing"]
  }
}

{
  name: "set_ownership",
  description: "Set loan ownership structure between applicants.",
  input_schema: {
    type: "object",
    properties: {
      ownerships: {
        type: "array",
        items: {
          type: "object",
          properties: {
            owner: { type: "string", enum: ["PRIMARY_APPLICANT", "SECONDARY_APPLICANT"] },
            proportion: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["owner", "proportion"]
        }
      }
    },
    required: ["ownerships"]
  }
}

{
  name: "calculate_serviceability",
  description: "Calculate serviceability by calling the V7 API.",
  input_schema: {
    type: "object",
    properties: {
      explain_results: { type: "boolean", default: true }
    }
  }
}
```

#### 4.2.7 Scenario Tools

```javascript
{
  name: "save_scenario",
  description: "Save the current application state as a named scenario.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      notes: { type: "string" }
    },
    required: ["name"]
  }
}

{
  name: "load_scenario",
  description: "Load a previously saved scenario.",
  input_schema: {
    type: "object",
    properties: {
      scenario_id: { type: "string" }
    },
    required: ["scenario_id"]
  }
}

{
  name: "compare_scenarios",
  description: "Compare two or more saved scenarios and highlight differences.",
  input_schema: {
    type: "object",
    properties: {
      scenario_ids: { type: "array", items: { type: "string" }, minItems: 2 }
    },
    required: ["scenario_ids"]
  }
}
```

---

## 5. Agent Architecture

### 5.1 Agent Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                        AGENT LOOP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User Message                                                  │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Claude API with:                                        │  │
│   │  - System prompt (parsing rules, context)               │  │
│   │  - Tools (all available tools)                          │  │
│   │  - Current application state                            │  │
│   │  - Conversation history                                  │  │
│   └─────────────────────────────────────────────────────────┘  │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────┐                                          │
│   │ stop_reason =   │──── "end_turn" ───► Return text response │
│   │ "tool_use"?     │                                          │
│   └────────┬────────┘                                          │
│            │ yes                                                │
│            ▼                                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Execute tool(s):                                        │  │
│   │  - Update application state                              │  │
│   │  - Log change to delta tracker                          │  │
│   │  - Return result                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Continue conversation with tool results                 │  │
│   │  (loop back to Claude API call)                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 System Prompt Guidelines

The agent system prompt should include:

**1. Parsing Conventions**
- "$180k" = 180000
- "partner/wife/husband" = secondary applicant
- "IP/investment" = investment purpose
- Property price without deposit = assume 20% deposit

**2. Australian Context**
- HEM benchmarks by postcode/income/dependents
- HECS/HELP repayment thresholds
- Stamp duty awareness
- State-specific considerations

**3. Workflow Guidance**
- Gather income first
- Then liabilities
- Then loan requirements
- Calculate when sufficient data

**4. Explanation Style**
- Plain language
- Explain acronyms on first use
- Provide context for results

---

## 6. Data Model

### 6.1 Application State

The internal application state maps directly to the V7 API request:

```typescript
interface ApplicationState {
  // Loan details
  loan: {
    loanAmount: number;
    loanTerm: number;
    interestRateOngoing: number;
    interestOnlyPeriod?: number;
    negativeGearingPercentage?: number;
    shouldUseLowerRateBuffer?: boolean;
  };
  
  // Applicants
  applicants: Applicant[];
  
  // Households (V7)
  households: Household[];
  
  // Relationship (when 2 applicants)
  relationshipBetweenApplicants?: RelationshipType;
  
  // Collaterals
  collaterals: Collateral[];
  
  // Ownerships
  ownerships: Ownership[];
  
  // Liabilities
  otherMortgages: OtherMortgage[];
  otherDebts: OtherDebt[];
}
```

### 6.2 Scenario State

```typescript
interface ScenarioState {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Application data
  application: ApplicationState;
  
  // Last calculation result (if any)
  result?: ServiceabilityResponseV7;
  
  // For baseline comparison
  isBaseline: boolean;
  baselineId?: string;
  
  // Change tracking
  changes?: ChangeLog[];
  
  // User notes
  notes?: string;
}

interface ChangeLog {
  timestamp: Date;
  tool: string;
  field: string;
  previousValue: any;
  newValue: any;
  impactOnSurplus?: number;  // Calculated if result available
}
```

### 6.3 UI State

```typescript
interface UIState {
  // Current scenario
  currentScenarioId: string;
  
  // All scenarios (including baseline)
  scenarios: Map<string, ScenarioState>;
  
  // Baseline reference
  baselineScenarioId?: string;
  
  // Comparison mode
  comparisonMode: boolean;
  comparisonScenarioIds: string[];
  
  // Conversation
  messages: Message[];
  
  // UI flags
  isCalculating: boolean;
  lastError?: string;
  activeTab: 'application' | 'scenarios' | 'changes';
}
```

---

## 7. Scenario Comparison

### 7.1 Delta Calculation

When comparing scenarios, calculate deltas for all numeric fields:

```typescript
interface ScenarioDelta {
  baselineId: string;
  currentId: string;
  
  // Summary
  surplusDelta: number;           // +$1,240 means improved
  nsrDelta: number;               // +0.08 means improved
  dtiDelta: number;               // -0.3 means improved (lower is better)
  
  // Input changes
  inputChanges: InputChange[];
  
  // Recommendations
  recommendations?: string[];
}

interface InputChange {
  category: 'income' | 'expense' | 'liability' | 'loan';
  field: string;
  baselineValue: any;
  currentValue: any;
  impactOnSurplus: number;
}
```

### 7.2 Comparison Display

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SCENARIO COMPARISON                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   BASELINE (Original)          │    WORKSHOPPED                             │
│   ────────────────────         │    ────────────────                       │
│   Surplus: -$1,240             │    Surplus: +$290   (+$1,530)              │
│   NSR: 0.94                    │    NSR: 1.02        (+0.08)                │
│   DTI: 5.8                     │    DTI: 5.2         (-0.6)                 │
│                                │                                            │
│   CHANGES MADE:                                                             │
│   ─────────────                                                             │
│   ✓ Loan reduced: $960k → $890k                    Impact: +$720/mo        │
│   ✓ Credit card paid out: $45k limit removed       Impact: +$810/mo        │
│                                                                             │
│   RECOMMENDATION:                                                           │
│   To proceed with this application:                                         │
│   1. Reduce loan amount to $890,000                                        │
│   2. Pay out credit cards at settlement ($45k from loan)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Persistence

### 8.1 Storage Strategy

Using browser localStorage/sessionStorage for MVP:

```typescript
// Storage keys
const STORAGE_KEYS = {
  SCENARIOS: 'serviceability_scenarios',
  CURRENT_SCENARIO: 'serviceability_current',
  BASELINE_ID: 'serviceability_baseline',
  SETTINGS: 'serviceability_settings'
};

// Storage interface
interface StorageService {
  saveScenario(scenario: ScenarioState): void;
  loadScenario(id: string): ScenarioState | null;
  listScenarios(): ScenarioState[];
  deleteScenario(id: string): void;
  setBaseline(id: string): void;
  getBaseline(): ScenarioState | null;
}
```

### 8.2 Export Format

```typescript
interface ExportedScenario {
  version: '1.0';
  exportedAt: string;
  scenario: ScenarioState;
  baseline?: ScenarioState;  // Include if exporting comparison
}
```

---

## 9. Validation

### 9.1 Pre-Calculation Validation

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Required for calculation
const REQUIRED_FIELDS = [
  'loan.loanAmount',
  'loan.loanTerm', 
  'loan.interestRateOngoing',
  'applicants[0].partyId',
  'applicants[0].applicantType',
  'applicants[0].entityType',
  'applicants[0].incomes',
  'applicants[0].expenses',
  'households[0].householdId',
  'households[0].addressPostcode',
  'households[0].applicants',
  'ownerships[0]'
];
```

### 9.2 Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `loanAmount` | 0 < x ≤ 99,999,999 | "Loan amount must be between $1 and $99,999,999" |
| `loanTerm` | 1 ≤ x ≤ 30 | "Loan term must be 1-30 years" |
| `interestRateOngoing` | 0 < x ≤ 20 | "Interest rate must be between 0% and 20%" |
| `addressPostcode` | 4 digits | "Postcode must be 4 digits" |
| `ownerships.proportion` | sum = 1.0 | "Ownership proportions must sum to 100%" |
| `applicants` | length ≥ 1 | "At least one applicant required" |
| `households` | length ≥ 1 | "At least one household required" |

---

## 10. Error Handling

### 10.1 Error Categories

| Category | Example | User Message |
|----------|---------|--------------|
| Validation | Missing required field | "Please provide [field] before calculating" |
| API | 400 Bad Request | "There's an issue with the data: [details]" |
| API | 500 Server Error | "Unable to calculate right now. Please try again." |
| Network | Timeout | "Connection timed out. Please check your connection." |
| State | Invalid scenario | "This scenario appears to be corrupted. Start fresh?" |

### 10.2 Recovery Strategies

- **Validation errors**: Highlight missing/invalid fields in UI
- **API errors**: Show error details, allow retry
- **Network errors**: Auto-retry with exponential backoff (max 3 attempts)
- **State corruption**: Offer to reset to last known good state

---

## 11. Testing Strategy

### 11.1 Unit Tests

- Tool input validation
- State transformation functions
- Delta calculation logic
- API request assembly

### 11.2 Integration Tests

- Full agent loop with mock API
- Scenario save/load cycle
- Import/export roundtrip

### 11.3 E2E Tests

- Complete user journey: import → workshop → compare → export
- Conversational capture flow
- Error recovery scenarios

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-07 | Initial technical architecture extracted from PRD v1.4 |
