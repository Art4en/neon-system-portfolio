import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/orbitron/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '@fontsource-variable/space-grotesk/wght.css';
import './styles/globals.css';
import './styles/components.css';
import App from './App';
import { content } from './content/portfolio';
import { collectTodos } from './content/placeholder';
import { handle } from './lib/content';
import { sfx } from './audio/synth';
import { useAppStore } from './store/useAppStore';

sfx.setEnabled(useAppStore.getState().soundOn);

// Message pour les recruteurs curieux qui ouvrent la console 👀
console.log(
  `%c
 ███╗   ██╗███████╗ ██████╗ ███╗   ██╗
 ████╗  ██║██╔════╝██╔═══██╗████╗  ██║
 ██╔██╗ ██║█████╗  ██║   ██║██╔██╗ ██║
 ██║╚██╗██║██╔══╝  ██║   ██║██║╚██╗██║
 ██║ ╚████║███████╗╚██████╔╝██║ ╚████║
 ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝ //SYSTEM v2.0`,
  'color:#00f0ff;text-shadow:0 0 6px #00f0ff;font-family:monospace;font-size:11px',
);
console.log(
  `%c> Salut, recruteur·se curieux·se 👋  Tu lis la console de ${handle} : on va bien s'entendre.\n> Indice : ↑ ↑ ↓ ↓ ← → ← → B A … ou tape « matrix ».`,
  'color:#39ff14;font-family:monospace;font-size:12px',
);

// En dev : liste de tous les champs encore « [À REMPLIR] » dans src/content/portfolio.ts.
if (import.meta.env.DEV) {
  const todos = collectTodos(content);
  if (todos.length) {
    console.groupCollapsed(
      `%c✏️ ${todos.length} champ(s) à remplir dans src/content/portfolio.ts`,
      'color:#ffe600;font-weight:bold;font-size:12px',
    );
    console.table(
      todos.map((t) => ({ champ: t.path.replace(/^content\./, ''), consigne: t.hint })),
    );
    console.groupEnd();
  } else {
    console.log('%c✔ Tout le contenu est rempli. GG !', 'color:#39ff14;font-weight:bold');
  }
}

if (import.meta.env.DEV) {
  // Accès de debug dans la console du navigateur : __neon.runtime, __neon.store.getState()
  void Promise.all([import('./store/runtime'), import('./scene/sceneState')]).then(([r, s]) => {
    (window as unknown as { __neon: unknown }).__neon = {
      runtime: r.runtime,
      scene: s.sceneState,
      store: useAppStore,
    };
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
