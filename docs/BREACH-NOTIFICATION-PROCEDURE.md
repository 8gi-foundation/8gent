# Data Breach Notification Procedure

**Product:** 8gent Jr (8gentjr.com) -- AAC Communication App for Children
**Controller:** James Spalding, operating as 8gent, Ireland
**Supervisory Authority:** Irish Data Protection Commission (DPC)
**Effective date:** 23 March 2026
**Related documents:** [DPIA](./DPIA.md), Privacy Policy

---

## 1. Purpose and Scope

This procedure governs the detection, assessment, notification, and resolution of all personal data breaches affecting 8gent Jr users. It implements the requirements of GDPR Articles 33 and 34.

8gent Jr processes children's health-related data (AAC communication records, disability-indicating preferences). Breaches involving this data are treated as HIGH severity by default. The 72-hour DPC notification clock starts the moment any team member becomes aware of a breach.

This procedure applies to breaches originating from:

- 8gent systems directly
- Sub-processors (Convex, Vercel, Clerk, ElevenLabs)
- Unauthorized access by any party
- Accidental loss, destruction, or disclosure

---

## 2. Definitions

**Personal data breach** (Article 4(12)): A breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, personal data.

| Category | Description | Example |
|----------|-------------|---------|
| **Confidentiality** | Unauthorized disclosure or access | Sentence history exposed via API vulnerability |
| **Integrity** | Unauthorized alteration | Child's custom cards modified by unauthorized party |
| **Availability** | Loss of access or destruction | Convex outage causing loss of AAC vocabulary data |

---

## 3. Detection and Reporting

### Detection Sources

| Source | Examples |
|--------|---------|
| **Automated monitoring** | Error rate spikes, unauthorized API access patterns, Convex audit logs |
| **Sub-processor notification** | Convex, Vercel, Clerk, or ElevenLabs reports an incident |
| **User report** | Parent reports suspicious activity or data they should not see |
| **Internal discovery** | Team member identifies a vulnerability or data exposure |
| **External report** | Security researcher, DPC inquiry, or media report |

### Internal Reporting Chain

1. **Anyone** who suspects a breach reports immediately to the Data Controller (James Spalding)
2. The Data Controller acknowledges receipt and begins assessment within **1 hour**
3. The 72-hour clock starts at the moment the Controller becomes aware
4. If the Controller is unavailable for more than 4 hours, the next available team member with system access acts as interim Controller

**Contact:** james@8gent.app | Telegram: @jamesspalding

---

## 4. Severity Assessment

Assess every breach against this matrix within **4 hours** of detection.

### Severity Matrix

| Severity | Criteria | Examples | DPC Notification | Data Subject Notification |
|----------|----------|----------|------------------|--------------------------|
| **HIGH** | Children's sentence history, card data, health-indicating preferences, or identity data exposed or compromised | Sentence history database leaked; child profiles accessible without auth; custom AAC cards exposed | Required (72h) | Required |
| **MEDIUM** | Parent authentication data, email addresses, or consent records exposed | Clerk auth tokens leaked; parent emails exposed via API | Required (72h) | Likely required -- assess on case basis |
| **LOW** | Non-personal technical data, anonymized/aggregated data, or data already public | Error logs with no PII; anonymized usage metrics | Log only | Not required |

### Assessment Factors

- [ ] Does the breach involve children's data?
- [ ] Does the breach involve special category data (health/disability)?
- [ ] How many data subjects are affected?
- [ ] Is the data sufficient to identify a specific child?
- [ ] Has the data been accessed by a malicious actor (vs. accidental exposure)?
- [ ] Is the data encrypted or otherwise unintelligible to unauthorized parties?
- [ ] Can the breach be contained (data recalled, access revoked)?

**Default assumption:** Any breach involving children's communication data or disability-indicating data is HIGH severity unless evidence demonstrates otherwise. The burden of proof is on downgrading, not upgrading.

---

## 5. DPC Notification (Article 33)

### When to Notify

Notify the DPC within **72 hours** of becoming aware of any breach that is not LOW severity. If you cannot determine severity within 72 hours, notify anyway and provide additional details later (Article 33(4) permits phased notification).

### How to Notify

| | |
|-|-|
| **Online portal** | https://forms.dataprotection.ie/ |
| **Address** | Data Protection Commission, 21 Fitzwilliam Square South, Dublin 2, D02 RD28 |
| **Phone** | +353 (0)1 765 0100 / 1800 437 737 |
| **Email** | info@dataprotection.ie |

Use the online portal as the primary channel. Follow up by email if the portal is unavailable.

### Notification Content (Article 33(3))

The notification must include:

| Field | Content |
|-------|---------|
| **Nature of the breach** | Confidentiality / integrity / availability; what happened |
| **Data categories** | Children's AAC sentence history, custom cards, disability-indicating preferences, parent email/auth data (as applicable) |
| **Data subject categories** | Children aged 2-16 with communication disabilities; parents/guardians |
| **Approximate number of data subjects** | Best estimate at time of notification |
| **Approximate number of records** | Best estimate at time of notification |
| **Contact details** | James Spalding, james@8gent.app |
| **Likely consequences** | Risk of identification of child's disability status, exposure of communication patterns, emotional/psychological harm to child and family |
| **Measures taken or proposed** | Containment actions, remediation steps, data subject notifications planned |

### If Notification Is Delayed Beyond 72 Hours

Document the reasons for the delay. GDPR requires the delay to be justified. Submit as soon as possible with an explanation.

---

## 6. Data Subject Notification (Article 34)

### When to Notify

Notify affected data subjects (parents/guardians) when a breach is **likely to result in a high risk** to the rights and freedoms of individuals.

For 8gent Jr, the threshold is effectively: **always notify for HIGH severity breaches.** Children's health-related communication data is among the most sensitive categories under GDPR. When in doubt, notify.

### Exceptions (Article 34(3))

Notification is not required only if:

1. The data was encrypted and the keys were not compromised, OR
2. Measures have been taken that eliminate the high risk, OR
3. It would involve disproportionate effort (in which case, make a public communication instead)

### How to Notify

- **Primary:** Email to the parent's registered email address
- **Secondary:** In-app notification on next login
- **Fallback:** Public notice on 8gentjr.com if email delivery fails

### Notification Content

Write in plain language. The audience is parents, not lawyers.

The notification must include:

- [ ] What happened (in plain terms)
- [ ] What data was affected (sentence history, cards, preferences -- be specific)
- [ ] What we are doing about it
- [ ] What the parent should do (change password, monitor for misuse, etc.)
- [ ] Contact details for questions: james@8gent.app
- [ ] DPC contact details for complaints: https://forms.dataprotection.ie/contact

### Timing

Notify data subjects **without undue delay** after becoming aware. Do not wait for the DPC notification to be submitted first -- these are parallel obligations.

---

## 7. Sub-Processor Obligations

Each sub-processor must notify 8gent **without undue delay** upon becoming aware of a breach affecting 8gent Jr data. This obligation must be in the Data Processing Agreement (DPA) with each processor.

| Sub-Processor | Data They Hold | DPA Requirement |
|---------------|----------------|-----------------|
| **Convex** | All server-side child data (sentences, cards, preferences, consent records) | Must notify within 24 hours; provide breach details sufficient for DPC notification |
| **Vercel** | HTTP request logs (IP addresses, user-agents) | Must notify within 24 hours |
| **Clerk** | Parent authentication data (email, OAuth tokens) | Must notify within 24 hours |
| **ElevenLabs** | Spoken text (transient, not stored per their policy) | Must notify within 24 hours |

### On Receiving a Sub-Processor Notification

1. The 72-hour DPC clock starts when **we** become aware (i.e., when we receive the sub-processor's notification)
2. Request full incident details from the sub-processor immediately
3. Assess severity per Section 4
4. Proceed with DPC and data subject notifications as required

---

## 8. Breach Register

Log **every** suspected or confirmed breach regardless of severity. This register satisfies Article 33(5).

### Register Fields

| Field | Description |
|-------|-------------|
| **Breach ID** | Sequential identifier (e.g., BRE-2026-001) |
| **Date/time detected** | When the breach was first identified |
| **Date/time reported internally** | When the Controller was informed |
| **Reported by** | Person or system that detected the breach |
| **Nature of breach** | Confidentiality / integrity / availability |
| **Description** | What happened |
| **Data categories affected** | Sentence history, cards, preferences, parent auth, etc. |
| **Data subject categories** | Children, parents, or both |
| **Approximate records affected** | Number or best estimate |
| **Severity** | HIGH / MEDIUM / LOW |
| **Containment actions** | What was done to stop the breach |
| **DPC notified** | Yes / No / Not required -- with date if yes |
| **Data subjects notified** | Yes / No / Not required -- with date if yes |
| **Root cause** | Once determined |
| **Remediation** | Measures taken to prevent recurrence |
| **Status** | Open / Closed |
| **Closed date** | When the incident was fully resolved |

### Storage

The breach register is maintained as a private document, not in the public codebase. Access is restricted to the Data Controller.

---

## 9. Post-Breach Review

Complete a root cause analysis within **14 days** of breach closure.

### Review Checklist

- [ ] What was the root cause?
- [ ] Was the breach detected promptly? If not, what monitoring gaps existed?
- [ ] Was the 72-hour DPC deadline met? If not, why?
- [ ] Were data subjects notified appropriately?
- [ ] What technical or organizational measures would have prevented this breach?
- [ ] Do any of the following need updating?
  - [ ] This breach notification procedure
  - [ ] The DPIA risk assessment
  - [ ] Sub-processor DPAs
  - [ ] Access controls or authentication
  - [ ] Monitoring and alerting
  - [ ] Data retention policies
- [ ] Has the remediation been implemented and verified?

### Reporting

Summarize findings and share with any affected sub-processors where relevant. If the breach revealed a systemic issue, schedule a DPIA review per the DPIA review schedule.

---

## 10. Response Timeline Summary

| Time | Action |
|------|--------|
| **T+0** | Breach detected or reported |
| **T+1h** | Controller acknowledges and begins assessment |
| **T+4h** | Severity assessed; containment actions underway |
| **T+24h** | Data subject notification drafted (if HIGH) |
| **T+48h** | DPC notification drafted and reviewed |
| **T+72h** | **DPC notification submitted** (hard deadline) |
| **T+72h** | Data subject notification sent (without undue delay) |
| **T+14 days** | Post-breach review completed |
| **T+30 days** | Remediation measures implemented and verified |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 23 March 2026 | James Spalding | Initial version |
