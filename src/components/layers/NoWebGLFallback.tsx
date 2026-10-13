/** Repli sans WebGL : dégradé animé + grille en perspective, 100 % CSS. */
export function NoWebGLFallback() {
  return (
    <div className="nogl" aria-hidden="true">
      <div className="nogl__sky" />
      <div className="nogl__sun" />
      <div className="nogl__floor">
        <div className="nogl__grid" />
      </div>
    </div>
  );
}
