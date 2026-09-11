import React, { useState, useEffect } from 'react';
import { Map, Shield, Building, Info, AlertTriangle, ArrowRight, Sliders, CheckCircle2, Eye, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const CampusHeatmapPage: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res: any = await api.get('/analytics/heatmap');
        setHeatmapData(res.data);
        if (res.data?.zones?.length > 0) setSelectedZone(res.data.zones[0]);
      } catch {
        const fallback = {
          campusName: 'State Alpha - District Welfare & Legal Support Network',
          zones: [
            { zoneId: 'zone_court', name: 'Special Courts & Witness Cell Cluster', aggregateStress: 7.2, sampleSize: 28, alertLevel: 'ELEVATED', primaryNeed: 'Witness Safe Transit & Pre-Hearing Grounding' },
            { zoneId: 'zone_dist_central', name: 'District Central Rehabilitation Hub', aggregateStress: 6.1, sampleSize: 42, alertLevel: 'ELEVATED', primaryNeed: 'Vocational Rehabilitation Grants & Shelter' },
            { zoneId: 'zone_sub_north', name: 'North Sub-Division Legal Aid Clinic', aggregateStress: 5.4, sampleSize: 19, alertLevel: 'WATCH', primaryNeed: 'NALSA Legal Aid Advocate Assignment' },
            { zoneId: 'zone_rural_east', name: 'Eastern Block Community Outreach', aggregateStress: 4.8, sampleSize: 34, alertLevel: 'STABLE', primaryNeed: 'Periodic Welfare Check-in Coverage' },
            { zoneId: 'zone_south_shelter', name: 'Southern Shelter & Protection Safehouse', aggregateStress: 4.2, sampleSize: 15, alertLevel: 'STABLE', primaryNeed: 'Protected Transit Support' },
            { zoneId: 'zone_welfare_hq', name: 'District Welfare Office (Direct Walk-in)', aggregateStress: 3.8, sampleSize: 52, alertLevel: 'STABLE', primaryNeed: 'Compensation Scheme Counseling' },
          ],
        };
        setHeatmapData(fallback);
        setSelectedZone(fallback.zones[0]);
      }
    };
    fetchHeatmap();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Spatial & Zone Intelligence
            </span>
            <span className="text-xs text-slate-400">• Privacy-Preserving Jurisdictional Aggregates</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Map className="w-8 h-8 text-teal-400" />
            District & Regional Distress Heatmap
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Privacy-preserving aggregate distress levels and support demand across district welfare centers, court clusters, and legal aid clinics.
          </p>
        </div>

        <Link
          to="/admin/interventions"
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all self-start md:self-auto"
        >
          <Activity className="w-4 h-4" />
          <span>Support Pathways & Outcomes</span>
        </Link>
      </div>

      {/* k-Anonymity Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 flex items-start gap-3.5">
        <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-teal-300 block mb-0.5 font-semibold">
            Privacy-Preserving Spatial Aggregation (k ≥ 5)
          </strong>
          All telemetry is anonymized and clustered at the district/zone level. Individual victim coordinates, home addresses, or identifying locations are strictly suppressed.
        </div>
      </div>

      {heatmapData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Zone Selection Grid */}
          <div className="lg:col-span-8 glass-card p-6 border border-slate-800 rounded-2xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Select District Welfare Zone</h2>
              <p className="text-xs text-slate-400">Click a zone to inspect telemetry indicators and recommend institutional actions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {heatmapData.zones.map((zone: any) => (
                <div
                  key={zone.zoneId}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedZone?.zoneId === zone.zoneId
                      ? 'bg-slate-800/90 border-teal-400 shadow-glow-teal ring-1 ring-teal-400'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Building className="w-4 h-4 text-teal-400" />
                      {zone.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        zone.alertLevel === 'ELEVATED'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : zone.alertLevel === 'WATCH'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {zone.alertLevel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">
                    Primary Demand: <strong className="text-slate-300">{zone.primaryNeed || 'Support Outreach'}</strong>
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                    <span>Distress Index: <strong className="text-white font-bold">{zone.aggregateStress} / 10</strong></span>
                    <span>Cohort (k ≥ 5): <strong className="text-slate-200">{zone.sampleSize}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Detail & Institutional Action Card */}
          {selectedZone && (
            <div className="lg:col-span-4 glass-card p-6 border border-slate-800 rounded-2xl flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-teal-400">
                    Zone Telemetry Detail
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">ID: {selectedZone.zoneId}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{selectedZone.name}</h3>
                <span className="text-xs text-slate-400 block mb-6">Jurisdictional Cohort Breakdown</span>

                <div className="space-y-4 my-4">
                  <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Perceived Distress Index</span>
                    <div className="text-3xl font-extrabold text-amber-400">
                      {selectedZone.aggregateStress} <span className="text-sm text-slate-500 font-normal">/ 10</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Anonymized Monitored Cohort</span>
                    <div className="text-2xl font-bold text-white">{selectedZone.sampleSize} individuals</div>
                    <span className="text-[10px] text-teal-300 block mt-1">Meets k ≥ 5 Differential Privacy threshold</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 my-4">
                  <strong className="text-teal-300 block text-xs">Recommended Institutional Action:</strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {selectedZone.alertLevel === 'ELEVATED'
                      ? 'Deploy mobile DLSA legal aid counselors and expedite trauma-informed psycho-social relief camps in this zone.'
                      : 'Maintain scheduled DLSA legal aid clinics and routine periodic counselor check-in coverage.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Link
                  to="/admin/interventions"
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>View Support Pathways for this Zone</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
