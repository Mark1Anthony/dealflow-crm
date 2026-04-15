import { notFound } from "next/navigation";
import { getContactById } from "@/lib/queries/contacts";
import { TopBar } from "@/components/TopBar";
import { ContactForm } from "@/components/ContactForm";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContactById(id);
  if (!contact) notFound();

  return (
    <>
      <TopBar title="Edit contact" subtitle={contact.name} />
      <div className="max-w-xl">
        <ContactForm contact={contact} />
      </div>
    </>
  );
}
