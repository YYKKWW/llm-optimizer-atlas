# Incremental literature update — 2026-07-17

Status: candidate report only; nothing in this report is verified canonical content.

Search window used for journal queries: `2026-07-16` through `2026-07-17` (inclusive). Conference adapters re-scan the current and previous official proceedings rather than applying the journal date window.

## Guardrails and repository state

- The applicable root `AGENTS.md`, the 15 canonical paper records, 8 open-problem records, discovery configuration, prior 60-candidate artifact, current discovery code, and Git history for the requested state files were inspected before this report was written.
- `research/search-state.yml` does not exist in the working tree or Git history. Therefore no venue has a repository checkpoint that can truthfully be called its “last successful verified retrieval date.” The prior artifact's `window_end: 2026-07-16` was used only as a traceable temporary lower bound, not as a checkpoint.
- `research/review-decisions.yml` also does not exist in the working tree or Git history. The labels **include**, **watch**, and **exclude** below are recommendations for a human reviewer, not review decisions and not authorization to publish.
- No canonical paper, open-problem, generated content, or search-state file was changed. No paper was promoted.
- Retrieval used only the configured official endpoints: Crossref journal records for the two journals, official ICLR proceedings, official PMLR proceedings for ICML, and official NeurIPS proceedings. Retrieved text was treated as untrusted data and no external instruction was executed.

## Retrieval and comparison summary

The incremental discovery command produced 55 unverified conference carryovers in `.artifacts/discovery/2026-07-17/`. Comparing semantic fields with the prior artifact showed 55 identical candidate IDs, zero new conference candidate IDs, and zero changed versions. Only retrieval timestamps changed. Five journal candidates in the prior six-month artifact fell outside the one-day window and were therefore absent from the current artifact.

The journal adapters found one new bibliographic record, which the automatic relevance filter correctly rejected. A manual, priority-driven spot check of official proceedings also found high-priority 2025 papers that both the prior and current automatic candidate artifacts missed. These are logged below as **historical backfill false negatives**, not as papers newly published during the incremental window. This spot check demonstrates a recall defect in the current title-term profiles; it is not an exhaustive historical re-index.

No checkpoint was advanced for any venue. The reason is explicit: the requested state file is absent, conference adapters do not provide date-bounded incremental semantics, and some metadata verification remains unresolved.

## Venue-by-venue retrieval report

| Venue | Configured official source | Retrieved / profile matches | Incremental outcome | Verification and checkpoint disposition |
| --- | --- | ---: | --- | --- |
| Mathematical Programming | Crossref, ISSN `0025-5610` | 0 / 0 | Exact journal window returned no records. | Successful empty query. No checkpoint written because no state file exists. |
| SIAM Journal on Optimization | Crossref, ISSN `1052-6234` | 1 / 0 | One online-published journal article; excluded after abstract-level review. | Venue, volume, issue, pages, DOI, and online date verified through deposited SIAM metadata. Direct SIAM page returned HTTP 403, leaving some metadata unresolved. No checkpoint written. |
| ICLR | Official ICLR proceedings | 3,703 / 13 | All 13 are unchanged ICLR 2025 carryovers. No new ID or version. | Official 2025 proceedings status verified. The 2026 official index currently exposes zero papers, and candidate dates/DOIs are null. No checkpoint written. |
| ICML | Official PMLR proceedings | 3,330 / 13 | All 13 are unchanged ICML 2025/PMLR 267 carryovers. No new ID or version. | Official venue and publication status verified; exact per-paper publication dates remain unresolved. No checkpoint written. |
| NeurIPS | Official NeurIPS proceedings | 5,823 / 29 | All 29 are unchanged NeurIPS 2025 carryovers. No new ID or version. | All 29 are published in NeurIPS 2025 proceedings. Proceedings metadata exposes a 2026-04-23 citation date while the artifact has null dates; policy is unresolved. No checkpoint written. |

Official journal queries:

- [Mathematical Programming exact Crossref window](https://api.crossref.org/journals/0025-5610/works?filter=from-pub-date%3A2026-07-16%2Cuntil-pub-date%3A2026-07-17&rows=100&select=DOI%2Ctitle%2Cauthor%2Cpublished-online%2Cpublished-print%2Cpublished%2CURL%2Cabstract%2Csubject)
- [SIAM Journal on Optimization exact Crossref window](https://api.crossref.org/journals/1052-6234/works?filter=from-pub-date%3A2026-07-16%2Cuntil-pub-date%3A2026-07-17&rows=100&select=DOI%2Ctitle%2Cauthor%2Cpublished-online%2Cpublished-print%2Cpublished%2CURL%2Cabstract%2Csubject)

## The only newly retrieved journal record

**Exclude — Complexity of Minimizing Regularized Convex Quadratic Functions.** Daniel Berg Thomsen and Nikita Doikov; *SIAM Journal on Optimization* 36(3), 1509–1536; DOI [`10.1137/25M1736578`](https://doi.org/10.1137/25M1736578); published online 2026-07-16; deposited print date 2026-09-30.

The paper studies first-order complexity for smooth convex quadratics regularized by powers of the Euclidean norm, including a cubic-regularized special case. This is objective regularization, not norm-induced steepest-descent geometry, a duality map, an LMO, a spectral/closed-set constraint, or an LLM optimizer. It has only weak priority-2/7 adjacency and does not merit full reading for the current atlas. It is not a DOI/title/author duplicate of the canonical dataset or prior candidate sets, and it presents no identified conflict with existing atlas papers.

## Ranked candidate report

These rankings prioritize full reading. “Include” means “recommend an explicit human include decision after reading,” never automatic promotion.

1. **Include / full read — [SUMO: Subspace-Aware Moment-Orthogonalization for Accelerating Memory-Efficient LLM Training](https://proceedings.neurips.cc/paper_files/paper/2025/hash/d85a66edadd443ac2350e93c0287f4f9-Abstract-Conference.html)** (NeurIPS 2025; historical backfill false negative). Exact-SVD moment orthogonalization, norm-induced steepest descent, approximation error, and LLM memory make it the strongest direct bridge between matrix-sign accuracy and systems cost.
2. **Include / full read — [Purifying Shampoo: Investigating Shampoo's Heuristics by Decomposing its Preconditioner](https://proceedings.neurips.cc/paper_files/paper/2025/hash/f14f4eda29a74c02c803699a09529bb9-Abstract-Conference.html)** (NeurIPS 2025; backfill). Directly separates Shampoo eigenvalue/eigenbasis errors, analyzes grafting and stale preconditioners, and proposes adaptive eigenbasis computation.
3. **Include / full read — [Implicit Bias of Spectral Descent and Muon on Multiclass Separable Data](https://proceedings.neurips.cc/paper_files/paper/2025/hash/386432c7534eec9a1cd7cbeea90d7e9f-Abstract-Conference.html)** (NeurIPS 2025; backfill). Gives a norm-based implicit-bias account of spectral descent and Muon in multiclass separable linear classification; the setting boundary must remain explicit.
4. **Include / full read — [Distributed Retraction-Free and Communication-Efficient Optimization on the Stiefel Manifold](https://proceedings.mlr.press/v267/song25c.html)** (ICML 2025; carryover). EF-Landing combines a retraction-free Stiefel method, compression, error feedback, stochastic analysis, and feasibility guarantees.
5. **Include / full read — [Parameter and Memory Efficient Pretraining via Low-rank Riemannian Optimization](https://proceedings.iclr.cc/paper_files/paper/2025/hash/16fafdc5e8ab22780873d607ce4387a8-Abstract-Conference.html)** (ICLR 2025; carryover). LORO directly joins LLM pretraining, low-rank manifolds, steepest descent, and memory; quantitative baseline and wall-clock conditions need full-paper verification.
6. **Include / full read — [FRUGAL: Memory-Efficient Optimization by Reducing State Overhead for Scalable Training](https://proceedings.mlr.press/v267/zmushko25a.html)** (ICML 2025; carryover). Direct pretraining evidence and a useful challenge to low-rank-only update strategies: low-dimensional stateful updates are combined with full-rank state-free updates.
7. **Include / full read — [A Memory Efficient Randomized Subspace Optimization Method for Training Large Language Models](https://proceedings.mlr.press/v267/chen25cj.html)** (ICML 2025; carryover). Covers LLM pretraining/fine-tuning, randomized subspaces, optimizer-state and activation memory, convergence, and communication.
8. **Include / full read — [Breaking the Frozen Subspace: Importance Sampling for Low-Rank Optimization in LLM Pretraining](https://proceedings.neurips.cc/paper_files/paper/2025/hash/0edd294b7632fc96903abfbf3b264fc1-Abstract-Conference.html)** (NeurIPS 2025; backfill). Claims dominant low-rank subspaces can freeze and proposes importance sampling with convergence guarantees.
9. **Include / full read — [AlphaDecay: Module-wise Weight Decay for Heavy-Tailed Balancing in LLMs](https://proceedings.neurips.cc/paper_files/paper/2025/hash/2aacf95ddc1ebd79832474bb41d13943-Abstract-Conference.html)** (NeurIPS 2025; backfill). Directly bears on weight-decay transfer and spectral module heterogeneity in 60M–1B pretraining.
10. **Include / full read — [MISA: Memory-Efficient LLMs Optimization with Module-wise Importance Sampling](https://proceedings.neurips.cc/paper_files/paper/2025/hash/73efab19ebde03ff0958f4f155483f57-Abstract-Conference.html)** (NeurIPS 2025; carryover). Direct LLM pretraining/fine-tuning, stochastic theory, module sampling, and memory accounting; matched-loss, wall-clock, and state-byte conditions need checking.
11. **Include / full read — [Efficient Distributed Optimization under Heavy-Tailed Noise](https://proceedings.mlr.press/v267/lee25ak.html)** (ICML 2025; carryover). TailOPT/Bi²Clip is relevant to heavy-tailed attention-model noise and adaptive behavior without transmitting extra optimizer statistics.
12. **Include / full read — [How Memory in Optimization Algorithms Implicitly Modifies the Loss](https://proceedings.neurips.cc/paper_files/paper/2025/hash/e4cc8ab4a64e99f962f36d07a7723d94-Abstract-Conference.html)** (NeurIPS 2025; carryover). A theory candidate for optimizer memory as loss perturbation, with a stated AdamW/Lion distinction.
13. **Include / full read — [Understanding Outer Optimizers in Local SGD: Learning Rates, Momentum, and Acceleration](https://proceedings.neurips.cc/paper_files/paper/2025/hash/90ad0e850532986dff56da49bc599904-Abstract-Conference.html)** (NeurIPS 2025; carryover). Distributed language-model experiments and inner/outer learning-rate interactions make it important for transfer and fair benchmarks.
14. **Include / full read — [Finding Low-Rank Matrix Weights in DNNs via Riemannian Optimization: RAdaGrad and RAdamW](https://proceedings.neurips.cc/paper_files/paper/2025/hash/5679173c400b332796426e443ab5ea0d-Abstract-Conference.html)** (NeurIPS 2025; backfill). Fixed-rank Riemannian optimization and adaptive metrics are directly relevant, although experiments are fine-tuning/compression rather than pretraining.
15. **Include / full read — [A geometric framework for momentum-based optimizers for low-rank training](https://proceedings.neurips.cc/paper_files/paper/2025/hash/81f1ae463ed30c5d44ff416d134f9071-Abstract-Conference.html)** (NeurIPS 2025; backfill). Connects dynamical low-rank approximation, momentum, geometry, and failure modes of conventional momentum on low-rank parameterizations.
16. **Include / full read — [COAT: Compressing Optimizer states and Activations for Memory-Efficient FP8 Training](https://proceedings.iclr.cc/paper_files/paper/2025/hash/6ac807c9b296964409b277369e55621a-Abstract-Conference.html)** (ICLR 2025; carryover). Direct finite-precision LLM training evidence; interpret its claims as systems/precision evidence, not optimizer ranking.
17. **Include / full read — [Efficient Pre-Training of LLMs via Topology-Aware Communication Alignment on More Than 9600 GPUs](https://proceedings.neurips.cc/paper_files/paper/2025/hash/d82c24b7a4237aa4283b38e12047dc38-Abstract-Conference.html)** (NeurIPS 2025; backfill). Important matched systems context for communication and end-to-end performance, even though it is a scheduling paper rather than an optimizer.
18. **Watch / full read — [PaZO: Preconditioned Accelerated Zeroth-Order Optimization for Fine-Tuning LLMs](https://proceedings.neurips.cc/paper_files/paper/2025/hash/a14193e9d9fb0b03af0b717de1cac8ac-Abstract-Conference.html)** (NeurIPS 2025; carryover). Strong approximate-oracle/preconditioning theory, but only fine-tuning evidence.
19. **Watch / full read — [StelLA: Subspace Learning in Low-rank Adaptation using Stiefel Manifold](https://proceedings.neurips.cc/paper_files/paper/2025/hash/6cb0c6e7d50d5d65613f0456ca85e2db-Abstract-Conference.html)** (NeurIPS 2025; backfill). Explicit Stiefel-constrained factors and a Euclidean-to-Riemannian optimizer conversion; fine-tuning scope lowers priority.
20. **Watch / full read — [Riemannian Diffusion Adaptation for Distributed Optimization on Manifolds](https://proceedings.mlr.press/v267/wang25h.html)** (ICML 2025; carryover). General-manifold decentralized online theory; experiments are PCA/GMM rather than LLMs.

## Potentially important for my manifold or close set optimizer research

Highest priority for this research thread:

1. **EF-Landing** — retraction-free Stiefel feasibility under stochastic gradients, compression, and error feedback; compare its smooth Stiefel geometry carefully with the nonsmooth spectral sphere at repeated leading singular values.
2. **LORO, RAdaGrad/RAdamW, and the geometric momentum framework** — three distinct ways to optimize low-rank structures. A full read should separate factor-manifold geometry, fixed-rank matrix geometry, and dynamical low-rank approximations.
3. **StelLA** — modular Riemannian optimization of Stiefel-constrained LoRA factors; useful for implementation patterns despite fine-tuning scope.
4. **Riemannian Diffusion Adaptation** — decentralized online optimization on general manifolds with non-asymptotic analysis.
5. **SUMO, Purifying Shampoo, and Spectral Descent/Muon implicit bias** — directly relevant to spectral matrix maps, approximate orthogonalization, induced norms, and matrix geometry, even when they do not impose a closed constraint set.
6. **Exploiting Similarity for Decentralized Optimization, PaZO, DiZO, Addax, and the low-rank ZO papers** — possible analogues for inexact projection/oracle tolerances, but guarantees cannot be transferred without matching oracle and feasible-set assumptions.

Important boundary: a smooth Stiefel retraction-free result does not establish B-stationarity or projection behavior for a nonsmooth spectral sphere. Likewise, a low-rank factorization method is not automatically an algorithm on the closed set of bounded-rank matrices.

## Where new papers disagree with the existing literature

No direct contradiction is established from official abstracts alone. The following are concrete tensions that merit matched-protocol full reading:

- **SUMO versus matrix-sign approximation evidence.** SUMO motivates exact-SVD moment orthogonalization, while the canonical Polar Express record and the existing matrix-sign-accuracy open problem question when higher approximation accuracy changes training. The algorithm, state, model, and accuracy regimes differ; this is a candidate disagreement, not a resolved contradiction.
- **Purifying Shampoo versus existing Shampoo/SOAP narratives.** It argues grafting compensates for stale or mis-scaled eigenvalues and that direct eigenvalue correction can remove grafting. This may qualify the canonical SOAP and KL-Shampoo interpretations, but requires checking implementations and update frequencies.
- **FRUGAL versus low-rank/subspace methods.** FRUGAL argues low-rank effective updates may discard useful gradient information, whereas LORO, randomized subspace optimization, and Breaking the Frozen Subspace report benefits from structured low-dimensional updates. They constrain or sample different objects, so matched ranks and token budgets are required.
- **AlphaDecay versus uniform transfer rules.** Module-specific decay chosen from spectral heavy-tail measures may complicate the canonical `1/width` weight-decay transfer rule and the open question relating explicit norm control to weight decay.
- **Outer Local SGD versus simple hyperparameter transfer.** A useful outer learning rate above one and compensation for inner-rate mistuning add topology/communication axes that model-size-only transfer rules and optimizer benchmarks may omit.
- **Optimizer memory as implicit regularization.** The AdamW/Lion distinction proposed by *How Memory...* suggests that comparisons based only on explicit weight decay or radial norm control may be incomplete.
- **COAT and topology-aware scheduling versus token efficiency.** Both provide system-level evidence that memory, precision, communication topology, and end-to-end wall clock can diverge from token efficiency. They complement rather than directly refute the canonical benchmark records.
- **EF-Landing versus spectral-sphere overhead.** Retraction-free compressed Stiefel optimization suggests a different constraint-handling design, but it does not refute solver/retraction costs on the nonsmooth spectral sphere.
- **Hyperparameter Transfer versus diminishing gains.** The already-canonical matrix-preconditioner transfer paper remains in conditional tension with *Fantastic Optimizers* on whether gains persist across scale. The current artifact is merely a duplicate of the canonical work, not new evidence.

## Historical backfill false negatives from official proceedings

These published papers were absent from both automated candidate artifacts. Their presence shows that the configured title-term conjunctions have insufficient recall. They are merged by official proceedings work identity; abstract, PDF, supplemental material, OpenReview, and arXiv links must not become separate candidates.

| Recommendation | Official work | Why retained or downgraded |
| --- | --- | --- |
| Include / full read | [SUMO](https://proceedings.neurips.cc/paper_files/paper/2025/hash/d85a66edadd443ac2350e93c0287f4f9-Abstract-Conference.html) | Direct matrix orthogonalization, exact SVD, approximation error, LLM training, and memory. |
| Include / full read | [Purifying Shampoo](https://proceedings.neurips.cc/paper_files/paper/2025/hash/f14f4eda29a74c02c803699a09529bb9-Abstract-Conference.html) | Direct Shampoo eigenbasis/eigenvalue approximation and update-frequency evidence. |
| Include / full read | [Implicit Bias of Spectral Descent and Muon](https://proceedings.neurips.cc/paper_files/paper/2025/hash/386432c7534eec9a1cd7cbeea90d7e9f-Abstract-Conference.html) | Direct induced-norm and Muon theory, with a narrow linear separable setting. |
| Include / full read | [Breaking the Frozen Subspace](https://proceedings.neurips.cc/paper_files/paper/2025/hash/0edd294b7632fc96903abfbf3b264fc1-Abstract-Conference.html) | Low-rank importance sampling and convergence in LLM pretraining. |
| Include / full read | [AlphaDecay](https://proceedings.neurips.cc/paper_files/paper/2025/hash/2aacf95ddc1ebd79832474bb41d13943-Abstract-Conference.html) | Module-wise spectral weight decay in 60M–1B LLM pretraining. |
| Include / full read | [Topology-Aware Communication Alignment](https://proceedings.neurips.cc/paper_files/paper/2025/hash/d82c24b7a4237aa4283b38e12047dc38-Abstract-Conference.html) | Large-scale end-to-end communication evidence; include as systems context, not optimizer efficacy. |
| Include / full read | [RAdaGrad and RAdamW](https://proceedings.neurips.cc/paper_files/paper/2025/hash/5679173c400b332796426e443ab5ea0d-Abstract-Conference.html) | Fixed-rank Riemannian matrix optimization and adaptive metrics; fine-tuning scope noted. |
| Include / full read | [Geometric framework for momentum-based low-rank training](https://proceedings.neurips.cc/paper_files/paper/2025/hash/81f1ae463ed30c5d44ff416d134f9071-Abstract-Conference.html) | Geometric failure modes and dynamical low-rank momentum methods. |
| Include / full read | [AdaRankGrad: Adaptive Gradient Rank and Moments for Memory-Efficient LLMs Training and Fine-Tuning](https://proceedings.iclr.cc/paper_files/paper/2025/hash/fe99ca7c293fe083c8fe7e85dce2f814-Abstract-Conference.html) | Adaptive low-rank gradients and moments with stated pretraining relevance. |
| Watch / full read | [Harmony in Divergence: Towards Fast, Accurate, and Memory-efficient Zeroth-order LLM Fine-tuning](https://proceedings.neurips.cc/paper_files/paper/2025/hash/ffd4f5a2ea6b93e9bf5af9264d568cf2-Abstract-Conference.html) | Layerwise zeroth-order projections and GPU-hour evidence, but fine-tuning only. |
| Watch / full read | [StelLA](https://proceedings.neurips.cc/paper_files/paper/2025/hash/6cb0c6e7d50d5d65613f0456ca85e2db-Abstract-Conference.html) | Explicit Stiefel geometry, but LoRA fine-tuning rather than pretraining. |
| Watch | [Enhancing Optimizer Stability: Momentum Adaptation of The NGN Step-size](https://proceedings.neurips.cc/paper_files/paper/2025/hash/1470947b2ecc3a877ef124b50efc4d37-Abstract-Conference.html) | Step-size robustness and stochastic convergence; no direct LLM or matrix/manifold evidence. |
| Watch / full read | [Addax](https://proceedings.iclr.cc/paper_files/paper/2025/hash/03560f68b1238221e7c07ad01c4b47aa-Abstract-Conference.html) | Hybrid first/zeroth-order memory tradeoff for language-model fine-tuning. |
| Watch / full read | [Enhancing Zeroth-order Fine-tuning for Language Models with Low-rank Structures](https://proceedings.iclr.cc/paper_files/paper/2025/hash/9ccc9d814d3dee4750debaf23061e733-Abstract-Conference.html) | Low-rank zeroth-order estimator for LLMs, but fine-tuning rather than pretraining. |
| Watch | [Zeroth-Order Fine-Tuning of LLMs with Transferable Static Sparsity](https://proceedings.iclr.cc/paper_files/paper/2025/hash/266983d0949aed78a16fa4782237dea7-Abstract-Conference.html) | Approximate-oracle and sparsity relevance; fine-tuning scope. |
| Watch | [Revisiting Zeroth-Order Optimization: Minimum-Variance Two-Point Estimators and Directionally Aligned Perturbations](https://proceedings.iclr.cc/paper_files/paper/2025/hash/2345275663a15ee92a06bc957be54a2c-Abstract-Conference.html) | General approximate-oracle theory; no direct LLM-pretraining or manifold result. |

## Disposition of all 55 automatic conference candidates

Every record below is an unchanged carryover from the prior candidate set. “Watch” records are downgraded from keyword relevance because their setting is narrower or indirect. “Exclude” records are retained in this audit trail so false positives are explainable.

### ICLR 2025 — 13 records

| Candidate ID | Recommendation | Title | Reason |
| --- | --- | --- | --- |
| `candidate-3b14aedab99654e1` | Include / full read | COAT | Direct FP8 optimizer-state/activation compression for LLM training; quantitative conditions need checking. |
| `candidate-7126388f712dc222` | Include / full read | Parameter and Memory Efficient Pretraining via Low-rank Riemannian Optimization | Direct LLM pretraining plus low-rank manifold steepest descent. |
| `candidate-94944b4213669b09` | Watch | Achieving Dimension-Free Communication in Federated Learning via Zeroth-Order Optimization | Low-effective-rank and communication theory, but federated fine-tuning. |
| `candidate-b4667eee9e90fff4` | Watch | Convergence of Distributed Adaptive Optimization with Local Updates | Useful Local Adam/SGDM and communication theory; no direct pretraining benchmark. |
| `candidate-9a5202fe1732cc97` | Watch / full read | Second-Order Fine-Tuning without Pain for LLMs | Diagonal-Hessian zeroth-order method; fine-tuning-only evidence. |
| `candidate-acfa5a3960d5078f` | Watch | Towards Faster Decentralized Stochastic Optimization with Communication Compression | Momentum tracking, compression, and error feedback; indirect to LLM/manifold questions. |
| `candidate-246b01f3c14be9eb` | Watch | Tuning-Free Bilevel Optimization | Adaptive-step theory is potentially useful but indirect to current algorithms and constraints. |
| `candidate-caf5eb676e685468` | Exclude | Deep Distributed Optimization for Large-Scale Quadratic Programming | Learned QP solver, not target optimizer or closed-set theory. |
| `candidate-529d5e94a744356f` | Exclude | Divergence-enhanced Knowledge-guided Context Optimization | Visual-language prompt method; “optimization” is task naming. |
| `candidate-6110f095b093a09a` | Exclude | Fine-Tuning Discrete Diffusion Models via Reward Optimization | Biological diffusion reward tuning, outside scope. |
| `candidate-0148f1d82a6933a6` | Exclude | SOO-Bench | Offline black-box design benchmark, unrelated domain. |
| `candidate-8b1ed0af3036c5b3` | Exclude | Towards hyperparameter-free optimization with differential privacy | DP-specific learning-rate automation is too indirect for the atlas. |
| `candidate-691d1594d49924c6` | Exclude | Tuning Timestep-Distilled Diffusion Model Using Pairwise Sample Optimization | Image-diffusion tuning, not model-parameter optimizer research. |

### ICML 2025 — 13 records

| Candidate ID | Recommendation | Title | Reason |
| --- | --- | --- | --- |
| `candidate-b0c590840b3ff75c` | Include / full read | A Memory Efficient Randomized Subspace Optimization Method for Training Large Language Models | Direct LLM subspace optimization, memory, convergence, and communication. |
| `candidate-1bd82b69734f1f11` | Include / full read | Distributed Retraction-Free and Communication-Efficient Optimization on the Stiefel Manifold | Direct manifold, feasibility, stochastic, and compressed distributed optimization. |
| `candidate-31ddd670bcafe59f` | Include / full read | Efficient Distributed Optimization under Heavy-Tailed Noise | Attention-model motivation plus adaptive/state/communication tradeoffs. |
| `candidate-fca2d98e7b2cd1a8` | Include / full read | FRUGAL | Direct scalable pretraining and optimizer-state reduction. |
| `candidate-a9b322d072f0f085` | Watch | ELMO | Float8, stochastic rounding, and memory are relevant; domain is extreme multilabel classification. |
| `candidate-d027502cea9ffd2f` | Watch | Exploiting Similarity for Computation and Communication-Efficient Decentralized Optimization | Relaxed proximal-subproblem accuracy may inform inexact-oracle work; no direct LMO/closed-set result. |
| `candidate-ff342d4f74311c12` | Watch | NestQuant | Low-precision matrix products, but post-training quantization rather than optimizer training. |
| `candidate-9fcee468b47e6abe` | Watch | PipeOffload | Systems context for activation memory/throughput; not an optimizer. |
| `candidate-385c0099bac454ee` | Watch / full read | Riemannian Diffusion Adaptation for Distributed Optimization on Manifolds | General-manifold decentralized theory; non-LLM experiments. |
| `candidate-1f1f375efaaf02e8` | Exclude | Data Mixing Optimization for Supervised Fine-Tuning of LLMs | Data-mixture selection, not parameter optimization. |
| `candidate-ffabc7d9eed10ab5` | Exclude | DMM | Cryptographic distributed-DP matrix mechanism, not matrix preconditioning. |
| `candidate-59d5a0a02c3c6615` | Exclude | Kona | Secure KNN communication protocol. |
| `candidate-854e8120de4a1c48` | Exclude | OpenworldAUC | Vision-language prompt evaluation/tuning, outside optimizer scope. |

### NeurIPS 2025 — 29 records

| Candidate ID | Recommendation | Title | Reason |
| --- | --- | --- | --- |
| `candidate-0a34095abe41f059` | Include / full read | MISA | Direct LLM pretraining/fine-tuning, module sampling, state memory, and stochastic theory. |
| `candidate-65a637efc4f7ec5f` | Include / full read | Understanding Outer Optimizers in Local SGD | Distributed LM training, learning-rate/momentum interaction, and communication. |
| `candidate-6ca04cc68937bfdb` | Include / full read | How Memory in Optimization Algorithms Implicitly Modifies the Loss | Direct theory for optimizer memory and implicit loss perturbation. |
| `candidate-e017eaf74ee78ee5` | Watch / full read | PaZO | Strong preconditioned zeroth-order theory, but LLM fine-tuning only. |
| `candidate-1ea77dd9654c8a9e` | Watch | Binary Quadratic Quantization | Matrix compression relevance, but ViT post-training quantization rather than optimizer-state training. |
| `candidate-211bdd1dda4087ef` | Watch | Geometry-Aware Collaborative Multi-Solutions Optimizer | Geometry language and fine-tuning relevance; no explicit manifold/closed-set result in the abstract. |
| `candidate-24301623d81f08e7` | Watch | PROFIT | Specialized temporal-gradient optimizer, but deep fine-tuning rather than pretraining. |
| `candidate-2d01aaf1129824fc` | Watch | The ML.ENERGY Benchmark | Inference-energy methodology may inform systems benchmarks; not training optimization. |
| `candidate-6d11459b71fe1c9c` | Watch | Cost-Sensitive Freeze-thaw Bayesian Optimization | Tuning-budget methodology; not optimizer hyperparameter transfer. |
| `candidate-9b74fd4e8c4f3eda` | Watch | Robust Federated Finetuning of LLMs via Alternating Optimization of LoRA | LLM and alternating optimization, but federated fine-tuning. |
| `candidate-cb825cb5ce3a6830` | Watch | Flow Density Control | General generative fine-tuning theory, not pretraining optimizer evidence. |
| `candidate-d4d280eb3f89eeab` | Exclude as duplicate / merge | Hyperparameter Transfer Enables Consistent Gains of Matrix-Preconditioned Optimizers Across Scales | Exact work already exists as canonical `hyperparameter-transfer-matrix-preconditioners`; no new version. |
| `candidate-0b5e9b2fa17c6c9d` | Exclude | Adaptive Divergence Regularized Policy Optimization | Generative-model policy fine-tuning, outside core scope. |
| `candidate-95457b933ab57234` | Exclude | Balanced Token Pruning | Vision-language token pruning, not optimizer scaling. |
| `candidate-46cb8726727646db` | Exclude | BO4Mob | Urban-mobility Bayesian-optimization benchmark. |
| `candidate-d5ec0ffe7d26ef8e` | Exclude | CoIDO | Visual-instruction data selection, not parameter optimization. |
| `candidate-967a492aaab66def` | Exclude | ConStellaration | Stellarator dataset/benchmark, keyword false positive. |
| `candidate-f6ba0cd04fb58710` | Exclude | DCcluster-Opt | Data-center workload multi-objective benchmark, not LLM optimizer training. |
| `candidate-3bf3bfdb05a21c90` | Exclude | Dual-Flow | Adversarial attack method, not transfer of optimizer hyperparameters. |
| `candidate-a0c8dcc1a7d5cae1` | Exclude | DP Federated Speech Recognition | Domain-specific DP/federated benchmark; too distant from priorities. |
| `candidate-15397e729e9b047e` | Exclude | GuideFlow3D | Appearance transfer; keyword false positive. |
| `candidate-e27361e4ead56e52` | Exclude | LC-Opt | Liquid-cooling control benchmark, not model training. |
| `candidate-61be88e0d4fbf028` | Exclude | MetaBox-v2 | General meta-black-box optimization platform, outside current atlas. |
| `candidate-07f0ef7c8044268d` | Exclude | Offline RL by Reward-Weighted Fine-Tuning | Conversation policy optimization, not optimizer research. |
| `candidate-c9e46dba0778a68b` | Exclude | OptiScene | LLM-driven scene layout generation; “optimization/scale” is not optimizer scaling. |
| `candidate-637e950bf08286eb` | Exclude | PolarQuant | KV-cache inference quantization; “polar” is a semantic false hit. |
| `candidate-ebe01f6121151ae5` | Exclude | RoPECraft | Diffusion motion transfer, not optimizer transfer. |
| `candidate-20f466eb20b0640d` | Exclude | SolverLLM | Test-time combinatorial search using an LLM, not LLM training optimization. |
| `candidate-b0432c8d2afe9a55` | Exclude | StruDiCO | Inference-stage combinatorial optimization, not training memory/optimizer evidence. |

## Prior journal candidates outside this incremental window

These five records were inspected for deduplication because they occur in the prior candidate set. They were not retrieved in the one-day query and are not newly verified here.

| Prior candidate | Recommendation | Reason |
| --- | --- | --- |
| `candidate-710388b85e43b29a` — High Probability Complexity Bounds of Trust-Region Stochastic SQP with Heavy-Tailed Noise | Watch | Potential general stochastic/inexact-oracle relevance; no direct LLM, matrix, or manifold evidence established. |
| `candidate-84703c2edd997975` — Unboundedness in Bilevel Optimization | Exclude | General bilevel pathology is too indirect for the current priorities. |
| `candidate-8c49c97a2534ce14` — A low-rank augmented Lagrangian method for polyhedral-SDP and moment-SOS relaxations | Watch | Low-rank and closed/conic-set theory may be useful; requires full verification before inclusion. |
| `candidate-9865e7bf3382e2e6` — Computational guarantees for restarted PDHG for LP | Exclude | Error-ratio/sharpness theory is currently too remote from MCSD/PGD/SPEL and spectral constraints. |
| `candidate-e467fb82ca259e6c` — Distributed Nonlinear Conic Optimization with Partially Separable Structure | Watch | Distributed constrained optimization may provide general theory, but no direct bridge has yet been verified. |

## Deduplication and version decisions

- The 55 current automatic candidate IDs exactly match 55 records in the prior artifact. Ignoring `provenance.retrieved_at`, their titles, authors, source keys, official URLs, relevance fields, and dedupe fields are unchanged. They are carryovers, not new versions.
- `candidate-d4d280eb3f89eeab` is the same official NeurIPS work as canonical `hyperparameter-transfer-matrix-preconditioners`; it must be merged, not added. The proceedings display “Charlie Chen,” while canonical metadata says “Zixi Chen”; this alias requires human resolution.
- The newly retrieved SIOPT DOI has no DOI/title/author match in the canonical dataset or prior candidate artifacts.
- No other exact normalized-title match was found against the 15 canonical papers. Manual backfill papers were counted once per official proceedings identity; linked PDFs, supplementals, OpenReview pages, or arXiv versions are supporting versions, not separate works.

## Unresolved metadata and verification failures

1. `research/search-state.yml` is absent, so the requested per-venue checkpoint cannot be read or advanced. No substitute state was silently created.
2. `research/review-decisions.yml` is absent, so no explicit human promotion decision exists.
3. The direct SIAM publisher page returned HTTP 403. Submission/acceptance dates, publisher keywords/MSC codes, license/OA status, arXiv relationship, and formula exponents hidden by Crossref's `[Formula: see text]` remain unverified.
4. Automatic ICLR/ICML/NeurIPS records have null publication dates, DOIs, and arXiv URLs despite verified official proceedings status. Exact day-level dates must not be inferred.
5. Checked NeurIPS 2025 pages expose `citation_publication_date=2026-04-23`; whether the atlas should record that date or the 2025 proceedings year needs a metadata-policy decision.
6. Candidate author arrays are normalized/alphabetized rather than preserving official author order. Canonical promotion would need source-order recovery.
7. The ICLR 2026 official proceedings index currently exposes zero papers. This may reflect an incomplete current-edition index rather than a verified empty publication interval.
8. Quantitative conditions for memory, speed, perplexity, state bytes, communication bytes, FLOPs, matched loss, seeds, and wall-clock comparisons require full-paper review before any claim is copied into the atlas.
9. The candidate matcher has a demonstrated recall failure: it missed multiple direct LLM pretraining, Muon/Shampoo, low-rank, manifold, and zeroth-order papers because profile matches rely heavily on title-term conjunctions. The backfill list above is a spot check, not proof of exhaustive recall.

## Recommended human decisions

- **Include after full reading:** the 17 high-priority works in the ranked list whose recommendation is include, with first attention to SUMO, Purifying Shampoo, Spectral Descent/Muon implicit bias, EF-Landing, LORO, FRUGAL, randomized subspace optimization, Breaking the Frozen Subspace, and AlphaDecay.
- **Watch:** narrow fine-tuning, generic manifold/inexact-oracle, finite-precision, communication, or systems-context papers listed above. Promote only if a human review identifies a precise claim/evidence bridge to an existing open problem.
- **Exclude:** scope/keyword false positives and the SIOPT regularized-quadratic record. Preserve the audit trail; do not delete prior artifacts merely because a record is excluded.
- **Merge, do not add:** the Hyperparameter Transfer NeurIPS candidate into the existing canonical work after resolving the author alias and only if a human decision explicitly requests a metadata correction.
- **Process decision needed:** create and approve a schema/policy for `research/search-state.yml` and `research/review-decisions.yml` before the next incremental run. A separate historical re-index should improve recall before any conference checkpoint is considered trustworthy.

No promotion was performed because there is no explicit human decision.
