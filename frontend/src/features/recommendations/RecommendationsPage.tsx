import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wind,
  Moon,
  Compass,
  Users,
  PhoneCall,
  ExternalLink,
  Shield,
  HeartHandshake,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Scale,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Recommendation } from '../../types';
import { InteractiveResourceCard } from './InteractiveResourceCard';
import { SensoryResetModal } from './SensoryResetModal';
import { NsdrRelaxationModal } from './NsdrRelaxationModal';
import { LegalDefenseModal } from './LegalDefenseModal';
import { VictimCompensationModal } from './VictimCompensationModal';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'sensory' | 'nsdr' | 'legal' | 'compensation' | null>(null);

  // Interactive 4-7-8 Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setPhaseSeconds((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 8;
            } else {
              setBreathPhase('Inhale');
              setCompletedCycles((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase]);

  const handleResetBreath = () => {
    setIsBreathingActive(false);
    setBreathPhase('Inhale');
    setPhaseSeconds(4);
  };

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res: any = await api.get('/recommendations');
        setRecommendations(res.data?.recommendations || []);
      } catch {
        setRecommendations([
          {
            _id: '1',
            title: '4-7-8 Parasympathetic Grounding',
            category: 'BREATHING',
            description: 'Inhale for 4s, hold for 7s, exhale for 8s. Helps calm acute legal and pre-hearing stress.',
            durationMinutes: 4,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '2',
            title: 'NALSA / DLSA Free Legal Aid Cell',
            category: 'LEGAL_AID',
            description: 'Connect with your District Legal Services advocate for case updates and deposition preparation.',
            durationMinutes: 15,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '3',
            title: 'Victim Compensation Scheme Assistance',
            category: 'VICTIM_COMPENSATION',
            description: 'Assistance for interim financial relief under Section 357A CrPC and Central Victim Compensation guidelines.',
            durationMinutes: 20,
            targetRiskLevels: ['ALL'],
            isNonClinical: true,
          },
          {
            _id: '4',
            title: 'Witness Protection & Safe Transit Coordination',
            category: 'WITNESS_PROTECTION',
            description: 'Coordination with the District Witness Protection Committee for escorted safe travel and confidential waiting areas.',
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
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Support & Assistance Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-teal-400" />
            <span>Support Pathways & Grounding Resources</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Everyday grounding tools, legal aid connections, and statutory welfare relief organized clearly for your safety and peace of mind.
          </p>
        </div>

        <Link
          to="/support"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto shrink-0"
        >
          <span>Chat with Companion</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE 4-7-8 SOMATIC BREATHING CALMER                             */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
              <Wind className="w-4 h-4" />
              <span>Interactive Grounding</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              4-7-8 Somatic Calming Exercise
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When case tension rises before hearings, this paced breathing technique activates your parasympathetic nervous system to slow heart rate and de-escalate anxiety.
            </p>
          </div>

          {/* Interactive Breathing Circle Visualizer */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-3xl border border-slate-800/80 w-full sm:w-64 shrink-0 space-y-3">
            <div
              className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ${
                breathPhase === 'Inhale'
                  ? 'border-teal-400 bg-teal-500/10 scale-105'
                  : breathPhase === 'Hold'
                  ? 'border-amber-400 bg-amber-500/10 scale-105'
                  : 'border-indigo-400 bg-indigo-500/10 scale-95'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {breathPhase}
              </span>
              <span className="text-2xl font-extrabold text-white mt-0.5">
                {phaseSeconds}s
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {isBreathingActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Breathing</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetBreath}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {completedCycles > 0 && (
              <span className="text-[11px] text-teal-300 font-medium">
                {completedCycles} {completedCycles === 1 ? 'cycle' : 'cycles'} completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE-TIER SUPPORT DIRECTORY                                           */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Tier 1: Everyday Grounding Tools */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-400" />
              <span>1. Everyday Grounding & Self-Care</span>
            </h2>
            <span className="text-xs text-slate-400">Non-Clinical Practices</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InteractiveResourceCard
              id="resource-card-sensory"
              title="5-4-3-2-1 Sensory Reset"
              subtitle="3–5 minutes"
              badgeText="Grounding"
              description="Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste to re-center attention prior to courtroom depositions."
              actionText="Start exercise"
              icon={<Wind className="w-5 h-5 text-teal-400" />}
              accentColor="teal"
              onClick={() => setActiveModal('sensory')}
            />

            <InteractiveResourceCard
              id="resource-card-nsdr"
              title="Bedtime Non-Sleep Deep Rest (NSDR)"
              subtitle="10 minutes"
              badgeText="Rest & Recovery"
              description="Systematic progressive muscle relaxation to de-escalate bedtime hypervigilance and support restorative sleep recovery."
              actionText="Begin session"
              icon={<Moon className="w-5 h-5 text-indigo-400" />}
              accentColor="indigo"
              onClick={() => setActiveModal('nsdr')}
            />
          </div>
        </div>

        {/* Tier 2: Statutory Legal Aid & Welfare Relief */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-400" />
              <span>2. Legal Aid & Statutory Welfare Entitlements</span>
            </h2>
            <span className="text-xs text-slate-400">Official Assistance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InteractiveResourceCard
              id="resource-card-legal"
              title="NALSA / DLSA Free Legal Defense"
              subtitle="Free Legal Counsel"
              badgeText="Government Assigned"
              description="Entitlement under the Legal Services Authorities Act. Connect with designated panel advocates for representation and witness support."
              footerPrimary="Toll-Free Helpline: <strong>15100</strong>"
              footerSecondary="Assigned Counsel"
              actionText="Get legal support"
              icon={<Scale className="w-5 h-5 text-sky-400" />}
              accentColor="sky"
              onClick={() => setActiveModal('legal')}
            />

            <InteractiveResourceCard
              id="resource-card-compensation"
              title="Victim Compensation (Sec 357A CrPC)"
              subtitle="Statutory Financial Relief"
              badgeText="Counselor Assisted"
              description="Interim and final financial relief for medical care, rehabilitation, and immediate subsistence grants via the District Welfare Committee."
              footerPrimary="Application: Form I Submission"
              footerSecondary="Welfare Scheme"
              actionText="Explore compensation"
              icon={<Compass className="w-5 h-5 text-amber-400" />}
              accentColor="amber"
              onClick={() => setActiveModal('compensation')}
            />
          </div>
        </div>

        {/* Tier 3: Urgent & Toll-Free 24/7 Helplines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>3. Urgent & 24/7 Emergency Helplines</span>
            </h2>
            <span className="text-xs text-slate-400">Direct Human Connection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Tele-MANAS</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20">
                  24/7 Toll-Free
                </span>
              </div>
              <p className="text-xs text-slate-300">
                National Tele-Mental Health programme offering multilingual crisis support and psychological first aid.
              </p>
              <a
                href="tel:14416"
                className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:underline pt-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 14416 / 1800-891-4416</span>
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">KIRAN Helpline</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                  24/7 Multilingual
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Ministry of Social Justice and Empowerment dedicated mental health support line.
              </p>
              <a
                href="tel:18005990019"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline pt-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 1800-599-0019</span>
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300">Emergency & Protection</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
                  Immediate
                </span>
              </div>
              <p className="text-xs text-slate-300">
                If you are in immediate physical danger or require urgent police escort, dial emergency services.
              </p>
              <a
                href="tel:112"
                className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 hover:underline pt-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Emergency: Dial 112</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE SUPPORT EXPERIENCE MODALS                                  */}
      {/* ========================================================================= */}
      <SensoryResetModal
        isOpen={activeModal === 'sensory'}
        onClose={() => setActiveModal(null)}
      />

      <NsdrRelaxationModal
        isOpen={activeModal === 'nsdr'}
        onClose={() => setActiveModal(null)}
      />

      <LegalDefenseModal
        isOpen={activeModal === 'legal'}
        onClose={() => setActiveModal(null)}
      />

      <VictimCompensationModal
        isOpen={activeModal === 'compensation'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
