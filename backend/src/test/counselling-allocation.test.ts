import { connectDatabase } from '../config/db.js';
import { counsellingAllocationService } from '../features/counseling/counsellingAllocation.service.js';
import { authService } from '../features/auth/auth.service.js';
import { notificationsService } from '../features/notifications/notifications.service.js';
import { TokenPayload } from '../types/index.js';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Case } from '../models/Case.js';
import { CounsellingRequest } from '../models/CounsellingRequest.js';

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

export async function runCounsellingAllocationTests() {
  console.log('\n===============================================================');
  console.log('🤝 RUNNING COUNSELLOR–VICTIM ALLOCATION WORKFLOW TEST SUITE');
  console.log('===============================================================\n');

  await connectDatabase();

  // Reset in-memory store
  counsellingAllocationService._resetMemoryStore();

  // 1. Authenticate Personas
  const counselorAuth = await authService.login({ email: 'counsellor@gmail.com', password: 'MindPulse' });
  const adminAuth = await authService.login({ email: 'admin@gmail.com', password: 'MindPulse' });
  const victimAuth = await authService.login({ email: 'user@gmail.com', password: 'MindPulse' });

  const counselorUser: TokenPayload = {
    userId: counselorAuth.user.id || 'c1',
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
    userId: 'user_jordan_102',
    email: 'jordan.c@protected.local',
    role: 'USER',
    fullName: 'Jordan Chen (Pseudonymous)',
  };

  const testVictimId = victimUser.userId;

  // If MongoDB connected with valid ObjectIds, clear any old test state
  if (mongoose.connection.readyState === 1) {
    try {
      if (mongoose.Types.ObjectId.isValid(testVictimId)) {
        await User.findByIdAndUpdate(testVictimId, {
          counsellorId: null,
          counsellorStatus: 'NOT_ALLOCATED',
          counsellorAssignedAt: null,
        });
        await Case.findOneAndUpdate(
          { victimId: testVictimId },
          {
            counselorId: null,
            counsellorStatus: 'NOT_ALLOCATED',
            counsellorAssignedAt: null,
          }
        );
        await CounsellingRequest.deleteMany({ victimId: testVictimId });
      }
    } catch {
      // Ignored
    }
  }

  // Test 1: New/Unallocated victim has no counsellor
  console.log('--- Test 1: Verify Initial Unallocated Victim State ---');
  try {
    const victimCounsellor = await counsellingAllocationService.getVictimCounsellorProfile(testVictimId);
    assertTest(victimCounsellor.counsellorStatus === 'NOT_ALLOCATED', 'Victim status is NOT_ALLOCATED');
    assertTest(victimCounsellor.counsellor === null, 'Victim has no active counsellor assigned');
  } catch (err: any) {
    assertTest(false, 'Initial unallocated state check', err.message);
  }

  // Test 2: Victim submits request to Admin (VICTIM_TO_ADMIN)
  console.log('\n--- Test 2: Victim Requests Counsellor (VICTIM_TO_ADMIN) ---');
  let victimRequestId = '';
  try {
    const res = await counsellingAllocationService.requestCounsellorAsVictim(
      victimUser,
      'Need support with trauma counselling and court trial preparation.'
    );
    const req = res.request;
    victimRequestId = req._id?.toString() || '';
    assertTest(Boolean(victimRequestId), 'Counselling request created by victim');
    assertTest(req.requestType === 'VICTIM_TO_ADMIN', 'Request type is VICTIM_TO_ADMIN');
    assertTest(req.status === 'PENDING', 'Request status is PENDING');

    const updatedCounsellorState = await counsellingAllocationService.getVictimCounsellorProfile(testVictimId);
    assertTest(updatedCounsellorState.counsellorStatus === 'PENDING', 'Victim status transitioned to PENDING');
    assertTest(updatedCounsellorState.pendingRequest !== null, 'Pending request returned to victim');
  } catch (err: any) {
    assertTest(false, 'Victim counsellor request', err.message);
  }

  // Test 3: Duplicate request prevention
  console.log('\n--- Test 3: Duplicate Request Prevention ---');
  try {
    let duplicateBlocked = false;
    try {
      await counsellingAllocationService.requestCounsellorAsVictim(
        victimUser,
        'Another duplicate request attempt.'
      );
    } catch (dupErr: any) {
      duplicateBlocked = true;
    }
    assertTest(duplicateBlocked, 'Duplicate pending request from same victim is blocked');
  } catch (err: any) {
    assertTest(false, 'Duplicate check', err.message);
  }

  // Test 4: Counsellor views available victims (who need counselling)
  console.log('\n--- Test 4: Counsellor Views Available Victims ---');
  try {
    const unallocated = await counsellingAllocationService.getAvailableVictims(counselorUser);
    const foundVictim = unallocated.find((v) => v.victimId === testVictimId || v.id === testVictimId);
    assertTest(Boolean(foundVictim), 'Counsellor sees unallocated victim in available list');
    assertTest(foundVictim?.counsellorStatus === 'PENDING', 'Victim status accurately shows PENDING');
  } catch (err: any) {
    assertTest(false, 'getAvailableVictims', err.message);
  }

  // Test 5: Admin browses available counsellors
  console.log('\n--- Test 5: Admin Browses Available Counsellors ---');
  try {
    const counsellors = await counsellingAllocationService.getAdminAvailableCounsellors();
    assertTest(counsellors.length > 0, 'Available counsellors list returned');
    const targetCounsellor = counsellors.find((c: any) => c.fullName === 'Dr. Sarah Jenkins' || c._id === 'c1');
    assertTest(Boolean(targetCounsellor), 'Dr. Sarah Jenkins is in available counsellors list');
    assertTest(typeof targetCounsellor?.currentCases === 'number', 'Caseload count metric is present');
  } catch (err: any) {
    assertTest(false, 'getAdminAvailableCounsellors', err.message);
  }

  // Test 6: Admin sends request to Counsellor (ADMIN_TO_COUNSELLOR)
  console.log('\n--- Test 6: Admin Initiates Allocation Request to Counsellor ---');
  let adminToCounsellorReqId = '';
  try {
    const res = await counsellingAllocationService.adminRequestCounsellor(
      adminUser,
      testVictimId,
      'c1',
      'Victim requested trauma and court preparation counselling.'
    );
    const adminReq = res.request;
    adminToCounsellorReqId = adminReq._id?.toString() || '';
    assertTest(Boolean(adminToCounsellorReqId), 'Admin-to-Counsellor request created');
    assertTest(adminReq.requestType === 'ADMIN_TO_COUNSELLOR', 'Request type is ADMIN_TO_COUNSELLOR');
    assertTest(adminReq.status === 'PENDING', 'Request status is PENDING');

    // Verify counsellor received notification
    const counselorNotifs = await notificationsService.getNotifications(counselorUser);
    const notif = counselorNotifs.notifications.find((n: any) => n.type === 'COUNSELLING_REQUEST_CREATED');
    assertTest(Boolean(notif), 'Counsellor received persistent notification for allocation request');
  } catch (err: any) {
    assertTest(false, 'Admin request counsellor', err.message);
  }

  // Test 7: Counsellor rejects request with required reason
  console.log('\n--- Test 7: Counsellor Rejects Allocation Request ---');
  try {
    const rejectionReason = 'Caseload at capacity this week for court hearings; available next month.';
    const res = await counsellingAllocationService.counselorRespondRequest(
      counselorUser,
      adminToCounsellorReqId,
      'REJECT',
      rejectionReason
    );
    const rejectedReq = res.request;
    assertTest(rejectedReq.status === 'REJECTED', 'Request marked REJECTED');
    assertTest(rejectedReq.rejectionReason === rejectionReason, 'Rejection reason recorded');

    // Victim should still be unallocated
    const victimState = await counsellingAllocationService.getVictimCounsellorProfile(testVictimId);
    assertTest(victimState.counsellorStatus !== 'ACTIVE', 'Victim remains unallocated after counsellor rejection');
  } catch (err: any) {
    assertTest(false, 'Counsellor rejection', err.message);
  }

  // Test 8: Counsellor proactively requests to counsel unallocated victim (COUNSELLOR_TO_ADMIN)
  console.log('\n--- Test 8: Counsellor Requests Unallocated Victim (COUNSELLOR_TO_ADMIN) ---');
  let counselorReqId = '';
  try {
    const res = await counsellingAllocationService.counselorRequestVictim(
      counselorUser,
      testVictimId,
      'I specialize in POSH trauma cases and have an opening this week.'
    );
    const cReq = res.request;
    counselorReqId = cReq._id?.toString() || '';
    assertTest(Boolean(counselorReqId), 'Counsellor-to-Admin request created');
    assertTest(cReq.requestType === 'COUNSELLOR_TO_ADMIN', 'Request type is COUNSELLOR_TO_ADMIN');
    assertTest(cReq.status === 'PENDING', 'Request status is PENDING');

    // Admin receives persistent notification
    const adminNotifs = await notificationsService.getNotifications(adminUser);
    const adminNotif = adminNotifs.notifications.find((n: any) => n.type === 'COUNSELLING_REQUEST_CREATED');
    assertTest(Boolean(adminNotif), 'Admin received notification for counsellor request');
  } catch (err: any) {
    assertTest(false, 'Counsellor request to counsel', err.message);
  }

  // Test 9: Admin approves Counsellor request -> Victim becomes ACTIVE
  console.log('\n--- Test 9: Admin Approves Request -> Active Allocation ---');
  try {
    const approvedRes = await counsellingAllocationService.adminApproveCounselorRequest(
      adminUser,
      counselorReqId
    );
    assertTest(approvedRes.request.status === 'APPROVED', 'Request marked APPROVED');

    const victimProfile = await counsellingAllocationService.getVictimCounsellorProfile(testVictimId);
    assertTest(victimProfile.counsellorStatus === 'ACTIVE', 'Victim counsellorStatus is now ACTIVE');
    assertTest(victimProfile.counsellor !== null, 'Victim counsellor profile attached');
  } catch (err: any) {
    assertTest(false, 'Admin approval and active allocation', err.message);
  }

  // Test 10: Victim "My Counsellor" view shows active counsellor
  console.log('\n--- Test 10: Victim "My Counsellor" View ---');
  try {
    const myCounsellor = await counsellingAllocationService.getVictimCounsellorProfile(testVictimId);
    assertTest(myCounsellor.counsellorStatus === 'ACTIVE', 'My Counsellor status is ACTIVE');
    assertTest(myCounsellor.counsellor !== null, 'Active counsellor object returned');
    assertTest(myCounsellor.counsellor?.fullName === counselorUser.fullName, 'Counsellor name matches Dr. Sarah Jenkins');
    assertTest(Boolean(myCounsellor.counsellor?.email), 'Counsellor email present');
  } catch (err: any) {
    assertTest(false, 'Victim view active counsellor', err.message);
  }

  // Test 11: One Victim = One Active Counsellor constraint (409 Conflict)
  console.log('\n--- Test 11: Enforce 1 Victim = 1 Active Counsellor (Conflict Protection) ---');
  try {
    let conflictThrown = false;
    try {
      // Try direct assignment or new request for an already allocated victim
      await counsellingAllocationService.adminRequestCounsellor(
        adminUser,
        testVictimId,
        'c2',
        'Attempting duplicate allocation.'
      );
    } catch (conflictErr: any) {
      if (conflictErr.statusCode === 409 || conflictErr.message?.includes('already been allocated')) {
        conflictThrown = true;
      }
    }
    assertTest(conflictThrown, 'Backend rejects new allocation request for already allocated victim with 409 Conflict');
  } catch (err: any) {
    assertTest(false, '1-to-1 constraint check', err.message);
  }

  // Test 12: Allocated victim is excluded from available victims list
  console.log('\n--- Test 12: Allocated Victim Excluded From Available Victims ---');
  try {
    const available = await counsellingAllocationService.getAvailableVictims(counselorUser);
    const isPresent = available.some((v) => v.victimId === testVictimId);
    assertTest(!isPresent, 'Allocated victim is NOT listed in available/unallocated victims');
  } catch (err: any) {
    assertTest(false, 'Exclusion from available list', err.message);
  }

  // Summary
  console.log('\n===============================================================');
  const passed = testResults.filter((r) => r.passed).length;
  const total = testResults.length;
  console.log(`📊 COUNSELLING ALLOCATION TEST SUMMARY: ${passed}/${total} PASSED`);
  console.log('===============================================================\n');

  return { passed, total, allPassed: passed === total };
}

// CLI execution
if (process.argv[1]?.includes('counselling-allocation')) {
  runCounsellingAllocationTests()
    .then((res) => {
      if (!res.allPassed) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('Test execution error:', err);
      process.exit(1);
    });
}
