# Implementation plan

## Phase 1 build target

A thin, local harness demonstrating the cluster's canonical scenarios against mocked layer outputs.

## Build components

1. Correlation contract
2. Scenario pack
3. Mock layer handlers
4. Scenario runner
5. Audit stitcher viewer
6. Buyer-facing explanation

## Suggested next development steps

1. Replace mocked layer handlers with each owner's sandbox endpoint.
2. Keep the runner local and stateless.
3. Require each layer response to carry `decision_correlation_id`.
4. Add a simple conformance check for required fields only.
5. Export stitched audit trails as JSON packages.

## Boundary controls

- No central storage of test runs.
- No shared certification language.
- No dashboard asserting conformance.
- No vendor-specific fields in the canonical scenario pack unless marked as implementation-specific.
