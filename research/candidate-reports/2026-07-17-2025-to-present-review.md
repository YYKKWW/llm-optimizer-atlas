# Literature re-index: 2025-01-01 through 2026-07-17

Status: reviewed candidate report. Candidate decisions authorize screening disposition only.
An `include` decision means "read the full paper and prepare a canonical-ingestion review"; it
does not make the paper a verified canonical record.

## Outcome

- Official-source retrieval scanned 215 Mathematical Programming records, 155 SIAM Journal on
  Optimization records, 3,703 ICLR 2025 papers, 3,330 ICML 2025 papers, and 5,823 NeurIPS 2025
  papers.
- The configured automatic profiles produced 72 candidates: 17 journal and 55 conference records.
- Manual recall review found 56 additional high-relevance records that the title profiles missed:
  28 journal and 28 conference records.
- The reviewed public queue therefore contains 128 records: 52 `include`, 41 `watch`, and 35
  `exclude` or merge decisions.
- All 128 decisions and individual rationales are stored in `research/candidate-papers.yml` and
  `research/review-decisions.yml`. No candidate was copied into the canonical papers dataset.

## Venue-by-venue retrieval report

| Venue | Official coverage | Reviewed candidates | Decision split | Checkpoint result |
| --- | --- | ---: | --- | --- |
| Mathematical Programming | Crossref ISSN `0025-5610`, 2025-01-01 through 2026-07-17 | 28 | 13 include / 8 watch / 7 exclude | Advanced through 2026-07-17 |
| SIAM Journal on Optimization | Crossref ISSN `1052-6234`, 2025-01-01 through 2026-07-17 | 17 | 10 include / 7 watch | Advanced through 2026-07-17 |
| ICLR | Official 2025 proceedings; 2026 index unresolved | 22 | 7 include / 9 watch / 6 exclude | Not advanced |
| ICML | Official PMLR volume 267 for 2025; complete 2026 volume unavailable | 15 | 6 include / 5 watch / 4 exclude | Not advanced |
| NeurIPS | Official 2025 proceedings; 2026 path unavailable | 46 | 16 include / 12 watch / 18 exclude | Not advanced |

The conference checkpoint is intentionally conservative. The retrieval code tolerates a missing or
empty current-year index, which is useful operationally but is not evidence of complete 2026 venue
coverage.

## Ranked candidate report

The first full-reading batch should be:

1. **SUMO** - moment orthogonalization, exact/approximate matrix operations, memory, and LLM
   training in one paper.
2. **Purifying Shampoo** - eigenvalue/eigenbasis approximation errors, grafting, stale
   preconditioners, and update frequency.
3. **A New Perspective on Shampoo's Preconditioner** - Kronecker approximation and its relation
   to power iteration.
4. **A Stable Whitening Optimizer (SPlus)** - stability of stale Shampoo-style inverses,
   learning-rate transfer, Transformer benchmarks, and wall-clock results.
5. **Implicit Bias of Spectral Descent and Muon** - direct norm-based Muon theory, with a narrow
   separable-linear setting boundary.
6. **Deconstructing What Makes a Good Optimizer for Autoregressive Language Models** - controlled
   optimizer comparison across model scales.
7. **Subspace Optimization for LLMs with Convergence Guarantees (GoLore)** - a GaLore
   counterexample, convergence conditions, and randomized subspaces.
8. **SubTrack++** - Grassmannian gradient-subspace tracking, projection-aware Adam, memory, and
   wall-clock behavior.
9. **LORO**, **Randomized Subspace Optimization**, **FRUGAL**, **MISA**, **AdaRankGrad**, and
   **Breaking the Frozen Subspace** - complementary low-rank/state-memory design points that should
   be compared under matched loss and system budgets.
10. **Projected Gradient Descent Accumulates at Bouligand Stationary Points** - the most direct
    general closed-set PGD result in this re-index.
11. **Stochastic Optimization Over Proximally Smooth Sets** and **Finite-Time Stochastic
    Nonsmooth Riemannian Optimization** - strong foundations for retractions, nonsmoothness, and
    approximate oracles.
12. **Partial Convexification for Low-Rank Spectral Optimization**, **Space-Decoupling for
    Bounded-Rank Matrices**, and **Randomized Frank-Wolfe over the Spectrahedron** - the strongest
    journal bridge to spectral closed sets, rank constraints, and LMOs.

## Potentially important for my manifold or close set optimizer research

Highest-priority theory records are:

- **Projected Gradient Descent Accumulates at Bouligand Stationary Points**: arbitrary nonempty
  closed feasible sets and B-stationary accumulation points.
- **Stochastic Optimization Over Proximally Smooth Sets**: weakly convex stochastic objectives,
  prox-smooth closed sets, simplified models, and retractions.
- **Tight Error Bounds for the Sign-Constrained Stiefel Manifold**: exact penalties and feasibility
  error bounds for intersecting sign and orthogonality constraints.
- **Second-Order Directional Optimality for General Set Constraints**, **Limiting Normal Cones to a
  Union of Convex Sets**, and **Commutation Principles for Nonsmooth Spectral Sets**: tools for
  B/M-stationarity and stratified spectral geometry.
- **Low-rank Tucker varieties**, **bounded-rank space decoupling**, **RAdaGrad/RAdamW**, **EF-Landing**,
  and **randomized Riemannian submanifolds**: distinct treatments of tangent cones, fixed-rank
  manifolds, feasibility, and retraction cost.
- **Inexact semialgebraic subgradient methods**, **stochastic SQP with biased heavy-tailed oracles**,
  and the **nonsmooth Riemannian zeroth-order method**: relevant models for approximate SVD,
  finite-precision, or inexact projection analysis.

These works do not automatically settle behavior on a spectral sphere at repeated largest singular
values. Smooth Stiefel/fixed-rank results must not be transferred to that nonsmooth set without a
new regularity and stationarity argument.

## Where new papers disagree with the existing literature

These are literature tensions to resolve by full reading, not verified contradictions:

1. **Shampoo approximation and refresh frequency.** Purifying Shampoo, the new Shampoo
   preconditioner analysis, and SPlus separate approximation, stability, stale inverse, and
   systems-cost effects more sharply than broad claims about coupled preconditioners.
2. **Low-rank subspaces.** GoLore supplies a convergence counterexample for GaLore-style subspaces;
   Breaking the Frozen Subspace motivates importance sampling; SubTrack++ uses dynamic Grassmannian
   tracking; randomized subspace methods refresh differently. Their assumptions and costs are not
   interchangeable.
3. **Optimizer rankings.** Deconstructing Good Optimizers and Through the River indicate that
   scale, schedule, training horizon, and tuning protocol can change conclusions drawn from a
   single benchmark table.
4. **Weight decay.** AlphaDecay argues against one uniform module-wise decay rule, creating a direct
   test for the atlas question about weight decay, norm constraints, and hyperparameter transfer.
5. **Memory efficiency.** FRUGAL retains full-rank state-free updates, while LORO, MISA,
   AdaRankGrad, SUMO, GoLore, and SubTrack++ reduce or restructure state/subspaces. Token savings,
   state bytes, communication, and wall-clock speed may rank these methods differently.
6. **Muon theory scope.** The new implicit-bias result concerns multiclass separable linear data. It
   supports a norm interpretation but does not by itself validate nonlinear LLM scaling claims.

## Unresolved metadata and verification failures

- ICLR, ICML, and NeurIPS 2026 do not have complete verified proceedings coverage in the configured
  adapters. Their date checkpoints remain null.
- Conference candidates generally lack a verified exact publication day, DOI, and arXiv relation.
- Automatic conference records have normalized/alphabetized author lists. Manual-recall records use
  official proceedings order; automatic records need author-order restoration before promotion.
- Crossref does not establish arXiv version relationships for the journal records.
- Quantitative memory, FLOPs, communication, matched-loss, seed, and wall-clock claims remain
  unverified until full-paper reading.
- The automatic title profiles have a demonstrated recall problem: 56 high-relevance records were
  found only through manual recall. Future discovery rules must be widened and audited before a
  conference checkpoint is trusted.

## Recommended decisions

- **Include (52):** approved for full-paper reading and a separate canonical-ingestion review.
- **Watch (41):** retain when the current evidence is fine-tuning-only, application-specific, or an
  indirect theory bridge.
- **Exclude/merge (35):** preserve for auditability, but hide from the default active view. The
  NeurIPS Hyperparameter Transfer record is merged conceptually with canonical
  `hyperparameter-transfer-matrix-preconditioners`; it is not a new work.

No generated `dist` content and no canonical paper record was modified by this re-index.
