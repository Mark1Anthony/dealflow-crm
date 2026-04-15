import Link from "next/link";
import { getContacts } from "@/lib/queries/contacts";
import { TopBar } from "@/components/TopBar";

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { contacts, total, limit } = await getContacts(q, undefined, page);

  return (
    <>
      <TopBar
        title="Contacts"
        subtitle={`${total} contact${total !== 1 ? "s" : ""}`}
        action={
          <Link href="/contacts/new" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg transition text-sm">
            + New contact
          </Link>
        }
      />

      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search contacts..."
          className="w-full max-w-sm bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition placeholder:text-zinc-600"
        />
      </form>

      {contacts.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-2">{q ? "No contacts match your search." : "No contacts yet."}</p>
          {!q && <Link href="/contacts/new" className="text-cyan-400 hover:text-cyan-300 text-sm">Create your first contact</Link>}
        </div>
      ) : (
        <div className="bg-[#111218] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Company</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                  <td className="px-5 py-3">
                    <Link href={`/contacts/${c.id}`} className="text-zinc-100 font-medium hover:text-cyan-400 transition">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-400 hidden sm:table-cell">{c.company || "—"}</td>
                  <td className="px-5 py-3 text-zinc-400 hidden md:table-cell">{c.email || "—"}</td>
                  <td className="px-5 py-3 text-zinc-400 hidden lg:table-cell">{c.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-zinc-500">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} contacts
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/contacts?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) }).toString()}`}
                className="bg-white/5 hover:bg-white/10 text-zinc-300 font-medium px-4 py-2 rounded-lg transition text-sm"
              >
                Previous
              </Link>
            )}
            {page * limit < total && (
              <Link
                href={`/contacts?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) }).toString()}`}
                className="bg-white/5 hover:bg-white/10 text-zinc-300 font-medium px-4 py-2 rounded-lg transition text-sm"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
