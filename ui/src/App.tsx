import './index.css';
import { useStore } from './store/useStore';
import {
  Header,
  Navigation,
  LoanSection,
  IncomeSection,
  ExpensesSection,
  LiabilitiesSection,
  ChangeLog,
} from './components';

function App() {
  const {
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
    setActiveTab,
    resetToBaseline,
  } = useStore();

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Header */}
      <Header application={application} result={result} onReset={resetToBaseline} />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        changeCount={changeLog.length}
      />

      {/* Main content */}
      <main className="mx-auto max-w-screen-xl px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main content area */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Active section based on tab */}
            {activeTab === 'loan' && (
              <LoanSection
                loan={application.loan}
                collaterals={application.collaterals}
                onUpdate={updateLoan}
              />
            )}

            {activeTab === 'income' && (
              <IncomeSection
                applicants={application.applicants}
                onUpdateEmployment={updateEmployment}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesSection
                applicants={application.applicants}
                result={result}
                onUpdateExpense={updateExpense}
              />
            )}

            {activeTab === 'liabilities' && (
              <LiabilitiesSection
                otherDebts={application.otherDebts}
                otherMortgages={application.otherMortgages}
                onUpdateDebt={updateDebt}
                onUpdateMortgage={updateMortgage}
              />
            )}
          </div>

          {/* Sidebar - Change Log */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="lg:sticky lg:top-20">
              <ChangeLog
                changeLog={changeLog}
                baseline={baseline}
                currentSurplus={result?.netSurplusOrDeficit ?? 0}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-[#111111] bg-[#111111] text-[#F9F9F7] mt-16">
        <div className="mx-auto max-w-screen-xl px-4 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Brand */}
            <div className="col-span-12 md:col-span-4">
              <h3 className="font-serif text-2xl font-bold mb-4">
                Serviceability
                <br />
                <span className="italic">Workshop</span>
              </h3>
              <p className="font-body text-sm text-neutral-400 leading-relaxed">
                A tool for credit assessors and loan experts to workshop serviceability scenarios,
                compare changes, and find paths to approval.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-span-6 md:col-span-2">
              <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                Sections
              </h4>
              <ul className="space-y-2 font-sans text-sm">
                <li>
                  <button
                    onClick={() => setActiveTab('loan')}
                    className="hover:text-[#CC0000] transition-colors"
                  >
                    Loan Details
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('income')}
                    className="hover:text-[#CC0000] transition-colors"
                  >
                    Income
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="hover:text-[#CC0000] transition-colors"
                  >
                    Expenses
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('liabilities')}
                    className="hover:text-[#CC0000] transition-colors"
                  >
                    Liabilities
                  </button>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="col-span-6 md:col-span-2">
              <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                Actions
              </h4>
              <ul className="space-y-2 font-sans text-sm">
                <li>
                  <button className="hover:text-[#CC0000] transition-colors">Import JSON</button>
                </li>
                <li>
                  <button className="hover:text-[#CC0000] transition-colors">Export Scenario</button>
                </li>
                <li>
                  <button className="hover:text-[#CC0000] transition-colors">Save Scenario</button>
                </li>
                <li>
                  <button
                    onClick={resetToBaseline}
                    className="hover:text-[#CC0000] transition-colors"
                  >
                    Reset to Baseline
                  </button>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div className="col-span-12 md:col-span-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                About
              </h4>
              <p className="font-body text-sm text-neutral-400 leading-relaxed mb-4">
                This tool uses the Serviceability API V7 to calculate loan serviceability.
                All calculations include a rate buffer for stress testing.
              </p>
              <div className="font-mono text-xs text-neutral-500">
                Edition: Vol 2.0 | API: V7
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-8 border-t border-neutral-700 flex items-center justify-between">
            <div className="font-mono text-xs text-neutral-500">
              &copy; 2026 Serviceability Workshop. All rights reserved.
            </div>
            <div className="text-center font-serif text-lg text-neutral-600 tracking-[0.5em]">
              ✧ ✧ ✧
            </div>
            <div className="font-mono text-xs text-neutral-500">
              Designed with the Newsprint aesthetic
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
