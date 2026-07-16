import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  output: 'static',
  site: 'https://YYKKWW.github.io',
  base: '/llm-optimizer-atlas',
  integrations: [
    starlight({
      title: 'LLM Optimizer Atlas',
      description:
        'A verified personal literature atlas for LLM optimizers and mathematical optimization.',
      customCss: ['./src/styles/atlas.css'],
      social: [
        {
          icon: 'github',
          label: 'LLM Optimizer Atlas on GitHub',
          href: 'https://github.com/YYKKWW/llm-optimizer-atlas',
        },
      ],
      sidebar: [
        {
          label: 'Overview',
          items: [{ label: 'Home', link: '/' }],
        },
        {
          label: 'Literature Map',
          items: [
            { label: 'Map overview', link: '/literature-map/' },
            {
              label: 'Norms, duality & steepest descent',
              link: '/literature-map/norm-duality/',
            },
            {
              label: 'Structured preconditioning',
              link: '/literature-map/preconditioning/',
            },
            {
              label: 'Constraints, manifolds & spectra',
              link: '/literature-map/manifold-constraints/',
            },
            {
              label: 'Benchmarking & scaling',
              link: '/literature-map/benchmarking/',
            },
            {
              label: 'Systems & efficient optimization',
              link: '/literature-map/systems/',
            },
          ],
        },
        {
          label: 'Evidence',
          items: [
            { label: 'Paper Library', link: '/paper-notes/' },
            {
              label: 'Claim–Evidence Matrix',
              link: '/claim-evidence-matrix/',
            },
            {
              label: 'Benchmark Comparisons',
              link: '/benchmark-comparisons/',
            },
          ],
        },
        {
          label: 'Research Workflow',
          items: [
            { label: 'Open Problems', link: '/open-problems/' },
            { label: 'Reading Queue', link: '/reading-queue/' },
            { label: 'Watchlist', link: '/watchlist/' },
            { label: 'Experiment Ledger', link: '/experiment-notes/' },
          ],
        },
        {
          label: 'Synthesis',
          items: [
            {
              label: 'Where Papers Disagree',
              link: '/where-papers-disagree/',
            },
          ],
        },
      ],
    }),
  ],
});
