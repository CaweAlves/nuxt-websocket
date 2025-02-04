// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  plugins: ['~/plugins/global.js', '~/plugins/socket.js'],
  compatibilityDate: '2025-02-01',
})