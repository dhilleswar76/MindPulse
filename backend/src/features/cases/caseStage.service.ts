import mongoose from 'mongoose';
import { Case, StageTransitionRequest, AuditLog, User } from '../../models/index.js';
import { CaseStage, TokenPayload, IStageHistoryItem, ICaseStageItem, StageStatus } from '../../types/index.js';
import { mockSyntheticCases } from './cases.service.js';
import { notificationsService } from '../notifications/notifications.service.js';

export const SIX_STAGES_CONFIG: { stage: CaseStage; name: string; shortLabel: string; order: number; description: string }[] = [
  {
    stage: 'CASE_REGISTRATION',
    name: 'Case Registration',
    shortLabel: 'Registration',
    order: 1,
    description: 'Initial reporting and intake under SC/ST POA',
  },
  {
    stage: 'INVESTIGATION',
    name: 'Investigation',
    shortLabel: 'Investigation',
    order: 2,
    description: 'Evidence, statements and police inquiry',
  },
  {
    stage: 'COURT_TRIAL',
    name: 'Court / Trial',
    shortLabel: 'Trial',
    order: 3,
    description: 'Special Court hearings & testimony support',
  },
  {
    stage: 'COMPENSATION',
    name: 'Compensation & Relief',
    shortLabel: 'Compensation',
    order: 4,
    description: 'Statutory welfare relief & Sec 357A CrPC claim',
  },
  {
    stage: 'REHABILITATION',
    name: 'Rehabilitation',
    shortLabel: 'Rehabilitation',
    order: 5,
    description: 'Social, psychological and vocational support',
  },
  {
    stage: 'PROTECTION_SUPPORT',
    name: 'Protection & Support',
    shortLabel: 'Protection',
    order: 6,
    description: 'Witness safety audit & ongoing wellbeing tracking',
  },
];

export const VALID_CASE_STAGES: CaseStage[] = [
  'CASE_REGISTRATION',
  'INVESTIGATION',
  'COURT_TRIAL',
  'COMPENSATION',
  'REHABILITATION',
  'PROTECTION_SUPPORT',
  'CLOSED',
];

// Helper to get next stage in sequential lifecycle
export const getNextSequentialStage = (currentStage: CaseStage): CaseStage => {
  const index = SIX_STAGES_CONFIG.findIndex((s) => s.stage === currentStage);
  if (index >= 0 && index < SIX_STAGES_CONFIG.length - 1) {
    return SIX_STAGES_CONFIG[index + 1].stage;
  }
  return 'CLOSED';
};

// In-memory fallback store for requests if MongoDB is not connected or in standalone demo mode
const memoryRequests: any[] = [];

export const caseStageService = {
  /**
   * Retrieves comprehensive 6-stage status lifecycle for a case.
   */
  getCaseStages: async (caseId: string) => {
    let dbCase: any = null;
    try {
      dbCase = await Case.findOne({
        $or: [{ caseId }, { _id: mongoose.Types.ObjectId.isValid(caseId) ? caseId : new mongoose.Types.ObjectId() }],
      });
    } catch {
      // ignore
    }

    const mockCase = !dbCase ? mockSyntheticCases.find((c) => c.caseId === caseId || c.id === caseId) : null;
    const currentOfficialStage: CaseStage = dbCase?.caseStage || mockCase?.caseStage || 'INVESTIGATION';

    // Find active transition request (if any)
    let activeRequest: any = null;
    let latestRequest: any = null;
    try {
      const allRequests = await StageTransitionRequest.find({ caseId: dbCase?.caseId || caseId }).sort({ createdAt: -1 });
      if (allRequests && allRequests.length > 0) {
        latestRequest = allRequests[0];
        activeRequest = allRequests.find((r) => ['PENDING', 'CLARIFICATION_REQUIRED'].includes(r.status));
      }
    } catch {
      const mems = memoryRequests.filter((r) => r.caseId === caseId || r.caseId === dbCase?.caseId);
      if (mems.length > 0) {
        latestRequest = mems[0];
        activeRequest = mems.find((r) => ['PENDING', 'CLARIFICATION_REQUIRED'].includes(r.status));
      }
    }

    const currentStageIndex = SIX_STAGES_CONFIG.findIndex((s) => s.stage === currentOfficialStage);
    const safeCurrentIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

    const stages: ICaseStageItem[] = SIX_STAGES_CONFIG.map((conf, idx) => {
      let status: StageStatus = 'LOCKED';
      let rejectionReason: string | undefined;
      let completedBy: string | undefined;
      let submittedAt: Date | string | undefined;
      let approvedBy: string | undefined;
      let approvedAt: Date | string | undefined;
      let notes: string | undefined;
      let evidenceReference: string | undefined;

      // Check DB stage history first
      const histItem = dbCase?.stagesHistory?.find((h: any) => h.stage === conf.stage);
      if (histItem) {
        if (histItem.status === 'COMPLETED') status = 'COMPLETED';
        else if (histItem.status === 'REJECTED') {
          status = 'REJECTED';
          rejectionReason = histItem.rejectionReason;
        } else if (histItem.status === 'COMPLETION_REQUESTED' || histItem.status === 'AWAITING_VERIFICATION') {
          status = 'COMPLETION_REQUESTED';
        } else if (histItem.status === 'ACTIVE' || histItem.status === 'IN_PROGRESS') {
          status = 'ACTIVE';
        } else if (histItem.status === 'LOCKED' || histItem.status === 'NOT_STARTED') {
          status = 'LOCKED';
        }
        rejectionReason = histItem.rejectionReason || rejectionReason;
        notes = histItem.notes;
        evidenceReference = histItem.evidenceReference;
        submittedAt = histItem.requestedAt;
        approvedAt = histItem.confirmedAt;
      }

      // Reconcile status based on position in sequence and pending requests
      if (idx < safeCurrentIndex) {
        status = 'COMPLETED';
      } else if (idx === safeCurrentIndex) {
        if (activeRequest) {
          status = 'COMPLETION_REQUESTED';
          submittedAt = activeRequest.createdAt;
          evidenceReference = activeRequest.evidenceReference;
          notes = activeRequest.notes;
        } else if (latestRequest && latestRequest.status === 'REJECTED' && latestRequest.fromStage === conf.stage) {
          status = 'REJECTED';
          rejectionReason = latestRequest.reviewNotes || 'Stage completion documentation rejected by Admin.';
        } else {
          status = 'ACTIVE';
        }
      } else {
        // Future stages
        status = 'LOCKED';
      }

      return {
        stage: conf.stage,
        name: conf.name,
        order: conf.order,
        status,
        completedBy,
        submittedAt,
        approvedBy,
        approvedAt,
        rejectionReason,
        notes,
        evidenceReference,
      };
    });

    return {
      caseId: dbCase?.caseId || mockCase?.caseId || caseId,
      currentStage: currentOfficialStage,
      pendingTransition: activeRequest
        ? {
            requestId: activeRequest._id,
            requestedStage: activeRequest.requestedStage,
            requestedAt: activeRequest.createdAt,
            status: activeRequest.status,
          }
        : null,
      stages,
    };
  },

  /**
   * Counselor submits a formal Stage Completion / Transition Request for Admin approval.
   */
  submitTransitionRequest: async (
    counselorUser: TokenPayload,
    caseId: string,
    data: {
      stage?: CaseStage;
      requestedStage?: CaseStage;
      reason?: string;
      evidenceReference?: string;
      notes?: string;
    }
  ) => {
    let { stage, requestedStage, reason, evidenceReference, notes } = data;

    // 1. Locate case
    let dbCase: any = null;
    try {
      dbCase = await Case.findOne({
        $or: [{ caseId }, { _id: mongoose.Types.ObjectId.isValid(caseId) ? caseId : new mongoose.Types.ObjectId() }],
      });
    } catch {
      // ignore db error
    }

    const currentOfficialStage: CaseStage = dbCase?.caseStage || 'INVESTIGATION';
    const stageToComplete = stage || currentOfficialStage;

    if (!requestedStage) {
      requestedStage = getNextSequentialStage(stageToComplete);
    }

    if (!requestedStage || !VALID_CASE_STAGES.includes(requestedStage)) {
      throw new Error(`Invalid requested stage: ${requestedStage}`);
    }

    if (!reason || !reason.trim()) {
      reason = `Stage completion submitted by counselor for official milestone verification.`;
    }

    if (!evidenceReference || !evidenceReference.trim()) {
      evidenceReference = `MS-${caseId}-${stageToComplete}`;
    }

    // 2. Check for existing active pending transition requests
    try {
      const activePending = await StageTransitionRequest.findOne({
        caseId: dbCase?.caseId || caseId,
        status: { $in: ['PENDING', 'CLARIFICATION_REQUIRED'] },
      });
      if (activePending) {
        throw new Error('A stage transition request for this case is already pending review or clarification');
      }
    } catch (err: any) {
      if (err.message.includes('already pending')) throw err;
      const memPending = memoryRequests.find(
        (r) => (r.caseId === caseId || r.caseId === dbCase?.caseId) && ['PENDING', 'CLARIFICATION_REQUIRED'].includes(r.status)
      );
      if (memPending) {
        throw new Error('A stage transition request for this case is already pending review or clarification');
      }
    }

    // 3. Create Stage Transition Request
    let newRequest: any = null;
    const counselorObjectId = mongoose.Types.ObjectId.isValid(counselorUser.userId)
      ? new mongoose.Types.ObjectId(counselorUser.userId)
      : new mongoose.Types.ObjectId();

    try {
      newRequest = await StageTransitionRequest.create({
        caseId: dbCase?.caseId || caseId,
        caseObjId: dbCase?._id,
        fromStage: stageToComplete,
        requestedStage,
        requestedByCounselor: counselorObjectId,
        counselorName: counselorUser.fullName || 'Designated Counselor',
        reason: reason.trim(),
        evidenceReference: evidenceReference.trim(),
        notes: notes?.trim() || '',
        status: 'PENDING',
      });

      // Update case pending stage state
      if (dbCase) {
        dbCase.pendingStageTransition = {
          requestId: newRequest._id,
          requestedStage,
          requestedAt: new Date(),
          status: 'PENDING',
        };

        // Update stage history item if present
        if (dbCase.stagesHistory && dbCase.stagesHistory.length > 0) {
          const currentItem = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === stageToComplete);
          if (currentItem) {
            currentItem.status = 'COMPLETION_REQUESTED';
            currentItem.requestedAt = new Date();
            currentItem.requestedBy = counselorObjectId;
            currentItem.rejectionReason = undefined;
          }
        }
        await dbCase.save();
      }

      // Write Audit Log
      await AuditLog.create({
        actorId: counselorObjectId,
        action: 'STAGE_TRANSITION_REQUESTED',
        resourceType: 'CASE',
        resourceId: dbCase?.caseId || caseId,
        details: {
          fromStage: stageToComplete,
          requestedStage,
          reason: reason.trim(),
          evidenceReference: evidenceReference.trim(),
          counselorName: counselorUser.fullName,
        },
        timestamp: new Date(),
      });
    } catch {
      // Memory fallback for demo mode
      newRequest = {
        _id: 'req_' + Date.now(),
        caseId: dbCase?.caseId || caseId,
        fromStage: stageToComplete,
        requestedStage,
        requestedByCounselor: counselorObjectId,
        counselorName: counselorUser.fullName || 'Designated Counselor',
        reason: reason.trim(),
        evidenceReference: evidenceReference.trim(),
        notes: notes?.trim() || '',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryRequests.unshift(newRequest);

      const mock = mockSyntheticCases.find((c) => c.caseId === caseId || c.id === caseId);
      if (mock) {
        (mock as any).pendingStageTransition = {
          requestId: newRequest._id,
          requestedStage,
          requestedAt: new Date(),
          status: 'PENDING',
        };
        if (mock.stagesHistory) {
          const item = mock.stagesHistory.find((s) => s.stage === stageToComplete);
          if (item) {
            (item as any).status = 'COMPLETION_REQUESTED';
            (item as any).rejectionReason = undefined;
          }
        }
      }
    }

    // 4. Create persistent Notification for ADMIN
    const stageDisplayName = SIX_STAGES_CONFIG.find((s) => s.stage === stageToComplete)?.shortLabel || stageToComplete;
    await notificationsService.createNotification({
      recipientRole: 'ADMIN',
      caseId: dbCase?.caseId || caseId,
      stage: stageDisplayName,
      type: 'STAGE_COMPLETION_REQUESTED',
      title: 'Stage completion approval required',
      message: `Stage completion approval required for Case ${dbCase?.caseId || caseId} (${stageDisplayName}). Submitted by ${counselorUser.fullName || 'Assigned Counselor'}.`,
      submittedBy: counselorUser.fullName || 'Assigned Counselor',
      status: 'Pending Approval',
      requestId: newRequest._id,
    });

    return newRequest;
  },

  /**
   * Retrieves stage transition requests with filtering.
   */
  getTransitionRequests: async (filters?: {
    status?: string;
    caseId?: string;
    counselorId?: string;
  }) => {
    try {
      const query: any = {};
      if (filters?.status && filters.status !== 'all' && filters.status !== 'ALL') {
        query.status = filters.status.toUpperCase();
      }
      if (filters?.caseId) {
        query.caseId = filters.caseId;
      }
      if (filters?.counselorId && mongoose.Types.ObjectId.isValid(filters.counselorId)) {
        query.requestedByCounselor = new mongoose.Types.ObjectId(filters.counselorId);
      }

      const requests = await StageTransitionRequest.find(query)
        .populate('requestedByCounselor', 'fullName email')
        .populate('reviewedBy', 'fullName email')
        .sort({ createdAt: -1 });

      if (requests && requests.length > 0) {
        return requests;
      }
    } catch {
      // fallback to memory
    }

    let result = [...memoryRequests];
    if (filters?.status && filters.status !== 'all' && filters.status !== 'ALL') {
      result = result.filter((r) => r.status === filters.status?.toUpperCase());
    }
    if (filters?.caseId) {
      result = result.filter((r) => r.caseId === filters.caseId);
    }
    return result;
  },

  /**
   * Retrieves single request by ID.
   */
  getRequestById: async (requestId: string) => {
    try {
      const reqDoc = await StageTransitionRequest.findById(requestId)
        .populate('requestedByCounselor', 'fullName email')
        .populate('reviewedBy', 'fullName email')
        .populate('caseObjId');
      if (reqDoc) return reqDoc;
    } catch {
      // fallback
    }

    const mem = memoryRequests.find((r) => r._id.toString() === requestId);
    if (mem) return mem;
    throw new Error(`Stage transition request not found: ${requestId}`);
  },

  /**
   * Authorized Official (ADMIN) approves a Stage Transition Request.
   * Atomically transitions the case's official stage, records stage history, and writes audit record.
   */
  approveTransition: async (adminUser: TokenPayload, requestId: string, reviewNotes?: string) => {
    let reqDoc: any = null;
    let dbCase: any = null;

    try {
      reqDoc = await StageTransitionRequest.findById(requestId);
    } catch {
      // ignore
    }

    if (!reqDoc) {
      reqDoc = memoryRequests.find((r) => r._id.toString() === requestId);
    }

    if (!reqDoc) {
      throw new Error('Stage transition request not found');
    }

    if (reqDoc.status === 'APPROVED') {
      throw new Error('Request has already been approved');
    }

    if (reqDoc.status === 'REJECTED') {
      throw new Error('Cannot approve a previously rejected request');
    }

    const adminObjectId = mongoose.Types.ObjectId.isValid(adminUser.userId)
      ? new mongoose.Types.ObjectId(adminUser.userId)
      : new mongoose.Types.ObjectId();

    try {
      dbCase = await Case.findOne({
        $or: [{ caseId: reqDoc.caseId }, { _id: reqDoc.caseObjId }],
      });
    } catch {
      // ignore
    }

    const oldStage = dbCase ? dbCase.caseStage : reqDoc.fromStage;

    // Stale request detection: Verify case's current stage matches fromStage
    if (dbCase && dbCase.caseStage !== reqDoc.fromStage) {
      throw new Error(
        `Stale request conflict: Case has changed stage to ${dbCase.caseStage} since this request was created for ${reqDoc.fromStage}`
      );
    }

    // 1. Update Case
    if (dbCase) {
      dbCase.caseStage = reqDoc.requestedStage;
      dbCase.pendingStageTransition = null;

      // Update stages history in DB
      if (!dbCase.stagesHistory || dbCase.stagesHistory.length === 0) {
        dbCase.stagesHistory = SIX_STAGES_CONFIG.map((st) => ({
          stage: st.stage,
          status: st.stage === reqDoc.requestedStage ? 'ACTIVE' : 'LOCKED',
        }));
      }

      // Mark old stage as completed
      const prevStageItem = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === oldStage);
      if (prevStageItem) {
        prevStageItem.status = 'COMPLETED';
        prevStageItem.completedAt = new Date();
        prevStageItem.rejectionReason = undefined;
      }

      // Mark new stage as in progress / ACTIVE
      const newStageItem = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === reqDoc.requestedStage);
      if (newStageItem) {
        newStageItem.status = 'ACTIVE';
        newStageItem.enteredAt = new Date();
        newStageItem.confirmedAt = new Date();
        newStageItem.confirmedBy = adminObjectId;
        newStageItem.evidenceReference = reqDoc.evidenceReference;
        newStageItem.notes = reviewNotes || reqDoc.notes;
        newStageItem.rejectionReason = undefined;
      }

      await dbCase.save();
    } else {
      const mock = mockSyntheticCases.find((c) => c.caseId === reqDoc.caseId);
      if (mock) {
        mock.caseStage = reqDoc.requestedStage;
        (mock as any).pendingStageTransition = null;
        if (mock.stagesHistory) {
          const prev = mock.stagesHistory.find((s) => s.stage === oldStage);
          if (prev) {
            prev.status = 'COMPLETED' as any;
            (prev as any).rejectionReason = undefined;
          }
          const nxt = mock.stagesHistory.find((s) => s.stage === reqDoc.requestedStage);
          if (nxt) {
            nxt.status = 'ACTIVE' as any;
            nxt.date = new Date().toISOString().split('T')[0];
            nxt.note = `Confirmed by ${adminUser.fullName}: ${reqDoc.evidenceReference}`;
            (nxt as any).rejectionReason = undefined;
          }
        }
      }
    }

    // 2. Update Request Status
    reqDoc.status = 'APPROVED';
    reqDoc.reviewedBy = adminObjectId;
    reqDoc.reviewerName = adminUser.fullName || 'District Welfare Admin';
    reqDoc.reviewedAt = new Date();
    reqDoc.reviewNotes = reviewNotes || 'Official milestone verified and approved.';
    if (typeof reqDoc.save === 'function') {
      await reqDoc.save();
    }

    // 3. Write Audit Log
    try {
      await AuditLog.create({
        actorId: adminObjectId,
        action: 'STAGE_TRANSITION_APPROVED',
        resourceType: 'CASE',
        resourceId: reqDoc.caseId,
        details: {
          requestId: reqDoc._id,
          fromStage: oldStage,
          confirmedStage: reqDoc.requestedStage,
          evidenceReference: reqDoc.evidenceReference,
          reviewerName: adminUser.fullName,
          reviewNotes: reqDoc.reviewNotes,
        },
        timestamp: new Date(),
      });
    } catch {
      // ignore
    }

    // 4. Create persistent Notification for COUNSELOR
    const nextStageName = SIX_STAGES_CONFIG.find((s) => s.stage === reqDoc.requestedStage)?.shortLabel || reqDoc.requestedStage;
    await notificationsService.createNotification({
      recipientRole: 'COUNSELOR',
      recipientId: reqDoc.requestedByCounselor,
      caseId: reqDoc.caseId,
      stage: nextStageName,
      type: 'STAGE_APPROVED',
      title: 'Stage approved',
      message: `Your stage completion has been approved. The next case stage (${nextStageName}) is now active.`,
      requestId: reqDoc._id,
    });

    return { success: true, case: dbCase, request: reqDoc };
  },

  /**
   * Authorized Official (ADMIN) rejects a Stage Transition Request.
   */
  rejectTransition: async (adminUser: TokenPayload, requestId: string, reviewNotes: string) => {
    if (!reviewNotes || !reviewNotes.trim()) {
      throw new Error('Rejection reason / review notes are required');
    }

    let reqDoc: any = null;
    let dbCase: any = null;

    try {
      reqDoc = await StageTransitionRequest.findById(requestId);
    } catch {
      // ignore
    }

    if (!reqDoc) {
      reqDoc = memoryRequests.find((r) => r._id.toString() === requestId);
    }

    if (!reqDoc) {
      throw new Error('Stage transition request not found');
    }

    if (reqDoc.status === 'APPROVED') {
      throw new Error('Cannot reject an already approved request');
    }

    const adminObjectId = mongoose.Types.ObjectId.isValid(adminUser.userId)
      ? new mongoose.Types.ObjectId(adminUser.userId)
      : new mongoose.Types.ObjectId();

    try {
      dbCase = await Case.findOne({
        $or: [{ caseId: reqDoc.caseId }, { _id: reqDoc.caseObjId }],
      });
    } catch {
      // ignore
    }

    if (dbCase) {
      dbCase.pendingStageTransition = null;
      if (dbCase.stagesHistory) {
        const currentStageItem = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === reqDoc.fromStage);
        if (currentStageItem) {
          currentStageItem.status = 'REJECTED';
          currentStageItem.rejectionReason = reviewNotes.trim();
        }
      }
      await dbCase.save();
    } else {
      const mock = mockSyntheticCases.find((c) => c.caseId === reqDoc.caseId);
      if (mock) {
        (mock as any).pendingStageTransition = null;
        if (mock.stagesHistory) {
          const currentStageItem = mock.stagesHistory.find((s) => s.stage === reqDoc.fromStage);
          if (currentStageItem) {
            (currentStageItem as any).status = 'REJECTED';
            (currentStageItem as any).rejectionReason = reviewNotes.trim();
          }
        }
      }
    }

    reqDoc.status = 'REJECTED';
    reqDoc.reviewedBy = adminObjectId;
    reqDoc.reviewerName = adminUser.fullName || 'District Welfare Admin';
    reqDoc.reviewedAt = new Date();
    reqDoc.reviewNotes = reviewNotes.trim();
    if (typeof reqDoc.save === 'function') {
      await reqDoc.save();
    }

    try {
      await AuditLog.create({
        actorId: adminObjectId,
        action: 'STAGE_TRANSITION_REJECTED',
        resourceType: 'CASE',
        resourceId: reqDoc.caseId,
        details: {
          requestId: reqDoc._id,
          fromStage: reqDoc.fromStage,
          requestedStage: reqDoc.requestedStage,
          evidenceReference: reqDoc.evidenceReference,
          reviewerName: adminUser.fullName,
          reviewNotes: reviewNotes.trim(),
        },
        timestamp: new Date(),
      });
    } catch {
      // ignore
    }

    // Create persistent Notification for COUNSELOR
    const fromStageName = SIX_STAGES_CONFIG.find((s) => s.stage === reqDoc.fromStage)?.shortLabel || reqDoc.fromStage;
    await notificationsService.createNotification({
      recipientRole: 'COUNSELOR',
      recipientId: reqDoc.requestedByCounselor,
      caseId: reqDoc.caseId,
      stage: fromStageName,
      type: 'STAGE_REJECTED',
      title: 'Stage completion rejected',
      message: `Stage completion request rejected. Reason: ${reviewNotes.trim()}`,
      rejectionReason: reviewNotes.trim(),
      requestId: reqDoc._id,
    });

    return { success: true, request: reqDoc };
  },

  /**
   * Authorized Official (ADMIN) requests clarification from Counselor.
   */
  requestClarification: async (adminUser: TokenPayload, requestId: string, reviewNotes: string) => {
    if (!reviewNotes || !reviewNotes.trim()) {
      throw new Error('Clarification instructions / review notes are required');
    }

    let reqDoc: any = null;
    let dbCase: any = null;

    try {
      reqDoc = await StageTransitionRequest.findById(requestId);
    } catch {
      // ignore
    }

    if (!reqDoc) {
      reqDoc = memoryRequests.find((r) => r._id.toString() === requestId);
    }

    if (!reqDoc) {
      throw new Error('Stage transition request not found');
    }

    if (reqDoc.status === 'APPROVED') {
      throw new Error('Cannot request clarification on an approved request');
    }

    const adminObjectId = mongoose.Types.ObjectId.isValid(adminUser.userId)
      ? new mongoose.Types.ObjectId(adminUser.userId)
      : new mongoose.Types.ObjectId();

    try {
      dbCase = await Case.findOne({
        $or: [{ caseId: reqDoc.caseId }, { _id: reqDoc.caseObjId }],
      });
    } catch {
      // ignore
    }

    if (dbCase && dbCase.pendingStageTransition) {
      dbCase.pendingStageTransition.status = 'CLARIFICATION_REQUIRED';
      await dbCase.save();
    }

    reqDoc.status = 'CLARIFICATION_REQUIRED';
    reqDoc.reviewedBy = adminObjectId;
    reqDoc.reviewerName = adminUser.fullName || 'District Welfare Admin';
    reqDoc.reviewedAt = new Date();
    reqDoc.reviewNotes = reviewNotes.trim();
    if (typeof reqDoc.save === 'function') {
      await reqDoc.save();
    }

    try {
      await AuditLog.create({
        actorId: adminObjectId,
        action: 'STAGE_TRANSITION_CLARIFICATION_REQUESTED',
        resourceType: 'CASE',
        resourceId: reqDoc.caseId,
        details: {
          requestId: reqDoc._id,
          fromStage: reqDoc.fromStage,
          requestedStage: reqDoc.requestedStage,
          clarificationRequested: reviewNotes.trim(),
          reviewerName: adminUser.fullName,
        },
        timestamp: new Date(),
      });
    } catch {
      // ignore
    }

    return { success: true, request: reqDoc };
  },

  /**
   * Authorized Administrative Stage Reopening / Correction.
   */
  reopenStage: async (
    adminUser: TokenPayload,
    caseId: string,
    targetStage: CaseStage,
    reopenReason: string
  ) => {
    if (!reopenReason || !reopenReason.trim()) {
      throw new Error('Reopening reason is required for audit verification');
    }

    const adminObjectId = mongoose.Types.ObjectId.isValid(adminUser.userId)
      ? new mongoose.Types.ObjectId(adminUser.userId)
      : new mongoose.Types.ObjectId();

    let dbCase: any = null;
    try {
      dbCase = await Case.findOne({
        $or: [{ caseId }, { _id: mongoose.Types.ObjectId.isValid(caseId) ? caseId : new mongoose.Types.ObjectId() }],
      });
    } catch {
      // ignore
    }

    if (dbCase) {
      dbCase.caseStage = targetStage;
      dbCase.pendingStageTransition = null;

      if (dbCase.stagesHistory) {
        const stageItem = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === targetStage);
        if (stageItem) {
          stageItem.status = 'REOPENED';
          stageItem.reopenReason = reopenReason.trim();
          stageItem.confirmedBy = adminObjectId;
          stageItem.confirmedAt = new Date();
        }
      }
      await dbCase.save();
    } else {
      const mock = mockSyntheticCases.find((c) => c.caseId === caseId);
      if (mock) {
        mock.caseStage = targetStage;
      }
    }

    try {
      await AuditLog.create({
        actorId: adminObjectId,
        action: 'CASE_STAGE_REOPENED',
        resourceType: 'CASE',
        resourceId: dbCase?.caseId || caseId,
        details: {
          reopenedToStage: targetStage,
          reopenReason: reopenReason.trim(),
          authorizedBy: adminUser.fullName,
        },
        timestamp: new Date(),
      });
    } catch {
      // ignore
    }

    return { success: true, case: dbCase };
  },
};
