import mongoose from 'mongoose';
import { Case, StageTransitionRequest, AuditLog, User } from '../../models/index.js';
import { CaseStage, TokenPayload, IStageHistoryItem } from '../../types/index.js';
import { mockSyntheticCases } from './cases.service.js';

export const VALID_CASE_STAGES: CaseStage[] = [
  'CASE_REGISTRATION',
  'INVESTIGATION',
  'COURT_TRIAL',
  'COMPENSATION',
  'REHABILITATION',
  'PROTECTION_SUPPORT',
  'CLOSED',
];

// In-memory fallback store for requests if MongoDB is not connected or in standalone demo mode
const memoryRequests: any[] = [];

export const caseStageService = {
  /**
   * Counselor submits a formal Stage Transition Request with official milestone evidence.
   */
  submitTransitionRequest: async (
    counselorUser: TokenPayload,
    caseId: string,
    data: {
      requestedStage: CaseStage;
      reason: string;
      evidenceReference: string;
      notes?: string;
    }
  ) => {
    const { requestedStage, reason, evidenceReference, notes } = data;

    if (!requestedStage || !VALID_CASE_STAGES.includes(requestedStage)) {
      throw new Error(`Invalid requested stage: ${requestedStage}`);
    }

    if (!reason || !reason.trim()) {
      throw new Error('Milestone reason is required');
    }

    if (!evidenceReference || !evidenceReference.trim()) {
      throw new Error('Official evidence or milestone reference identifier is required');
    }

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

    if (currentOfficialStage === requestedStage) {
      throw new Error(`Case is already in stage ${requestedStage}`);
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
        fromStage: currentOfficialStage,
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
          const targetItem = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === requestedStage);
          if (targetItem) {
            targetItem.status = 'AWAITING_VERIFICATION';
            targetItem.requestedAt = new Date();
            targetItem.requestedBy = counselorObjectId;
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
          fromStage: currentOfficialStage,
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
        fromStage: currentOfficialStage,
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
      }
    }

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
        dbCase.stagesHistory = VALID_CASE_STAGES.filter((st) => st !== 'CLOSED').map((st) => ({
          stage: st,
          status: st === reqDoc.requestedStage ? 'IN_PROGRESS' : 'NOT_STARTED',
        }));
      }

      // Mark old stage as completed
      const prevStageItem = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === oldStage);
      if (prevStageItem) {
        prevStageItem.status = 'COMPLETED';
        prevStageItem.completedAt = new Date();
      }

      // Mark new stage as in progress & confirmed
      const newStageItem = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === reqDoc.requestedStage);
      if (newStageItem) {
        newStageItem.status = 'IN_PROGRESS';
        newStageItem.enteredAt = new Date();
        newStageItem.confirmedAt = new Date();
        newStageItem.confirmedBy = adminObjectId;
        newStageItem.evidenceReference = reqDoc.evidenceReference;
        newStageItem.notes = reviewNotes || reqDoc.notes;
      }

      await dbCase.save();
    } else {
      const mock = mockSyntheticCases.find((c) => c.caseId === reqDoc.caseId);
      if (mock) {
        mock.caseStage = reqDoc.requestedStage;
        (mock as any).pendingStageTransition = null;
        if (mock.stagesHistory) {
          const prev = mock.stagesHistory.find((s) => s.stage === oldStage);
          if (prev) prev.status = 'COMPLETED';
          const nxt = mock.stagesHistory.find((s) => s.stage === reqDoc.requestedStage);
          if (nxt) {
            nxt.status = 'ACTIVE' as any;
            nxt.date = new Date().toISOString().split('T')[0];
            nxt.note = `Confirmed by ${adminUser.fullName}: ${reqDoc.evidenceReference}`;
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
        const target = dbCase.stagesHistory.find((s: IStageHistoryItem) => s.stage === reqDoc.requestedStage);
        if (target && target.status === 'AWAITING_VERIFICATION') {
          target.status = 'NOT_STARTED';
        }
      }
      await dbCase.save();
    } else {
      const mock = mockSyntheticCases.find((c) => c.caseId === reqDoc.caseId);
      if (mock) {
        (mock as any).pendingStageTransition = null;
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
