// SPVM3 Theme System.
// Supported theme variants: Ember, Cyberpunk, Obsidian, Nightshade, Glacier, Parchment.

export const themes = {
  ember: {
    label: 'Ember Dark',
    description: 'Warm forge glow — dark charcoal with molten orange accents.',
    monacoBase: 'vs-dark',
    tokens: {
      '--bg-base': '#171310',
      '--bg-surface': '#1f1a15',
      '--bg-elevated': '#28211a',
      '--bg-hover': '#332a20',
      '--border': '#3a2f24',
      '--text-primary': '#f2e9de',
      '--text-secondary': '#b8a898',
      '--text-muted': '#7d7062',
      '--accent': '#ff7a3d',
      '--accent-soft': '#ff7a3d26',
      '--accent-text': '#1a0f08',
      '--success': '#7fbf7f',
      '--danger': '#e05c5c',
      '--font-display': "'JetBrains Mono', monospace",
      '--font-body': "'Inter', -apple-system, sans-serif",
      '--font-mono': "'JetBrains Mono', 'Fira Code', monospace"
    }
  },
  cyberpunk: {
    label: 'Cyberpunk Neon',
    description: 'Neon teal and magenta high contrast dark mode.',
    monacoBase: 'vs-dark',
    tokens: {
      '--bg-base': '#080a0f',
      '--bg-surface': '#0f131c',
      '--bg-elevated': '#181e2b',
      '--bg-hover': '#242c3d',
      '--border': '#1e293b',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--accent': '#06b6d4',
      '--accent-soft': '#06b6d426',
      '--accent-text': '#042f2e',
      '--success': '#10b981',
      '--danger': '#f43f5e',
      '--font-display': "'JetBrains Mono', monospace",
      '--font-body': "'Inter', -apple-system, sans-serif",
      '--font-mono': "'JetBrains Mono', 'Fira Code', monospace"
    }
  },
  obsidian: {
    label: 'Obsidian Jet',
    description: 'Sleek ultra-dark theme with vivid emerald accents.',
    monacoBase: 'vs-dark',
    tokens: {
      '--bg-base': '#090a0f',
      '--bg-surface': '#11131a',
      '--bg-elevated': '#1a1d26',
      '--bg-hover': '#252936',
      '--border': '#282d3c',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#475569',
      '--accent': '#10b981',
      '--accent-soft': '#10b98126',
      '--accent-text': '#022c22',
      '--success': '#34d399',
      '--danger': '#ef4444',
      '--font-display': "'JetBrains Mono', monospace",
      '--font-body': "'Inter', -apple-system, sans-serif",
      '--font-mono': "'JetBrains Mono', 'Fira Code', monospace"
    }
  },
  nightshade: {
    label: 'Nightshade Violet',
    description: 'Deep violet-black — for late-night, high-focus sessions.',
    monacoBase: 'vs-dark',
    tokens: {
      '--bg-base': '#0d0b14',
      '--bg-surface': '#15121f',
      '--bg-elevated': '#1e1a2b',
      '--bg-hover': '#292339',
      '--border': '#332c47',
      '--text-primary': '#e9e5f5',
      '--text-secondary': '#a89fc4',
      '--text-muted': '#6f6790',
      '--accent': '#b088ff',
      '--accent-soft': '#b088ff26',
      '--accent-text': '#140d24',
      '--success': '#7fd9a0',
      '--danger': '#ff6b8b',
      '--font-display': "'JetBrains Mono', monospace",
      '--font-body': "'Inter', -apple-system, sans-serif",
      '--font-mono': "'JetBrains Mono', 'Fira Code', monospace"
    }
  },
  glacier: {
    label: 'Glacier Light',
    description: 'Cool arctic light — crisp whites with deep glacial blue.',
    monacoBase: 'vs',
    tokens: {
      '--bg-base': '#f3f6f9',
      '--bg-surface': '#ffffff',
      '--bg-elevated': '#e9eef3',
      '--bg-hover': '#dde5ec',
      '--border': '#cdd8e1',
      '--text-primary': '#132433',
      '--text-secondary': '#3f5568',
      '--text-muted': '#7c8fa0',
      '--accent': '#0f6fb0',
      '--accent-soft': '#0f6fb01f',
      '--accent-text': '#ffffff',
      '--success': '#1e8e5a',
      '--danger': '#c4302b',
      '--font-display': "'JetBrains Mono', monospace",
      '--font-body': "'Inter', -apple-system, sans-serif",
      '--font-mono': "'JetBrains Mono', 'Fira Code', monospace"
    }
  },
  parchment: {
    label: 'Parchment Sepia',
    description: 'Warm paper tones — low eye strain reading theme.',
    monacoBase: 'vs',
    tokens: {
      '--bg-base': '#f1e9d8',
      '--bg-surface': '#f8f2e5',
      '--bg-elevated': '#eadfc7',
      '--bg-hover': '#e0d3b3',
      '--border': '#cbb98f',
      '--text-primary': '#2c2416',
      '--text-secondary': '#5b4d34',
      '--text-muted': '#8a7a58',
      '--accent': '#a85c2e',
      '--accent-soft': '#a85c2e22',
      '--accent-text': '#fbf5e8',
      '--success': '#4a7a3c',
      '--danger': '#a83c2e',
      '--font-display': "'JetBrains Mono', monospace",
      '--font-body': "'Inter', sans-serif",
      '--font-mono': "'JetBrains Mono', 'Fira Code', monospace"
    }
  }
};

export function applyTheme(themeKey) {
  const theme = themes[themeKey] || themes.ember;
  const root = document.documentElement;
  Object.entries(theme.tokens).forEach(([key, value]) => root.style.setProperty(key, value));
  root.setAttribute('data-theme', themeKey);
  return theme;
}
