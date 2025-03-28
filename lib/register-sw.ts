export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((_registration) => {
          console.log('Service Worker registered: ', _registration);
        })
        .catch((_error) => {
          console.log('Service Worker registration failed: ', _error);
        });
    });
  }
}
