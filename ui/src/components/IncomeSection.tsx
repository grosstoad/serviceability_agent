import { useState, useCallback } from 'react';
import type { Applicant, Employment, RentalIncome, Frequency, RentalOwnership } from '../types';
import {
  formatCurrency,
  formatFrequency,
  formatJobType,
  formatOtherIncomeType,
  toAnnual,
} from '../data/mockData';
import { AmountFrequencyEditor } from './AmountFrequencyEditor';

interface IncomeSectionProps {
  applicants: Applicant[];
  onUpdateEmployment: (applicantId: string, employmentId: string, updates: Partial<Employment>) => void;
  onAddRentalIncome: (applicantId: string, rental: Omit<RentalIncome, 'incomeId'>) => void;
  onUpdateRentalIncome: (applicantId: string, incomeId: string, updates: Partial<RentalIncome>) => void;
  onRemoveRentalIncome: (applicantId: string, incomeId: string) => void;
}

interface OwnershipFormEntry {
  partyId: string;
  selected: boolean;
  proportion: number;
}

interface RentalFormData {
  propertyAddress: string;
  propertyPostcode: string;
  proportionalAmount: string;
  proportionalAmountFrequency: Frequency;
  ownerships: OwnershipFormEntry[];
}

const createDefaultRentalForm = (applicants: Applicant[], primaryApplicantId: string): RentalFormData => ({
  propertyAddress: '',
  propertyPostcode: '',
  proportionalAmount: '',
  proportionalAmountFrequency: 'MONTHLY',
  ownerships: applicants.map(app => ({
    partyId: app.partyId,
    selected: app.partyId === primaryApplicantId,
    proportion: app.partyId === primaryApplicantId ? 100 : 0,
  })),
});

// Type for income field editing state
interface IncomeEditState {
  fieldKey: string;
  tempAmount: string;
  tempFrequency: Frequency;
}

export function IncomeSection({
  applicants,
  onUpdateEmployment,
  onAddRentalIncome,
  onUpdateRentalIncome,
  onRemoveRentalIncome,
}: IncomeSectionProps) {
  const [editingField, setEditingField] = useState<IncomeEditState | null>(null);
  const [showAddRentalForm, setShowAddRentalForm] = useState<string | null>(null); // applicantId or null
  const [rentalForm, setRentalForm] = useState<RentalFormData>(() =>
    createDefaultRentalForm(applicants, applicants[0]?.partyId ?? '')
  );
  const [editingRental, setEditingRental] = useState<string | null>(null); // rental incomeId being edited

  // Handle editing employment income fields with amount + frequency
  const handleEditEmploymentField = useCallback((
    fieldKey: string,
    currentAmount: number,
    currentFrequency: Frequency
  ) => {
    setEditingField({
      fieldKey,
      tempAmount: currentAmount.toString(),
      tempFrequency: currentFrequency,
    });
  }, []);

  const handleSaveEmploymentField = useCallback((
    applicantId: string,
    employmentId: string,
    amountField: keyof Employment,
    frequencyField: keyof Employment
  ) => {
    if (!editingField) return;

    const numValue = parseFloat(editingField.tempAmount);
    if (!isNaN(numValue)) {
      onUpdateEmployment(applicantId, employmentId, {
        [amountField]: numValue,
        [frequencyField]: editingField.tempFrequency,
      });
    }
    setEditingField(null);
  }, [editingField, onUpdateEmployment]);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
  }, []);

  // Rental form handlers
  const handleAddRentalClick = (applicantId: string) => {
    setShowAddRentalForm(applicantId);
    setRentalForm(createDefaultRentalForm(applicants, applicantId));
    setEditingRental(null);
  };

  const handleEditRentalClick = (applicantId: string, rental: RentalIncome) => {
    setShowAddRentalForm(applicantId);
    setEditingRental(rental.incomeId);
    setRentalForm({
      propertyAddress: rental.propertyAddress || '',
      propertyPostcode: rental.propertyPostcode || '',
      proportionalAmount: rental.proportionalAmount.toString(),
      proportionalAmountFrequency: rental.proportionalAmountFrequency,
      ownerships: applicants.map(app => {
        const existingOwnership = rental.ownerships?.find(o => o.partyId === app.partyId);
        if (existingOwnership) {
          return {
            partyId: app.partyId,
            selected: true,
            proportion: existingOwnership.proportion * 100,
          };
        }
        // If no ownerships defined, default to the applicant who holds the rental
        if (!rental.ownerships && app.partyId === applicantId) {
          return { partyId: app.partyId, selected: true, proportion: 100 };
        }
        return { partyId: app.partyId, selected: false, proportion: 0 };
      }),
    });
  };

  const handleOwnershipToggle = (partyId: string) => {
    const selectedCount = rentalForm.ownerships.filter(o => o.selected).length;
    const currentOwnership = rentalForm.ownerships.find(o => o.partyId === partyId);
    const isCurrentlySelected = currentOwnership?.selected;

    // Don't allow deselecting if it's the only one selected
    if (isCurrentlySelected && selectedCount <= 1) return;

    setRentalForm(prev => {
      const newOwnerships = prev.ownerships.map(o => {
        if (o.partyId === partyId) {
          return { ...o, selected: !o.selected, proportion: !o.selected ? 50 : 0 };
        }
        return o;
      });

      // Rebalance proportions among selected
      const selectedOwnerships = newOwnerships.filter(o => o.selected);
      const equalShare = 100 / selectedOwnerships.length;
      return {
        ...prev,
        ownerships: newOwnerships.map(o =>
          o.selected ? { ...o, proportion: equalShare } : o
        ),
      };
    });
  };

  const handleOwnershipProportionChange = (partyId: string, proportion: number) => {
    setRentalForm(prev => ({
      ...prev,
      ownerships: prev.ownerships.map(o =>
        o.partyId === partyId ? { ...o, proportion: Math.min(100, Math.max(0, proportion)) } : o
      ),
    }));
  };

  const handleRentalFormSubmit = (applicantId: string) => {
    const amount = parseFloat(rentalForm.proportionalAmount);
    if (isNaN(amount) || amount <= 0) {
      return; // Invalid amount
    }

    // Build ownerships array from form data
    const ownerships: RentalOwnership[] = rentalForm.ownerships
      .filter(o => o.selected && o.proportion > 0)
      .map(o => ({
        partyId: o.partyId,
        proportion: o.proportion / 100, // Convert percentage to decimal
      }));

    if (editingRental) {
      // Update existing rental
      onUpdateRentalIncome(applicantId, editingRental, {
        propertyAddress: rentalForm.propertyAddress || undefined,
        propertyPostcode: rentalForm.propertyPostcode || undefined,
        proportionalAmount: amount,
        proportionalAmountFrequency: rentalForm.proportionalAmountFrequency,
        ownerships: ownerships.length > 0 ? ownerships : undefined,
      });
    } else {
      // Add new rental
      onAddRentalIncome(applicantId, {
        propertyAddress: rentalForm.propertyAddress || undefined,
        propertyPostcode: rentalForm.propertyPostcode || undefined,
        proportionalAmount: amount,
        proportionalAmountFrequency: rentalForm.proportionalAmountFrequency,
        ownerships: ownerships.length > 0 ? ownerships : undefined,
      });
    }

    setShowAddRentalForm(null);
    setRentalForm(createDefaultRentalForm(applicants, applicants[0]?.partyId ?? ''));
    setEditingRental(null);
  };

  const handleCancelRentalForm = () => {
    setShowAddRentalForm(null);
    setRentalForm(createDefaultRentalForm(applicants, applicants[0]?.partyId ?? ''));
    setEditingRental(null);
  };

  // Calculate total income across all applicants
  const totalAnnualIncome = applicants.reduce((total, app) => {
    const empIncome = app.incomes.employments.reduce((sum, emp) => {
      let empTotal = toAnnual(emp.salary, emp.salaryFrequency);
      if (emp.bonus) empTotal += toAnnual(emp.bonus, emp.bonusFrequency || 'YEARLY');
      if (emp.commission) empTotal += toAnnual(emp.commission, emp.commissionFrequency || 'YEARLY');
      if (emp.regularOvertimeAndShiftAllowance) {
        empTotal += toAnnual(emp.regularOvertimeAndShiftAllowance, emp.regularOvertimeAndShiftAllowanceFrequency || 'YEARLY');
      }
      return sum + empTotal;
    }, 0);

    const rentalIncome = app.incomes.rentals.reduce(
      (sum, r) => sum + toAnnual(r.proportionalAmount, r.proportionalAmountFrequency),
      0
    );

    const otherIncome = app.incomes.others.reduce(
      (sum, o) => sum + toAnnual(o.proportionalAmount, o.proportionalAmountFrequency),
      0
    );

    return total + empIncome + rentalIncome + otherIncome;
  }, 0);

  return (
    <section className="border border-[#111111] bg-[#F9F9F7]">
      {/* Section header */}
      <div className="border-b border-[#111111] px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Employment & Income</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mt-1">
            Fig. 2.0 — Income Sources
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Total Annual Income
          </div>
          <div className="font-mono text-2xl font-bold text-[#166534]">
            {formatCurrency(totalAnnualIncome)}
          </div>
        </div>
      </div>

      {/* Applicants income breakdown */}
      <div className="divide-y divide-[#111111]">
        {applicants.map((applicant, appIdx) => (
          <div key={applicant.partyId} className="p-6">
            {/* Applicant header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 border border-[#111111] flex items-center justify-center font-serif text-xl font-bold">
                {appIdx + 1}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">{applicant.name}</h3>
                <div className="font-mono text-xs uppercase tracking-widest text-[#CC0000]">
                  {applicant.applicantType === 'PRIMARY_APPLICANT' ? 'Primary Applicant' : 'Secondary Applicant'}
                </div>
              </div>
            </div>

            {/* Employment income */}
            {applicant.incomes.employments.length > 0 && (
              <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300">
                  Employment Income
                </h4>
                <div className="space-y-4">
                  {applicant.incomes.employments.map((emp) => (
                    <div key={emp.id} className="border border-[#111111]">
                      {/* Employment header */}
                      <div className="px-4 py-3 bg-neutral-100 border-b border-[#111111] flex items-center justify-between">
                        <div>
                          <div className="font-sans text-sm font-medium">{emp.employer}</div>
                          <div className="font-mono text-xs text-neutral-500">{formatJobType(emp.jobType)}</div>
                        </div>
                        <div className="font-mono text-xs uppercase tracking-widest px-2 py-1 border border-[#111111]">
                          Active
                        </div>
                      </div>

                      {/* Income breakdown grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#111111]">
                        {/* Salary */}
                        <AmountFrequencyEditor
                          label="Base Salary"
                          amount={emp.salary}
                          frequency={emp.salaryFrequency}
                          isEditing={editingField?.fieldKey === `${applicant.partyId}-${emp.id}-salary`}
                          tempAmount={editingField?.tempAmount ?? ''}
                          tempFrequency={editingField?.tempFrequency ?? 'YEARLY'}
                          onEdit={() => handleEditEmploymentField(
                            `${applicant.partyId}-${emp.id}-salary`,
                            emp.salary,
                            emp.salaryFrequency
                          )}
                          onAmountChange={(value) => setEditingField(prev => prev ? { ...prev, tempAmount: value } : null)}
                          onFrequencyChange={(freq) => setEditingField(prev => prev ? { ...prev, tempFrequency: freq } : null)}
                          onSave={() => handleSaveEmploymentField(applicant.partyId, emp.id, 'salary', 'salaryFrequency')}
                          onCancel={handleCancelEdit}
                          showAnnual
                          compact
                        />

                        {/* Bonus */}
                        <AmountFrequencyEditor
                          label="Bonus"
                          amount={emp.bonus}
                          frequency={emp.bonusFrequency}
                          defaultFrequency="YEARLY"
                          isEditing={editingField?.fieldKey === `${applicant.partyId}-${emp.id}-bonus`}
                          tempAmount={editingField?.tempAmount ?? ''}
                          tempFrequency={editingField?.tempFrequency ?? 'YEARLY'}
                          onEdit={() => handleEditEmploymentField(
                            `${applicant.partyId}-${emp.id}-bonus`,
                            emp.bonus ?? 0,
                            emp.bonusFrequency ?? 'YEARLY'
                          )}
                          onAmountChange={(value) => setEditingField(prev => prev ? { ...prev, tempAmount: value } : null)}
                          onFrequencyChange={(freq) => setEditingField(prev => prev ? { ...prev, tempFrequency: freq } : null)}
                          onSave={() => handleSaveEmploymentField(applicant.partyId, emp.id, 'bonus', 'bonusFrequency')}
                          onCancel={handleCancelEdit}
                          showAnnual
                          compact
                        />

                        {/* Commission */}
                        <AmountFrequencyEditor
                          label="Commission"
                          amount={emp.commission}
                          frequency={emp.commissionFrequency}
                          defaultFrequency="YEARLY"
                          isEditing={editingField?.fieldKey === `${applicant.partyId}-${emp.id}-commission`}
                          tempAmount={editingField?.tempAmount ?? ''}
                          tempFrequency={editingField?.tempFrequency ?? 'YEARLY'}
                          onEdit={() => handleEditEmploymentField(
                            `${applicant.partyId}-${emp.id}-commission`,
                            emp.commission ?? 0,
                            emp.commissionFrequency ?? 'YEARLY'
                          )}
                          onAmountChange={(value) => setEditingField(prev => prev ? { ...prev, tempAmount: value } : null)}
                          onFrequencyChange={(freq) => setEditingField(prev => prev ? { ...prev, tempFrequency: freq } : null)}
                          onSave={() => handleSaveEmploymentField(applicant.partyId, emp.id, 'commission', 'commissionFrequency')}
                          onCancel={handleCancelEdit}
                          showAnnual
                          compact
                        />

                        {/* Overtime */}
                        <AmountFrequencyEditor
                          label="Overtime/Allowances"
                          amount={emp.regularOvertimeAndShiftAllowance}
                          frequency={emp.regularOvertimeAndShiftAllowanceFrequency}
                          defaultFrequency="YEARLY"
                          isEditing={editingField?.fieldKey === `${applicant.partyId}-${emp.id}-overtime`}
                          tempAmount={editingField?.tempAmount ?? ''}
                          tempFrequency={editingField?.tempFrequency ?? 'YEARLY'}
                          onEdit={() => handleEditEmploymentField(
                            `${applicant.partyId}-${emp.id}-overtime`,
                            emp.regularOvertimeAndShiftAllowance ?? 0,
                            emp.regularOvertimeAndShiftAllowanceFrequency ?? 'YEARLY'
                          )}
                          onAmountChange={(value) => setEditingField(prev => prev ? { ...prev, tempAmount: value } : null)}
                          onFrequencyChange={(freq) => setEditingField(prev => prev ? { ...prev, tempFrequency: freq } : null)}
                          onSave={() => handleSaveEmploymentField(applicant.partyId, emp.id, 'regularOvertimeAndShiftAllowance', 'regularOvertimeAndShiftAllowanceFrequency')}
                          onCancel={handleCancelEdit}
                          showAnnual
                          compact
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rental income */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-neutral-300">
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                  Rental Income
                </h4>
                <button
                  onClick={() => handleAddRentalClick(applicant.partyId)}
                  className="px-3 py-1 text-xs font-mono uppercase tracking-widest border border-[#111111] hover:bg-[#111111] hover:text-white transition-all"
                >
                  + Add Rental
                </button>
              </div>

              {/* Add/Edit Rental Form */}
              {showAddRentalForm === applicant.partyId && (
                <div className="border-2 border-[#111111] bg-neutral-50 p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-mono text-sm uppercase tracking-widest font-bold">
                      {editingRental ? 'Edit Rental Income' : 'Add Rental Income'}
                    </h5>
                    <button
                      onClick={handleCancelRentalForm}
                      className="text-neutral-500 hover:text-[#CC0000]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Amount - Required */}
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Rental Amount *
                      </label>
                      <input
                        type="number"
                        value={rentalForm.proportionalAmount}
                        onChange={(e) => setRentalForm({ ...rentalForm, proportionalAmount: e.target.value })}
                        placeholder="e.g. 2800"
                        className="w-full px-3 py-2 border-b-2 border-[#111111] bg-white"
                      />
                    </div>

                    {/* Frequency - Required */}
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Frequency *
                      </label>
                      <select
                        value={rentalForm.proportionalAmountFrequency}
                        onChange={(e) => setRentalForm({ ...rentalForm, proportionalAmountFrequency: e.target.value as Frequency })}
                        className="w-full px-3 py-2 border-b-2 border-[#111111] bg-white"
                      >
                        <option value="WEEKLY">Weekly</option>
                        <option value="FORTNIGHTLY">Fortnightly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>

                    {/* Postcode - Optional but recommended */}
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Property Postcode
                      </label>
                      <input
                        type="text"
                        value={rentalForm.propertyPostcode}
                        onChange={(e) => setRentalForm({ ...rentalForm, propertyPostcode: e.target.value })}
                        placeholder="e.g. 2150"
                        maxLength={4}
                        pattern="[0-9]{4}"
                        className="w-full px-3 py-2 border-b-2 border-[#111111] bg-white"
                      />
                      <p className="font-mono text-xs text-neutral-400 mt-1">Used for tier calculation</p>
                    </div>

                    {/* Address - Optional */}
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Property Address
                      </label>
                      <input
                        type="text"
                        value={rentalForm.propertyAddress}
                        onChange={(e) => setRentalForm({ ...rentalForm, propertyAddress: e.target.value })}
                        placeholder="e.g. 42 Investment Ave, Parramatta"
                        className="w-full px-3 py-2 border-b-2 border-[#111111] bg-white"
                      />
                      <p className="font-mono text-xs text-neutral-400 mt-1">For reference only</p>
                    </div>
                  </div>

                  {/* Ownership selection - for shared rental income */}
                  {applicants.length > 1 && (
                    <div className="mb-4">
                      <label className="block font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Ownership Split
                      </label>
                      <div className="border border-[#111111] bg-white">
                        {rentalForm.ownerships.map((ownership) => {
                          const app = applicants.find(a => a.partyId === ownership.partyId);
                          if (!app) return null;
                          return (
                            <div
                              key={ownership.partyId}
                              className="flex items-center gap-4 p-3 border-b border-neutral-200 last:border-b-0"
                            >
                              <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={ownership.selected}
                                  onChange={() => handleOwnershipToggle(ownership.partyId)}
                                  className="w-4 h-4 border-2 border-[#111111] rounded-none"
                                />
                                <span className="font-sans text-sm">{app.name}</span>
                                <span className="font-mono text-xs text-neutral-500">
                                  ({app.applicantType === 'PRIMARY_APPLICANT' ? 'Primary' : 'Secondary'})
                                </span>
                              </label>
                              {ownership.selected && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={ownership.proportion}
                                    onChange={(e) => handleOwnershipProportionChange(ownership.partyId, parseFloat(e.target.value) || 0)}
                                    min={0}
                                    max={100}
                                    className="w-16 px-2 py-1 text-right font-mono text-sm border-b-2 border-[#111111]"
                                  />
                                  <span className="font-mono text-sm">%</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="font-mono text-xs text-neutral-400 mt-1">
                        Rental income can be shared between applicants
                      </p>
                    </div>
                  )}

                  {/* Annual preview */}
                  {rentalForm.proportionalAmount && !isNaN(parseFloat(rentalForm.proportionalAmount)) && (
                    <div className="bg-white border border-[#111111] p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                          Annual Rental Income
                        </span>
                        <span className="font-mono text-lg font-bold text-[#166534]">
                          {formatCurrency(toAnnual(parseFloat(rentalForm.proportionalAmount), rentalForm.proportionalAmountFrequency))}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-neutral-500 mt-1">
                        Note: Rental income is typically shaded to 80% for serviceability
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRentalFormSubmit(applicant.partyId)}
                      disabled={!rentalForm.proportionalAmount || parseFloat(rentalForm.proportionalAmount) <= 0}
                      className="flex-1 bg-[#111111] text-white px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all"
                    >
                      {editingRental ? 'Update Rental' : 'Add Rental'}
                    </button>
                    <button
                      onClick={handleCancelRentalForm}
                      className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-[#111111] hover:bg-neutral-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Existing rentals list */}
              {applicant.incomes.rentals.length > 0 ? (
                <div className="space-y-3">
                  {applicant.incomes.rentals.map((rental) => {
                    // Get ownership info for display
                    const hasSharedOwnership = rental.ownerships && rental.ownerships.length > 1;
                    const ownershipDisplay = rental.ownerships?.map(o => {
                      const owner = applicants.find(a => a.partyId === o.partyId);
                      return owner ? `${owner.name.split(' ')[0]} ${Math.round(o.proportion * 100)}%` : '';
                    }).filter(Boolean).join(', ');

                    return (
                      <div key={rental.incomeId} className="border border-[#111111] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-body text-base">{rental.propertyAddress || 'Investment Property'}</div>
                            <div className="font-mono text-xs text-neutral-500 mt-1">
                              Postcode {rental.propertyPostcode || '—'}
                            </div>
                            {hasSharedOwnership && (
                              <div className="mt-2">
                                <span className="font-mono text-xs px-2 py-0.5 bg-purple-50 border border-purple-300 text-purple-700">
                                  Shared: {ownershipDisplay}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-mono text-xl font-bold">
                                {formatCurrency(rental.proportionalAmount)}
                                <span className="text-xs text-neutral-500 ml-1">
                                  {formatFrequency(rental.proportionalAmountFrequency)}
                                </span>
                              </div>
                              <div className="font-mono text-xs text-neutral-500">
                                {formatCurrency(toAnnual(rental.proportionalAmount, rental.proportionalAmountFrequency))} p.a.
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleEditRentalClick(applicant.partyId, rental)}
                                className="px-2 py-1 text-xs font-mono uppercase border border-[#111111] hover:bg-[#111111] hover:text-white transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => onRemoveRentalIncome(applicant.partyId, rental.incomeId)}
                                className="px-2 py-1 text-xs font-mono uppercase border border-[#CC0000] text-[#CC0000] hover:bg-[#CC0000] hover:text-white transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                showAddRentalForm !== applicant.partyId && (
                  <div className="border border-dashed border-neutral-300 p-6 text-center">
                    <p className="font-body text-sm text-neutral-500">No rental income recorded</p>
                    <button
                      onClick={() => handleAddRentalClick(applicant.partyId)}
                      className="mt-2 px-4 py-2 text-xs font-mono uppercase tracking-widest border border-[#111111] hover:bg-[#111111] hover:text-white transition-all"
                    >
                      Add Investment Property
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Other income */}
            {applicant.incomes.others.length > 0 && (
              <div>
                <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-3 pb-2 border-b border-dashed border-neutral-300">
                  Other Income
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {applicant.incomes.others.map((other) => (
                    <div key={other.id} className="border border-[#111111] p-4 flex items-center justify-between">
                      <div>
                        <div className="font-sans text-sm font-medium">
                          {formatOtherIncomeType(other.type)}
                        </div>
                        {other.description && (
                          <div className="font-mono text-xs text-neutral-500 mt-1">{other.description}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">
                          {formatCurrency(other.proportionalAmount)}
                          <span className="text-xs text-neutral-500 ml-1">
                            {formatFrequency(other.proportionalAmountFrequency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
