export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden p-4">
      {children}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 text-[10px] text-text-muted/40 font-medium">
        <span>Chiffre SSL</span>
        <span>RGPD</span>
        <span>Mobile friendly</span>
      </div>
    </div>
  )
}
