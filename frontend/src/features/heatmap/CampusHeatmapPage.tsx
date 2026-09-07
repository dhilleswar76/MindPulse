import React, { useState, useEffect } from 'react';
import { Map, Shield, Building, Info, AlertTriangle } from 'lucide-react';
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
            { zoneId: 'zone_court', name: 'Special Courts & Witness Cell Cluster', aggregateStress: 7.2, sampleSize: 28, alertLevel: 'ELEVATED' },
            { zoneId: 'zone_dist_central', name: 'District Central Rehabilitation Hub', aggregateStress: 6.1, sampleSize: 42, alertLevel: 'ELEVATED' },
            { zoneId: 'zone_sub_north', name: 'North Sub-Division Legal Aid Clinic', aggregateStress: 5.4, sampleSize: 19, alertLevel: 'WATCH' },
            { zoneId: 'zone_rural_east', name: 'Eastern Block Community Outreach', aggregateStress: 4.8, sampleSize: 34, alertLevel: 'STABLE' },
            { zoneId: 'zone_south_shelter', name: 'Southern Shelter & Protection Safehouse', aggregateStress: 4.2, sampleSize: 15, alertLevel: 'STABLE' },
            { zoneId: 'zone_welfare_hq', name: 'District Welfare Office (Direct Walk-in)', aggregateStress: 3.8, sampleSize: 52, alertLevel: 'STABLE' },
          ],
        };
        setHeatmapData(fallback);
        setSelectedZone(fallback.zones[0]);
      }
    };
    fetchHeatmap();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Map className="w-7 h-7 text-teal-400" />
          District & Regional Distress Heatmap
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Privacy-preserving aggregate distress and case support intensity across district welfare zones.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-teal-300 block mb-0.5">Privacy-Preserving Jurisdictional Aggregation (k ≥ 5)</strong>
          All telemetry is anonymized and aggregated at the district/block level. No individual case coordinates or victim identities are ever exposed on spatial maps.
        </div>
      </div>

      {heatmapData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Visual Zone Grid */}
          <div className="lg:col-span-8 glass-card p-6 border border-slate-800">
            <h2 className="text-base font-bold text-slate-100 mb-4">Select District / Division Zone</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {heatmapData.zones.map((zone: any) => (
                <div
                  key={zone.zoneId}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    selectedZone?.zoneId === zone.zoneId
                      ? 'bg-slate-800 border-teal-500 shadow-glow-teal ring-1 ring-teal-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      {zone.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                        zone.alertLevel === 'ELEVATED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : zone.alertLevel === 'WATCH'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {zone.alertLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                    <span>Aggregate Distress: <strong className="text-white">{zone.aggregateStress}/10</strong></span>
                    <span>Anonymized Cohort (k ≥ 5): <strong className="text-slate-300">{zone.sampleSize}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Detail Panel */}
          {selectedZone && (
            <div className="lg:col-span-4 glass-card p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">{selectedZone.name}</h3>
                <span className="text-xs text-teal-400 block mb-4">Jurisdictional Telemetry Breakdown</span>

                <div className="space-y-4 my-6">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Perceived Distress Index</span>
                    <div className="text-3xl font-extrabold text-amber-400">{selectedZone.aggregateStress} <span className="text-sm text-slate-500">/ 10</span></div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Active Cases Monitored</span>
                    <div className="text-2xl font-bold text-white">{selectedZone.sampleSize} individuals</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
                <strong className="text-slate-200 block mb-1">Recommended Institutional Action:</strong>
                {selectedZone.alertLevel === 'ELEVATED'
                  ? 'Deploy mobile legal aid counselors and expedite trauma-informed psycho-social relief camps in this zone.'
                  : 'Maintain scheduled DLSA outreach and routine counselor check-in coverage.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
