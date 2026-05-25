function now() {
  return new Date().toISOString();
}

function artifactId(prefix, dcid) {
  return `${prefix}-${dcid.replace(/[^a-zA-Z0-9]/g, '').slice(-10)}`;
}

function asro(input) {
  return {
    layer: 'ASRO',
    decision_correlation_id: input.decision_correlation_id,
    artifact_id: artifactId('ASRO-WITNESS', input.decision_correlation_id),
    produced_at: now(),
    outcome: 'WITNESSED',
    summary: 'Authority state, actor identity, and surrounding decision context witnessed before bind.',
    evidence_refs: input.evidence_refs || [],
    payload: {
      witnessed_actor: input.actor,
      witnessed_action: input.requested_action,
      authority_state: input.context.parent_authority_state || 'active',
      policy_set_id: input.context.policy_set_id,
      witness_position: 'pre_bind_context'
    }
  };
}

function flowSignal(input, priorArtifacts) {
  const highRiskOverride = input.context.operator_override === true && Number(input.requested_action.amount || 0) > 100000;
  const dataExport = input.requested_action.action === 'EXPORT_CUSTOMER_DATA';
  const outcome = highRiskOverride || dataExport ? 'ESCALATE' : 'ALLOW';

  return {
    layer: 'FlowSignal',
    decision_correlation_id: input.decision_correlation_id,
    artifact_id: artifactId('FS-CLOSURE', input.decision_correlation_id),
    produced_at: now(),
    outcome,
    summary: outcome === 'ALLOW'
      ? 'Requested consequence is admissible at bind under the supplied authority and evidence state.'
      : 'Requested consequence requires escalation before bind because authority/evidence conditions are not sufficient for immediate execution.',
    evidence_refs: input.evidence_refs || [],
    payload: {
      bind_point: 'pre_execution_commit',
      execution_target: input.requested_action,
      authority_resolution: {
        outcome,
        checks: {
          mandate_scope: 'pass',
          delegation_chain: 'pass',
          evidence_sufficiency: highRiskOverride || dataExport ? 'conditional' : 'pass',
          override_admissibility: input.context.operator_override ? 'conditional' : 'not_applicable'
        }
      },
      admissible_to_bind: outcome === 'ALLOW',
      escalation_required: outcome === 'ESCALATE',
      upstream_artifacts_seen: priorArtifacts.map(a => a.artifact_id)
    }
  };
}

function mir(input, priorArtifacts) {
  return {
    layer: 'MIR',
    decision_correlation_id: input.decision_correlation_id,
    artifact_id: artifactId('MIR-DECISION-REPORT', input.decision_correlation_id),
    produced_at: now(),
    outcome: 'RECORDED',
    summary: 'Substrate events, policy evaluation response, and decision-report shape recorded with correlation continuity.',
    evidence_refs: input.evidence_refs || [],
    payload: {
      events_submitted: [
        'actor_observed',
        'action_requested',
        'context_bound',
        'layer_output_observed'
      ],
      policy_evaluate: {
        endpoint: '/policy/evaluate',
        decision: 'record_and_continue',
        whyRec: 'Scenario requires substrate continuity, not authority over bind.'
      },
      decision_report: {
        actorLabel: input.actor.label,
        action: input.requested_action.action,
        decision_correlation_id: input.decision_correlation_id,
        observed_layer_artifacts: priorArtifacts.map(a => a.artifact_id)
      },
      conformance_signal: 'correlation_contract_present'
    }
  };
}

function evide(input, priorArtifacts) {
  return {
    layer: 'EVIDE',
    decision_correlation_id: input.decision_correlation_id,
    artifact_id: artifactId('EVIDE-EVIDENCE-PACKAGE', input.decision_correlation_id),
    produced_at: now(),
    outcome: 'SEALED',
    summary: 'Portable evidence package sealed from bounded layer artifacts and correlation identifiers.',
    evidence_refs: priorArtifacts.map(a => `hash:${a.artifact_id}`),
    payload: {
      closure_package: {
        includes: priorArtifacts.map(a => ({ layer: a.layer, artifact_id: a.artifact_id, outcome: a.outcome })),
        hash_strategy: 'mock_sha256_per_artifact',
        portability: 'reviewer_exportable'
      }
    }
  };
}

function reviewability(input, priorArtifacts) {
  const allCarryCorrelation = priorArtifacts.every(a => a.decision_correlation_id === input.decision_correlation_id);
  const layersPresent = new Set(priorArtifacts.map(a => a.layer));
  const missing = input.expected_layers.filter(l => !layersPresent.has(l) && l !== 'Reviewability');

  return {
    layer: 'Reviewability',
    decision_correlation_id: input.decision_correlation_id,
    artifact_id: artifactId('REVIEWABILITY-TEST', input.decision_correlation_id),
    produced_at: now(),
    outcome: allCarryCorrelation && missing.length === 0 ? 'PASS' : 'FAIL',
    summary: allCarryCorrelation && missing.length === 0
      ? 'Reviewer can independently stitch all supplied artifacts using the correlation contract.'
      : 'Reviewer cannot fully stitch the audit trail from supplied artifacts.',
    evidence_refs: priorArtifacts.map(a => a.artifact_id),
    payload: {
      tests: {
        correlation_contract_present: allCarryCorrelation,
        expected_layer_records_present: missing.length === 0,
        artifacts_independently_bounded: true,
        chain_of_custody_reconstructable: allCarryCorrelation && missing.length === 0
      },
      missing_layers: missing
    }
  };
}

module.exports = { asro, flowSignal, mir, evide, reviewability };
