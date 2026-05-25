# Phase 1 Thin Composition Harness

This Phase 1 mock demonstrates the five-layer composed architecture without creating a central product, certification server, or shared control plane.

It includes:

- Canonical correlation contract
- Five canonical decision lifecycle scenarios
- Mocked per-layer outputs
- Local scenario runner
- Audit trail stitcher
- Static buyer/auditor viewer

## Principle

The harness proves composition without consolidation.

Each primitive produces its own bounded artifact. The runner simply exercises the scenario lifecycle and stitches outputs using `decision_correlation_id`.

No layer controls another layer. No central service decides what conformance means.

## Quick start

Open:

```bash
viewer/index.html
```

Or run the local scenario runner:

```bash
node runner/run-scenario.js scenarios/03-high-stakes-transaction-operator-override.json
```

The runner emits a composed audit trail to stdout.

## Directory structure

```text
schemas/       Canonical contracts and per-layer output shapes
scenarios/     Canonical decision lifecycle scenarios
mocks/         Mocked primitive handlers
runner/        Local runner that exercises one scenario
viewer/        Static visual audit stitcher demo
/docs/         Buyer-facing explanation and implementation notes
```

## Phase 1 scope

In scope:

- Mock APIs
- Deterministic scenario outputs
- Correlation contract
- Local audit stitching
- Reviewer-readable artifacts

Out of scope:

- Shared hosted server
- Central dashboard
- Certification body
- Production authentication
- Multi-tenant storage
- Commercial product coupling
