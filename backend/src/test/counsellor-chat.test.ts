import { connectDatabase } from '../config/db.js';
import { counsellorChatService } from '../features/counseling/counsellorChat.service.js';
import { authService } from '../features/auth/auth.service.js';
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

export async function runCounsellorChatTests() {
  console.log('\n===============================================================');
  console.log('💬 RUNNING COUNSELLOR CHAT & SUGGESTIONS TEST SUITE');
  console.log('===============================================================\n');

  await connectDatabase();

  // Reset in-memory store
  counsellorChatService._resetMemoryStore();

  // 1. Authenticate Personas
  const counselorAuth = await authService.login({ email: 'counsellor@gmail.com', password: 'MindPulse' });
  const adminAuth = await authService.login({ email: 'admin@gmail.com', password: 'MindPulse' });
  const victimAuth = await authService.login({ email: 'user@gmail.com', password: 'MindPulse' });

  const assignedCounselorUser: TokenPayload = {
    userId: counselorAuth.user.id || 'counselor_sarah_201',
    email: counselorAuth.user.email,
    role: 'COUNSELOR',
    fullName: counselorAuth.user.fullName || 'Dr. Sarah Jenkins',
  };

  const unassignedCounselorUser: TokenPayload = {
    userId: 'counselor_david_202',
    email: 'david.w@counselor.mindpulse.local',
    role: 'COUNSELOR',
    fullName: 'Dr. David Wilson',
  };

  const allocatedVictimUser: TokenPayload = {
    userId: victimAuth.user.id || 'user_alex_101',
    email: victimAuth.user.email,
    role: 'USER',
    fullName: victimAuth.user.fullName || 'Alex Rivera (Protected Witness)',
  };

  const unallocatedVictimUser: TokenPayload = {
    userId: 'user_unallocated_999',
    email: 'unallocated@test.local',
    role: 'USER',
    fullName: 'Unallocated Victim',
  };

  // Test 1: Unallocated victim gets conversation state
  console.log('--- Test 1: Unallocated Victim Conversation Check ---');
  try {
    const unallocatedConv = await counsellorChatService.getOrCreateVictimConversation(unallocatedVictimUser.userId);
    assertTest(unallocatedConv.hasCounsellor === false, 'Unallocated victim correctly identified as having no counsellor');
    assertTest(unallocatedConv.conversation === null, 'No active conversation returned for unallocated victim');
  } catch (err: any) {
    assertTest(false, 'Unallocated victim conversation check', err.message);
  }

  // Test 2: Allocated victim gets or creates active conversation
  console.log('\n--- Test 2: Allocated Victim Active Conversation ---');
  let conversationId = '';
  try {
    const allocatedConv = await counsellorChatService.getOrCreateVictimConversation(allocatedVictimUser.userId);
    conversationId = allocatedConv.conversation?._id?.toString() || '';
    assertTest(allocatedConv.hasCounsellor === true, 'Allocated victim recognized as having active counsellor');
    assertTest(Boolean(conversationId), 'Conversation document generated/retrieved');
    assertTest(allocatedConv.counsellor?.fullName === 'Dr. Sarah Jenkins', 'Assigned counsellor matches Dr. Sarah Jenkins');
  } catch (err: any) {
    assertTest(false, 'Allocated victim conversation retrieval', err.message);
  }

  // Test 3: Victim sends chat message to assigned counsellor
  console.log('\n--- Test 3: Victim Sends Message to Counsellor ---');
  let victimMessageId = '';
  try {
    const msgText = 'Hello Dr. Sarah, I have been feeling anxious about the trial cross-examination next Tuesday.';
    const res = await counsellorChatService.sendVictimMessage(allocatedVictimUser, msgText);
    victimMessageId = res.message._id?.toString() || '';
    assertTest(Boolean(victimMessageId), 'Victim message successfully sent');
    assertTest(res.message.message === msgText, 'Message text matches exactly');
    assertTest(res.message.senderRole === 'USER', 'Sender role is USER');
    assertTest(res.message.read === false, 'Message starts as unread');

    // Verify counsellor received persistent notification
    const counselorNotifs = await notificationsService.getNotifications(assignedCounselorUser);
    const notif = counselorNotifs.notifications.find((n: any) => n.type === 'CHAT_MESSAGE_RECEIVED');
    assertTest(Boolean(notif), 'Counsellor received persistent notification for new chat message');
  } catch (err: any) {
    assertTest(false, 'Victim send message', err.message);
  }

  // Test 4: Counsellor views conversation & unread count resets
  console.log('\n--- Test 4: Counsellor Reads Messages ---');
  try {
    const inbox = await counsellorChatService.getCounsellorInbox(assignedCounselorUser);
    assertTest(inbox.conversations.length > 0, 'Counsellor inbox lists active conversations');

    const convMessages = await counsellorChatService.getCounsellorConversationMessages(
      assignedCounselorUser,
      conversationId
    );
    assertTest(convMessages.messages.length > 0, 'Conversation messages returned to counsellor');
    const readMsg = convMessages.messages.find((m) => m._id === victimMessageId || m.message.includes('anxious'));
    assertTest(readMsg?.read === true, 'Victim message marked as read after counsellor opens conversation');
  } catch (err: any) {
    assertTest(false, 'Counsellor read messages', err.message);
  }

  // Test 5: Counsellor replies to victim
  console.log('\n--- Test 5: Counsellor Sends Reply ---');
  let counsellorReplyId = '';
  try {
    const replyText = 'Hello Alex, I understand. Let us schedule a 15-minute grounding session before Tuesday to prepare.';
    const res = await counsellorChatService.sendCounsellorMessage(
      assignedCounselorUser,
      conversationId,
      replyText
    );
    counsellorReplyId = res.message._id?.toString() || '';
    assertTest(Boolean(counsellorReplyId), 'Counsellor reply created');
    assertTest(res.message.senderRole === 'COUNSELOR', 'Sender role is COUNSELOR');

    // Verify victim receives notification
    const victimNotifs = await notificationsService.getNotifications(allocatedVictimUser);
    const notif = victimNotifs.notifications.find((n: any) => n.type === 'CHAT_MESSAGE_RECEIVED');
    assertTest(Boolean(notif), 'Victim received persistent notification for counsellor reply');
  } catch (err: any) {
    assertTest(false, 'Counsellor send reply', err.message);
  }

  // Test 6: Victim reads messages & unread count resets
  console.log('\n--- Test 6: Victim Fetches Messages & Marks Read ---');
  try {
    const victimHistory = await counsellorChatService.getVictimMessages(allocatedVictimUser.userId);
    assertTest(victimHistory.messages.length >= 2, 'Victim history contains both user message and counsellor reply');
    const replyMsg = victimHistory.messages.find((m) => m._id === counsellorReplyId || m.senderRole === 'COUNSELOR');
    assertTest(replyMsg?.read === true, 'Counsellor reply marked as read for victim');
  } catch (err: any) {
    assertTest(false, 'Victim fetch messages', err.message);
  }

  // Test 7: Strict RBAC: Unassigned counsellor cannot access private conversation (403 Forbidden)
  console.log('\n--- Test 7: Strict RBAC Access Control ---');
  try {
    let accessBlocked = false;
    try {
      await counsellorChatService.getCounsellorConversationMessages(
        unassignedCounselorUser,
        conversationId
      );
    } catch (authErr: any) {
      if (authErr.statusCode === 403 || authErr.message?.includes('Forbidden')) {
        accessBlocked = true;
      }
    }
    assertTest(accessBlocked, 'Unassigned counsellor blocked from viewing private victim conversation (403)');
  } catch (err: any) {
    assertTest(false, 'RBAC conversation isolation', err.message);
  }

  // Test 8: Victim requests a personalized suggestion from counsellor
  console.log('\n--- Test 8: Victim Requests Counsellor Suggestion ---');
  let suggestionRequestId = '';
  try {
    const suggRes = await counsellorChatService.requestCounsellorSuggestion(
      allocatedVictimUser,
      'Need advice regarding sleep disruption and trial preparation.'
    );
    suggestionRequestId = suggRes.suggestionRequest._id?.toString() || '';
    assertTest(Boolean(suggestionRequestId), 'Suggestion request created');
    assertTest(suggRes.suggestionRequest.status === 'PENDING', 'Suggestion status is PENDING');

    // Counsellor receives notification
    const cNotifs = await notificationsService.getNotifications(assignedCounselorUser);
    const suggNotif = cNotifs.notifications.find((n: any) => n.type === 'COUNSELLOR_SUGGESTION_REQUESTED');
    assertTest(Boolean(suggNotif), 'Counsellor received notification for suggestion request');
  } catch (err: any) {
    assertTest(false, 'Victim request suggestion', err.message);
  }

  // Test 9: Duplicate suggestion prevention
  console.log('\n--- Test 9: Duplicate Suggestion Request Prevention ---');
  try {
    let duplicateBlocked = false;
    try {
      await counsellorChatService.requestCounsellorSuggestion(
        allocatedVictimUser,
        'Attempting second simultaneous request'
      );
    } catch (dupErr: any) {
      if (dupErr.statusCode === 400 || dupErr.message?.includes('pending suggestion request')) {
        duplicateBlocked = true;
      }
    }
    assertTest(duplicateBlocked, 'Duplicate active suggestion request prevented with 400 Bad Request');
  } catch (err: any) {
    assertTest(false, 'Duplicate suggestion check', err.message);
  }

  // Test 10: Counsellor responds to suggestion request
  console.log('\n--- Test 10: Counsellor Responds with Suggestion ---');
  try {
    const adviceText =
      'Your recent check-ins show elevated stress and reduced sleep. I recommend maintaining your grounding routine and scheduling a 15-minute preparation check-in before court hearings.';
    const respondRes = await counsellorChatService.respondCounsellorSuggestion(
      assignedCounselorUser,
      suggestionRequestId,
      adviceText
    );
    assertTest(respondRes.suggestion.status === 'RESPONDED', 'Suggestion status updated to RESPONDED');
    assertTest(respondRes.suggestion.suggestionMessage === adviceText, 'Suggestion advice recorded');

    // Victim receives notification
    const vNotifs = await notificationsService.getNotifications(allocatedVictimUser);
    const receivedNotif = vNotifs.notifications.find((n: any) => n.type === 'COUNSELLOR_SUGGESTION_RECEIVED');
    assertTest(Boolean(receivedNotif), 'Victim received persistent notification for completed suggestion');
  } catch (err: any) {
    assertTest(false, 'Counsellor respond suggestion', err.message);
  }

  // Test 11: Victim views suggestions history
  console.log('\n--- Test 11: Victim Suggestion History ---');
  try {
    const suggestions = await counsellorChatService.getVictimSuggestions(allocatedVictimUser.userId);
    assertTest(suggestions.length > 0, 'Victim suggestions history returned');
    const matched = suggestions.find((s) => s._id === suggestionRequestId || s.status === 'RESPONDED');
    assertTest(matched?.status === 'RESPONDED', 'Suggestion displays as RESPONDED to victim');
  } catch (err: any) {
    assertTest(false, 'Victim view suggestions', err.message);
  }

  // Summary
  console.log('\n===============================================================');
  const passed = testResults.filter((r) => r.passed).length;
  const total = testResults.length;
  console.log(`📊 COUNSELLOR CHAT TEST SUMMARY: ${passed}/${total} PASSED`);
  console.log('===============================================================\n');

  return { passed, total, allPassed: passed === total };
}

// CLI execution
if (process.argv[1]?.includes('counsellor-chat')) {
  runCounsellorChatTests()
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
