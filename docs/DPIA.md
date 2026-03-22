# Data Protection Impact Assessment (DPIA)

**Product:** 8gent Jr (8gentjr.com) -- AAC Communication App for Children
**Controller:** James Spalding, operating as 8gent, Ireland
**Jurisdiction:** Irish Data Protection Commission (DPC), GDPR
**Assessment date:** 22 March 2026
**Status:** Working draft -- pre-launch

This DPIA is conducted under GDPR Article 35, which mandates an impact assessment before processing that is "likely to result in a high risk to the rights and freedoms of natural persons." 8gent Jr meets multiple triggers for mandatory DPIA:

- Processing of children's data (Recital 38)
- Special category data relating to health/disability (Article 9)
- Systematic monitoring of data subjects (usage tracking for personalization)
- New technology applied to vulnerable individuals
- EU AI Act high-risk classification for education AI (effective 2 August 2026)

---

## 1. Description of Processing

### 1.1 What 8gent Jr Does

8gent Jr is a web-based AAC (Augmentative and Alternative Communication) application. Children with communication disabilities (autism, apraxia, developmental delays) use picture cards to build sentences that are spoken aloud via text-to-speech. The app personalizes card suggestions based on usage patterns to reduce the number of taps needed to communicate.

### 1.2 Categories of Data Subjects

| Category | Description | Age Range |
|----------|-------------|-----------|
| **Children** | Primary users of the AAC interface | 2--16 years |
| **Parents/Guardians** | Account holders who manage settings, consent, and data | 18+ |

Ireland's digital age of consent is 16 (Data Protection Act 2018, Section 31). All child users require verifiable parental consent.

### 1.3 Data Collected -- Per Database Table

#### `tenants` -- Child Profile (one record per child)

| Field | Purpose | Special Category? |
|-------|---------|-------------------|
| `subdomain` | URL routing (e.g. nick.8gentjr.com) | No |
| `displayName` | Shown in UI, chosen by parent | No |
| `dateOfBirth` | Age-appropriate content filtering | No (but sensitive for a child) |
| `mode` | "kid" or "adult" -- controls UI complexity | No |
| `preferences.themeColor` | Visual customization | No |
| `preferences.voiceId` | Selected TTS voice | No |
| `preferences.ttsRate` | Speech rate (0.5--2.0) | Potentially -- slow rate may indicate motor/cognitive needs |
| `preferences.cardSize` | Small/medium/large display | Potentially -- large cards may indicate visual/motor needs |
| `preferences.showLabels` | Whether text labels appear on cards | No |
| `preferences.enableAnimations` | Animation toggle | Potentially -- disabling may indicate sensory sensitivity |

#### `userCards` -- Card Customization (one document per child)

| Field | Purpose | Special Category? |
|-------|---------|-------------------|
| `cards[]` | Custom AAC cards created by parent | Yes -- card vocabulary reveals communication needs |
| `favorites[]` | Frequently needed card IDs | Yes -- reveals communication patterns |
| `recentlyUsed[]` | Last 20 card IDs used | Yes -- reveals current communication focus |
| `hiddenCards[]` | Cards removed from view | Potentially -- may indicate developmental stage |

#### `sentenceHistory` -- Communication Records

| Field | Purpose | Special Category? |
|-------|---------|-------------------|
| `sentence` | Full text of spoken sentence | Yes -- reveals communication ability and content |
| `cardIds[]` | Which cards were combined | Yes -- reveals communication patterns |
| `spokenAt` | Timestamp | No alone, but temporal patterns are sensitive |

This is the most sensitive table. Sentence history directly reveals a child's communication ability, vocabulary level, and what they talk about. Combined with timestamps, it creates a detailed behavioral profile of a child with a disability.

#### `consentRecords` -- GDPR Audit Trail

| Field | Purpose | Special Category? |
|-------|---------|-------------------|
| `consentType` | What was consented to | No |
| `granted` / `grantedAt` / `withdrawnAt` | Consent state | No |
| `ipAddress` | Verification of consenting party | No (but personal data) |
| `userAgent` | Browser/device at time of consent | No |
| `version` | Privacy policy version | No |

Consent records are immutable. They are never deleted, only marked as withdrawn. This is required under GDPR Article 7(1) to demonstrate that consent was validly obtained.

#### Client-Side Data (localStorage -- never leaves the device)

| Storage Key | Contents | Synced to Server? |
|-------------|----------|-------------------|
| `8gent-jr-personalization` | Word frequency, category frequency, sentence lengths, active dates, total interaction count | **No** |
| `8gent-jr-session-events` | Timestamped events: card taps, sentence builds, game scores, category taps, settings changes | **No** |
| `8gent-jr-session-history` | Session summaries: duration, unique words, sentences spoken, games played (last 50 sessions) | **No** |

The personalization engine and session logger operate entirely in the browser. This is a deliberate data minimization choice -- behavioral analytics stay on-device and are never transmitted to the server.

### 1.4 Data Flows

```
Child uses AAC board (browser)
    |
    +--> Card taps, sentences --> localStorage (personalization + session logger)
    |                             [STAYS ON DEVICE]
    |
    +--> Sentence spoken --> Convex DB: sentenceHistory table
    |                        [SERVER-SIDE, per-tenant isolation]
    |
    +--> Custom cards, favorites --> Convex DB: userCards table
    |
    +--> TTS request --> Browser Speech Synthesis API (local)
    |                    OR ElevenLabs API (voice ID only, no child data sent)
    |
Parent manages account (browser)
    |
    +--> Consent grants/withdrawals --> Convex DB: consentRecords
    +--> Data export (Article 20) --> JSON download to parent's device
    +--> Data deletion (Article 17) --> Server-side deletion of all child data
```

### 1.5 Sub-Processors

| Sub-Processor | Role | Data Accessed | DPA in Place? |
|---------------|------|---------------|---------------|
| Convex | Database hosting and real-time sync | All server-side data | Required before launch |
| Vercel | Web application hosting | HTTP request logs (IP, user-agent) | Required before launch |
| Clerk | Authentication | Parent email, OAuth tokens | Required before launch |
| ElevenLabs | Text-to-speech (optional) | Voice ID setting only; spoken text processed but not stored | Required before launch |

No sub-processor receives the child's name, disability status, or communication history in identifiable form. ElevenLabs receives the text to be spoken but has no identifier linking it to a specific child.

---

## 2. Legal Basis

### 2.1 Parental Consent -- Article 6(1)(a) + Article 8

All processing of children's data is based on parental consent. The consent flow works as follows:

1. Parent creates an account (Clerk authentication)
2. Parent creates a tenant (child profile)
3. Before the child can use the app, the parent must grant consent via the `grantConsents` mutation
4. Two consents are **required** before any processing begins:
   - `data_processing` -- basic data processing consent
   - `health_data` -- explicit consent for special category data (Article 9)
5. Two consents are **optional**:
   - `personalization` -- consent for learning/recommendation features
   - `analytics` -- consent for usage analytics

The `hasRequiredConsents` query is checked before the AAC board loads. If either required consent is missing, the app does not function.

### 2.2 Explicit Consent for Health Data -- Article 9(2)(a)

The use of an AAC app inherently reveals that a child has a communication disability. This constitutes special category data under Article 9. We rely on the explicit consent of the parent (as holder of parental responsibility) under Article 9(2)(a).

The consent is:

- **Freely given** -- the parent chooses to use the app; there is no coercion or bundling with unrelated services
- **Specific** -- health data consent is a separate consent type (`health_data`), not bundled with basic processing
- **Informed** -- the privacy policy explains exactly what health-related data is processed and why
- **Unambiguous** -- consent is granted via an affirmative action (explicit toggle/button), not pre-ticked
- **Withdrawable** -- the `withdrawConsent` mutation allows withdrawal at any time

### 2.3 Legitimate Interest -- Article 6(1)(f)

We claim legitimate interest **only** for:

- Crash reports and error logs (30-day retention)
- Essential security measures (authentication, rate limiting)

We do **not** claim legitimate interest for any processing of children's communication data, personalization data, or behavioral patterns. For children's data, consent is the sole legal basis.

### 2.4 Legal Obligation -- Article 6(1)(c)

Consent records are retained for 7 years under legal obligation to demonstrate that valid consent was obtained (Article 7(1)).

---

## 3. Necessity and Proportionality

### 3.1 Why Each Data Type Is Necessary

| Data Type | Necessity | What Happens Without It |
|-----------|-----------|------------------------|
| Sentence history | Powers next-card prediction, reducing taps needed to communicate | Child must manually search for every card every time -- significantly slower communication |
| Card favorites/recently used | Surfaces most-needed cards first | Child sees generic card order that doesn't match their vocabulary |
| Custom cards | Parents create cards for child-specific needs (pet names, places, routines) | Limited to default vocabulary that cannot represent the child's life |
| Voice preferences | Some children only respond to specific voice types/speeds | TTS may be unintelligible or distressing to the child |
| Accessibility settings (card size, animations) | Motor and sensory accommodations | App may be physically unusable for children with motor or sensory processing differences |

### 3.2 Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| No server-side storage at all | Sentence history and custom cards would be lost if the browser cache is cleared. For a child who depends on AAC for daily communication, losing their vocabulary is a serious harm. |
| Anonymous/pseudonymous processing only | Per-child isolation requires an identifier. We use Convex document IDs (opaque strings) rather than real names. The subdomain is parent-chosen and need not be the child's real name. |
| Processing all analytics server-side | Rejected in favor of localStorage-only analytics. The personalization engine and session logger deliberately run client-side to minimize server-side data. |
| Aggregate-only sentence history | Would break per-child prediction. The whole point of AAC personalization is adapting to one specific child's patterns. |

### 3.3 Data Minimization Measures

1. **Client-side by default.** The personalization engine (`personalization.ts`) and session logger (`session-logger.ts`) store all behavioral data in localStorage. Word frequency maps, category frequency, sentence lengths, session events, and session summaries never leave the device.

2. **No real names required.** The tenant `displayName` and `subdomain` are parent-chosen. The app does not ask for or store the child's legal name.

3. **No photos, location, microphone, or biometrics.** The app does not request access to camera, GPS, microphone, or any biometric sensors.

4. **Per-tenant isolation.** All data is scoped to a tenant ID. There is no cross-child analysis, no aggregation across children, and no global models trained on individual children's data.

5. **Minimal server-side storage.** Only three types of child-related data are stored server-side: sentence history (for persistence across devices), user cards (custom vocabulary), and tenant preferences (voice/display settings).

6. **Recently used capped at 20.** The `recentlyUsed` array stores a maximum of 20 card IDs, limiting the temporal window of usage tracking.

7. **Session history capped at 50.** Client-side session history retains only the last 50 session summaries.

---

## 4. Risk Assessment

### 4.1 Risk Matrix

| # | Risk | Likelihood | Severity | Overall | Justification |
|---|------|-----------|----------|---------|---------------|
| R1 | **Unauthorized access to child's communication data** -- breach exposes what a disabled child communicates about | Low | High | **High** | Convex provides authentication and per-tenant isolation, but a breach would expose deeply personal data about a vulnerable child. The reputational and psychological harm is severe. |
| R2 | **Behavioral profiling of children** -- communication patterns used to build developmental profiles without clinical oversight | Medium | High | **High** | The app tracks card usage to improve predictions. Without safeguards, this data could be interpreted as a developmental assessment. Parents and third parties might draw clinical conclusions from usage patterns. |
| R3 | **Discriminatory use of disability data** -- data revealing a child's disability is used to their detriment (insurance, education, employment) | Low | High | **Medium** | The data stays within the app ecosystem with no third-party sharing. Risk is primarily from a data breach or future policy change. The long-term risk of disability data persisting is real. |
| R4 | **Inappropriate personalization** -- prediction engine reinforces limited vocabulary rather than encouraging growth | Medium | Medium | **Medium** | If the system only surfaces frequently used cards, a child's vocabulary may plateau. The recommendation engine suggests underused words, but this is a known tension in AAC design. |
| R5 | **Consent validity** -- parent's consent does not meet GDPR standards (not sufficiently informed, not freely given) | Low | High | **Medium** | The consent flow requires explicit action for each consent type. The privacy policy is written in plain language. A child-friendly version exists. Risk is low but consequence of invalid consent is that all processing is unlawful. |
| R6 | **Child accesses parent controls** -- child modifies settings or deletes their own data | Low | Medium | **Low** | Parent admin panel is not currently PIN-protected in the codebase. A child with sufficient capability could access settings. |
| R7 | **Data retention exceeding necessity** -- sentence history retained indefinitely when 90 days would suffice for prediction | Medium | Medium | **Medium** | Current implementation retains sentence history until explicit deletion. The privacy policy states "until you request deletion" for communication patterns. A time-based auto-deletion policy should be implemented. |
| R8 | **Social development inference** -- communication patterns reveal social relationships, emotional states, or developmental regression | Medium | High | **High** | Sentence content like "I feel sad" or "no school" combined with frequency/timing data could reveal emotional distress or social difficulties. This data is especially sensitive for children in care or custody situations. |
| R9 | **Loss of AAC data** -- accidental deletion or corruption removes a child's communication vocabulary | Low | High | **Medium** | For a child who depends on AAC, losing their personalized vocabulary is functionally equivalent to losing their voice. Data export exists but must be proactively used. |
| R10 | **EU AI Act non-compliance** -- personalization/prediction engine classified as high-risk AI in education | Medium | High | **High** | The card prediction engine uses frequency-based algorithms to suggest next cards. Under the EU AI Act (effective August 2026), AI systems in education involving children may be classified as high-risk, requiring conformity assessment, technical documentation, and human oversight. |

### 4.2 Summary of High Risks

Three risks are rated **High** overall:

1. **R1 (Unauthorized access)** -- mitigated by technical security measures but residual risk remains due to the sensitivity of the data subjects.
2. **R8 (Social development inference)** -- inherent to any system that records what a child communicates. Partially mitigated by data minimization and retention limits.
3. **R10 (EU AI Act)** -- the prediction engine must be assessed against AI Act requirements before the August 2026 deadline.

---

## 5. Mitigation Measures

### 5.1 Implemented Safeguards

| Measure | Implementation | Addresses Risk |
|---------|---------------|----------------|
| **Mandatory parental consent gate** | `hasRequiredConsents` query blocks AAC board until `data_processing` and `health_data` consents are granted | R5 |
| **Granular consent types** | 4 separate consent types: `data_processing` (required), `health_data` (required), `personalization` (optional), `analytics` (optional) | R2, R5 |
| **Consent withdrawal** | `withdrawConsent` mutation marks consent as withdrawn with timestamp; original record preserved for audit | R5 |
| **Immutable consent audit trail** | Consent records are never deleted, only timestamped as withdrawn. Retained for 7 years. | R5 |
| **Data deletion (Article 17)** | `deleteChildData` mutation removes all userCards, sentenceHistory, and resets tenant preferences | R1, R3, R7 |
| **Data export (Article 20)** | `exportChildData` mutation returns structured JSON of all child data for download | R9 |
| **Per-child tenant isolation** | All data keyed by `tenantId`. No cross-tenant queries. No global aggregation. | R1, R2, R3 |
| **Client-side analytics** | Personalization engine and session logger use localStorage only. Behavioral data never transmitted to server. | R2, R8 |
| **No third-party data sharing** | No advertising SDKs, no third-party analytics, no data brokers | R3 |
| **No advertising** | Zero advertising in the product. No ad-related data collection. | R3 |
| **No automated decision-making with legal effects** | Card prediction is a convenience feature. No decisions about the child's education, care, or access to services are made by the system. | R2, R10 |
| **Privacy policies** | Parent-facing privacy policy with specific data tables, retention periods, and DPC contact. Child-friendly version available at `/privacy/kids`. | R5 |
| **Owner-only data operations** | `requireOwner` check ensures only the parent (tenant owner) can export or delete data | R1, R6 |
| **Vocabulary growth recommendations** | `getRecommendedWords` and `getRecommendations` functions suggest underused words and categories to counter vocabulary stagnation | R4 |

### 5.2 Measures Required Before Launch

| Measure | Priority | Addresses Risk | Status |
|---------|----------|----------------|--------|
| **Automatic data retention enforcement** -- server-side deletion of sentence history older than 90 days, game activity older than 30 days | High | R7 | Not yet implemented |
| **PIN-protected parent admin panel** -- prevent child from accessing data management or settings | Medium | R6 | Referenced in privacy policy but not verified in codebase |
| **Sub-processor DPAs** -- execute Data Processing Agreements with Convex, Vercel, Clerk, and ElevenLabs | High | R1 | Required before launch |
| **Encryption at rest audit** -- verify that Convex encrypts stored data at rest | High | R1 | Verify with Convex |
| **Breach notification procedure** -- documented process for notifying DPC within 72 hours and affected parents without undue delay (Articles 33-34) | High | R1 | Not yet documented |
| **EU AI Act conformity assessment** -- evaluate prediction engine against Annex III high-risk criteria | High | R10 | Due before August 2026 |
| **Data Protection Officer assessment** -- determine if a DPO appointment is required given the scale and nature of processing | Medium | All | Not yet assessed |
| **Age verification for parental consent** -- implement reasonable measures to verify that the person consenting is actually the parent/guardian | Medium | R5 | Not yet implemented |
| **Backup and recovery procedure** -- document how child AAC data is backed up and can be restored | Medium | R9 | Not yet documented |

---

## 6. Data Retention Schedule

| Data Type | Retention Period | Justification | Deletion Method |
|-----------|-----------------|---------------|-----------------|
| Communication card usage (recentlyUsed) | Rolling window of 20 items | Immediate personalization -- surfaces most-used cards | Automatically capped at 20 entries |
| Sentence history (sentenceHistory) | 90 days | Powers next-card prediction; older data has diminishing predictive value | Auto-deletion to be implemented; manual deletion via `deleteChildData` available now |
| Game activity (session events) | 30 days | Short-term progress tracking | Client-side only (localStorage); auto-pruned to last 50 sessions |
| Personalization profiles (tenant preferences) | Until deletion requested | Core service function -- voice, display, accessibility settings | Deleted via `deleteChildData` or account deletion |
| Custom cards (userCards) | Until deletion requested | Parent-created vocabulary essential for child's communication | Deleted via `deleteChildData` or account deletion |
| Consent records (consentRecords) | 7 years from date of grant | Legal audit trail requirement under GDPR Article 7(1) | Automated deletion after 7-year period (to be implemented) |
| Account data (users, tenants) | Until account deleted | Service provision | Parent-initiated account deletion |
| Client-side behavioral data (localStorage) | Until browser data cleared | On-device personalization; never transmitted to server | Cleared by browser, or by `CLEAR_LOCAL_STORAGE` instruction after data deletion |
| Crash reports and error logs | 30 days | Debugging and stability | Automatic expiry |
| HTTP access logs (Vercel) | Per Vercel's retention policy | Infrastructure operation | Managed by sub-processor |

**Note:** The privacy policy currently states communication patterns are retained "until you request deletion." The 90-day auto-deletion for sentence history should be implemented before launch to align with the data minimization principle and to reduce the risk profile of a potential breach.

---

## 7. DPC Consultation

### 7.1 Residual Risk Assessment

After implementing all measures listed in Section 5, the following residual risks remain:

- **R1 (Unauthorized access):** Reduced to Medium. Technical controls are in place but the inherent sensitivity of the data means any breach has high impact.
- **R8 (Social development inference):** Reduced to Medium. Data minimization helps but the fundamental nature of recording a child's communication means some inference risk is inherent to the service.
- **R10 (EU AI Act):** Remains High until conformity assessment is completed.

### 7.2 Prior Consultation Decision

Under GDPR Article 36, prior consultation with the supervisory authority is required if residual risk remains high after mitigation. Given that:

1. The data subjects are children, a specifically protected category under GDPR
2. The data is special category (health/disability)
3. The EU AI Act assessment is pending
4. This is a new product without established processing history

**Recommendation:** Seek prior consultation with the Irish DPC before public launch. Even if not strictly required after all mitigations are implemented, voluntary consultation demonstrates good faith and may surface issues we have not identified.

### 7.3 DPC Contact Details

| | |
|-|-|
| **Authority** | Data Protection Commission (An Coimisiun um Chosaint Sonrai) |
| **Address** | 21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland |
| **Phone** | +353 (0)1 765 0100 / 1800 437 737 |
| **Email** | info@dataprotection.ie |
| **Website** | https://www.dataprotection.ie |
| **Online form** | https://forms.dataprotection.ie/contact |

---

## 8. Review Schedule

| Event | Action |
|-------|--------|
| **Annual review** | Full DPIA review including risk re-assessment |
| **New data types added** | DPIA amendment before processing begins |
| **Processing purpose changes** | DPIA amendment before new processing begins |
| **New sub-processor added** | Risk assessment and DPA before engagement |
| **Security incident** | Immediate DPIA review |
| **EU AI Act effective date (2 August 2026)** | Conformity assessment and DPIA update |
| **Significant user base growth** | Re-assess DPO requirement and scale of processing |

| | Date |
|-|-|
| **DPIA created** | 22 March 2026 |
| **Last reviewed** | 22 March 2026 |
| **Next review due** | 22 September 2026 |

---

## Appendix A: Relevant Legislation

- **GDPR** -- Regulation (EU) 2016/679, in particular Articles 5, 6, 7, 8, 9, 17, 20, 25, 32, 35, 36
- **Data Protection Act 2018** (Ireland) -- Section 31 (age of digital consent: 16)
- **EU AI Act** -- Regulation (EU) 2024/1689, Annex III (high-risk AI systems in education)
- **ePrivacy Directive** -- Directive 2002/58/EC (cookies and electronic communications)
- **GDPR Recital 38** -- Children merit specific protection with regard to their personal data
- **GDPR Recital 71** -- Profiling of children should not be based solely on automated processing

## Appendix B: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 22 March 2026 | James Spalding | Initial draft based on codebase analysis |
