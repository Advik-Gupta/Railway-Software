export function NotificationsPanel() {
  const placeholders = [1, 2, 3, 4];

  return (
    <aside className="hidden w-full max-w-[300px] shrink-0 border-l border-border bg-card/40 p-4 lg:block">
      <h2 className="mb-4 text-sm font-semibold text-foreground">
        Notifications
      </h2>
      <div className="space-y-3">
        {placeholders.map((i) => (
          <div
            key={i}
            className="h-20 w-full rounded-lg border border-border bg-muted/30"
          />
        ))}
      </div>
    </aside>
  );
}
