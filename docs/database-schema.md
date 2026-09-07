# Database Schema — MindPulse Collections (SIH26094)

MindPulse defines 12 specialized Mongoose models designed for data isolation, victim privacy, and modular extensibility under SIH26094 guidelines.

---

## 1. `User`
- `_id`: ObjectId
- `email`: String (unique, indexed)
- `passwordHash`: String
- `fullName`: String
- `role`: Enum [`USER`, `COUNSELOR`, `ADMIN`]
- `victimType`: Enum [`VICTIM`, `COMPLAINANT`, `WITNESS`, `FAMILY_MEMBER`]
- `caseId`: String (e.g. "MP-1042")
- `caseStage`: Enum [`CASE_REGISTRATION`, `INVESTIGATION`, `COURT_TRIAL`, `COMPENSATION`, `REHABILITATION`, `PROTECTION_SUPPORT`]
- `district`: String (e.g. "District Central")
- `state`: String (e.g. "State Alpha")
- `supportStatus`: Enum [`ACTIVE`, `MONITORING`, `ESCALATED`, `RESOLVED`]
- `consentStatus`: Boolean
- `assignedCounselor`: String
- `department`: String
- `isActive`: Boolean
- `createdAt`, `updatedAt`: Date

## 2. `Case`
- `_id`: ObjectId
- `caseId`: String (unique, indexed, e.g. "MP-1042")
- `victimType`: Enum [`VICTIM`, `COMPLAINANT`, `WITNESS`, `FAMILY_MEMBER`]
- `currentStage`: Enum [`CASE_REGISTRATION`, `INVESTIGATION`, `COURT_TRIAL`, `COMPENSATION`, `REHABILITATION`, `PROTECTION_SUPPORT`]
- `priorityScore`: Number (0.00-1.00)
- `district`: String
- `state`: String
- `incidentCategory`: String (e.g. "SC/ST Atrocity Matter")
- `assignedCounselorId`: Ref -> `User`
- `status`: Enum [`ACTIVE`, `PENDING_REVIEW`, `CLOSED`]
- `stages`: Array of `{ stage: String, enteredAt: Date, completedAt: Date, notes: String }`
- `createdAt`, `updatedAt`: Date

## 3. `Consent`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `dataSharingConsent`: Boolean
- `counselorAlertConsent`: Boolean
- `anonymousResearchConsent`: Boolean
- `version`: String
- `agreedAt`: Date

## 4. `CheckIn`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `caseId`: String
- `caseStage`: Enum [`CASE_REGISTRATION`, `INVESTIGATION`, `COURT_TRIAL`, `COMPENSATION`, `REHABILITATION`, `PROTECTION_SUPPORT`]
- `mood`: Number (1-10)
- `stress`: Number (1-10)
- `energy`: Number (1-10)
- `sleepHours`: Number (0-24)
- `senseOfSafety`: Number (1-10)
- `caseRelatedStress`: Number (1-10)
- `supportAvailability`: Number (1-10)
- `optionalNote`: String
- `timestamp`: Date (indexed)

## 5. `JournalEntry`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `title`: String
- `content`: String
- `sentiment`: Enum [`positive`, `neutral`, `negative`]
- `stressSignal`: Number (0.00-1.00)
- `emotionSignals`: Array of Strings (e.g. ["hearing_anxiety", "safety_concern", "hypervigilance"])
- `isPrivate`: Boolean
- `createdAt`, `updatedAt`: Date

## 6. `RiskScore`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `caseId`: String
- `riskScore`: Number (0.00-1.00)
- `riskLevel`: Enum [`STABLE`, `WATCH`, `ELEVATED`, `REQUIRES_REVIEW`]
- `factors`: Array of `{ feature: String, impact: Number, description: String }`
- `anomalyScore`: Number
- `modelVersion`: String
- `calculatedAt`: Date (indexed)

## 7. `Alert`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `caseId`: String
- `riskLevel`: Enum [`WATCH`, `COUNSELOR_REVIEW`]
- `status`: Enum [`OPEN`, `ACKNOWLEDGED`, `RESOLVED`]
- `triggerReason`: String
- `assignedCounselorId`: Ref -> `User`
- `createdAt`, `updatedAt`: Date

## 8. `Intervention`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `caseId`: String
- `counselorId`: Ref -> `User` (indexed)
- `type`: Enum [`COUNSELLING`, `LEGAL_AID`, `PROTECTION_SUPPORT`, `RELOCATION_SUPPORT`, `FINANCIAL_ASSISTANCE`, `REHABILITATION_SUPPORT`, `PROFESSIONAL_REFERRAL`, `OTHER`]
- `status`: Enum [`PLANNED`, `ACTIVE`, `COMPLETED`, `FOLLOW_UP_REQUIRED`]
- `supportPathway`: String
- `preInterventionStress`: Number
- `postInterventionStress`: Number
- `clinicalNotes`: String
- `scheduledDate`: Date
- `createdAt`, `updatedAt`: Date

## 9. `Recommendation`
- `_id`: ObjectId
- `title`: String
- `category`: Enum [`BREATHING`, `SLEEP`, `LEGAL_AID`, `VICTIM_COMPENSATION`, `WITNESS_PROTECTION`, `COUNSELING_PATHWAY`, `DISTRICT_WELFARE`, `CRISIS_CONTACT`]
- `description`: String
- `actionUrl`: String
- `targetRiskLevels`: Array of Strings
- `isNonClinical`: Boolean

## 10. `AuditLog`
- `_id`: ObjectId
- `actorId`: Ref -> `User` (indexed)
- `action`: String
- `resourceType`: String
- `resourceId`: String
- `ipAddress`: String
- `timestamp`: Date (indexed)

