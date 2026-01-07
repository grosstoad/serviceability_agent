import type { CalculationResult, ApplicationState } from '../types';
import { formatCurrency } from '../data/mockData';

interface HeaderProps {
  application: ApplicationState;
  result: CalculationResult | null;
  onReset: () => void;
}

export function Header({ application, result, onReset }: HeaderProps) {
  const surplus = result?.netSurplusOrDeficit ?? 0;
  const status = surplus >= 0 ? 'APPROVED' : surplus > -2000 ? 'REFER' : 'DECLINED';

  const statusColors = {
    APPROVED: 'bg-[#166534]',
    REFER: 'bg-[#CA8A04]',
    DECLINED: 'bg-[#CC0000]',
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="border-b-4 border-[#111111] bg-[#F9F9F7]">
      {/* Top metadata bar */}
      <div className="border-b border-[#111111] px-4 py-2">
        <div className="mx-auto max-w-screen-xl flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Vol. 1 | {dateStr} | Sydney Edition
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Serviceability Workshop v2.0
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 py-8">
        <div className="mx-auto max-w-screen-xl">
          <div className="grid grid-cols-12 gap-8">
            {/* Title section */}
            <div className="col-span-12 lg:col-span-8">
              <h1 className="font-serif text-5xl lg:text-7xl font-black tracking-tighter leading-tight-headline mb-4">
                Serviceability
                <br />
                <span className="italic">Assessment</span>
              </h1>
              <p className="font-body text-lg text-neutral-600 max-w-2xl">
                Workshop loan scenarios, compare changes against baseline, and find the path to approval.
              </p>
            </div>

            {/* Status & metrics */}
            <div className="col-span-12 lg:col-span-4 border-l-0 lg:border-l border-[#111111] pl-0 lg:pl-8">
              {/* Status badge */}
              <div className="mb-6">
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                  Application Status
                </div>
                <div
                  className={`inline-block px-4 py-2 text-sm font-mono uppercase tracking-widest text-white ${statusColors[status]}`}
                >
                  {status}
                </div>
              </div>

              {/* Key metrics grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#111111] p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                    Surplus
                  </div>
                  <div
                    className={`font-mono text-2xl font-bold ${surplus >= 0 ? 'text-[#166534]' : 'text-[#CC0000]'}`}
                  >
                    {surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}
                  </div>
                  <div className="font-mono text-xs text-neutral-500 mt-1">
                    per month
                  </div>
                </div>

                <div className="border border-[#111111] p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                    DTI Ratio
                  </div>
                  <div className="font-mono text-2xl font-bold">
                    {result?.debtIncomeRatio.toFixed(1) ?? '—'}x
                  </div>
                  <div className="font-mono text-xs text-neutral-500 mt-1">
                    debt to income
                  </div>
                </div>

                <div className="border border-[#111111] p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                    Loan Amount
                  </div>
                  <div className="font-mono text-2xl font-bold">
                    {formatCurrency(application.loan.loanAmount)}
                  </div>
                  <div className="font-mono text-xs text-neutral-500 mt-1">
                    {application.loan.loanTerm} year term
                  </div>
                </div>

                <div className="border border-[#111111] p-4">
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                    Repayment
                  </div>
                  <div className="font-mono text-2xl font-bold">
                    {formatCurrency(result?.athBufferedRepayments ?? 0)}
                  </div>
                  <div className="font-mono text-xs text-neutral-500 mt-1">
                    buffered p.m.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={onReset}
                  className="flex-1 border border-[#111111] bg-transparent px-4 py-3 text-xs font-sans uppercase tracking-widest hover:bg-[#111111] hover:text-[#F9F9F7]"
                >
                  Reset
                </button>
                <button className="flex-1 bg-[#111111] text-[#F9F9F7] px-4 py-3 text-xs font-sans uppercase tracking-widest border border-transparent hover:bg-[#F9F9F7] hover:text-[#111111] hover:border-[#111111]">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applicants bar */}
      <div className="border-t border-[#111111] bg-[#111111] text-[#F9F9F7] px-4 py-3">
        <div className="mx-auto max-w-screen-xl flex items-center gap-8">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
            Applicants:
          </div>
          {application.applicants.map((app, idx) => (
            <div key={app.partyId} className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#CC0000]">
                {idx === 0 ? 'Primary' : 'Secondary'}
              </span>
              <span className="font-sans text-sm font-medium">{app.name}</span>
            </div>
          ))}
          <div className="ml-auto font-mono text-xs text-neutral-400">
            {application.households[0]?.noOfDependents ?? 0} dependents | Postcode {application.households[0]?.addressPostcode}
          </div>
        </div>
      </div>
    </header>
  );
}
