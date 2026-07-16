export const DISAGREEMENT_TOPICS = [
  {
    id: 'scaling-of-optimizer-gains',
    title: 'Scaling of optimizer gains',
    question:
      'Do matrix-optimizer gains diminish with scale, or do they persist under optimizer-specific transfer rules?',
    paperIds: [
      'fantastic-pretraining-optimizers',
      'hyperparameter-transfer-matrix-preconditioners',
      'benchmarking-optimizers-llm-pretraining',
      'muon-is-scalable-for-llm-training',
      'hyperball-optimization',
    ],
    interpretation:
      'The records do not form matched replications. Their parameterizations, model grids, datasets, batch sizes, tuning procedures, training horizons, and resource accounting differ, so the atlas preserves each conditional claim instead of declaring one universal scaling law.',
  },
  {
    id: 'hyperparameter-transfer',
    title: 'Hyperparameter transfer',
    question:
      'Which learning-rate, weight-decay, momentum, and schedule rules transfer across width or scale?',
    paperIds: [
      'hyperparameter-transfer-matrix-preconditioners',
      'fantastic-pretraining-optimizers',
      'hyperball-optimization',
      'benchmarking-optimizers-llm-pretraining',
      'controlled-llm-training-spectral-sphere',
    ],
    interpretation:
      'The studies use different notions of transfer: optimizer-specific scaling laws, maximal-update rules, width-scaled weight decay, fixed-radius projection, or retuning at each regime. These procedures should not be collapsed into one transferable hyperparameter recipe.',
  },
  {
    id: 'token-versus-wall-clock',
    title: 'Token efficiency versus wall-clock efficiency',
    question:
      'When does reaching a loss in fewer tokens or model FLOPs reduce end-to-end training time?',
    paperIds: [
      'fantastic-pretraining-optimizers',
      'hyperparameter-transfer-matrix-preconditioners',
      'hyperball-optimization',
      'soap-language-modeling',
      'polar-express-matrix-sign',
      'benchmarking-optimizers-llm-pretraining',
      'controlled-llm-training-spectral-sphere',
      'kl-shampoo-and-soap',
    ],
    interpretation:
      'Token-equivalent or forward/backward-FLOP efficiency does not by itself establish lower end-to-end time. The time-bearing records use different hardware and measurements, including estimates, step latency, selected wall-clock comparisons, and fixed-iteration runs.',
  },
  {
    id: 'constraints-versus-weight-decay',
    title: 'Explicit norm constraints versus weight decay',
    question:
      'Are decoupled weight decay and explicit projection or retraction interchangeable ways to control scale?',
    paperIds: [
      'muon-is-scalable-for-llm-training',
      'hyperparameter-transfer-matrix-preconditioners',
      'training-deep-learning-models-norm-constrained-lmos',
      'controlled-llm-training-spectral-sphere',
      'demystifying-manifold-constraints-llm-pretraining',
      'hyperball-optimization',
    ],
    interpretation:
      'The records study different feasible sets and scale-control mechanisms: decoupled decay, norm-constrained linear minimization, spectral retraction, manifold projection, and fixed Frobenius radii. They are alternatives under different parameterizations and protocols, not interchangeable formulas.',
  },
  {
    id: 'matrix-sign-approximation',
    title: 'Matrix-sign approximation',
    question:
      'How do polynomial choice, normalization, iteration count, precision, and surrounding optimizer rules affect a matrix-sign update?',
    paperIds: [
      'old-optimizer-new-norm',
      'modular-duality-in-deep-learning',
      'muon-is-scalable-for-llm-training',
      'polar-express-matrix-sign',
      'controlled-llm-training-spectral-sphere',
      'demystifying-manifold-constraints-llm-pretraining',
    ],
    interpretation:
      'The papers share a polar-factor or matrix-sign target but not one canonical implementation. Approximation schedules are embedded in different momentum, normalization, shape-scaling, constraint, precision, and weight-decay rules; only matched subroutine comparisons isolate approximation quality.',
  },
];
