/** The site is one page: the desk. It carries its own bar, so the layout adds only the skip link. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#intro"
        className="sr-only rounded-full bg-primary px-4 py-2 text-small font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      {children}
    </>
  )
}
