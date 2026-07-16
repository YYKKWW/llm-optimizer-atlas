# Seed literature verification report

- Verification date: 2026-07-16 (Asia/Shanghai)
- Dataset: `src/data/papers.yml`
- Scope: the 15 entries in `seed-papers.md` only; Pion was selected for item 15.
- Method: publisher/conference pages and final papers take precedence over preprint metadata. ArXiv is used for version history and for papers that remain preprints. An official code URL is recorded only when the paper, project page, or author-owned repository establishes the connection.
- Interpretation boundary: `core_claim` summarizes what the paper claims; `traditional_optimization_link` is atlas interpretation. Exact updates and evidence fields are tied to the named source version. Every `human_notes` value was preserved.

## Successfully verified papers

All 15 seed entries have a primary paper source, exact canonical title and author list, an explicit status, a source version, and a verification date. Unknown fields remain explicit rather than inferred.

| # | Canonical paper | Verified status and source | Official code |
|---:|---|---|---|
| 1 | [Old Optimizer, New Norm: An Anthology](https://opt-ml.org/papers/2024/paper93.pdf) | Accepted, non-archival OPT2024 poster; arXiv:2409.20325v2 | `TODO_UNVERIFIED` |
| 2 | [Modular Duality in Deep Learning](https://proceedings.mlr.press/v267/bernstein25a.html) | Published, ICML 2025 / PMLR 267; arXiv:2410.21265v2 | [modula](https://github.com/modula-systems/modula) |
| 3 | [Training Deep Learning Models with Norm-Constrained LMOs](https://proceedings.mlr.press/v267/pethick25a.html) | Published, ICML 2025 / PMLR 267; arXiv:2502.07529v2 | [Scion](https://github.com/LIONS-EPFL/scion) |
| 4 | [Muon is Scalable for LLM Training](https://arxiv.org/abs/2502.16982) | Preprint, arXiv:2502.16982v1 | [Moonlight](https://github.com/MoonshotAI/Moonlight) |
| 5 | [The Polar Express: Optimal Matrix Sign Methods and Their Application to the Muon Algorithm](https://openreview.net/forum?id=yRtgZ1K8hO) | Published, ICLR 2026 oral; arXiv:2505.16932v5 | [PolarExpress](https://github.com/NoahAmsel/PolarExpress) |
| 6 | [SOAP: Improving and Stabilizing Shampoo using Adam for Language Modeling](https://proceedings.iclr.cc/paper_files/paper/2025/hash/e988664070e9591f93fdcf605f7dc623-Abstract-Conference.html) | Published, ICLR 2025; arXiv:2409.11321v2 | [SOAP](https://github.com/nikhilvyas/SOAP) |
| 7 | [Structured Preconditioners in Adaptive Optimization: A Unified Analysis](https://proceedings.mlr.press/v267/xie25j.html) | Published, ICML 2025 / PMLR 267; arXiv:2503.10537v2 | `TODO_UNVERIFIED` |
| 8 | [Understanding and Improving Shampoo and SOAP via Kullback-Leibler Minimization](https://openreview.net/forum?id=pQQuC1nIQq) | Published, ICLR 2026; extended arXiv:2509.03378v10 | [KL-Methods](https://github.com/yorkerlin/KL-Methods) |
| 9 | [Benchmarking Optimizers for Large Language Model Pretraining](https://arxiv.org/abs/2509.01440) | Preprint, arXiv:2509.01440v1; its NeurIPS 2025 and ICLR 2026 submissions do not establish acceptance | [llm-optimizer-benchmark](https://github.com/epfml/llm-optimizer-benchmark) |
| 10 | [Fantastic Pretraining Optimizers and Where to Find Them](https://openreview.net/forum?id=2J51qUZ0iG) | Published, ICLR 2026; arXiv:2509.02046v2 | [Marin optimizer branch](https://github.com/marin-community/marin/tree/kaiyue/optimizers) |
| 11 | [Hyperparameter Transfer Enables Consistent Gains of Matrix-Preconditioned Optimizers Across Scales](https://proceedings.neurips.cc/paper_files/paper/2025/file/bdcd9f6327db5877dee502cdec183159-Paper-Conference.pdf) | Published, NeurIPS 2025; arXiv:2512.05620v2 | [scaling-matrix-preconditioning](https://github.com/charliezchen/scaling-matrix-preconditioning) |
| 12 | [Controlled LLM Training on Spectral Sphere](https://openreview.net/pdf/b9ca84cc3b708b5d87723f4b63527fb35f937506.pdf) | Accepted, ICML 2026 final paper designated PMLR 306; arXiv:2601.08393v3 | [Spectral-Sphere-Optimizer](https://github.com/Unakar/Spectral-Sphere-Optimizer) |
| 13 | [Demystifying Manifold Constraints in LLM Pre-training](https://arxiv.org/abs/2605.04418) | Preprint, arXiv:2605.04418v1 | `TODO_UNVERIFIED` |
| 14 | [Fantastic Pretraining Optimizers and Where to Find Them II: Hyperball Optimization](https://arxiv.org/abs/2606.16899) | Preprint, arXiv:2606.16899v1 | `TODO_UNVERIFIED` |
| 15 | [Pion: A Spectrum-Preserving Optimizer via Orthogonal Equivalence Transformation](https://arxiv.org/abs/2605.12492) | Preprint, arXiv:2605.12492v1 | [Pion](https://github.com/Sphere-AI-Lab/pion) |

Pion was selected over SPECTRA and TEON because its arXiv record, paper, and author-owned implementation form a complete primary-source chain for this verification pass.

## Unresolved metadata

- Official code remains `TODO_UNVERIFIED` for papers 1, 7, 13, and 14.
- Paper 4 does not identify a reproducible canonical corpus for its principal training runs; `evidence.datasets` remains `TODO_UNVERIFIED`.
- Paper 9 has submitted-only [NeurIPS 2025](https://openreview.net/forum?id=fL9qDVnMJF) and [ICLR 2026](https://openreview.net/forum?id=Jw7khYzYzl) records but no verified acceptance or proceedings record; `venue` remains `TODO_UNVERIFIED` and the record remains a preprint.
- Paper 11 has a verified NeurIPS proceedings paper but no unambiguous single-day publication date; `publication_date` and `evidence.optimizer_state_reported` remain `TODO_UNVERIFIED`.
- Paper 12 is listed by the [official ICML 2026 downloads page](https://icml.cc/Downloads/2026), and its final PDF identifies PMLR 306. The PMLR article/volume page is not yet available, so the record is conservatively `accepted` and `publication_date` remains `TODO_UNVERIFIED`; the arXiv v3 date is not substituted for the publication date.
- Paper 15 does not provide a complete matched compute budget; `evidence.compute_budget` remains `TODO_UNVERIFIED`.

## Conflicting or conditional claims

- SOAP attributes robustness to retaining Adam-style adaptivity in a slowly refreshed Shampoo eigenbasis. The KL paper argues that a jointly fitted KL covariance model can remove Adam grafting and its extra state. These are competing design explanations, not a matched replication.
- The Semenov benchmark often favors AdEMAMix, MARS, and D-Muon in its tested regimes, whereas the Wen benchmark often favors Muon, SOAP, Kron, or Scion in large-batch TPU regimes. Batch size, hardware, horizon, schedule, and optimizer-specific tuning differ, so neither ranking is treated as universal.
- *Fantastic Pretraining Optimizers I* reports diminishing matrix-method advantage with scale under its protocol. The hyperparameter-transfer paper argues that incorrect learning-rate and weight-decay transfer explains much of that diminution and reports persistent gains under its own parameterization. The dataset records both claims with their respective protocols.
- Moonlight emphasizes decoupled weight decay for its long scaling run, while Polar Express reports main Muon experiments that can omit it. The implementations, momentum rules, normalization, and training protocols differ, so the atlas does not collapse them into one canonical Muon update.
- The hyperparameter-transfer paper recommends width-scaled weight decay, while Hyperball replaces it for selected matrices with projection to a fixed Frobenius radius. These are alternative scale-control mechanisms rather than interchangeable formulas.
- SSO optimizes on a spectral sphere that is nonsmooth at repeated top singular values. MACRO's compact smooth-manifold convergence result therefore does not establish convergence for the full spectral-sphere case.
- Pion's exact two-sided matrix-exponential update preserves the singular spectrum; its practical second-order exponential truncation only preserves it approximately.

## Papers that remain preprints

1. Muon is Scalable for LLM Training: arXiv:2502.16982v1.
2. Benchmarking Optimizers for Large Language Model Pretraining: arXiv:2509.01440v1.
3. Demystifying Manifold Constraints in LLM Pre-training: arXiv:2605.04418v1.
4. Fantastic Pretraining Optimizers and Where to Find Them II: Hyperball Optimization: arXiv:2606.16899v1.
5. Pion: A Spectrum-Preserving Optimizer via Orthogonal Equivalence Transformation: arXiv:2605.12492v1.
