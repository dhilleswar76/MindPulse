import React from 'react';
import { Filter, Calendar, AlertCircle, GitMerge, CheckCircle2, MapPin, RotateCcw } from 'lucide-react';

export interface AdminFilters {
  dateRange: string;
  riskLevel: string;
  stage: string;
  victimType: string;
  status: string;
  district: string;
}

interface AdminFilterBarProps {
  filters: AdminFilters;
  onFilterChange: (filters: AdminFilters) => void;
  onReset: () => void;
}

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (key: keyof AdminFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="glass-card p-4 border border-slate-800 rounded-2xl space-y-3 bg-slate-900/90 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Filter className="w-4 h-4 text-teal-400" />
          <span>Administrative Telemetry Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 transition-all hover:bg-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Filter 1: Date Range */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-teal-400" />
            Date Horizon
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Past 1 Year</option>
            <option value="all">All Historical</option>
          </select>
        </div>

        {/* Filter 2: Risk Level */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            Risk Level Triage
          </label>
          <select
            value={filters.riskLevel}
            onChange={(e) => handleChange('riskLevel', e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="REQUIRES_REVIEW">High (Requires Review)</option>
            <option value="ELEVATED">Medium (Elevated)</option>
            <option value="WATCH">Low (Watch)</option>
            <option value="STABLE">Stable Baseline</option>
          </select>
        </div>

        {/* Filter 3: Case Stage */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <GitMerge className="w-3 h-3 text-indigo-400" />
            Case Stage Milestone
          </label>
          <select
            value={filters.stage}
            onChange={(e) => handleChange('stage', e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All 6 Stages</option>
            <option value="CASE_REGISTRATION">1. Case Registration</option>
            <option value="INVESTIGATION">2. Investigation</option>
            <option value="COURT_TRIAL">3. Court / Trial</option>
            <option value="COMPENSATION">4. Compensation & Relief</option>
            <option value="REHABILITATION">5. Rehabilitation</option>
            <option value="PROTECTION_SUPPORT">6. Protection & Support</option>
          </select>
        </div>

        {/* Filter 4: Intervention Status */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Intervention Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active Support</option>
            <option value="COMPLETED">Completed</option>
            <option value="FOLLOW_UP_REQUIRED">Follow-Up Pending</option>
          </select>
        </div>

        {/* Filter 5: District Jurisdiction */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            District Jurisdiction
          </label>
          <select
            value={filters.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Districts</option>
            <option value="Central District">Central District</option>
            <option value="North District">North District</option>
            <option value="South District">South District</option>
            <option value="East District">East District</option>
            <option value="West District">West District</option>
          </select>
        </div>
      </div>
    </div>
  );
};
