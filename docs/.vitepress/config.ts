import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'React Scanner Studio',
  description:
    'A dashboard generator that transforms react-scanner output into a portable, interactive component usage insights dashboard',
  base: '/',

  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start/' },
      { text: 'CLI Reference', link: '/cli/' },
      { text: 'Configuration', link: '/configuration/' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is React Scanner Studio?', link: '/guide/' },
          { text: 'Installation', link: '/guide/installation' },
        ],
      },
      {
        text: 'Quick Start',
        items: [
          { text: 'Overview', link: '/quick-start/' },
          { text: 'Automated Setup', link: '/quick-start/automated' },
          { text: 'Manual Setup', link: '/quick-start/manual' },
          { text: 'LLM-Assisted Setup', link: '/quick-start/llm-assisted' },
        ],
      },
      {
        text: 'CLI Commands',
        items: [
          { text: 'Overview', link: '/cli/' },
          { text: 'init', link: '/cli/init' },
          { text: 'scan', link: '/cli/scan' },
          { text: 'start', link: '/cli/start' },
          { text: 'build', link: '/cli/build' },
        ],
      },
      {
        text: 'Configuration',
        items: [
          { text: 'react-scanner.config.js', link: '/configuration/' },
          { text: 'Configuration Options', link: '/configuration/options' },
        ],
      },
      {
        text: 'CI/CD Integration',
        items: [
          { text: 'Overview', link: '/advanced/ci-cd/' },
          { text: 'GitHub Actions', link: '/advanced/ci-cd/github-actions' },
          { text: 'GitLab CI', link: '/advanced/ci-cd/gitlab-ci' },
          { text: 'CircleCI', link: '/advanced/ci-cd/circleci' },
          { text: 'Azure Pipelines', link: '/advanced/ci-cd/azure-pipelines' },
        ],
      },
      {
        text: 'Advanced',
        items: [{ text: 'Troubleshooting', link: '/advanced/troubleshooting' }],
      },
    ],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/vimalmunjani/react-scanner-studio',
      },
      {
        icon: 'linkedin',
        link: 'https://www.linkedin.com/in/vimalmunjani/',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright:
        'Created with ❤️ by <a href="https://www.linkedin.com/in/vimalmunjani/" target="_blank">Vimal Munjani</a>',
    },

    search: {
      provider: 'local',
    },
  },

  head: [
    ['link', { rel: 'icon', href: '/react-scanner-studio/favicon.ico' }],
    [
      'script',
      {
        async: '',
        src: 'https://cloud.umami.is/script.js',
        'data-website-id': '189fe392-f9a9-458c-bf3b-b954d279af56',
      },
    ],
  ],
});
