import { useState } from 'react';
import type { Applicant, MaritalStatus } from '../types';

interface ApplicantSectionProps {
  applicants: Applicant[];
  onUpdateApplicant: (applicantId: string, updates: Partial<Applicant>) => void;
}

const maritalStatusOptions: { value: MaritalStatus; label: string }[] = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DEFACTO', label: 'De Facto' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'SEPARATED', label: 'Separated' },
];

export function ApplicantSection({ applicants, onUpdateApplicant }: ApplicantSectionProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEdit = (field: string, currentValue: string | number | undefined) => {
    setEditingField(field);
    setTempValue(currentValue?.toString() ?? '');
  };

  const handleSave = (applicantId: string, field: keyof Applicant, isNumber = false) => {
    if (isNumber) {
      const numValue = parseInt(tempValue, 10);
      if (!isNaN(numValue)) {
        onUpdateApplicant(applicantId, { [field]: numValue });
      }
    } else {
      onUpdateApplicant(applicantId, { [field]: tempValue });
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, applicantId: string, field: keyof Applicant, isNumber = false) => {
    if (e.key === 'Enter') {
      handleSave(applicantId, field, isNumber);
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setTempValue('');
    }
  };

  const formatApplicantType = (type: string) => {
    switch (type) {
      case 'PRIMARY_APPLICANT': return 'Primary';
      case 'SECONDARY_APPLICANT': return 'Secondary';
      case 'NON_BORROWER': return 'Non-borrower';
      default: return type;
    }
  };

  return (
    <section className="border border-[#111111] bg-[#F9F9F7]">
      {/* Section header */}
      <div className="border-b border-[#111111] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Applicants</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mt-1">
            Fig. 5.0 — Applicant Details
          </p>
        </div>
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          Click values to edit
        </div>
      </div>

      {/* Applicants */}
      <div className="p-6 space-y-6">
        {applicants.map((applicant, idx) => (
          <div key={applicant.partyId} className="border border-[#111111] p-6">
            {/* Applicant Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-neutral-300">
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 flex items-center justify-center font-mono text-lg font-bold border-2
                  ${idx === 0 ? 'bg-[#111111] text-[#F9F9F7] border-[#111111]' : 'bg-neutral-100 text-neutral-600 border-neutral-300'}
                `}>
                  {idx + 1}
                </div>
                <div>
                  {editingField === `${applicant.partyId}-name` ? (
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      onBlur={() => handleSave(applicant.partyId, 'name')}
                      onKeyDown={(e) => handleKeyDown(e, applicant.partyId, 'name')}
                      className="font-serif text-xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-2 py-1 w-64"
                      autoFocus
                    />
                  ) : (
                    <h3
                      className="font-serif text-xl font-bold cursor-pointer hover:bg-neutral-100 px-2 py-1 -mx-2"
                      onClick={() => handleEdit(`${applicant.partyId}-name`, applicant.name)}
                    >
                      {applicant.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`
                      font-mono text-xs px-2 py-0.5 uppercase
                      ${idx === 0 ? 'bg-[#CC0000] text-white' : 'bg-neutral-200 text-neutral-600'}
                    `}>
                      {formatApplicantType(applicant.applicantType)}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 bg-neutral-100 border border-neutral-300">
                      {applicant.entityType === 'INDIVIDUAL' ? 'Individual' : 'Company'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicant Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              {/* Marital Status */}
              <div className="border border-[#111111] p-4 -mt-px -ml-px">
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                  Marital Status
                </div>
                {editingField === `${applicant.partyId}-maritalStatus` ? (
                  <select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => handleSave(applicant.partyId, 'maritalStatus')}
                    className="w-full font-body text-base bg-[#F0F0F0] border-b-2 border-[#111111] px-0 py-1"
                    autoFocus
                  >
                    {maritalStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <div
                    className="font-body text-base cursor-pointer hover:bg-neutral-100 px-2 py-1 -mx-2"
                    onClick={() => handleEdit(`${applicant.partyId}-maritalStatus`, applicant.maritalStatus)}
                  >
                    {maritalStatusOptions.find(o => o.value === applicant.maritalStatus)?.label ?? '—'}
                  </div>
                )}
              </div>

              {/* Dependents */}
              <div
                className="border border-[#111111] p-4 -mt-px -ml-px cursor-pointer hard-shadow-hover"
                onClick={() => handleEdit(`${applicant.partyId}-noOfDependents`, applicant.noOfDependents)}
              >
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                  Dependents
                </div>
                {editingField === `${applicant.partyId}-noOfDependents` ? (
                  <input
                    type="number"
                    min={0}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => handleSave(applicant.partyId, 'noOfDependents', true)}
                    onKeyDown={(e) => handleKeyDown(e, applicant.partyId, 'noOfDependents', true)}
                    className="w-20 font-mono text-2xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                    autoFocus
                  />
                ) : (
                  <div className="font-mono text-2xl font-bold">
                    {applicant.noOfDependents ?? 0}
                  </div>
                )}
              </div>

              {/* Postcode */}
              <div
                className="border border-[#111111] p-4 -mt-px -ml-px cursor-pointer hard-shadow-hover"
                onClick={() => handleEdit(`${applicant.partyId}-addressPostcode`, applicant.addressPostcode)}
              >
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                  Postcode
                </div>
                {editingField === `${applicant.partyId}-addressPostcode` ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => handleSave(applicant.partyId, 'addressPostcode')}
                    onKeyDown={(e) => handleKeyDown(e, applicant.partyId, 'addressPostcode')}
                    className="w-20 font-mono text-2xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                    autoFocus
                  />
                ) : (
                  <div className="font-mono text-2xl font-bold">
                    {applicant.addressPostcode ?? '—'}
                  </div>
                )}
              </div>

              {/* HEM Override */}
              <div
                className="border border-[#111111] p-4 -mt-px -ml-px cursor-pointer hard-shadow-hover"
                onClick={() => handleEdit(`${applicant.partyId}-hem`, applicant.hem)}
              >
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                  HEM Override
                </div>
                {editingField === `${applicant.partyId}-hem` ? (
                  <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={() => handleSave(applicant.partyId, 'hem', true)}
                    onKeyDown={(e) => handleKeyDown(e, applicant.partyId, 'hem', true)}
                    className="w-28 font-mono text-2xl font-bold bg-[#F0F0F0] border-b-2 border-[#111111] px-0"
                    autoFocus
                  />
                ) : (
                  <div className="font-mono text-2xl font-bold">
                    {applicant.hem ? `$${applicant.hem.toLocaleString()}` : 'Auto'}
                  </div>
                )}
              </div>
            </div>

            {/* Income Summary */}
            <div className="mt-6 pt-4 border-t border-dashed border-neutral-300">
              <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
                Income Summary
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-mono text-xs text-neutral-500">Employment</div>
                  <div className="font-mono text-lg font-bold">
                    {applicant.incomes.employments.length} source{applicant.incomes.employments.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-neutral-500">Rental</div>
                  <div className="font-mono text-lg font-bold">
                    {applicant.incomes.rentals.length} propert{applicant.incomes.rentals.length !== 1 ? 'ies' : 'y'}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-neutral-500">Other Income</div>
                  <div className="font-mono text-lg font-bold">
                    {applicant.incomes.others.length} source{applicant.incomes.others.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Summary */}
            <div className="mt-4 pt-4 border-t border-dashed border-neutral-300">
              <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3">
                Expense Summary
              </h4>
              <div className="font-mono text-lg font-bold">
                {applicant.expenses.length} expense categor{applicant.expenses.length !== 1 ? 'ies' : 'y'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
