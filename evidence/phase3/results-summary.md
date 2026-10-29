# Phase 3 Results Summary — SatQuery AI

**Current evidence state:** Incomplete; measured results are pending.

## Project and candidate
- Project: SatQuery AI
- Team: TARA
- Team ID: P-2025-29-CD-024-AY26-27
- Vertical: Cloud & DevOps
- Candidate recorded in available materials: I01 — conversational assistant with visible evidence and abstention.
- Last known recorded review status: **Review pending**; obtain official confirmation.

## Validation criteria carried forward as targets (not achieved results)
1. At least 20% lower median time to a correct answer than the QGIS + manual-report comparator.
2. Correctness no lower than the comparator.
3. Correct abstention on all 4 designated unanswerable cases.
4. Twenty requests after a clean redeployment, recording errors, latency, provenance, and cost where measurable.

## Results table
| Metric | Target | Observed result | Status |
|---|---|---|---|
| Median time to correct answer vs QGIS + manual report | >=20% lower | Not measured | Pending |
| Correctness vs comparator | No lower than comparator | Not measured | Pending |
| Unanswerable-case abstention | 4/4 correct | Not measured | Pending |
| Clean-redeployment requests | 20 requests | Not run / not evidenced | Pending |
| Error rate | Record all errors | Not measured | Pending |
| Latency | Record per request | Not measured | Pending |
| Provenance visibility | Record evidence/citations per request | Not measured | Pending |
| Cost | Record if measurable | Not measured | Pending |

## Calculation rules
- Time improvement (%) = ((baseline median seconds − SatQuery median seconds) / baseline median seconds) × 100.
- Accuracy (%) = (correct evaluated answers / total evaluated answerable cases) × 100.
- Abstention success (%) = (correct abstentions / 4 designated unanswerable cases) × 100.
- Error rate (%) = (failed requests / total requests) × 100.

Do not fill observed-result cells until the raw dataset, timestamps, case-level judgments, and replay logs are available. Attach the underlying raw data and evaluation rubric before reporting a headline result.
