export const ROADMAP_COMPETENCIES = [
  {
    id: 'optimization-theory',
    title: 'Optimization theory',
    focus:
      'Smooth, convex, stochastic, constrained, and nonsmooth analysis; rates, stationarity, and oracle assumptions.',
    proof:
      'Derive an update rule and state a correct convergence target with every assumption visible.',
  },
  {
    id: 'matrix-geometry',
    title: 'Matrix geometry',
    focus:
      'Induced and Schatten norms, duality maps, SVD, polar decomposition, matrix sign, and retractions.',
    proof:
      'Move fluently between an algebraic update, its geometry, and a numerically stable implementation.',
  },
  {
    id: 'llm-training',
    title: 'LLM training',
    focus:
      'Transformer blocks, pretraining loss, schedules, weight decay, scaling, data budgets, and evaluation.',
    proof:
      'Train and debug a small language model without treating the training loop as a black box.',
  },
  {
    id: 'optimizer-mechanisms',
    title: 'Optimizer mechanisms',
    focus:
      'SGD, AdamW, Adafactor, Lion, Shampoo, SOAP, Muon, low-rank updates, and structured preconditioning.',
    proof:
      'Explain what information each state tensor stores and what approximation changes the update.',
  },
  {
    id: 'numerical-computation',
    title: 'Numerical computation',
    focus:
      'Power iteration, Newton–Schulz iterations, approximate SVD, low rank, quantization, and finite precision.',
    proof:
      'Measure approximation error and connect it to the realized training trajectory.',
  },
  {
    id: 'training-systems',
    title: 'Training systems',
    focus:
      'Mixed precision, sharding, communication, optimizer-state memory, FLOPs, kernels, and wall-clock cost.',
    proof:
      'Produce a profiler-backed resource ledger instead of reporting token efficiency alone.',
  },
  {
    id: 'experimental-science',
    title: 'Experimental science',
    focus:
      'Fair tuning, controls, ablations, seeds, uncertainty, confounders, and reproducible reporting.',
    proof:
      'Design a comparison in which the optimizer—not a hidden budget choice—is the scientific variable.',
  },
  {
    id: 'research-communication',
    title: 'Research communication',
    focus:
      'Claim–evidence writing, theorem boundaries, related-work synthesis, negative results, and open questions.',
    proof:
      'Write a two-page memo that another researcher can falsify, reproduce, or extend.',
  },
];

export const ROADMAP_PHASES = [
  {
    id: 'baseline',
    number: '01',
    duration: 'Weeks 1–4',
    title: 'Build a trustworthy baseline',
    purpose:
      'Learn the LLM training loop and the rules of a fair optimizer comparison before specializing.',
    paperIds: [
      'old-optimizer-new-norm',
      'benchmarking-optimizers-llm-pretraining',
    ],
    candidateTrack: 'benchmarking',
    checkpoints: [
      {
        id: 'baseline-derive',
        label: 'Derive SGD, momentum, AdamW, and decoupled weight decay from the update equations.',
      },
      {
        id: 'baseline-train',
        label: 'Train a small Transformer and reproduce one stable AdamW baseline.',
      },
      {
        id: 'baseline-ledger',
        label: 'Record tokens, model size, optimizer state, FLOPs, peak memory, and wall-clock time.',
      },
      {
        id: 'baseline-compare',
        label: 'Write a one-page comparison with tuning budget and evaluation metric fixed.',
      },
    ],
    deliverable:
      'A reproducible baseline repository plus one completed claim–evidence comparison.',
  },
  {
    id: 'geometry',
    number: '02',
    duration: 'Weeks 5–10',
    title: 'Master norms, duality, and matrix geometry',
    purpose:
      'Build the mathematical language needed to understand steepest descent, LMOs, and structured updates.',
    paperIds: [
      'modular-duality-in-deep-learning',
      'training-deep-learning-models-norm-constrained-lmos',
      'structured-preconditioners-unified-analysis',
    ],
    candidateTrack: 'norm-duality',
    checkpoints: [
      {
        id: 'geometry-duality',
        label: 'Compute dual norms and duality maps for vector and matrix norm examples.',
      },
      {
        id: 'geometry-svd',
        label: 'Derive SVD, polar decomposition, matrix sign, and induced-norm steepest directions.',
      },
      {
        id: 'geometry-lmo',
        label: 'Implement three norm-induced steepest-descent or LMO updates on the same objective.',
      },
      {
        id: 'geometry-proof',
        label: 'Write a proof sketch that names its smoothness, oracle, and stationarity assumptions.',
      },
    ],
    deliverable:
      'A derivation notebook connecting geometry, update rules, and computational primitives.',
  },
  {
    id: 'matrix-optimizers',
    number: '03',
    duration: 'Weeks 11–16',
    title: 'Understand matrix optimizers end to end',
    purpose:
      'Connect preconditioners and orthogonalized updates to approximation error, state cost, and training behavior.',
    paperIds: [
      'muon-is-scalable-for-llm-training',
      'polar-express-matrix-sign',
      'soap-language-modeling',
      'kl-shampoo-and-soap',
      'pion-spectrum-preserving-optimizer',
    ],
    candidateTrack: 'preconditioning',
    checkpoints: [
      {
        id: 'matrix-implement',
        label: 'Implement minimal Muon and Shampoo/SOAP-style update kernels.',
      },
      {
        id: 'matrix-approximation',
        label: 'Compare exact and approximate matrix functions at matched iteration budgets.',
      },
      {
        id: 'matrix-accounting',
        label: 'Measure optimizer-state memory, update latency, and communication volume.',
      },
      {
        id: 'matrix-reproduce',
        label: 'Reproduce one small-scale optimizer ranking with independently tuned baselines.',
      },
    ],
    deliverable:
      'A mechanism study separating mathematical update quality from implementation overhead.',
  },
  {
    id: 'constraints',
    number: '04',
    duration: 'Weeks 17–22',
    title: 'Specialize in constraints, manifolds, and inexact oracles',
    purpose:
      'Turn your manifold and closed-set background into a distinctive LLM optimizer research advantage.',
    paperIds: [
      'controlled-llm-training-spectral-sphere',
      'demystifying-manifold-constraints-llm-pretraining',
      'hyperball-optimization',
    ],
    candidateTrack: 'manifold-constraints',
    checkpoints: [
      {
        id: 'constraints-geometry',
        label: 'Derive tangent projections and retractions for spectral, Stiefel, and fixed-rank examples.',
      },
      {
        id: 'constraints-check',
        label: 'Numerically check gradients, feasibility error, and retraction accuracy.',
      },
      {
        id: 'constraints-stationarity',
        label: 'Compare projected, Riemannian, Bouligand, and nonsmooth stationarity notions.',
      },
      {
        id: 'constraints-inexact',
        label: 'Run an inexact SVD, power-iteration, or quantized-oracle sensitivity experiment.',
      },
    ],
    deliverable:
      'A technical note linking one closed-set stationarity question to a training-relevant approximation.',
  },
  {
    id: 'independent-research',
    number: '05',
    duration: 'Week 23 onward',
    title: 'Run an independent research loop',
    purpose:
      'Move from reading papers to producing a falsifiable result with an explicit evidence boundary.',
    paperIds: [
      'fantastic-pretraining-optimizers',
      'hyperparameter-transfer-matrix-preconditioners',
    ],
    candidateTrack: 'systems',
    checkpoints: [
      {
        id: 'research-question',
        label: 'Choose one open problem and write measurable resolution and falsification criteria.',
      },
      {
        id: 'research-protocol',
        label: 'Pre-register baselines, tuning budget, model scales, seeds, metrics, and stopping rules.',
      },
      {
        id: 'research-result',
        label: 'Produce one result that survives an ablation or a scale/hardware change.',
      },
      {
        id: 'research-memo',
        label: 'Write a two-page research memo and update the atlas with evidence and limitations.',
      },
    ],
    deliverable:
      'A workshop-quality research package: question, protocol, code, evidence table, and concise paper draft.',
  },
];

export const ROADMAP_RESEARCH_LADDERS = [
  {
    id: 'spectral-stationarity',
    label: 'Theory ladder',
    title: 'Nonsmooth spectral constraints',
    problemId: 'spectral-sphere-repeated-top-singular-values',
    firstMove:
      'Construct the smallest repeated-singular-value example and compare candidate stationarity notions.',
  },
  {
    id: 'matrix-sign',
    label: 'Algorithm ladder',
    title: 'Inexact matrix-sign updates',
    problemId: 'training-relevant-matrix-sign-accuracy',
    firstMove:
      'Vary approximation depth while tracking update error, loss trajectory, state, and wall-clock cost.',
  },
  {
    id: 'fair-benchmark',
    label: 'Evidence ladder',
    title: 'Fair optimizer benchmarking',
    problemId: 'conditional-fair-optimizer-benchmarking',
    firstMove:
      'Define one matched tuning protocol and test whether the ranking survives a horizon or batch change.',
  },
  {
    id: 'low-precision-systems',
    label: 'Systems ladder',
    title: 'Low-precision distributed optimization',
    problemId: 'low-precision-distributed-matrix-optimization',
    firstMove:
      'Separate quantization, approximation, and communication error in a controlled distributed update.',
  },
];

export const ROADMAP_FRONTIER_REVIEWED_ON = '2026-07-17';
export const ROADMAP_FRONTIER_HEAT_THRESHOLDS = Object.freeze({
  veryHigh: 10,
  high: 6,
});

export const ROADMAP_FRONTIERS = [
  {
    id: 'closed-set-spectral',
    rank: 1,
    fit: 'Exceptional fit',
    title: 'Closed-set stationarity for nonsmooth spectral constraints',
    whyNow:
      'Recent optimization papers are sharpening tangent-cone, Bouligand-stationarity, proximally smooth set, and nonsmooth Riemannian tools while LLM work is beginning to impose spectral constraints explicitly.',
    opportunity:
      'Build a stationarity and algorithmic theory that remains valid at repeated singular values, then connect it to a computable projected or retracted training update.',
    problemId: 'spectral-sphere-repeated-top-singular-values',
    candidateTrack: 'manifold-constraints',
    signalTags: [
      'bouligand-stationarity',
      'closed-set',
      'inexact-oracle',
      'nonsmooth-optimization',
      'nonsmooth-nonconvex',
      'proximally-smooth-set',
      'riemannian-optimization',
      'set-constraints',
      'tangent-cone',
    ],
    candidateIds: [
      'candidate-1d4681457d7704c3',
      'candidate-d204757bf0efc128',
      'candidate-d6dff783568c35f9',
      'candidate-c45fd66a1c3af92d',
      'candidate-8862bd215845e758',
    ],
  },
  {
    id: 'inexact-matrix-functions',
    rank: 2,
    fit: 'Exceptional fit',
    title: 'Inexact matrix functions for Muon, Shampoo, and whitening',
    whyNow:
      'Muon, Shampoo, SOAP, whitening, and moment-orthogonalization papers are converging on the same practical bottleneck: approximate matrix functions with limited iterations, stale statistics, and finite precision.',
    opportunity:
      'Derive a training-relevant error notion for matrix sign or inverse-root approximations instead of optimizing numerical error in isolation.',
    problemId: 'training-relevant-matrix-sign-accuracy',
    candidateTrack: 'preconditioning',
    signalTags: [
      'approximation',
      'approximation-error',
      'matrix-sign',
      'muon',
      'power-iteration',
      'shampoo',
      'structured-preconditioning',
      'whitening',
    ],
    candidateIds: [
      'candidate-17619dc6d9834d67',
      'candidate-aa96eb95ba15974a',
      'candidate-036a6a180fd97df5',
      'candidate-9d1966f9a12e2ed4',
      'candidate-5943f8855b0993c0',
    ],
  },
  {
    id: 'low-rank-subspace',
    rank: 3,
    fit: 'Very strong fit',
    title: 'Adaptive low-rank and subspace optimization for pretraining',
    whyNow:
      'Multiple 2025 papers study randomized SVD, adaptive rank, subspace tracking, importance sampling, and Riemannian low-rank updates as routes to lower optimizer memory.',
    opportunity:
      'Identify which adaptive low-rank or subspace gains survive larger models, longer horizons, and a matched full-rank baseline while retaining a useful memory advantage.',
    problemId: 'matrix-optimizer-gains-beyond-billion-scale',
    candidateTrack: 'preconditioning',
    signalTags: [
      'adaptive-rank',
      'bounded-rank',
      'grassmann',
      'low-rank',
      'randomized-svd',
      'subspace-optimization',
    ],
    candidateIds: [
      'candidate-1413c01b13e23d99',
      'candidate-7126388f712dc222',
      'candidate-ecc4a21f6b3e4497',
      'candidate-34afaaf14baeb200',
      'candidate-413aab9e9e5ba037',
    ],
  },
  {
    id: 'scaling-transfer',
    rank: 4,
    fit: 'Strong fit',
    title: 'Hyperparameter transfer and conditional optimizer rankings',
    whyNow:
      'Recent work studies learning-rate transfer, module-wise weight decay, long-memory momentum, schedule-free training, and optimizer rankings across changing scales and horizons.',
    opportunity:
      'Identify invariants that predict when a ranking or tuned recipe transfers—and when it reverses under a changed batch, horizon, model scale, or system budget.',
    problemId: 'conditional-fair-optimizer-benchmarking',
    candidateTrack: 'benchmarking',
    signalTags: [
      'hyperparameter-transfer',
      'learning-rate-transfer',
      'momentum',
      'optimizer-benchmarking',
      'scaling',
      'schedule-free',
      'weight-decay',
    ],
    candidateIds: [
      'candidate-411d5a4483119ba5',
      'candidate-3fe6cf6f16330f63',
      'candidate-580a468840e2a0f3',
      'candidate-65a637efc4f7ec5f',
      'candidate-97917eccdfad0ac0',
    ],
  },
  {
    id: 'low-precision-distributed',
    rank: 5,
    fit: 'Strong fit',
    title: 'Low-precision, communication-efficient, and fault-tolerant optimizers',
    whyNow:
      'Optimizer-state compression, FP8, low-rank communication, topology-aware collectives, error feedback, and fault tolerance are now being evaluated directly in large-model training.',
    opportunity:
      'Separate optimization error from quantization, communication, and hardware effects, then optimize time-to-target rather than step count alone.',
    problemId: 'low-precision-distributed-matrix-optimization',
    candidateTrack: 'systems',
    signalTags: [
      'communication',
      'error-feedback',
      'fault-tolerance',
      'fp8',
      'low-precision',
      'optimizer-state',
      'quantization',
    ],
    candidateIds: [
      'candidate-3b14aedab99654e1',
      'candidate-b774d7fec247b218',
      'candidate-7ed4c0eed6a385b2',
      'candidate-0593e6dc4c1bfcbe',
      'candidate-71c9511b1e47e103',
    ],
  },
  {
    id: 'norm-implicit-bias',
    rank: 6,
    fit: 'Very strong fit',
    title: 'Norm geometry, implicit bias, and explicit regularization',
    whyNow:
      'Spectral descent, Muon implicit bias, anisotropic geometry, affine-invariant Frank–Wolfe methods, and spectral variational analysis are forming a common geometric language.',
    opportunity:
      'Determine when optimizer-induced geometry and explicit norm constraints reproduce, complement, or conflict with weight decay without overextending simplified-model results.',
    problemId: 'when-norm-constraints-replace-weight-decay',
    candidateTrack: 'norm-duality',
    signalTags: [
      'anisotropic-geometry',
      'frank-wolfe',
      'implicit-bias',
      'linear-minimization-oracle',
      'norm-duality',
      'spectral-function',
      'spectral-set',
    ],
    candidateIds: [
      'candidate-5943f8855b0993c0',
      'candidate-9fe334fbf0b73f6b',
      'candidate-8b5c5539b1f3a52d',
      'candidate-eaebc1392c1c0dd1',
      'candidate-496506815392773e',
    ],
  },
];

export const ROADMAP_RESOURCES = [
  {
    title: 'Convex Optimization',
    provider: 'Boyd & Vandenberghe, Stanford',
    href: 'https://web.stanford.edu/~boyd/cvxbook/',
    purpose: 'Convex analysis, duality, optimality conditions, and numerical methods.',
  },
  {
    title: 'Language Modeling from Scratch',
    provider: 'Stanford CS336',
    href: 'https://cs336.stanford.edu/',
    purpose: 'Transformer training, resource accounting, kernels, parallelism, and scaling.',
  },
  {
    title: 'An Introduction to Optimization on Smooth Manifolds',
    provider: 'Nicolas Boumal',
    href: 'https://www.nicolasboumal.net/book/',
    purpose: 'Riemannian geometry, retractions, first-order methods, and matrix manifolds.',
  },
  {
    title: 'Pymanopt documentation',
    provider: 'Pymanopt project',
    href: 'https://pymanopt.org/docs/stable/',
    purpose: 'Executable manifold examples and automatic-differentiation checks.',
  },
  {
    title: 'Automatic Mixed Precision',
    provider: 'PyTorch documentation',
    href: 'https://docs.pytorch.org/docs/stable/accelerator/amp.html',
    purpose: 'Autocasting, gradient scaling, and numerical behavior at lower precision.',
  },
  {
    title: 'Fully Sharded Data Parallel (FSDP2)',
    provider: 'PyTorch documentation',
    href: 'https://docs.pytorch.org/docs/stable/distributed.fsdp.fully_shard.html',
    purpose: 'Sharded parameters, gradients, optimizer states, memory, and communication.',
  },
  {
    title: 'Deep Learning Tuning Playbook',
    provider: 'Google Research',
    href: 'https://github.com/google-research/tuning_playbook',
    purpose: 'Incremental tuning, scientific variables, fair search spaces, and experiment tracking.',
  },
  {
    title: 'Paper Checklist',
    provider: 'NeurIPS',
    href: 'https://neurips.cc/public/guides/PaperChecklist',
    purpose: 'Reproducibility, transparency, limitations, and responsible reporting.',
  },
];

const ROADMAP_TRACKS = new Set([
  'norm-duality',
  'preconditioning',
  'manifold-constraints',
  'benchmarking',
  'systems',
]);

export function resolveResearcherRoadmap(papers, problems, candidates) {
  const paperById = new Map(papers.map((paper) => [paper.id, paper]));
  const problemById = new Map(problems.map((problem) => [problem.id, problem]));
  const candidateById = new Map(
    candidates.map((candidate) => [candidate.candidate_id, candidate]),
  );
  const seenPaperIds = new Set();
  const seenCheckpointIds = new Set();

  const phases = ROADMAP_PHASES.map((phase) => {
    if (!ROADMAP_TRACKS.has(phase.candidateTrack)) {
      throw new Error('Unknown roadmap candidate track: ' + phase.candidateTrack);
    }
    const resolvedPapers = phase.paperIds.map((paperId) => {
      const paper = paperById.get(paperId);
      if (!paper) throw new Error('Unknown roadmap paper reference: ' + paperId);
      if (seenPaperIds.has(paperId)) {
        throw new Error('Duplicate roadmap paper reference: ' + paperId);
      }
      seenPaperIds.add(paperId);
      return paper;
    });
    for (const checkpoint of phase.checkpoints) {
      if (seenCheckpointIds.has(checkpoint.id)) {
        throw new Error('Duplicate roadmap checkpoint: ' + checkpoint.id);
      }
      seenCheckpointIds.add(checkpoint.id);
    }
    return { ...phase, papers: resolvedPapers };
  });

  const ladders = ROADMAP_RESEARCH_LADDERS.map((ladder) => {
    const problem = problemById.get(ladder.problemId);
    if (!problem) {
      throw new Error('Unknown roadmap open-problem reference: ' + ladder.problemId);
    }
    return { ...ladder, problem };
  });

  const frontiers = ROADMAP_FRONTIERS.map((frontier) => {
    const problem = problemById.get(frontier.problemId);
    if (!problem) {
      throw new Error('Unknown frontier open-problem reference: ' + frontier.problemId);
    }
    if (!ROADMAP_TRACKS.has(frontier.candidateTrack)) {
      throw new Error('Unknown frontier candidate track: ' + frontier.candidateTrack);
    }
    const signalCandidates = candidates.filter(
      (candidate) =>
        candidate.decision !== 'exclude' &&
        candidate.research_tracks.includes(frontier.candidateTrack) &&
        candidate.tags.some((tag) => frontier.signalTags.includes(tag)),
    );
    const signalCandidateIds = new Set(
      signalCandidates.map((candidate) => candidate.candidate_id),
    );
    const seenCandidateIds = new Set();
    const resolvedCandidates = frontier.candidateIds.map((candidateId) => {
      const candidate = candidateById.get(candidateId);
      if (!candidate) {
        throw new Error('Unknown frontier candidate reference: ' + candidateId);
      }
      if (seenCandidateIds.has(candidateId)) {
        throw new Error(
          'Duplicate candidate in frontier ' + frontier.id + ': ' + candidateId,
        );
      }
      if (candidate.decision !== 'include') {
        throw new Error(
          'Frontier candidate must have an include decision: ' + candidateId,
        );
      }
      if (!signalCandidateIds.has(candidateId)) {
        throw new Error(
          'Frontier candidate does not match its auditable signal rule: ' +
            candidateId,
        );
      }
      seenCandidateIds.add(candidateId);
      return candidate;
    });
    const heat =
      signalCandidates.length >= ROADMAP_FRONTIER_HEAT_THRESHOLDS.veryHigh
        ? 'Very high'
        : signalCandidates.length >= ROADMAP_FRONTIER_HEAT_THRESHOLDS.high
          ? 'High'
          : 'Emerging';
    return {
      ...frontier,
      problem,
      candidates: resolvedCandidates,
      heat,
      signalCount: signalCandidates.length,
    };
  });

  for (const resource of ROADMAP_RESOURCES) {
    if (!resource.href.startsWith('https://')) {
      throw new Error('Roadmap resource must use HTTPS: ' + resource.href);
    }
  }

  return {
    phases,
    ladders,
    frontiers,
    checkpointCount: seenCheckpointIds.size,
    paperCoverage: seenPaperIds.size,
  };
}
