export function PageLoadingState() {
  return (
    <main className="min-h-screen bg-ivory pt-32">
      <div className="ds-container grid gap-6">
        <div className="h-6 w-40 animate-pulse rounded-full bg-gold/30" />
        <div className="h-16 max-w-3xl animate-pulse rounded-card bg-navy/10" />
        <div className="h-80 animate-pulse rounded-panel bg-navy/10" />
      </div>
    </main>
  );
}
