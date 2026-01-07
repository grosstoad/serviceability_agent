import type { ChangeLogEntry, Scenario } from '../types';
import { formatCurrency } from '../data/mockData';

interface ChangeLogProps {
  changeLog: ChangeLogEntry[];
  baseline: Scenario | null;
  currentSurplus: number;
}

export function ChangeLog({ changeLog, baseline, currentSurplus }: ChangeLogProps) {
  const baselineSurplus = baseline?.result?.netSurplusOrDeficit ?? 0;
  const totalImpact = currentSurplus - baselineSurplus;

  const categoryIcons: Record<string, string> = {
    loan: 'LN',
    income: 'IN',
    expense: 'EX',
    liability: 'LB',
    applicant: 'AP',
  };

  const categoryColors: Record<string, string> = {
    loan: 'bg-blue-100 text-blue-800 border-blue-300',
    income: 'bg-green-100 text-green-800 border-green-300',
    expense: 'bg-orange-100 text-orange-800 border-orange-300',
    liability: 'bg-red-100 text-red-800 border-red-300',
    applicant: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="border border-[#111111] bg-[#F9F9F7]">
      {/* Section header */}
      <div className="border-b border-[#111111] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Change Log</h2>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mt-1">
              Modifications from baseline
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              Net Impact on Surplus
            </div>
            <div
              className={`font-mono text-2xl font-bold ${
                totalImpact >= 0 ? 'text-[#166534]' : 'text-[#CC0000]'
              }`}
            >
              {totalImpact >= 0 ? '+' : ''}
              {formatCurrency(totalImpact)}/mo
            </div>
          </div>
        </div>
      </div>

      {/* Baseline comparison banner */}
      {baseline && (
        <div className="px-6 py-4 bg-neutral-100 border-b border-[#111111]">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                Baseline Surplus
              </div>
              <div
                className={`font-mono text-xl font-bold ${
                  baselineSurplus >= 0 ? 'text-[#166534]' : 'text-[#CC0000]'
                }`}
              >
                {baselineSurplus >= 0 ? '+' : ''}
                {formatCurrency(baselineSurplus)}
              </div>
              <div className="font-mono text-xs text-neutral-500 mt-1">{baseline.name}</div>
            </div>
            <div className="text-center flex items-center justify-center">
              <div className="font-serif text-3xl text-neutral-300">→</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1">
                Current Surplus
              </div>
              <div
                className={`font-mono text-xl font-bold ${
                  currentSurplus >= 0 ? 'text-[#166534]' : 'text-[#CC0000]'
                }`}
              >
                {currentSurplus >= 0 ? '+' : ''}
                {formatCurrency(currentSurplus)}
              </div>
              <div className="font-mono text-xs text-neutral-500 mt-1">Working Scenario</div>
            </div>
          </div>
        </div>
      )}

      {/* Change log entries */}
      <div className="p-6">
        {changeLog.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-300">
            <div className="font-serif text-xl text-neutral-400 mb-2">No changes yet</div>
            <p className="font-body text-sm text-neutral-500">
              Edit any field to see changes tracked here
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Timeline header */}
            <div className="grid grid-cols-12 gap-4 pb-2 border-b-2 border-[#111111] mb-4">
              <div className="col-span-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
                Time
              </div>
              <div className="col-span-1 font-mono text-xs uppercase tracking-widest text-neutral-500">
                Type
              </div>
              <div className="col-span-5 font-mono text-xs uppercase tracking-widest text-neutral-500">
                Change
              </div>
              <div className="col-span-2 font-mono text-xs uppercase tracking-widest text-neutral-500 text-right">
                Previous
              </div>
              <div className="col-span-2 font-mono text-xs uppercase tracking-widest text-neutral-500 text-right">
                New Value
              </div>
            </div>

            {/* Entries */}
            {changeLog.map((entry, idx) => (
              <div
                key={entry.id}
                className={`grid grid-cols-12 gap-4 py-3 border-b border-neutral-200 ${
                  idx === 0 ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="col-span-2">
                  <div className="font-mono text-sm">{formatTimestamp(entry.timestamp)}</div>
                  {idx === 0 && (
                    <div className="font-mono text-xs text-[#CC0000] uppercase mt-1">Latest</div>
                  )}
                </div>

                <div className="col-span-1">
                  <div
                    className={`inline-block px-2 py-1 text-xs font-mono uppercase border ${
                      categoryColors[entry.category] || 'bg-neutral-100'
                    }`}
                  >
                    {categoryIcons[entry.category] || '??'}
                  </div>
                </div>

                <div className="col-span-5">
                  <div className="font-body text-sm">{entry.description}</div>
                  {entry.impactOnSurplus !== undefined && (
                    <div
                      className={`font-mono text-xs mt-1 ${
                        entry.impactOnSurplus >= 0 ? 'text-[#166534]' : 'text-[#CC0000]'
                      }`}
                    >
                      Impact: {entry.impactOnSurplus >= 0 ? '+' : ''}
                      {formatCurrency(entry.impactOnSurplus)}/mo
                    </div>
                  )}
                </div>

                <div className="col-span-2 text-right">
                  <div className="font-mono text-sm text-neutral-500 line-through">
                    {entry.previousValue ?? '—'}
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <div className="font-mono text-sm font-bold">{entry.newValue ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary of changes by category */}
        {changeLog.length > 0 && (
          <div className="mt-6 pt-6 border-t-4 border-[#111111]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
              Changes Summary
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {(['loan', 'income', 'expense', 'liability'] as const).map((category) => {
                const categoryChanges = changeLog.filter((c) => c.category === category);
                const categoryImpact = categoryChanges.reduce(
                  (sum, c) => sum + (c.impactOnSurplus ?? 0),
                  0
                );

                return (
                  <div key={category} className="border border-[#111111] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-6 h-6 flex items-center justify-center text-xs font-mono border ${
                          categoryColors[category]
                        }`}
                      >
                        {categoryIcons[category]}
                      </div>
                      <div className="font-mono text-xs uppercase tracking-widest">
                        {category}
                      </div>
                    </div>
                    <div className="font-mono text-2xl font-bold">{categoryChanges.length}</div>
                    <div className="font-mono text-xs text-neutral-500">
                      {categoryChanges.length === 1 ? 'change' : 'changes'}
                    </div>
                    {categoryImpact !== 0 && (
                      <div
                        className={`font-mono text-sm mt-2 ${
                          categoryImpact >= 0 ? 'text-[#166534]' : 'text-[#CC0000]'
                        }`}
                      >
                        {categoryImpact >= 0 ? '+' : ''}
                        {formatCurrency(categoryImpact)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Export / Generate summary */}
        {changeLog.length > 0 && (
          <div className="mt-6 flex gap-4">
            <button className="flex-1 border border-[#111111] bg-transparent px-4 py-3 text-xs font-sans uppercase tracking-widest hover:bg-[#111111] hover:text-[#F9F9F7]">
              Copy Changes
            </button>
            <button className="flex-1 bg-[#111111] text-[#F9F9F7] px-4 py-3 text-xs font-sans uppercase tracking-widest border border-transparent hover:bg-[#F9F9F7] hover:text-[#111111] hover:border-[#111111]">
              Generate Summary
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
