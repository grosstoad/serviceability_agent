import type { TabType } from '../store/useStore';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  changeCount: number;
}

export function Navigation({ activeTab, onTabChange, changeCount }: NavigationProps) {
  const tabs: Array<{ id: TabType; label: string; shortLabel: string }> = [
    { id: 'loan', label: 'Loan', shortLabel: 'LN' },
    { id: 'income', label: 'Income', shortLabel: 'IN' },
    { id: 'expenses', label: 'Expenses', shortLabel: 'EX' },
    { id: 'liabilities', label: 'Liabilities', shortLabel: 'LB' },
    { id: 'applicants', label: 'Applicants', shortLabel: 'AP' },
    { id: 'changes', label: 'Changes', shortLabel: 'CL' },
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

                {/* Badge for changes tab */}
                {tab.id === 'changes' && changeCount > 0 && (
                  <span className={`
                    ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold
                    ${activeTab === 'changes' ? 'bg-[#CC0000] text-white' : 'bg-[#CC0000] text-white'}
                  `}>
                    {changeCount}
                  </span>
                )}

                {/* Active indicator */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#CC0000]" />
                )}
              </button>
            ))}
          </div>

          {/* Quick actions */}
          <div className="hidden md:flex gap-2">
            <button className="p-2 border border-[#111111] hover:bg-[#111111] hover:text-white transition-all" title="Import">
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
            <button className="p-2 border border-[#111111] hover:bg-[#111111] hover:text-white transition-all" title="Export">
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
    </nav>
  );
}
