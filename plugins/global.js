export default defineNuxtPlugin(() => {
    if (typeof global === 'undefined') {
      global = window;
    }
  });
  