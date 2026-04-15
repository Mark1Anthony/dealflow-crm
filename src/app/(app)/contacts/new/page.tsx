import { TopBar } from "@/components/TopBar";
import { ContactForm } from "@/components/ContactForm";

export default function NewContactPage() {
  return (
    <>
      <TopBar title="New contact" subtitle="Add a new contact to your CRM" />
      <div className="max-w-xl">
        <ContactForm />
      </div>
    </>
  );
}
