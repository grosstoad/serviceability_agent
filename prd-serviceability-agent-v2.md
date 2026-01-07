# Product Requirements Document
## Agentic Serviceability Calculator

**Version:** 2.0  
**Author:** [Your Name]  
**Date:** January 2026  
**Status:** Ready for Development

**Related Documents:**
- Technical Architecture: `tech-spec-serviceability-agent.md`

---

## 1. Executive Summary

### 1.1 Product Vision
A serviceability workshopping tool that enables credit teams to quickly remediate applications that don't service, and helps loan experts capture borrower information conversationally—both with instant scenario comparison against original data.

### 1.2 Problem Statement

**Problem 1: Application Remediation is Manual and Error-Prone**

When a loan application doesn't service (negative surplus), credit assessors need to workshop different scenarios to find a path to approval. Today this requires:
- Manually exporting application data from the core system
- Re-entering all data into an Excel spreadsheet
- Making changes and recalculating serviceability manually
- Comparing results against the original scenario by eye
- Repeating this process multiple times to find viable options

This process is **time-consuming** (30-60 mins per application), **error-prone** (manual data entry and formula errors), and makes it **difficult to track** what changes were made and their impact.

**Problem 2: No Easy Way to Capture Borrower Information**

Loan experts (brokers, customer service, mobile lenders) often need to quickly assess a borrower's serviceability during conversations. Currently there's no tool that allows them to:
- Capture income, expenses, and liabilities conversationally
- Calculate serviceability in real-time
- Explore "what if" scenarios with the borrower
- Understand how different loan amounts or structures affect the outcome

### 1.3 Solution

An agentic serviceability calculator with two entry points:

**1. Import & Workshop Mode** (for Credit Assessors)
- Import existing application data directly (JSON export from core system)
- Original scenario locked as baseline for comparison
- Make changes via chat or UI to create new scenarios
- Instantly see deltas: what changed, impact on surplus, path to approval
- Export recommended changes back to the application

**2. Conversational Capture Mode** (for Loan Experts)
- Start fresh with a borrower conversation
- AI extracts structured data from natural language
- Build up the serviceability request progressively
- Calculate and explain results in plain language
- Save and compare multiple scenarios

### 1.4 Success Metrics

| Metric | Current State | Target State |
|--------|---------------|--------------|
| Time to workshop application | 30-60 mins | 5-10 mins |
| Data entry errors | Common | Eliminated (import) |
| Scenario comparison | Manual/visual | Automated deltas |
| Borrower conversation capture | Not supported | Real-time calculation |

---

## 2. User Personas

### 2.1 Primary: Credit Assessor (Application Remediation)
- **Role:** Assesses loan applications, determines serviceability, recommends conditions
- **Context:** Application has come through that doesn't service; needs to find a path to approval
- **Goals:** 
  - Quickly identify why the application doesn't service
  - Workshop scenarios to achieve positive surplus
  - Document what changes are needed (reduce loan, pay out debt, etc.)
  - Compare multiple remediation options
- **Pain Points:**
  - Re-entering application data into Excel is tedious and error-prone
  - Hard to track what changes were made across scenarios
  - No clear view of deltas between original and proposed
  - Difficult to explain to borrower what changes are needed and why
- **Entry Point:** Import application JSON → Workshop → Compare → Export recommendations

### 2.2 Primary: Loan Expert (Conversational Capture)
- **Role:** Broker, mobile lender, or customer service rep having real-time borrower conversations
- **Context:** Borrower wants to know how much they can borrow, or whether a specific property is within reach
- **Goals:**
  - Capture borrower's financial situation quickly during conversation
  - Calculate serviceability in real-time
  - Explore "what if" scenarios (different loan amounts, paying out debts)
  - Give borrower clear guidance on their position
- **Pain Points:**
  - No tool to capture information conversationally
  - Current calculators require navigating complex forms
  - Hard to explain serviceability concepts to borrowers
  - Can't easily show impact of different decisions
- **Entry Point:** New conversation → Capture details → Calculate → Explore scenarios

### 2.3 Secondary: Operations/Quality
- **Role:** Reviews credit decisions, audits serviceability calculations
- **Context:** Ensuring calculations are accurate and well-documented
- **Goals:**
  - See clear audit trail of changes made
  - Verify calculations match policy
  - Understand rationale for remediation recommendations
- **Entry Point:** Review exported scenarios and change logs

---

## 3. User Stories

### 3.1 Import & Workshop Mode

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| W1 | Credit Assessor | Import application data from JSON | I don't have to re-enter everything manually | P0 |
| W2 | Credit Assessor | Have the original automatically locked as baseline | I can always compare back to it | P0 |
| W3 | Credit Assessor | Make changes via chat or form | I can quickly explore different scenarios | P0 |
| W4 | Credit Assessor | See instant delta when I make a change | I understand the impact immediately | P0 |
| W5 | Credit Assessor | Save multiple scenarios | I can compare different remediation options | P1 |
| W6 | Credit Assessor | Generate a remediation summary | I can document what changes are needed | P1 |
| W7 | Credit Assessor | Export the scenario as JSON | I can update the core system | P1 |
| W8 | Credit Assessor | See which changes had the biggest impact | I can prioritize recommendations | P2 |

### 3.2 Conversational Capture Mode

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| C1 | Loan Expert | Describe a borrower's income naturally | I don't have to navigate complex forms | P0 |
| C2 | Loan Expert | Have the AI extract structured data | Information is captured accurately | P0 |
| C3 | Loan Expert | Calculate serviceability at any point | I can give the borrower feedback quickly | P0 |
| C4 | Loan Expert | See what information is missing | I know what else to ask the borrower | P0 |
| C5 | Loan Expert | Explore "what if" scenarios | I can show the borrower their options | P1 |
| C6 | Loan Expert | Get plain-language explanations | I can explain results to the borrower | P1 |
| C7 | Loan Expert | Save the session | I can hand off to credit or continue later | P1 |
| C8 | Loan Expert | See maximum borrowing capacity | I can set borrower expectations | P2 |

### 3.3 Common Capabilities

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| X1 | User | Add/edit/remove applicants | I can model different borrower structures | P0 |
| X2 | User | Add/edit/remove income sources | I can capture complete financial picture | P0 |
| X3 | User | Add/edit/remove expenses | I can model declared expenses vs HEM | P0 |
| X4 | User | Add/edit/remove liabilities | I can model existing debts | P0 |
| X5 | User | Set loan amount/term/rate | I can model the proposed loan | P0 |
| X6 | User | See surplus, NSR, DTI, DSR | I understand the serviceability position | P0 |
| X7 | User | Compare two scenarios side-by-side | I can see the impact of changes | P1 |
| X8 | User | Undo recent changes | I can recover from mistakes | P2 |

---

## 4. Functional Requirements

### 4.1 Data Capture

The system must support capturing the following data categories:

| Category | Data Points | Notes |
|----------|-------------|-------|
| **Applicants** | Primary/secondary, individual/entity, postcode, marital status, dependents | Min 1, max based on API |
| **Households** | Postcode, dependents, relationship | V7 requires explicit household structure |
| **Employment Income** | Job type, salary, bonus, overtime, commission, allowances, frequencies | Multiple per applicant |
| **Rental Income** | Amount, frequency, property postcode | Multiple per applicant |
| **Other Income** | 12 types (dividends, government payments, etc.) | Multiple per applicant |
| **Expenses** | 13 categories (fixed vs living) | Compared to HEM |
| **Other Debts** | 8 types (credit cards, loans, etc.) with limits and repayments | Multiple |
| **Other Mortgages** | Balance, limit, repayments, purpose, ownership | Multiple |
| **Loan Details** | Amount, term, rate, IO period, negative gearing | Required for calculation |
| **Collaterals** | Property ID, postcode | For tier calculation |
| **Ownership** | Who owns the loan, proportions | Required for calculation |

### 4.2 Calculation

The system must:
- Call the Serviceability API V7 to perform calculations
- Display key metrics: Net Surplus/Deficit, DTI, DSR, rate buffer used
- Show breakdown per applicant: gross income, shaded income, net income, HEM, expenses
- Support recalculation after any data change

### 4.3 Scenario Management

The system must:
- Allow saving named scenarios
- Support locking a baseline scenario
- Calculate deltas between any two scenarios
- Display side-by-side comparison with highlighted changes
- Track change history with impact on surplus

### 4.4 Import/Export

The system must:
- Import application data from JSON (format TBD with core system team)
- Export scenario data as JSON
- Generate remediation summary (markdown/text)
- Support copy/paste of summary for documentation

---

## 5. User Interface Requirements

### 5.1 Layout

Split-panel interface:
- **Left panel (50%):** Chat/conversation interface
- **Right panel (50%):** Structured data view with tabs
  - Application tab: Current data tree view
  - Scenarios tab: Saved scenarios list
  - Changes tab: Delta from baseline (if set)

### 5.2 Header

- Status indicator: APPROVED (green) / REFER (yellow) / DECLINED (red)
- Key metric: NSR ratio
- Quick actions: Save, Export, Clear

### 5.3 Interaction Modes

| Input | Behavior |
|-------|----------|
| Chat message | AI extracts data, calls tools, updates state |
| Form field edit | State updates, recalculates if auto-calc enabled |
| Button click | Triggers action (save, compare, export) |

### 5.4 Feedback

- Show loading state during API calls
- Highlight changed fields after updates
- Show validation errors inline
- Toast notifications for actions (saved, exported, etc.)

---

## 6. Scope

### 6.1 In Scope (MVP)

- Single and dual applicant scenarios
- All V7 API income types
- All V7 API expense types
- All V7 API liability types
- Scenario save/load (browser storage)
- Baseline comparison
- Chat-based data capture
- Form-based data editing
- JSON import/export

### 6.2 Out of Scope (MVP)

- Multi-lender comparison
- Integration with core system (beyond JSON export)
- Persistent storage (database)
- Multi-user collaboration
- Mobile-optimized UI
- Non-individual entities (trusts, companies) - limited support only
- Maximum borrowing power goal-seek
- PDF report generation

### 6.3 Future Phases

| Phase | Features |
|-------|----------|
| Phase 2 | Max borrowing power calculation, PDF reports, improved entity support |
| Phase 3 | Core system integration (API push), audit logging, user authentication |
| Phase 4 | Multi-lender comparison, broker portal integration |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target |
|--------|--------|
| Time to calculate | < 3 seconds |
| Time to import JSON | < 1 second |
| UI responsiveness | < 100ms for interactions |

### 7.2 Reliability

- Graceful handling of API errors
- Auto-save to prevent data loss
- Recovery from browser refresh

### 7.3 Usability

- No training required for basic use
- Inline help for complex fields
- Clear error messages with remediation hints

### 7.4 Browser Support

- Chrome (latest 2 versions)
- Edge (latest 2 versions)
- Safari (latest 2 versions)

---

## 8. Open Questions

### 8.1 Product Questions

| Question | Status | Notes |
|----------|--------|-------|
| What JSON format will core system export? | Open | Need alignment with core system team |
| Should users be able to manually override HEM? | Open | API supports it; is it allowed by policy? |
| How should non-individual entities be handled? | Open | API supports but rules unclear |
| What determines APPROVED vs REFER vs DECLINED? | Open | API only returns surplus; rules are policy |

### 8.2 Resolved

- ✅ API schema (V7) - fully documented
- ✅ All component schemas - extracted from API docs
- ✅ API endpoints - confirmed

---

## 9. Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Serviceability API V7 | Orcas team | Available |
| JSON export format from core system | Core System team | TBD |
| HEM lookup data | Serviceability team | Built into API |
| Rate buffer values | Policy team | Built into API |

---

## 10. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API availability | Low | High | Error handling, retry logic |
| JSON format changes | Medium | Medium | Version detection, graceful degradation |
| User adoption | Medium | High | Training, documentation, feedback loop |
| Performance with complex scenarios | Low | Medium | Optimize state management |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Serviceability** | Assessment of whether a borrower can afford loan repayments |
| **Surplus** | Net income after all expenses and repayments; positive = services |
| **NSR** | Net Surplus Ratio; surplus ÷ income |
| **DTI** | Debt-to-Income ratio; total debt ÷ annual income |
| **DSR** | Debt Service Ratio; repayments ÷ income |
| **HEM** | Household Expenditure Measure; benchmark living expenses |
| **Shading** | Reducing income by a percentage based on reliability/risk |
| **Rate Buffer** | Extra percentage added to interest rate for stress testing |
| **Baseline** | The original scenario to compare changes against |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0-1.4 | 2026-01-07 | Initial development (see tech spec for technical evolution) |
| 2.0 | 2026-01-07 | Split PRD from tech spec. PRD now focused on product requirements only. Technical details moved to `tech-spec-serviceability-agent.md`. |
