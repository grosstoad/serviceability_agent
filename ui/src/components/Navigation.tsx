interface NavigationProps {
  activeTab: 'loan' | 'income' | 'expenses' | 'liabilities';
  onTabChange: (tab: 'loan' | 'income' | 'expenses' | 'liabilities') => void;
  changeCount: number;
}

export function Navigation({ activeTab, onTabChange, changeCount }: NavigationProps) {
  const tabs = [
    { id: 'loan' as const, label: 'Loan', shortLabel: 'LN' },
    { id: 'income' as const, label: 'Income', shortLabel: 'IN' },
    { id: 'expenses' as const, label: 'Expenses', shortLabel: 'EX' },
    { id: 'liabilities' as const, label: 'Liabilities', shortLabel: 'LB' },
  ];

  return (
    <nav className="border-b border-[#111111] bg-[#F9F9F7] sticky top-0 z-40">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex items-center justify-between">
          {/* Tab navigation */}
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative px-6 py-4 font-mono text-sm uppercase tracking-widest
                  border-r border-[#111111] first:border-l
                  transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'bg-[#111111] text-[#F9F9F7]'
                      : 'bg-transparent hover:bg-neutral-100'
                  }
                `}
              >
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>

                {/* Active indicator */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#CC0000]" />
                )}
              </button>
            ))}
          </div>

          {/* Change log indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 border border-[#111111]">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                Changes
              </div>
              <div className={`
                w-8 h-8 flex items-center justify-center font-mono text-sm font-bold
                ${changeCount > 0 ? 'bg-[#CC0000] text-white' : 'bg-neutral-100 text-neutral-500'}
              `}>
                {changeCount}
              </div>
            </div>

            {/* Quick actions */}
            <div className="hidden md:flex gap-2">
              <button className="p-2 border border-[#111111] hover:bg-[#111111] hover:text-white transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </button>
              <button className="p-2 border border-[#111111] hover:bg-[#111111] hover:text-white transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
