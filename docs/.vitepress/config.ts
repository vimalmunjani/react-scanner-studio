import { defineConfig } from 'vitepress';

const hostname = 'https://reactscanner.studio';
const defaultTitle = 'React Scanner Studio - Interactive Component Usage Dashboard & Analysis';
const defaultDescription =
  'A portable, interactive dashboard for analyzing React component usage across your codebase';

export default defineConfig({
  title: defaultTitle,
  description: defaultDescription,
  lang: 'en',
  base: '/',
  titleTemplate: ':title | React Scanner Studio - Interactive Component Usage Dashboard & Analysis',

  sitemap: {
    hostname,
  },

  themeConfig: {
    logo: '/logo.png',
    lastUpdated: true,
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
          { text: 'Screenshots', link: '/guide/screenshots' },
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
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['meta', { name: 'keywords', content: 'React, component usage, design system, codebase analysis, react-scanner, dashboard, static analysis' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    // Open Graph (page-specific og:title, og:description, og:url added via transformPageData)
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: defaultTitle }],
    ['meta', { property: 'og:image', content: `${hostname}/logo.png` }],
    ['meta', { property: 'og:locale', content: 'en' }],
    // Twitter Card (page-specific title/description added via transformPageData)
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${hostname}/logo.png` }],
    // Preconnect to analytics origin so the deferred script connects faster when it loads
    ['link', { rel: 'preconnect', href: 'https://cloud.umami.is', crossorigin: 'anonymous' }],
    // Load analytics after page is interactive to avoid impacting LCP and INP (PageSpeed)
    [
      'script',
      {},
      `(function(){function l(){var s=document.createElement('script');s.async=true;s.src='https://cloud.umami.is/script.js';s.setAttribute('data-website-id','189fe392-f9a9-458c-bf3b-b954d279af56');document.head.appendChild(s);}if('requestIdleCallback' in window)requestIdleCallback(l,{timeout:3500});else window.addEventListener('load',l);})();`,
    ],
  ],

  transformPageData(pageData) {
    const slug = pageData.relativePath
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '');
    const path = slug ? `/${slug}` : '/';
    const canonicalUrl = `${hostname}${path}`;
    const title = pageData.title || defaultTitle;
    const description = pageData.description || defaultDescription;

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
    );

    // Preload LCP image on homepage to improve Largest Contentful Paint (PageSpeed)
    if (pageData.relativePath === 'index.md') {
      pageData.frontmatter.head.push([
        'link',
        { rel: 'preload', href: '/logo-320.png', as: 'image', fetchpriority: 'high' },
      ]);
    }
  },
});
