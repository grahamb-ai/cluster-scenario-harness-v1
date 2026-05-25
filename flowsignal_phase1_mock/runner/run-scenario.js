#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const layers = require('../mocks/layers');

const scenarioPath = process.argv[2];
if (!scenarioPath) {
  console.error('Usage: node runner/run-scenario.js scenarios/03-high-stakes-transaction-operator-override.json');
  process.exit(1);
}

const resolved = path.resolve(process.cwd(), scenarioPath);
const scenario = JSON.parse(fs.readFileSync(resolved, 'utf8'));

const artifacts = [];
artifacts.push(layers.asro(scenario));
artifacts.push(layers.flowSignal(scenario, artifacts));
artifacts.push(layers.mir(scenario, artifacts));
artifacts.push(layers.evide(scenario, artifacts));
artifacts.push(layers.reviewability(scenario, artifacts));

const auditTrail = {
  scenario_id: scenario.scenario_id,
  scenario_name: scenario.name,
  decision_correlation_id: scenario.decision_correlation_id,
  generated_at: new Date().toISOString(),
  composition_discipline: 'composition_without_consolidation',
  note: 'Runner orchestrates mock calls only. It does not certify conformance or act as a shared control plane.',
  artifacts
};

console.log(JSON.stringify(auditTrail, null, 2));
