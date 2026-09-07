import React, { useState, useEffect } from 'react';
import { Sparkles, Wind, Moon, Compass, Users, PhoneCall, ExternalLink, Shield } from 'lucide-react';
import api from '../../services/api';
import { Recommendation } from '../../types';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res: any = await api.get('/recommendations');
        setRecommendations(res.data?.recommendations || []);
      } catch {
        setRecommendations([
          {
            _id: '1',
            title: '4-7-8 Parasympathetic Breathing',
            category: 'BREATHING',
            description: 'Inhale for 4s, hold for 7s, exhale for 8s. Repeat for 4 cycles to alleviate acute tension before hearings or interviews.',
            durationMinutes: 4,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '2',
            title: 'NALSA / DLSA Free Legal Aid Cell',
            category: 'LEGAL_AID',
            description: 'Connect with your District Legal Services Authority appointed advocate for case updates, witness deposition guidance, and bail opposition.',
            durationMinutes: 15,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '3',
            title: 'Victim Compensation Scheme Assistance',
            category: 'VICTIM_COMPENSATION',
            description: 'Facilitated access to interim financial relief under Section 357A CrPC and Central Victim Compensation Fund.',
            durationMinutes: 20,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '4',
            title: 'Witness Protection & Safe Transit Unit',
            category: 'WITNESS_PROTECTION',
            description: 'Confidential coordination with the District Witness Protection Committee for identity concealment, safe passage, and threat assessment.',
            durationMinutes: 30,
            targetRiskLevels: ['ELEVATED', 'REQUIRES_REVIEW'],
            isNonClinical: true,
          },
          {
            _id: '5',
            title: 'National Tele-Mental Health Helpline (KIRAN 1800-599-0019)',
            category: 'CRISIS_CONTACT',
            description: '24/7 toll-free, multilingual psychological first aid provided by the Ministry of Social Justice and Empowerment.',
            durationMinutes: 0,
            targetRiskLevels: ['REQUIRES_REVIEW'],
            isNonClinical: false,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BREATHING':
        return <Wind className="w-5 h-5 text-teal-400" />;
      case 'SLEEP':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'LEGAL_AID':
        return <Shield className="w-5 h-5 text-sky-400" />;
      case 'VICTIM_COMPENSATION':
        return <Compass className="w-5 h-5 text-amber-400" />;
      case 'WITNESS_PROTECTION':
        return <Users className="w-5 h-5 text-emerald-400" />;
      case 'CRISIS_CONTACT':
        return <PhoneCall className="w-5 h-5 text-rose-400" />;
      default:
        return <Compass className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-teal-400" />
          Personalized Non-Clinical Support Recommendations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Evidence-informed wellness routines, legal aid pathways, and grounding resources tailored to your signals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <div key={rec._id} className="glass-card p-6 border border-slate-800 flex flex-col justify-between glass-card-hover">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  {getCategoryIcon(rec.category)}
                </div>
                {rec.durationMinutes ? (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                    {rec.durationMinutes} mins
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    24/7 Crisis Contact
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-2">{rec.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">{rec.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                {rec.isNonClinical ? 'Non-Clinical Resource' : 'Professional Helpline'}
              </span>
              <button className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors">
                <span>Access</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
