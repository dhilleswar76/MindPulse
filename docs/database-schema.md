# Database Schema — MindPulse Collections

MindPulse defines 11 specialized Mongoose models designed for data isolation, privacy, and modular extensibility.

---

## 1. `User`
- `_id`: ObjectId
- `email`: String (unique, indexed)
- `passwordHash`: String
- `fullName`: String
- `role`: Enum [`USER`, `COUNSELOR`, `ADMIN`]
- `department`: String (e.g. "Computer Science", "Engineering")
- `yearOfStudy`: Number
- `isActive`: Boolean
- `createdAt`, `updatedAt`: Date

## 2. `Consent`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `dataSharingConsent`: Boolean
- `counselorAlertConsent`: Boolean
- `anonymousResearchConsent`: Boolean
- `version`: String
- `agreedAt`: Date

## 3. `CheckIn`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `mood`: Number (1-10)
- `stress`: Number (1-10)
- `energy`: Number (1-10)
- `sleepHours`: Number (0-24)
- `optionalNote`: String
- `timestamp`: Date (indexed)

## 4. `JournalEntry`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `title`: String
- `content`: String
- `sentiment`: Enum [`positive`, `neutral`, `negative`]
- `stressSignal`: Number (0.00-1.00)
- `emotionSignals`: Array of Strings (e.g. ["anxiety", "fatigue"])
- `isPrivate`: Boolean
- `createdAt`, `updatedAt`: Date

## 5. `RiskScore`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `riskScore`: Number (0.00-1.00)
- `riskLevel`: Enum [`STABLE`, `WATCH`, `ELEVATED`, `REQUIRES_REVIEW`]
- `factors`: Array of `{ feature: String, impact: Number }`
- `anomalyScore`: Number
- `modelVersion`: String
- `calculatedAt`: Date (indexed)

## 6. `RiskFactor`
- `_id`: ObjectId
- `riskScoreId`: Ref -> `RiskScore`
- `featureName`: String
- `shapValue`: Number
- `baselineDelta`: Number

## 7. `Alert`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `riskLevel`: Enum [`WATCH`, `COUNSELOR_REVIEW`]
- `status`: Enum [`OPEN`, `ACKNOWLEDGED`, `RESOLVED`]
- `triggerReason`: String
- `assignedCounselorId`: Ref -> `User`
- `createdAt`, `updatedAt`: Date

## 8. `Intervention`
- `_id`: ObjectId
- `userId`: Ref -> `User` (indexed)
- `counselorId`: Ref -> `User` (indexed)
- `type`: Enum [`CHECK_IN_CHAT`, `COUNSELING_SESSION`, `RESOURCE_REFERRAL`, `ACADEMIC_ADJUSTMENT`]
- `status`: Enum [`PLANNED`, `ACTIVE`, `COMPLETED`, `FOLLOW_UP_REQUIRED`]
- `clinicalNotes`: String
- `scheduledDate`: Date
- `createdAt`, `updatedAt`: Date

## 9. `FollowUp`
- `_id`: ObjectId
- `interventionId`: Ref -> `Intervention` (indexed)
- `dueDate`: Date
- `completed`: Boolean
- `notes`: String

## 10. `Recommendation`
- `_id`: ObjectId
- `title`: String
- `category`: Enum [`BREATHING`, `SLEEP`, `MINDFULNESS`, `CAMPUS_RESOURCE`, `CRISIS_CONTACT`]
- `description`: String
- `actionUrl`: String
- `targetRiskLevels`: Array of Strings

## 11. `AuditLog`
- `_id`: ObjectId
- `actorId`: Ref -> `User` (indexed)
- `action`: String
- `resourceType`: String
- `resourceId`: String
- `ipAddress`: String
- `timestamp`: Date (indexed)
