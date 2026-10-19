import React, { useState } from 'react';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { LeadItem, StageType } from '../types';

const leadFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional(),
  stage: z.string().default('New'),
  score: z.number().min(0).max(100).default(50),
  source: z.string().default('Website'),
  temperature: z.string().default('Warm'),
  intent: z.string().default('Buy'),
  budgetMin: z.number().optional().nullable(),
  budgetMax: z.number().optional().nullable(),
  preferredLocation: z.string().optional(),
  bedrooms: z.string().optional(),
  notes: z.string().optional(),
});

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Partial<LeadItem>) => Promise<void>;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState<StageType>('New');
  const [score, setScore] = useState(50);
  const [source, setSource] = useState('Website');
  const [temperature] = useState('Warm');
  const [intent, setIntent] = useState('Buy');
  const [budgetMin, setBudgetMin] = useState<number>(500000);
  const [budgetMax, setBudgetMax] = useState<number>(700000);
  const [preferredLocation, setPreferredLocation] = useState('Brickell');
  const [bedrooms, setBedrooms] = useState('2 bed');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const result = leadFormSchema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      stage,
      score: Number(score),
      source,
      temperature,
      intent,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      preferredLocation,
      bedrooms,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errMap[issue.path[0] as string] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddLead({
        firstName,
        lastName,
        email,
        phone,
        stage,
        score: Number(score),
        source,
        temperature,
        intent,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        preferredLocation,
        bedrooms,
        lookingFor: `${intent} · $${Math.round(budgetMin / 1000)}k to $${Math.round(
          budgetMax / 1000
        )}k · ${preferredLocation} · ${bedrooms}`,
      });

      // Reset
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 select-none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h2 className="text-base font-bold text-neutral-900 leading-tight">Create Real Estate Lead</h2>
            <span className="text-[11px] text-neutral-400">Add a client into Keystone CRM database</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">First Name *</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Sofia"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              {formErrors.firstName && (
                <span className="text-[10px] text-rose-500 mt-0.5 block">{formErrors.firstName}</span>
              )}
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Last Name *</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Alvarez"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              {formErrors.lastName && (
                <span className="text-[10px] text-rose-500 mt-0.5 block">{formErrors.lastName}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Email Address *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sofia.alvarez@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              {formErrors.email && (
                <span className="text-[10px] text-rose-500 mt-0.5 block">{formErrors.email}</span>
              )}
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 305 555 0192"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as StageType)}
                className="w-full px-2.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              >
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Qualified">Qualified</option>
                <option value="Under contract">Under contract</option>
                <option value="Agreement">Agreement</option>
                <option value="Contacted">Contacted</option>
                <option value="Nurture">Nurture</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              >
                <option value="Zillow">Zillow</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Sphere">Sphere</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="Realtor.com">Realtor.com</option>
                <option value="Open house">Open house</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Score (0-100)</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Intent</label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              >
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
                <option value="Rent">Rent</option>
                <option value="Invest">Invest</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Min Budget ($)</label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Max Budget ($)</label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Preferred Location</label>
              <input
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="Brickell, Coconut Grove..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Bedrooms / Layout</label>
              <input
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="2+ bed, 3 bed, Loft..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-medium shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
