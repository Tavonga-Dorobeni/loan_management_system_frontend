export default defineNuxtConfig({
  compatibilityDate: '2025-02-01',
  devtools: {
    enabled: true
  },
  srcDir: '.',
  dir: {
    app: 'app'
  },
  css: ['~/app/app.css'],
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    }
  },
  app: {
    head: {
      titleTemplate: '%s | Operations Workspace',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        },
        {
          name: 'theme-color',
          content: '#0f766e'
        }
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap'
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png'
        }
      ]
    }
  },
  devServer: {
    port: 3001
  },
  typescript: {
    strict: true,
    typeCheck: false
  },
  imports: {
    dirs: ['app/stores', 'app/composables', 'app/utils', 'app/lib']
  }
});
