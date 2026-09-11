import mongoose from 'mongoose';
import { User, Case, CounsellingRequest, ICounsellingRequest } from '../../models/index.js';
import { TokenPayload, CounsellorStatus } from '../../types/index.js';
import { notificationsService } from '../notifications/notifications.service.js';

// In-memory fallback data for demo / rapid testing
interface InMemoryVictim {
  _id: string;
  fullName: string;
  email: string;
  role: 'USER';
  caseId: string;
  caseStage: string;
  victimType: string;
  district: string;
  riskLevel: 'STABLE' | 'WATCH' | 'ELEVATED' | 'REQUIRES_REVIEW';
  counsellorId?: string | null;
  assignedCounselor?: string;
  counsellorStatus: CounsellorStatus;
  counsellorAssignedAt?: Date;
  createdAt: Date;
}

interface InMemoryCounsellor {
  _id: string;
  fullName: string;
  email: string;
  role: 'COUNSELOR';
  specialization: string;
  experienceYears: number;
  district: string;
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
}

const memoryVictims: InMemoryVictim[] = [
  {
    _id: 'user_alex_101',
    fullName: 'Alex Rivera (Protected Witness)',
    email: 'alex.r@protected.local',
    role: 'USER',
    caseId: 'MP-1042',
    caseStage: 'COURT_TRIAL',
    victimType: 'WITNESS',
    district: 'Central District',
    riskLevel: 'ELEVATED',
    counsellorId: 'c1',
    assignedCounselor: 'Dr. Sarah Jenkins',
    counsellorStatus: 'ACTIVE',
    counsellorAssignedAt: new Date(Date.now() - 3600000 * 24 * 14),
    createdAt: new Date(Date.now() - 3600000 * 24 * 30),
  },
  {
    _id: 'user_jordan_102',
    fullName: 'Jordan Chen (Pseudonymous)',
    email: 'jordan.c@protected.local',
    role: 'USER',
    caseId: 'MP-1001',
    caseStage: 'INVESTIGATION',
    victimType: 'VICTIM',
    district: 'North District',
    riskLevel: 'WATCH',
    counsellorId: null,
    counsellorStatus: 'NOT_ALLOCATED',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5),
  },
  {
    _id: 'user_priya_104',
    fullName: 'Priya Sharma (Protected Complainant)',
    email: 'priya.s@protected.local',
    role: 'USER',
    caseId: 'MP-1055',
    caseStage: 'CASE_REGISTRATION',
    victimType: 'VICTIM',
    district: 'East District',
    riskLevel: 'ELEVATED',
    counsellorId: null,
    counsellorStatus: 'NOT_ALLOCATED',
    createdAt: new Date(Date.now() - 3600000 * 12),
  },
  {
    _id: 'user_rahul_105',
    fullName: 'Rahul Verma (Atrocity Survivor)',
    email: 'rahul.v@protected.local',
    role: 'USER',
    caseId: 'MP-1060',
    caseStage: 'INVESTIGATION',
    victimType: 'VICTIM',
    district: 'South District',
    riskLevel: 'REQUIRES_REVIEW',
    counsellorId: null,
    counsellorStatus: 'NOT_ALLOCATED',
    createdAt: new Date(Date.now() - 3600000 * 6),
  },
];

const memoryCounsellors: InMemoryCounsellor[] = [
  {
    _id: 'counselor_sarah_201',
    fullName: 'Dr. Sarah Jenkins',
    email: 'counsellor@gmail.com',
    role: 'COUNSELOR',
    specialization: 'Trauma-Informed Crisis Intervention & Legal Aid',
    experienceYears: 12,
    district: 'Central District',
    availabilityStatus: 'AVAILABLE',
  },
  {
    _id: 'c2',
    fullName: 'Dr. David Wilson',
    email: 'david.w@counselor.mindpulse.local',
    role: 'COUNSELOR',
    specialization: 'Psychological Support & PTSD Rehabilitation',
    experienceYears: 9,
    district: 'North District',
    availabilityStatus: 'AVAILABLE',
  },
  {
    _id: 'c3',
    fullName: 'Dr. Ananya Iyer',
    email: 'ananya.i@counselor.mindpulse.local',
    role: 'COUNSELOR',
    specialization: 'Witness Safety Accompaniment & Youth Trauma Support',
    experienceYears: 7,
    district: 'East District',
    availabilityStatus: 'AVAILABLE',
  },
];

export const findMemoryCounsellor = (counsellorId?: string | null): InMemoryCounsellor | null => {
  if (!counsellorId) return null;
  return (
    memoryCounsellors.find(
      (c) =>
        c._id === counsellorId ||
        c.email === counsellorId ||
        c.fullName === counsellorId ||
        (counsellorId === 'c1' && c._id === 'counselor_sarah_201') ||
        (counsellorId.includes('sarah') && c._id === 'counselor_sarah_201') ||
        (counsellorId.includes('david') && c._id === 'c2') ||
        (counsellorId.includes('ananya') && c._id === 'c3')
    ) || memoryCounsellors[0]
  );
};

const memoryRequests: any[] = [];

export const counsellingAllocationService = {
  // Helper to reset memory store during test runs
  _resetMemoryStore: () => {
    memoryRequests.length = 0;
    // Reset victims
    memoryVictims[0].counsellorId = 'c1';
    memoryVictims[0].counsellorStatus = 'ACTIVE';
    memoryVictims[1].counsellorId = null;
    memoryVictims[1].counsellorStatus = 'NOT_ALLOCATED';
    memoryVictims[2].counsellorId = null;
    memoryVictims[2].counsellorStatus = 'NOT_ALLOCATED';
    memoryVictims[3].counsellorId = null;
    memoryVictims[3].counsellorStatus = 'NOT_ALLOCATED';
  },

  // 1. Get victim's current counsellor profile or allocation status
  getVictimCounsellorProfile: async (victimUserId: string) => {
    let victim: any = null;
    let counsellor: any = null;
    let pendingRequest: any = null;

    try {
      if (mongoose.Types.ObjectId.isValid(victimUserId)) {
        victim = await User.findById(victimUserId);
      }
      if (!victim) {
        victim = await User.findOne({ $or: [{ _id: victimUserId }, { email: victimUserId }, { caseId: victimUserId }] });
      }

      if (victim && victim.counsellorId && victim.counsellorStatus === 'ACTIVE') {
        counsellor = await User.findById(victim.counsellorId);
      }

      if (victim && (!victim.counsellorId || victim.counsellorStatus !== 'ACTIVE')) {
        pendingRequest = await CounsellingRequest.findOne({
          victimId: victim._id,
          status: 'PENDING',
        }).sort({ createdAt: -1 });
      }

      if (victim) {
        return {
          victimId: victim._id.toString(),
          victimName: victim.fullName,
          caseId: victim.caseId || 'MP-1042',
          caseStage: victim.caseStage || 'INVESTIGATION',
          counsellorStatus: victim.counsellorStatus || (victim.counsellorId ? 'ACTIVE' : 'NOT_ALLOCATED'),
          counsellor: counsellor
            ? {
                id: counsellor._id.toString(),
                fullName: counsellor.fullName,
                email: counsellor.email,
                specialization: counsellor.specialization || 'Trauma & Legal Aid Counselling',
                experienceYears: counsellor.experienceYears || 8,
                availability: counsellor.availabilityStatus || 'AVAILABLE',
                assignedSince: victim.counsellorAssignedAt || victim.updatedAt,
                district: counsellor.district || victim.district,
                phone: '+91 98765 43210',
              }
            : null,
          pendingRequest: pendingRequest
            ? {
                _id: pendingRequest._id.toString(),
                requestType: pendingRequest.requestType,
                requestedByName: pendingRequest.requestedByName,
                createdAt: pendingRequest.createdAt,
                status: pendingRequest.status,
              }
            : null,
        };
      }
    } catch {
      // MongoDB unreachable, fall back to memory
    }

    const memVictim = memoryVictims.find(
      (v) => v._id === victimUserId || v.email === victimUserId || v.caseId === victimUserId
    ) || memoryVictims[0];

    const memCounsellor = memVictim.counsellorId
      ? findMemoryCounsellor(memVictim.counsellorId)
      : null;

    const memPendingRequest = memoryRequests.find(
      (r) => r.victimId === memVictim._id && r.status === 'PENDING'
    );

    return {
      victimId: memVictim._id,
      victimName: memVictim.fullName,
      caseId: memVictim.caseId,
      caseStage: memVictim.caseStage,
      counsellorStatus: memVictim.counsellorStatus,
      counsellor: memCounsellor
        ? {
            id: memCounsellor._id,
            fullName: memCounsellor.fullName,
            email: memCounsellor.email,
            specialization: memCounsellor.specialization,
            experienceYears: memCounsellor.experienceYears,
            availability: memCounsellor.availabilityStatus,
            assignedSince: memVictim.counsellorAssignedAt || new Date(),
            district: memCounsellor.district,
            phone: '+91 98765 43210',
          }
        : null,
      pendingRequest: memPendingRequest
        ? {
            _id: memPendingRequest._id,
            requestType: memPendingRequest.requestType,
            requestedByName: memPendingRequest.requestedByName,
            createdAt: memPendingRequest.createdAt,
            status: memPendingRequest.status,
          }
        : null,
    };
  },

  // 2. Victim requests a counsellor from District Admin (VICTIM_TO_ADMIN)
  requestCounsellorAsVictim: async (victimUser: TokenPayload, notes?: string) => {
    try {
      let userDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(victimUser.userId)) {
        userDoc = await User.findById(victimUser.userId);
      }
      if (!userDoc) {
        userDoc = await User.findOne({ email: victimUser.email });
      }

      if (userDoc) {
        // Enforce 1 victim = 1 active counsellor
        if (userDoc.counsellorId && userDoc.counsellorStatus === 'ACTIVE') {
          const error: any = new Error('A counsellor is already assigned to your case.');
          error.statusCode = 400;
          throw error;
        }

        // Prevent duplicate active requests
        const existingPending = await CounsellingRequest.findOne({
          victimId: userDoc._id,
          status: 'PENDING',
        });

        if (existingPending) {
          const error: any = new Error(
            'You already have a pending counsellor request under review by the District Administration.'
          );
          error.statusCode = 400;
          throw error;
        }

        const caseId = userDoc.caseId || victimUser.caseId || 'MP-1042';
        const caseDoc = await Case.findOne({ $or: [{ caseId }, { victimId: userDoc._id }] });

        const newRequest = await CounsellingRequest.create({
          victimId: userDoc._id,
          victimName: userDoc.fullName,
          caseId,
          requestedBy: userDoc._id,
          requestedByName: userDoc.fullName,
          requestedByRole: 'USER',
          requestType: 'VICTIM_TO_ADMIN',
          status: 'PENDING',
          caseStage: userDoc.caseStage || caseDoc?.caseStage || 'INVESTIGATION',
          riskLevel: caseDoc?.recentRiskLevel || 'WATCH',
          notes: notes?.trim() || 'Victim requested trauma counseling and legal aid support via victim dashboard.',
        });

        // Update user status to PENDING
        await User.findByIdAndUpdate(userDoc._id, { counsellorStatus: 'PENDING' });
        if (caseDoc) {
          await Case.findByIdAndUpdate(caseDoc._id, { counsellorStatus: 'PENDING' });
        }

        // Persistent notification for District Admin
        await notificationsService.createNotification({
          recipientRole: 'ADMIN',
          caseId,
          stage: newRequest.caseStage,
          type: 'COUNSELLING_REQUEST_CREATED',
          title: 'New Counsellor Request',
          message: `Victim ${userDoc.fullName} (Case ${caseId}) has requested counselling support from District Administration.`,
          submittedBy: userDoc.fullName,
          status: 'Pending Admin Review',
          requestId: newRequest._id,
        });

        return {
          success: true,
          request: newRequest,
          message: 'Counselling request submitted to District Administration.',
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
      // fallback to memory below
    }

    // Memory store fallback
    const memVictim = memoryVictims.find(
      (v) => v._id === victimUser.userId || v.email === victimUser.email || v.caseId === victimUser.caseId
    );

    if (memVictim) {
      if (memVictim.counsellorId && memVictim.counsellorStatus === 'ACTIVE') {
        const error: any = new Error('A counsellor is already assigned to your case.');
        error.statusCode = 400;
        throw error;
      }

      const existingMemPending = memoryRequests.find(
        (r) => r.victimId === memVictim._id && r.status === 'PENDING'
      );
      if (existingMemPending) {
        const error: any = new Error(
          'You already have a pending counsellor request under review by the District Administration.'
        );
        error.statusCode = 400;
        throw error;
      }

      memVictim.counsellorStatus = 'PENDING';
      const memReq = {
        _id: 'req_' + Date.now(),
        victimId: memVictim._id,
        victimName: memVictim.fullName,
        caseId: memVictim.caseId,
        requestedBy: memVictim._id,
        requestedByName: memVictim.fullName,
        requestedByRole: 'USER',
        requestType: 'VICTIM_TO_ADMIN',
        status: 'PENDING',
        caseStage: memVictim.caseStage,
        riskLevel: memVictim.riskLevel,
        notes: notes?.trim() || 'Victim requested trauma counseling support.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryRequests.unshift(memReq);

      await notificationsService.createNotification({
        recipientRole: 'ADMIN',
        caseId: memVictim.caseId,
        stage: memVictim.caseStage,
        type: 'COUNSELLING_REQUEST_CREATED',
        title: 'New Counsellor Request',
        message: `Victim ${memVictim.fullName} (Case ${memVictim.caseId}) has requested counselling support.`,
        submittedBy: memVictim.fullName,
        status: 'Pending Admin Review',
        requestId: memReq._id,
      });

      return {
        success: true,
        request: memReq,
        message: 'Counselling request submitted to District Administration.',
      };
    }

    throw new Error('Victim account not found');
  },

  // 3. Counsellor views Available Victims (who have NO active counsellor)
  getAvailableVictims: async (counselorUser: TokenPayload) => {
    try {
      // Find all users with role 'USER' where counsellorStatus !== 'ACTIVE'
      const unallocatedUsers = await User.find({
        role: 'USER',
        $or: [{ counsellorId: { $exists: false } }, { counsellorId: null }, { counsellorStatus: 'NOT_ALLOCATED' }, { counsellorStatus: 'PENDING' }],
      }).lean();

      if (unallocatedUsers && unallocatedUsers.length > 0) {
        const victimIds = unallocatedUsers.map((u) => u._id);
        const cases = await Case.find({ victimId: { $in: victimIds } }).lean();
        const pendingRequests = await CounsellingRequest.find({
          victimId: { $in: victimIds },
          status: 'PENDING',
        }).lean();

        const results = unallocatedUsers
          .filter((u: any) => u.counsellorStatus !== 'ACTIVE')
          .map((u: any) => {
            const caseItem = cases.find((c: any) => c.victimId?.toString() === u._id.toString() || c.caseId === u.caseId);
            const myPending = pendingRequests.find(
              (r: any) =>
                r.victimId?.toString() === u._id.toString() &&
                r.requestedBy?.toString() === counselorUser.userId
            );
            const otherPending = pendingRequests.find((r: any) => r.victimId?.toString() === u._id.toString());

            return {
              id: u._id.toString(),
              victimId: u._id.toString(),
              victimName: u.fullName,
              caseId: u.caseId || caseItem?.caseId || 'MP-' + u._id.toString().substring(18, 22),
              caseStage: u.caseStage || caseItem?.caseStage || 'INVESTIGATION',
              victimType: u.victimType || 'VICTIM',
              district: u.district || 'Central District',
              riskLevel: caseItem?.recentRiskLevel || 'WATCH',
              counsellorStatus: (u.counsellorStatus || 'NOT_ALLOCATED') as CounsellorStatus,
              myPendingRequest: myPending ? { _id: myPending._id.toString(), status: myPending.status } : null,
              hasActiveRequest: !!otherPending,
              createdAt: u.createdAt || new Date(),
            };
          });

        return results;
      }
    } catch {
      // Fallback below
    }

    // Memory store fallback
    return memoryVictims
      .filter((v) => !v.counsellorId || v.counsellorStatus !== 'ACTIVE')
      .map((v) => {
        const myPending = memoryRequests.find(
          (r) => r.victimId === v._id && r.requestedBy === counselorUser.userId && r.status === 'PENDING'
        );
        const anyPending = memoryRequests.find((r) => r.victimId === v._id && r.status === 'PENDING');

        return {
          id: v._id,
          victimId: v._id,
          victimName: v.fullName,
          caseId: v.caseId,
          caseStage: v.caseStage,
          victimType: v.victimType,
          district: v.district,
          riskLevel: v.riskLevel,
          counsellorStatus: v.counsellorStatus,
          myPendingRequest: myPending ? { _id: myPending._id, status: myPending.status } : null,
          hasActiveRequest: !!anyPending,
          createdAt: v.createdAt,
        };
      });
  },

  // 4. Counsellor requests to counsel an unallocated victim (COUNSELLOR_TO_ADMIN)
  counselorRequestVictim: async (
    counselorUser: TokenPayload,
    victimId: string,
    notes?: string
  ) => {
    try {
      let victimDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(victimId)) {
        victimDoc = await User.findById(victimId);
      }
      if (!victimDoc) {
        victimDoc = await User.findOne({ $or: [{ caseId: victimId }, { email: victimId }] });
      }

      if (victimDoc) {
        // Enforce 1 victim = 1 active counsellor
        if (victimDoc.counsellorId && victimDoc.counsellorStatus === 'ACTIVE') {
          const error: any = new Error('Victim has already been allocated to another counsellor.');
          error.statusCode = 409;
          throw error;
        }

        // Check if this counsellor already requested this victim
        const existingCounselorReq = await CounsellingRequest.findOne({
          victimId: victimDoc._id,
          counsellorId: counselorUser.userId,
          status: 'PENDING',
        });

        if (existingCounselorReq) {
          const error: any = new Error('You have already submitted an active counselling request for this victim.');
          error.statusCode = 400;
          throw error;
        }

        const caseId = victimDoc.caseId || 'MP-1042';
        const caseDoc = await Case.findOne({ $or: [{ caseId }, { victimId: victimDoc._id }] });

        const newRequest = await CounsellingRequest.create({
          victimId: victimDoc._id,
          victimName: victimDoc.fullName,
          caseId,
          counsellorId: counselorUser.userId,
          counsellorName: counselorUser.fullName,
          requestedBy: counselorUser.userId,
          requestedByName: counselorUser.fullName,
          requestedByRole: 'COUNSELOR',
          requestType: 'COUNSELLOR_TO_ADMIN',
          status: 'PENDING',
          caseStage: victimDoc.caseStage || caseDoc?.caseStage || 'INVESTIGATION',
          riskLevel: caseDoc?.recentRiskLevel || 'WATCH',
          notes: notes?.trim() || `Counsellor ${counselorUser.fullName} requested to provide psycho-social and legal aid support.`,
        });

        // Notify District Admin
        await notificationsService.createNotification({
          recipientRole: 'ADMIN',
          caseId,
          stage: newRequest.caseStage,
          type: 'COUNSELLING_REQUEST_CREATED',
          title: 'New Counsellor Assignment Request',
          message: `${counselorUser.fullName} requested to counsel ${victimDoc.fullName} (Case ${caseId}).`,
          submittedBy: counselorUser.fullName,
          status: 'Pending Admin Approval',
          requestId: newRequest._id,
        });

        return {
          success: true,
          request: newRequest,
          message: 'Counselling assignment request submitted for District Admin approval.',
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memVictim = memoryVictims.find(
      (v) => v._id === victimId || v.caseId === victimId || v.email === victimId
    );

    if (memVictim) {
      if (memVictim.counsellorId && memVictim.counsellorStatus === 'ACTIVE') {
        const error: any = new Error('Victim has already been allocated to another counsellor.');
        error.statusCode = 409;
        throw error;
      }

      const existingMem = memoryRequests.find(
        (r) =>
          r.victimId === memVictim._id &&
          r.counsellorId === counselorUser.userId &&
          r.status === 'PENDING'
      );
      if (existingMem) {
        const error: any = new Error('You have already submitted an active counselling request for this victim.');
        error.statusCode = 400;
        throw error;
      }

      const memReq = {
        _id: 'req_' + Date.now(),
        victimId: memVictim._id,
        victimName: memVictim.fullName,
        caseId: memVictim.caseId,
        counsellorId: counselorUser.userId,
        counsellorName: counselorUser.fullName,
        requestedBy: counselorUser.userId,
        requestedByName: counselorUser.fullName,
        requestedByRole: 'COUNSELOR',
        requestType: 'COUNSELLOR_TO_ADMIN',
        status: 'PENDING',
        caseStage: memVictim.caseStage,
        riskLevel: memVictim.riskLevel,
        notes: notes?.trim() || 'Counsellor requested assignment.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryRequests.unshift(memReq);

      await notificationsService.createNotification({
        recipientRole: 'ADMIN',
        caseId: memVictim.caseId,
        stage: memVictim.caseStage,
        type: 'COUNSELLING_REQUEST_CREATED',
        title: 'New Counsellor Assignment Request',
        message: `${counselorUser.fullName} requested to counsel ${memVictim.fullName} (Case ${memVictim.caseId}).`,
        submittedBy: counselorUser.fullName,
        status: 'Pending Admin Approval',
        requestId: memReq._id,
      });

      return {
        success: true,
        request: memReq,
        message: 'Counselling assignment request submitted for District Admin approval.',
      };
    }

    throw new Error('Victim record not found');
  },

  // 5. Counsellor gets their requests (incoming Admin requests + outgoing requests)
  getCounselorRequests: async (counselorUser: TokenPayload) => {
    try {
      const dbRequests = await CounsellingRequest.find({
        $or: [
          { counsellorId: counselorUser.userId },
          { requestedBy: counselorUser.userId },
        ],
      }).sort({ createdAt: -1 });

      if (dbRequests && dbRequests.length > 0) {
        const incoming = dbRequests.filter(
          (r) => r.requestType === 'ADMIN_TO_COUNSELLOR' && r.status === 'PENDING'
        );
        const outgoing = dbRequests.filter(
          (r) => r.requestType === 'COUNSELLOR_TO_ADMIN'
        );
        return { incomingRequests: incoming, outgoingRequests: outgoing, allRequests: dbRequests };
      }
    } catch {
      // Fallback
    }

    const memReqs = memoryRequests.filter(
      (r) => r.counsellorId === counselorUser.userId || r.requestedBy === counselorUser.userId
    );
    return {
      incomingRequests: memReqs.filter(
        (r) => r.requestType === 'ADMIN_TO_COUNSELLOR' && r.status === 'PENDING'
      ),
      outgoingRequests: memReqs.filter((r) => r.requestType === 'COUNSELLOR_TO_ADMIN'),
      allRequests: memReqs,
    };
  },

  // 6. Counsellor accepts or rejects an Admin allocation request (ADMIN_TO_COUNSELLOR)
  counselorRespondRequest: async (
    counselorUser: TokenPayload,
    requestId: string,
    action: 'ACCEPT' | 'REJECT',
    rejectionReason?: string
  ) => {
    try {
      let requestDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(requestId)) {
        requestDoc = await CounsellingRequest.findById(requestId);
      }
      if (!requestDoc) {
        requestDoc = await CounsellingRequest.findOne({ _id: requestId });
      }

      if (requestDoc) {
        if (action === 'ACCEPT') {
          // Atomic check: Ensure victim is still unallocated
          const victimUser = await User.findById(requestDoc.victimId);
          if (victimUser && victimUser.counsellorId && victimUser.counsellorStatus === 'ACTIVE') {
            requestDoc.status = 'CANCELLED';
            await requestDoc.save();
            const error: any = new Error('Victim has already been allocated to another counsellor.');
            error.statusCode = 409;
            throw error;
          }

          // Allocate counsellor
          const now = new Date();
          await User.findByIdAndUpdate(requestDoc.victimId, {
            counsellorId: counselorUser.userId,
            assignedCounselor: counselorUser.fullName,
            counsellorStatus: 'ACTIVE',
            counsellorAssignedAt: now,
          });

          await Case.findOneAndUpdate(
            { $or: [{ caseId: requestDoc.caseId }, { victimId: requestDoc.victimId }] },
            {
              assignedCounselorId: counselorUser.userId,
              assignedCounselorName: counselorUser.fullName,
              counsellorStatus: 'ACTIVE',
              counsellorAssignedAt: now,
            }
          );

          requestDoc.status = 'ACCEPTED';
          requestDoc.respondedAt = now;
          await requestDoc.save();

          // Auto-cancel all other pending requests for this victim to prevent race conditions
          await CounsellingRequest.updateMany(
            {
              victimId: requestDoc.victimId,
              _id: { $ne: requestDoc._id },
              status: 'PENDING',
            },
            { status: 'CANCELLED' }
          );

          // Notifications
          await notificationsService.createNotification({
            recipientRole: 'ADMIN',
            caseId: requestDoc.caseId,
            stage: requestDoc.caseStage,
            type: 'COUNSELLING_REQUEST_ACCEPTED',
            title: 'Counsellor Accepted Assignment',
            message: `${counselorUser.fullName} accepted the counselling assignment for ${requestDoc.victimName} (Case ${requestDoc.caseId}).`,
            submittedBy: counselorUser.fullName,
            status: 'Allocated & Active',
            requestId: requestDoc._id,
          });

          await notificationsService.createNotification({
            recipientRole: 'USER',
            recipientId: requestDoc.victimId,
            caseId: requestDoc.caseId,
            stage: requestDoc.caseStage,
            type: 'COUNSELLING_ALLOCATED',
            title: 'Counsellor Assigned',
            message: `${counselorUser.fullName} has been assigned as your designated counsellor.`,
            submittedBy: 'District Welfare Administration',
            status: 'Active Counsellor',
            requestId: requestDoc._id,
          });

          return {
            success: true,
            request: requestDoc,
            message: `Successfully accepted counselling assignment for Case ${requestDoc.caseId}.`,
          };
        } else {
          // REJECT
          const now = new Date();
          requestDoc.status = 'REJECTED';
          requestDoc.rejectionReason = rejectionReason?.trim() || 'Counsellor at maximum caseload capacity.';
          requestDoc.respondedAt = now;
          await requestDoc.save();

          // Reset victim status if no other active counsellor
          const victimUser = await User.findById(requestDoc.victimId);
          if (victimUser && victimUser.counsellorStatus !== 'ACTIVE') {
            await User.findByIdAndUpdate(requestDoc.victimId, { counsellorStatus: 'NOT_ALLOCATED' });
          }

          // Notify Admin
          await notificationsService.createNotification({
            recipientRole: 'ADMIN',
            caseId: requestDoc.caseId,
            stage: requestDoc.caseStage,
            type: 'COUNSELLING_REQUEST_REJECTED',
            title: 'Counsellor Declined Assignment',
            message: `${counselorUser.fullName} declined the counselling assignment for ${requestDoc.victimName} (Case ${requestDoc.caseId}). Reason: ${requestDoc.rejectionReason}`,
            submittedBy: counselorUser.fullName,
            rejectionReason: requestDoc.rejectionReason,
            status: 'Declined',
            requestId: requestDoc._id,
          });

          return {
            success: true,
            request: requestDoc,
            message: `Declined counselling request for Case ${requestDoc.caseId}.`,
          };
        }
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memReq = memoryRequests.find((r) => r._id === requestId);
    if (!memReq) throw new Error('Request not found');

    if (action === 'ACCEPT') {
      const memVictim = memoryVictims.find((v) => v._id === memReq.victimId);
      if (memVictim && memVictim.counsellorId && memVictim.counsellorStatus === 'ACTIVE') {
        memReq.status = 'CANCELLED';
        const error: any = new Error('Victim has already been allocated to another counsellor.');
        error.statusCode = 409;
        throw error;
      }

      if (memVictim) {
        memVictim.counsellorId = counselorUser.userId;
        memVictim.assignedCounselor = counselorUser.fullName;
        memVictim.counsellorStatus = 'ACTIVE';
        memVictim.counsellorAssignedAt = new Date();
      }

      memReq.status = 'ACCEPTED';
      memReq.respondedAt = new Date();

      // Cancel other pending
      memoryRequests.forEach((r) => {
        if (r.victimId === memReq.victimId && r._id !== memReq._id && r.status === 'PENDING') {
          r.status = 'CANCELLED';
        }
      });

      await notificationsService.createNotification({
        recipientRole: 'ADMIN',
        caseId: memReq.caseId,
        stage: memReq.caseStage,
        type: 'COUNSELLING_REQUEST_ACCEPTED',
        title: 'Counsellor Accepted Assignment',
        message: `${counselorUser.fullName} accepted counselling assignment for ${memReq.victimName}.`,
        submittedBy: counselorUser.fullName,
        status: 'Active',
      });

      await notificationsService.createNotification({
        recipientRole: 'USER',
        recipientId: memReq.victimId,
        caseId: memReq.caseId,
        stage: memReq.caseStage,
        type: 'COUNSELLING_ALLOCATED',
        title: 'Counsellor Assigned',
        message: `${counselorUser.fullName} has been assigned as your designated counsellor.`,
      });

      return {
        success: true,
        request: memReq,
        message: 'Counselling assignment accepted.',
      };
    } else {
      memReq.status = 'REJECTED';
      memReq.rejectionReason = rejectionReason || 'Counsellor at max caseload';
      memReq.respondedAt = new Date();

      const memVictim = memoryVictims.find((v) => v._id === memReq.victimId);
      if (memVictim && memVictim.counsellorStatus !== 'ACTIVE') {
        memVictim.counsellorStatus = 'NOT_ALLOCATED';
      }

      await notificationsService.createNotification({
        recipientRole: 'ADMIN',
        caseId: memReq.caseId,
        stage: memReq.caseStage,
        type: 'COUNSELLING_REQUEST_REJECTED',
        title: 'Counsellor Declined Assignment',
        message: `${counselorUser.fullName} declined assignment. Reason: ${memReq.rejectionReason}`,
        submittedBy: counselorUser.fullName,
      });

      return {
        success: true,
        request: memReq,
        message: 'Counselling assignment declined.',
      };
    }
  },

  // 7. Admin gets overview: unallocated victims, active allocations, pending requests
  getAdminAllocationOverview: async () => {
    try {
      const allVictims = await User.find({ role: 'USER' }).lean();
      const unallocated = allVictims.filter(
        (v: any) => !v.counsellorId || v.counsellorStatus !== 'ACTIVE'
      );
      const allocated = allVictims.filter(
        (v: any) => v.counsellorId && v.counsellorStatus === 'ACTIVE'
      );

      const requests = await CounsellingRequest.find().sort({ createdAt: -1 }).lean();
      const pendingRequests = requests.filter((r) => r.status === 'PENDING');

      const counsellors = await User.find({ role: 'COUNSELOR' }).lean();

      return {
        unallocatedVictims: unallocated.map((u: any) => ({
          id: u._id.toString(),
          victimId: u._id.toString(),
          victimName: u.fullName,
          caseId: u.caseId || 'MP-' + u._id.toString().substring(18, 22),
          caseStage: u.caseStage || 'INVESTIGATION',
          victimType: u.victimType || 'VICTIM',
          district: u.district || 'Central District',
          counsellorStatus: (u.counsellorStatus || 'NOT_ALLOCATED') as CounsellorStatus,
          createdAt: u.createdAt || new Date(),
        })),
        activeAllocations: allocated.map((u: any) => {
          const cDoc = counsellors.find((c: any) => c._id.toString() === u.counsellorId?.toString());
          return {
            id: u._id.toString(),
            victimId: u._id.toString(),
            victimName: u.fullName,
            caseId: u.caseId || 'MP-1042',
            caseStage: u.caseStage || 'INVESTIGATION',
            counsellorId: u.counsellorId?.toString(),
            counsellorName: cDoc?.fullName || u.assignedCounselor || 'Designated Counsellor',
            counsellorSpecialization: cDoc?.specialization || 'Trauma Counselling',
            assignedAt: u.counsellorAssignedAt || u.updatedAt || new Date(),
            district: u.district || 'Central District',
            status: 'ACTIVE',
          };
        }),
        pendingRequests,
        stats: {
          totalUnallocated: unallocated.length,
          totalAllocated: allocated.length,
          totalPendingRequests: pendingRequests.length,
          totalCounsellors: counsellors.length,
        },
      };
    } catch {
      // Fallback below
    }

    const unallocated = memoryVictims.filter((v) => !v.counsellorId || v.counsellorStatus !== 'ACTIVE');
    const allocated = memoryVictims.filter((v) => v.counsellorId && v.counsellorStatus === 'ACTIVE');
    const pending = memoryRequests.filter((r) => r.status === 'PENDING');

    return {
      unallocatedVictims: unallocated.map((u) => ({
        id: u._id,
        victimId: u._id,
        victimName: u.fullName,
        caseId: u.caseId,
        caseStage: u.caseStage,
        victimType: u.victimType,
        district: u.district,
        riskLevel: u.riskLevel,
        counsellorStatus: u.counsellorStatus,
        createdAt: u.createdAt,
      })),
      activeAllocations: allocated.map((u) => {
        const c = findMemoryCounsellor(u.counsellorId);
        return {
          id: u._id,
          victimId: u._id,
          victimName: u.fullName,
          caseId: u.caseId,
          caseStage: u.caseStage,
          counsellorId: u.counsellorId,
          counsellorName: c?.fullName || u.assignedCounselor || 'Dr. Sarah Jenkins',
          counsellorSpecialization: c?.specialization || 'Trauma Support',
          assignedAt: u.counsellorAssignedAt || new Date(),
          district: u.district,
          status: 'ACTIVE',
        };
      }),
      pendingRequests: pending,
      stats: {
        totalUnallocated: unallocated.length,
        totalAllocated: allocated.length,
        totalPendingRequests: pending.length,
        totalCounsellors: memoryCounsellors.length,
      },
    };
  },

  // 8. Admin gets available counsellors list with caseload counts
  getAdminAvailableCounsellors: async () => {
    try {
      const counsellors = await User.find({ role: 'COUNSELOR' }).lean();
      const allAllocatedVictims = await User.find({
        role: 'USER',
        counsellorStatus: 'ACTIVE',
      }).lean();

      if (counsellors && counsellors.length > 0) {
        return counsellors.map((c: any) => {
          const activeCases = allAllocatedVictims.filter(
            (v: any) => v.counsellorId?.toString() === c._id.toString()
          ).length;

          return {
            id: c._id.toString(),
            _id: c._id.toString(),
            fullName: c.fullName,
            email: c.email,
            specialization: c.specialization || 'Trauma-Informed Support & Crisis Counseling',
            experienceYears: c.experienceYears || 8,
            district: c.district || 'Central District',
            currentCases: activeCases,
            availability: activeCases >= 5 ? 'BUSY' : 'AVAILABLE',
          };
        });
      }
    } catch {
      // Fallback below
    }

    return memoryCounsellors.map((c) => {
      const activeCount = memoryVictims.filter((v) => v.counsellorId === c._id && v.counsellorStatus === 'ACTIVE').length;
      return {
        id: c._id,
        _id: c._id,
        fullName: c.fullName,
        email: c.email,
        specialization: c.specialization,
        experienceYears: c.experienceYears,
        district: c.district,
        currentCases: activeCount,
        availability: activeCount >= 5 ? 'BUSY' : 'AVAILABLE',
      };
    });
  },

  // 9. Admin requests an available counsellor for an unallocated victim (ADMIN_TO_COUNSELLOR)
  adminRequestCounsellor: async (
    adminUser: TokenPayload,
    victimId: string,
    counselorId: string,
    notes?: string
  ) => {
    try {
      let victimDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(victimId)) {
        victimDoc = await User.findById(victimId);
      }
      if (!victimDoc) {
        victimDoc = await User.findOne({ $or: [{ caseId: victimId }, { email: victimId }] });
      }

      let counselorDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(counselorId)) {
        counselorDoc = await User.findById(counselorId);
      }
      if (!counselorDoc) {
        counselorDoc = await User.findOne({ $or: [{ email: counselorId }, { fullName: counselorId }] });
      }

      if (victimDoc && counselorDoc) {
        if (victimDoc.counsellorId && victimDoc.counsellorStatus === 'ACTIVE') {
          const error: any = new Error('Victim has already been allocated to another counsellor.');
          error.statusCode = 409;
          throw error;
        }

        const caseId = victimDoc.caseId || 'MP-1042';
        const caseDoc = await Case.findOne({ $or: [{ caseId }, { victimId: victimDoc._id }] });

        const newRequest = await CounsellingRequest.create({
          victimId: victimDoc._id,
          victimName: victimDoc.fullName,
          caseId,
          counsellorId: counselorDoc._id,
          counsellorName: counselorDoc.fullName,
          requestedBy: adminUser.userId,
          requestedByName: adminUser.fullName || 'District Welfare Admin',
          requestedByRole: 'ADMIN',
          requestType: 'ADMIN_TO_COUNSELLOR',
          status: 'PENDING',
          caseStage: victimDoc.caseStage || caseDoc?.caseStage || 'INVESTIGATION',
          riskLevel: caseDoc?.recentRiskLevel || 'HIGH',
          notes: notes?.trim() || `District Administrator assigned case ${caseId} to ${counselorDoc.fullName}.`,
        });

        await User.findByIdAndUpdate(victimDoc._id, { counsellorStatus: 'PENDING' });

        // Notify Counsellor
        await notificationsService.createNotification({
          recipientRole: 'COUNSELOR',
          recipientId: counselorDoc._id,
          caseId,
          stage: newRequest.caseStage,
          type: 'COUNSELLING_REQUEST_CREATED',
          title: 'New Counselling Request',
          message: `District Admin assigned you a new counselling request for Victim ${victimDoc.fullName} (Case ${caseId}, Stage: ${newRequest.caseStage}).`,
          submittedBy: adminUser.fullName || 'District Admin',
          status: 'Pending Counselor Acceptance',
          requestId: newRequest._id,
        });

        return {
          success: true,
          request: newRequest,
          message: `Counselling request sent to ${counselorDoc.fullName}.`,
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memVictim = memoryVictims.find((v) => v._id === victimId || v.caseId === victimId);
    const memCounsellor = findMemoryCounsellor(counselorId);

    if (memVictim && memCounsellor) {
      if (memVictim.counsellorId && memVictim.counsellorStatus === 'ACTIVE') {
        const error: any = new Error('Victim has already been allocated to another counsellor.');
        error.statusCode = 409;
        throw error;
      }

      memVictim.counsellorStatus = 'PENDING';
      const memReq = {
        _id: 'req_' + Date.now(),
        victimId: memVictim._id,
        victimName: memVictim.fullName,
        caseId: memVictim.caseId,
        counsellorId: memCounsellor._id,
        counsellorName: memCounsellor.fullName,
        requestedBy: adminUser.userId,
        requestedByName: adminUser.fullName || 'District Welfare Admin',
        requestedByRole: 'ADMIN',
        requestType: 'ADMIN_TO_COUNSELLOR',
        status: 'PENDING',
        caseStage: memVictim.caseStage,
        riskLevel: memVictim.riskLevel,
        notes: notes?.trim() || `District Administrator assigned case to ${memCounsellor.fullName}.`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryRequests.unshift(memReq);

      await notificationsService.createNotification({
        recipientRole: 'COUNSELOR',
        recipientId: memCounsellor._id,
        caseId: memVictim.caseId,
        stage: memVictim.caseStage,
        type: 'COUNSELLING_REQUEST_CREATED',
        title: 'New Counselling Request',
        message: `District Admin assigned you a new counselling request for ${memVictim.fullName} (Case ${memVictim.caseId}).`,
        submittedBy: adminUser.fullName || 'District Admin',
        status: 'Pending Counselor Acceptance',
        requestId: memReq._id,
      });

      return {
        success: true,
        request: memReq,
        message: `Counselling request sent to ${memCounsellor.fullName}.`,
      };
    }

    throw new Error('Victim or Counsellor account not found');
  },

  // 10. Admin approves a counsellor's request to counsel a victim (COUNSELLOR_TO_ADMIN)
  adminApproveCounselorRequest: async (adminUser: TokenPayload, requestId: string) => {
    try {
      let requestDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(requestId)) {
        requestDoc = await CounsellingRequest.findById(requestId);
      }
      if (!requestDoc) {
        requestDoc = await CounsellingRequest.findOne({ _id: requestId });
      }

      if (requestDoc) {
        // Atomic check: Ensure victim is still unallocated
        const victimUser = await User.findById(requestDoc.victimId);
        if (victimUser && victimUser.counsellorId && victimUser.counsellorStatus === 'ACTIVE') {
          requestDoc.status = 'CANCELLED';
          await requestDoc.save();
          const error: any = new Error('This victim has already been assigned to another counsellor.');
          error.statusCode = 409;
          throw error;
        }

        const now = new Date();
        await User.findByIdAndUpdate(requestDoc.victimId, {
          counsellorId: requestDoc.counsellorId,
          assignedCounselor: requestDoc.counsellorName,
          counsellorStatus: 'ACTIVE',
          counsellorAssignedAt: now,
        });

        await Case.findOneAndUpdate(
          { $or: [{ caseId: requestDoc.caseId }, { victimId: requestDoc.victimId }] },
          {
            assignedCounselorId: requestDoc.counsellorId,
            assignedCounselorName: requestDoc.counsellorName,
            counsellorStatus: 'ACTIVE',
            counsellorAssignedAt: now,
          }
        );

        requestDoc.status = 'APPROVED';
        requestDoc.approvedAt = now;
        await requestDoc.save();

        // Auto-cancel all other pending requests for this victim
        await CounsellingRequest.updateMany(
          {
            victimId: requestDoc.victimId,
            _id: { $ne: requestDoc._id },
            status: 'PENDING',
          },
          { status: 'CANCELLED' }
        );

        // Notify Counsellor
        await notificationsService.createNotification({
          recipientRole: 'COUNSELOR',
          recipientId: requestDoc.counsellorId,
          caseId: requestDoc.caseId,
          stage: requestDoc.caseStage,
          type: 'COUNSELLING_REQUEST_APPROVED',
          title: 'Counselling Request Approved',
          message: `Your counselling request for Case ${requestDoc.caseId} (${requestDoc.victimName}) was approved by District Admin.`,
          submittedBy: adminUser.fullName || 'District Admin',
          status: 'Approved & Active',
          requestId: requestDoc._id,
        });

        // Notify Victim
        await notificationsService.createNotification({
          recipientRole: 'USER',
          recipientId: requestDoc.victimId,
          caseId: requestDoc.caseId,
          stage: requestDoc.caseStage,
          type: 'COUNSELLING_ALLOCATED',
          title: 'Counsellor Assigned',
          message: `${requestDoc.counsellorName} has been assigned as your designated counsellor.`,
          submittedBy: 'District Welfare Administration',
          status: 'Active Counsellor',
          requestId: requestDoc._id,
        });

        return {
          success: true,
          request: requestDoc,
          message: `Approved ${requestDoc.counsellorName} as counsellor for Case ${requestDoc.caseId}.`,
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memReq = memoryRequests.find((r) => r._id === requestId);
    if (!memReq) throw new Error('Request not found');

    const memVictim = memoryVictims.find((v) => v._id === memReq.victimId);
    if (memVictim && memVictim.counsellorId && memVictim.counsellorStatus === 'ACTIVE') {
      memReq.status = 'CANCELLED';
      const error: any = new Error('This victim has already been assigned to another counsellor.');
      error.statusCode = 409;
      throw error;
    }

    if (memVictim) {
      memVictim.counsellorId = memReq.counsellorId;
      memVictim.assignedCounselor = memReq.counsellorName;
      memVictim.counsellorStatus = 'ACTIVE';
      memVictim.counsellorAssignedAt = new Date();
    }

    memReq.status = 'APPROVED';
    memReq.approvedAt = new Date();

    memoryRequests.forEach((r) => {
      if (r.victimId === memReq.victimId && r._id !== memReq._id && r.status === 'PENDING') {
        r.status = 'CANCELLED';
      }
    });

    await notificationsService.createNotification({
      recipientRole: 'COUNSELOR',
      recipientId: memReq.counsellorId,
      caseId: memReq.caseId,
      stage: memReq.caseStage,
      type: 'COUNSELLING_REQUEST_APPROVED',
      title: 'Counselling Request Approved',
      message: `Your counselling request for Case ${memReq.caseId} was approved.`,
    });

    await notificationsService.createNotification({
      recipientRole: 'USER',
      recipientId: memReq.victimId,
      caseId: memReq.caseId,
      stage: memReq.caseStage,
      type: 'COUNSELLING_ALLOCATED',
      title: 'Counsellor Assigned',
      message: `${memReq.counsellorName} has been assigned as your designated counsellor.`,
    });

    return {
      success: true,
      request: memReq,
      message: `Approved ${memReq.counsellorName} as counsellor.`,
    };
  },

  // 11. Admin rejects a counsellor's request
  adminRejectCounselorRequest: async (
    adminUser: TokenPayload,
    requestId: string,
    rejectionReason: string
  ) => {
    try {
      let requestDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(requestId)) {
        requestDoc = await CounsellingRequest.findById(requestId);
      }
      if (!requestDoc) {
        requestDoc = await CounsellingRequest.findOne({ _id: requestId });
      }

      if (requestDoc) {
        requestDoc.status = 'REJECTED';
        requestDoc.rejectionReason = rejectionReason?.trim() || 'Caseload distribution policy or conflict of interest.';
        requestDoc.respondedAt = new Date();
        await requestDoc.save();

        // Notify Counsellor
        await notificationsService.createNotification({
          recipientRole: 'COUNSELOR',
          recipientId: requestDoc.counsellorId,
          caseId: requestDoc.caseId,
          stage: requestDoc.caseStage,
          type: 'COUNSELLING_REQUEST_REJECTED',
          title: 'Counselling Request Declined',
          message: `Your counselling request for Case ${requestDoc.caseId} was declined by District Admin. Reason: ${requestDoc.rejectionReason}`,
          submittedBy: adminUser.fullName || 'District Admin',
          rejectionReason: requestDoc.rejectionReason,
          status: 'Declined',
          requestId: requestDoc._id,
        });

        return {
          success: true,
          request: requestDoc,
          message: `Counsellor request rejected for Case ${requestDoc.caseId}.`,
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memReq = memoryRequests.find((r) => r._id === requestId);
    if (!memReq) throw new Error('Request not found');

    memReq.status = 'REJECTED';
    memReq.rejectionReason = rejectionReason || 'Caseload policy';
    memReq.respondedAt = new Date();

    await notificationsService.createNotification({
      recipientRole: 'COUNSELOR',
      recipientId: memReq.counsellorId,
      caseId: memReq.caseId,
      stage: memReq.caseStage,
      type: 'COUNSELLING_REQUEST_REJECTED',
      title: 'Counselling Request Declined',
      message: `Your counselling request for Case ${memReq.caseId} was declined. Reason: ${memReq.rejectionReason}`,
    });

    return {
      success: true,
      request: memReq,
      message: `Counsellor request rejected.`,
    };
  },
};
