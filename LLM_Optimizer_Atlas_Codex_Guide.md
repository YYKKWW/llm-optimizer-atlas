# LLM 优化器 × 传统优化：个人学习网页 Codex 实施手册

## 1. 项目目标

建立一个可持续维护的个人学习网页，用于整理：

- LLM 预训练优化器；
- 范数、对偶与最速下降；
- 矩阵预条件与近似二阶方法；
- 流形、谱球与谱范数约束；
- 低秩、低精度、通信与内存优化；
- benchmark、scaling law 与公平比较；
- 与 MCSD、PGD、SPEL、inexact LMO 相关的开放问题。

第一版采用 **Astro + Starlight + Markdown/MDX + YAML**。  
原则是：结构化事实存入 `papers.yml`，个人理解写入 Markdown，避免 Codex 自动覆盖人工笔记。

---

## 2. 推荐文献地图

### 2.1 范数、对偶与最速下降

重点问题：

- 不同优化器对应什么 primal norm 和 dual norm？
- matrix sign 是否可解释为谱范数几何下的 duality map？
- layerwise norm、product norm 和全局 norm 有何差异？
- LMO、steepest descent、mirror descent 和 proximal step 如何统一？

第一批文献：

1. *Old Optimizer, New Norm*
2. *Modular Duality in Deep Learning*
3. *Training Deep Learning Models with Norm-Constrained LMOs*
4. *Muon is Scalable for LLM Training*
5. *The Polar Express*

建议记录每篇论文的精确更新式，而不只记录口号。

### 2.2 结构化预条件与近似二阶方法

重点问题：

- 预条件器逼近 Hessian、Fisher 还是梯度二阶矩？
- diagonal、layerwise、Kronecker 和 full-matrix 结构的收益如何比较？
- 预条件器更新频率如何影响偏差、方差和计算成本？
- token efficiency 是否能转化为 wall-clock efficiency？

第一批文献：

1. *SOAP*
2. *Structured Preconditioners in Adaptive Optimization*
3. *Understanding and Improving Shampoo and SOAP via KL Minimization*
4. Shampoo、Adafactor、K-FAC 相关基础文献

### 2.3 显式约束、流形与谱控制

重点问题：

- spectral sphere 在最大奇异值单重时的局部光滑结构；
- 最大奇异值重数大于一时的 tangent cone 和 normal cone；
- power iteration 只返回一个奇异向量时是否选择了错误法向；
- 显式投影、retraction、PGD 和 MCSD 分支如何组合；
- spectral constraint 与 weight decay 是否等价。

第一批文献：

1. *Controlled LLM Training on the Spectral Sphere*
2. *Demystifying Manifold Constraints in LLM Training*
3. *Hyperball*
4. *Pion*
5. *SPECTRA*
6. *TEON*

其中较新的预印本应放在 `watchlist`，不要默认视为已经建立的结论。

### 2.4 Benchmark、scaling 与公平比较

网页应同时记录：

- loss vs tokens；
- loss vs FLOPs；
- loss vs wall-clock；
- optimizer-state memory；
- 超参数搜索预算；
- 参数分组与宽度缩放规则；
- 模型规模和 data-to-parameter ratio。

第一批文献：

1. *Benchmarking Optimizers for Large Language Model Pretraining*
2. *Fantastic Pretraining Optimizers and Where to Find Them*
3. *Hyperparameter Transfer Enables Consistent Gains of Matrix-Based Optimizers in LLM Pretraining*

应单独建立 **Where papers disagree** 页面，记录文献之间的矛盾，而不是简单汇总“谁最好”。

### 2.5 内存、通信、近似线性代数与有限精度

重点问题：

- 低秩梯度子空间产生的投影偏差；
- moving subspace 的收敛；
- Newton–Schulz 截断误差；
- bfloat16 舍入误差；
- matrix sign、SVD 和 power iteration 的近似误差；
- 分布式 reduction 与量化噪声；
- optimizer state 的低比特表示。

第一批文献：

1. *GaLore*
2. 低精度 Muon / quantized optimizer state 相关工作
3. Newton–Schulz、polar decomposition 和 randomized SVD 基础文献

---

## 3. 值得进一步研究的传统优化问题

### 3.1 Spectral sphere 的非光滑区域

定义安全区域

\[
\Omega_\Delta
=
\left\{
W:
\sigma_1(W)-\sigma_2(W)\ge \Delta
\right\}.
\]

在 \(\Omega_\Delta\) 中使用 tangent-projected MCSD，在补集中使用 PGD。目标是证明任意聚点满足 spectral sphere 上的 B-stationarity。

### 3.2 Inexact matrix-sign LMO

实践中只能得到近似方向 \(\widetilde d_t\)。可研究如下相对精度条件：

\[
\langle g_t,\widetilde d_t\rangle
\le
-(1-\delta_t)\|g_t\|_*.
\]

需要确定：

- \(\delta_t\) 是否必须趋于零；
- 固定 Newton–Schulz 步数是否足够；
- bfloat16 和量化误差如何进入复杂度；
- 谱间隙如何影响 oracle 误差。

### 3.3 显式约束与 weight decay

比较

\[
W_{t+1}=P_C(W_t-\eta_t g_t)
\]

和

\[
W_{t+1}=(1-\eta_t\lambda)W_t-\eta_t g_t.
\]

需要区分：

- 参数范数是否受控；
- 一阶 KKT 条件是否一致；
- stochastic stationary distribution 是否一致；
- 约束半径和 weight decay 系数之间能否稳定转换。

### 3.4 非欧几里得优化器的超参数迁移

研究宽度变化下：

- 学习率是否可保持；
- update-to-weight ratio 是否稳定；
- spectral/nuclear geometry 是否改善 transfer；
- 参数化规则和优化器几何是否不可分离。

### 3.5 公平 benchmark 的数学设计

至少同时报告：

\[
\text{loss vs tokens},\qquad
\text{loss vs FLOPs},\qquad
\text{loss vs wall-clock}.
\]

并控制：

- tuning budget；
- optimizer state；
- warmup；
- weight decay；
- 参数分组；
- matrix operation overhead；
- 训练长度；
- data-to-parameter ratio。

---

## 4. 推荐项目结构

```text
llm-optimizer-atlas/
├── AGENTS.md
├── README.md
├── astro.config.mjs
├── package.json
├── src/
│   ├── content/
│   │   └── docs/
│   │       ├── index.mdx
│   │       ├── roadmap.mdx
│   │       ├── literature-map/
│   │       │   ├── norm-duality.mdx
│   │       │   ├── preconditioning.mdx
│   │       │   ├── manifold-constraints.mdx
│   │       │   ├── benchmarking.mdx
│   │       │   └── systems.mdx
│   │       ├── paper-notes/
│   │       ├── open-problems/
│   │       ├── experiment-notes/
│   │       └── watchlist/
│   ├── data/
│   │   └── papers.yml
│   └── components/
│       ├── PaperCard.astro
│       ├── PaperTable.astro
│       └── ClaimEvidence.astro
├── scripts/
│   ├── validate-papers.mjs
│   ├── generate-paper-pages.mjs
│   └── check-links.mjs
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 5. 数据设计

每篇论文在 `papers.yml` 中记录：

```yaml
- id: example-paper
  title: Example Paper
  authors:
    - Author One
    - Author Two
  year: 2026
  status: preprint
  venue: ""
  paper_url: ""
  code_url: ""
  tags:
    - spectral-constraint
    - llm-pretraining

  core_claim: >
    TODO_UNVERIFIED

  traditional_optimization_link:
    - nonsmooth optimization
    - manifold optimization

  evidence:
    model_scales: ""
    datasets: ""
    token_budget: ""
    compute_budget: ""
    baseline_tuning: ""
    wall_clock_reported: false
    optimizer_state_reported: false

  limitations:
    - TODO_UNVERIFIED

  reading_status: unread
  last_verified: null

  human_notes: |
    此处由本人维护，自动化脚本不得覆盖。
```

必须显式区分：

```yaml
status: preprint
status: accepted
status: published
```

无法核实的信息使用：

```text
TODO_UNVERIFIED
```

---

## 6. 单篇论文笔记模板

```markdown
# Paper title

## 1. Problem
论文解决什么问题？

## 2. Exact update rule
给出精确算法更新式。

## 3. Geometry
采用什么 norm、metric、constraint 或 preconditioner？

## 4. Traditional optimization interpretation
对应 steepest descent、mirror descent、proximal、LMO、
natural gradient、quasi-Newton 或 manifold optimization 中的哪一类？

## 5. Main theorem
列出主要结论和全部关键假设。

## 6. Computational cost
每步额外 FLOPs、通信量和 optimizer-state memory。

## 7. Experimental protocol
模型、数据、token budget、baseline tuning、硬件和训练长度。

## 8. Strongest evidence
最有说服力的理论或实验证据是什么？

## 9. Weaknesses
有哪些结论尚未被理论或实验充分支持？

## 10. Connection to my work
与 MCSD、PGD、SPEL、spectral sphere 和 inexact LMO 的联系。
```

---

## 7. Windows + VS Code + Codex 使用流程

### 第一步：准备环境

安装：

- Git；
- Node.js LTS；
- VS Code；
- Codex 扩展。

在 PowerShell 中检查：

```powershell
git --version
node --version
npm --version
```

### 第二步：创建空仓库

```powershell
mkdir llm-optimizer-atlas
cd llm-optimizer-atlas
git init
code .
```

将本启动包中的以下文件复制到仓库根目录：

```text
AGENTS.md
seed-papers.md
papers.example.yml
prompts/
```

### 第三步：让 Codex 执行阶段 1

在 Codex 中打开：

```text
prompts/01-scaffold-site.txt
```

将全文作为任务提交。

完成后检查：

```powershell
npm install
npm run dev
```

### 第四步：逐阶段执行

依次执行：

```text
02-add-schema.txt
03-add-seed-literature.txt
04-generate-pages.txt
05-audit-project.txt
```

每个阶段完成后单独提交：

```powershell
git add .
git commit -m "scaffold literature atlas"
```

不要让 Codex 一次同时修改框架、文献事实和数学笔记。

### 第五步：部署

完成站点后：

1. 在 GitHub 创建同名仓库；
2. 推送本地仓库；
3. 添加 GitHub Pages workflow；
4. 要求 workflow 依次运行：
   - YAML/schema validation；
   - link check；
   - Astro production build；
   - Pages deployment。

---

## 8. Codex 工作原则

Codex 必须：

1. 先检查仓库，再修改；
2. 优先使用论文原文、官方会议页面和官方代码仓库；
3. 不得杜撰发表状态、定理、数字或 URL；
4. 所有定量结论必须记录模型规模、训练预算、基线和指标；
5. 不得自动覆盖 `human_notes`；
6. 每次修改后运行 validation 和 production build；
7. 在最终报告中列出：
   - 修改文件；
   - 执行命令；
   - 测试结果；
   - 未核实事项。

---

## 9. 首页建议

首版设置六个入口：

1. Literature Map
2. Paper Library
3. Claim–Evidence Matrix
4. Open Problems
5. Reading Queue
6. Experiment Ledger

其中最重要的专题页是：

```text
Where papers disagree
```

建议记录：

- Muon 收益是否随模型规模减弱；
- hyperparameter transfer 是否解释 benchmark 矛盾；
- spectral constraint 是否优于 weight decay；
- token efficiency 是否转化为 wall-clock efficiency；
- matrix-sign 近似误差是否影响训练稳定性。

---

## 10. 第一版完成标准

第一版不追求论文数量，要求：

- 网站可以本地运行；
- 至少包含 12 篇已核实的 seed papers；
- 每篇论文有结构化 metadata；
- 至少有五条 literature tracks；
- 有一个 claim–evidence comparison 页面；
- 有一个 open problems 页面；
- 有清晰的 preprint/accepted/published 状态；
- 所有未核实事实明确标为 `TODO_UNVERIFIED`；
- `npm run build` 成功；
- 自动化脚本不覆盖人工笔记。
