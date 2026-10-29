# Replay Protocol — SatQuery AI

## A. Record the exact artefact
Before testing, record:
- Git commit SHA and branch
- Node.js and npm versions
- OS and date/time (include timezone)
- Dependency lockfile status
- Environment variables/configuration names used (never include secrets)
- Deployment URL or local route and whether it is accessible to reviewers

## B. Clean setup and automated checks
From the repository root:
```bash
npm ci
npm run test -- --reporter=verbose
npm run typecheck
npm run lint
npm run build
```
Capture terminal output and exit codes. Also retain the GitHub Actions run URL and logs. If any command fails, preserve the failure output and record the corrective action; do not omit failed attempts.

## C. Application replay
The route supplied for this project is `http://localhost:3000/chat`. It is only reachable on the machine running the app. Start the app using the repository's documented command, then test locally. For an external reviewer, use an approved staging deployment or provide exact setup instructions.

## D. Case-level evaluation
Prepare and freeze the same test set for SatQuery AI and the QGIS + manual-report comparator. Include answerable cases and the four designated unanswerable cases. For every case, record:
- case ID and prompt/question
- expected answer / acceptance criteria
- SatQuery output and cited evidence
- comparator output
- correctness judgment and reviewer rationale
- start/end timestamps and elapsed time
- latency, errors, provenance, and cost if available

## E. Twenty-request replay
After a clean redeployment, run 20 requests and record every request, not just successful ones. Include timestamp, case ID, response, status/error, latency, provenance presence, and cost if measurable. Preserve raw logs and calculate aggregate metrics from those logs.

## F. Evidence integrity
Keep raw outputs unchanged. Label derived tables/calculations separately. Record test-set changes, code changes, and exclusions. Never fabricate results or reviewer statements.
