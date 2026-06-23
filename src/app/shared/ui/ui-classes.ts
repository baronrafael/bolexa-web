export const uiClasses = {
  card: {
    base: 'rounded-[1.5rem] border border-white/10 bg-base-300/75 shadow-2xl backdrop-blur',
    subtle: 'rounded-2xl border border-white/10 bg-white/[0.03]',
  },
  button: {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    outline: 'btn btn-outline border-slate-600 text-slate-100 hover:border-primary hover:bg-primary/10',
    ghost: 'btn btn-ghost',
    danger: 'btn btn-error',
    success: 'btn btn-success',
  },
} as const;
