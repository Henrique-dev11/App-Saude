// Tema central do app: todas as cores, espaçamentos, raios e tipografia ficam aqui.
// Para mudar a identidade visual do projeto, altere apenas este arquivo.

export const colors = {
  // Marca
  primary: '#0B7F8B',
  primaryDark: '#096873',
  primarySoft: '#E0F7FA',
  accent: '#00CED1', // barra de progresso de água

  // Superfícies
  background: '#EEF7F9',
  surface: '#FFFFFF',
  border: '#D9E4E8',
  track: '#DCE8EC',

  // Texto
  text: '#0F172A',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',

  // Cabeçalho de navegação
  header: '#27272A',
  headerText: '#FFFFFF',

  // Estados
  info: '#2563EB',
  success: '#16A34A',
  danger: '#DC2626',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3, color: colors.text },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 16, fontWeight: '400', color: colors.text },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  caption: { fontSize: 13, fontWeight: '600', color: colors.text },
};

export const shadows = {
  card: { boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 16px rgba(15, 23, 42, 0.07)' },
  soft: { boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)' },
};

// Larguras máximas de conteúdo (mantém a leitura boa em tablet e desktop)
export const layout = {
  maxFormWidth: 480,
  maxGridWidth: 720,
};
