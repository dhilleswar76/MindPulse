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
            description: 'Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat for 4 cycles to alleviate acute stress sensations.',
            durationMinutes: 4,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '2',
            title: 'Non-Sleep Deep Rest (NSDR) Recovery',
            category: 'SLEEP',
            description: 'Guided audio body-scan relaxation that accelerates mental recovery and helps offset sleep deficits.',
            durationMinutes: 10,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '3',
            title: 'Campus Peer Wellness Drop-in Hours',
            category: 'CAMPUS_RESOURCE',
            description: 'Connect informally with trained fellow students for confidential, pressure-free check-ins at the Student Union.',
            durationMinutes: 30,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '4',
            title: '24/7 University Crisis Helpline',
            category: 'CRISIS_CONTACT',
            description: 'Free confidential support available any time: Dial 988 or Campus Crisis at (800) 273-8255.',
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
      case 'CAMPUS_RESOURCE':
        return <Users className="w-5 h-5 text-amber-400" />;
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
          Evidence-informed wellness routines, campus facilities, and grounding resources tailored to your signals.
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
