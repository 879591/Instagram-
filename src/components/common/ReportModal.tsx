/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Flag, AlertTriangle, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportCategory } from '../../types';

const REPORT_REASONS: { category: ReportCategory; label: string; description: string }[] = [
  {
    category: 'spam',
    label: 'Spam or Scam',
    description: 'Deceptive, repetitive, or commercial automated content',
  },
  {
    category: 'hate_speech',
    label: 'Hate Speech or Symbols',
    description: 'Direct attack against protected characteristics or discrimination',
  },
  {
    category: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeted abusive behavior, threats, or intimidation',
  },
  {
    category: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Explicit violence, nudity, or dangerous activities',
  },
  {
    category: 'copyright',
    label: 'Intellectual Property Violation',
    description: 'Infringes copyright, trademark, or creator ownership',
  },
  {
    category: 'impersonation',
    label: 'Pretending to Be Someone',
    description: 'Impersonating another person or brand without parody notice',
  },
];

export const ReportModal: React.FC = () => {
  const { reportModalTarget, closeReportModal, submitReport } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('spam');
  const [reasonDetails, setReasonDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!reportModalTarget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport({
      targetType: reportModalTarget.targetType,
      targetId: reportModalTarget.targetId,
      category: selectedCategory,
      reason: reasonDetails.trim() || `Reported for ${selectedCategory.replace('_', ' ')}`,
      previewInfo: reportModalTarget.title,
    });
    setIsSubmitted(true);
    setTimeout(() => {
      closeReportModal();
    }, 1400);
  };

  return (
    <div
      id="report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={closeReportModal}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-sm text-zinc-100">
              Report {reportModalTarget.targetType}
            </h3>
          </div>
          <button
            onClick={closeReportModal}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-white">Thank you for reporting</h4>
            <p className="text-xs text-zinc-400">
              Our safety and trust team has queued this item for administrative review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-300">
                Why are you reporting this {reportModalTarget.targetType}?
              </span>
              <p className="text-[11px] text-zinc-500">
                Your report is anonymous, except when reporting an intellectual property infringement.
              </p>
            </div>

            {/* Reasons List */}
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.category}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                    selectedCategory === r.category
                      ? 'border-rose-500 bg-rose-500/10'
                      : 'border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportCategory"
                    value={r.category}
                    checked={selectedCategory === r.category}
                    onChange={() => setSelectedCategory(r.category)}
                    className="mt-0.5 accent-rose-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">
                      {r.label}
                    </span>
                    <span className="text-[10px] text-zinc-400">{r.description}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Additional details */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">
                Additional context (Optional)
              </label>
              <textarea
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="Provide any additional details to help our moderation team..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
              <button
                type="button"
                onClick={closeReportModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
