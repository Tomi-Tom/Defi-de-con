export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      {children}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 text-[10px] text-text-muted">
        <span className="flex items-center gap-1">🔒 Chiffre SSL</span>
        <span className="flex items-center gap-1">✓ RGPD</span>
        <span className="flex items-center gap-1">📱 Mobile friendly</span>
      </div>
    </div>
  )
}
