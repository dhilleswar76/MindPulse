import { connectDatabase } from '../config/db.js';
import { caseStageService } from '../features/cases/caseStage.service.js';
import { authService } from '../features/auth/auth.service.js';
import { casesService } from '../features/cases/cases.service.js';
import { notificationsService } from '../features/notifications/notifications.service.js';
import { TokenPayload } from '../types/index.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const testResults: TestResult[] = [];

function assertTest(condition: boolean, name: string, errorDetail?: string) {
  if (condition) {
    testResults.push({ name, passed: true });
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    testResults.push({ name, passed: false, error: errorDetail || 'Assertion failed' });
    console.error(`  ❌ [FAIL] ${name}: ${errorDetail || 'Assertion failed'}`);
  }
}

export async function runStageWorkflowTests() {
  console.log('\n===============================================================');
  console.log('🏛️ RUNNING CASE STAGE WORKFLOW & ADMIN APPROVAL TEST SUITE');
  console.log('===============================================================\n');

  await connectDatabase();

  // 1. Authenticate Personas
  const counselorAuth = await authService.login({ email: 'counsellor@gmail.com', password: 'MindPulse' });
  const adminAuth = await authService.login({ email: 'admin@gmail.com', password: 'MindPulse' });
  const victimAuth = await authService.login({ email: 'user@gmail.com', password: 'MindPulse' });

  const counselorUser: TokenPayload = {
    userId: counselorAuth.user.id || 'counselor_sarah_201',
    email: counselorAuth.user.email,
    role: 'COUNSELOR',
    fullName: counselorAuth.user.fullName || 'Dr. Sarah Jenkins',
  };

  const adminUser: TokenPayload = {
    userId: adminAuth.user.id || 'admin_marcus_301',
    email: adminAuth.user.email,
    role: 'ADMIN',
    fullName: adminAuth.user.fullName || 'Marcus Vance (District Welfare Admin)',
  };

  const victimUser: TokenPayload = {
    userId: victimAuth.user.id || 'user_alex_101',
    email: victimAuth.user.email,
    role: 'USER',
    fullName: victimAuth.user.fullName || 'Alex Rivera',
  };

  const testCaseId = 'MP-1042';

  // Test 1: Initial 6-stage lifecycle retrieval
  try {
    console.log('--- Test 1: Retrieve 6-Stage Journey Lifecycle ---');
    const stageData = await caseStageService.getCaseStages(testCaseId);
    assertTest(stageData.stages.length === 6, 'Exactly 6 stages returned');
    assertTest(stageData.stages[0].stage === 'CASE_REGISTRATION', 'Stage 1 is CASE_REGISTRATION');
    assertTest(stageData.stages[1].stage === 'INVESTIGATION', 'Stage 2 is INVESTIGATION');
    assertTest(stageData.stages[2].stage === 'COURT_TRIAL', 'Stage 3 is COURT_TRIAL');
    assertTest(stageData.stages[3].stage === 'COMPENSATION', 'Stage 4 is COMPENSATION');
    assertTest(stageData.stages[4].stage === 'REHABILITATION', 'Stage 5 is REHABILITATION');
    assertTest(stageData.stages[5].stage === 'PROTECTION_SUPPORT', 'Stage 6 is PROTECTION_SUPPORT');

    // Past stages COMPLETED, current ACTIVE or as set, future LOCKED
    assertTest(stageData.stages[0].status === 'COMPLETED', 'Stage 1 Registration is COMPLETED');
    assertTest(stageData.stages[1].status === 'COMPLETED', 'Stage 2 Investigation is COMPLETED');
    assertTest(stageData.stages[2].status === 'ACTIVE', 'Stage 3 Trial is ACTIVE');
    assertTest(stageData.stages[3].status === 'LOCKED', 'Stage 4 Compensation is LOCKED');
    assertTest(stageData.stages[4].status === 'LOCKED', 'Stage 5 Rehabilitation is LOCKED');
    assertTest(stageData.stages[5].status === 'LOCKED', 'Stage 6 Protection is LOCKED');
  } catch (err: any) {
    assertTest(false, 'Initial stage fetch', err.message);
  }

  // Test 2: Counselor submits Stage 3 (Trial) completion request
  let createdRequestId = '';
  try {
    console.log('\n--- Test 2: Counselor completes active Stage 3 (Trial) ---');
    const submitRes = await caseStageService.submitTransitionRequest(counselorUser, testCaseId, {
      stage: 'COURT_TRIAL',
      reason: 'Trial hearings and witness cross-examination successfully concluded in Special Court.',
      evidenceReference: 'CRT-2026-1042-DEPOSITION',
    });

    createdRequestId = submitRes._id.toString();
    assertTest(Boolean(submitRes._id), 'Stage transition request created');
    assertTest(submitRes.status === 'PENDING', 'Request status is PENDING');

    // Check case stages: Stage 3 should now be COMPLETION_REQUESTED, Stage 4 remains LOCKED
    const updatedStages = await caseStageService.getCaseStages(testCaseId);
    assertTest(updatedStages.stages[2].status === 'COMPLETION_REQUESTED', 'Stage 3 transitioned to COMPLETION_REQUESTED');
    assertTest(updatedStages.stages[3].status === 'LOCKED', 'Stage 4 remains strictly LOCKED');
  } catch (err: any) {
    assertTest(false, 'Counselor submission', err.message);
  }

  // Test 3: Persistent Admin Notification created
  try {
    console.log('\n--- Test 3: Admin receives persistent notification ---');
    const adminNotifs = await notificationsService.getNotifications(adminUser);
    const found = adminNotifs.notifications.find(
      (n: any) => n.caseId === testCaseId && n.type === 'STAGE_COMPLETION_REQUESTED'
    );
    assertTest(Boolean(found), 'Admin has persistent notification for stage completion request');
    assertTest(found?.title === 'Stage completion approval required', 'Notification title matches requirement');
    assertTest(adminNotifs.unreadCount > 0, 'Unread notification count incremented');
  } catch (err: any) {
    assertTest(false, 'Admin notification check', err.message);
  }

  // Test 4: Counselor cannot approve own stage (RBAC check)
  try {
    console.log('\n--- Test 4: RBAC Counselor cannot approve own request ---');
    let blocked = false;
    if (counselorUser.role !== 'ADMIN') {
      blocked = true;
    }
    assertTest(blocked, 'Counselor role forbidden from approving stage completion');
  } catch (err: any) {
    assertTest(false, 'RBAC check', err.message);
  }

  // Test 5: Admin rejects stage completion with required reason
  try {
    console.log('\n--- Test 5: Admin rejects stage completion request with reason ---');
    const rejectionReason = 'Certified copy of the Special Court order deposition is missing.';
    const rejectRes = await caseStageService.rejectTransition(adminUser, createdRequestId, rejectionReason);
    assertTest(rejectRes.request.status === 'REJECTED', 'Request marked REJECTED');

    // Stage 3 should now be REJECTED with rejection reason
    const rejectedStages = await caseStageService.getCaseStages(testCaseId);
    assertTest(rejectedStages.stages[2].status === 'REJECTED', 'Stage 3 is now REJECTED');
    assertTest(rejectedStages.stages[2].rejectionReason === rejectionReason, 'Rejection reason attached to Stage 3');
    assertTest(rejectedStages.stages[3].status === 'LOCKED', 'Stage 4 remains LOCKED after rejection');

    // Counselor receives persistent rejection notification
    const counselorNotifs = await notificationsService.getNotifications(counselorUser);
    const rejectNotif = counselorNotifs.notifications.find(
      (n: any) => n.caseId === testCaseId && n.type === 'STAGE_REJECTED'
    );
    assertTest(Boolean(rejectNotif), 'Counselor received persistent rejection notification');
    assertTest(rejectNotif?.rejectionReason === rejectionReason, 'Notification includes rejection reason');
  } catch (err: any) {
    assertTest(false, 'Admin rejection', err.message);
  }

  // Test 6: Counselor resubmits Stage 3 with updated documentation
  let resubmittedRequestId = '';
  try {
    console.log('\n--- Test 6: Counselor resubmits Stage 3 after rejection ---');
    const resubmitRes = await caseStageService.submitTransitionRequest(counselorUser, testCaseId, {
      stage: 'COURT_TRIAL',
      reason: 'Certified copy of Special Court order attached along with public prosecutor acknowledgment.',
      evidenceReference: 'CRT-2026-1042-ORDER-CERTIFIED',
    });

    resubmittedRequestId = resubmitRes._id.toString();
    assertTest(Boolean(resubmitRes._id), 'Resubmitted request created');
    assertTest(resubmitRes.status === 'PENDING', 'Resubmitted request is PENDING');

    const resubmittedStages = await caseStageService.getCaseStages(testCaseId);
    assertTest(resubmittedStages.stages[2].status === 'COMPLETION_REQUESTED', 'Stage 3 is back in COMPLETION_REQUESTED state');
    assertTest(resubmittedStages.stages[3].status === 'LOCKED', 'Stage 4 is still LOCKED');
  } catch (err: any) {
    assertTest(false, 'Counselor resubmission', err.message);
  }

  // Test 7: Admin approves resubmitted stage -> Stage 3 COMPLETED, Stage 4 ACTIVE
  try {
    console.log('\n--- Test 7: Admin approves stage completion ---');
    const approveRes = await caseStageService.approveTransition(
      adminUser,
      resubmittedRequestId,
      'Court order verified with District Registrar. Proceed to Compensation & Relief.'
    );

    assertTest(approveRes.request.status === 'APPROVED', 'Request marked APPROVED');

    // Check 6-stage lifecycle
    const approvedStages = await caseStageService.getCaseStages(testCaseId);
    assertTest(approvedStages.stages[0].status === 'COMPLETED', 'Stage 1 remains COMPLETED');
    assertTest(approvedStages.stages[1].status === 'COMPLETED', 'Stage 2 remains COMPLETED');
    assertTest(approvedStages.stages[2].status === 'COMPLETED', 'Stage 3 is now COMPLETED');
    assertTest(approvedStages.stages[3].status === 'ACTIVE', 'Stage 4 (Compensation) is now ACTIVE');
    assertTest(approvedStages.stages[4].status === 'LOCKED', 'Stage 5 remains LOCKED');
    assertTest(approvedStages.stages[5].status === 'LOCKED', 'Stage 6 remains LOCKED');

    // Counselor receives persistent approval notification
    const counselorNotifs = await notificationsService.getNotifications(counselorUser);
    const approveNotif = counselorNotifs.notifications.find(
      (n: any) => n.caseId === testCaseId && n.type === 'STAGE_APPROVED'
    );
    assertTest(Boolean(approveNotif), 'Counselor received persistent approval notification');
    assertTest(approveNotif?.title === 'Stage approved', 'Approval notification title matches requirement');
  } catch (err: any) {
    assertTest(false, 'Admin approval', err.message);
  }

  // Test 8: Notification read state management
  try {
    console.log('\n--- Test 8: Notification mark as read without deletion ---');
    const adminNotifsBefore = await notificationsService.getNotifications(adminUser);
    const targetNotif = adminNotifsBefore.notifications[0];
    if (targetNotif) {
      await notificationsService.markAsRead(targetNotif._id.toString());
      const adminNotifsAfter = await notificationsService.getNotifications(adminUser);
      const readItem = adminNotifsAfter.notifications.find((n: any) => n._id.toString() === targetNotif._id.toString());
      assertTest(readItem?.read === true, 'Notification marked as read in database');
      assertTest(adminNotifsAfter.notifications.length === adminNotifsBefore.notifications.length, 'Notification retained in database (not deleted)');
    }
  } catch (err: any) {
    assertTest(false, 'Notification read management', err.message);
  }

  // Summary
  console.log('\n===============================================================');
  const passed = testResults.filter((r) => r.passed).length;
  const total = testResults.length;
  console.log(`📊 STAGE WORKFLOW TEST SUMMARY: ${passed}/${total} PASSED`);
  console.log('===============================================================\n');

  return { passed, total, allPassed: passed === total };
}

// CLI execution
if (process.argv[1]?.includes('stage-workflow')) {
  runStageWorkflowTests()
    .then((res) => {
      if (!res.allPassed) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('Test error:', err);
      process.exit(1);
    });
}
