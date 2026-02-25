import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/90 bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} TargetUZ. Instagram va Meta Ads mutaxassislari platformasi.</p>
        <div className="flex items-center gap-5">
          <Link href="/mutaxassislar" className="hover:text-slate-200">
            Mutaxassislar
          </Link>
          <Link href="/dashboard" className="hover:text-slate-200">
            Kabinet
          </Link>
          <Link href="/admin" className="hover:text-slate-200">
            Boshqaruv
          </Link>
        </div>
      </div>
    </footer>
  );
}
