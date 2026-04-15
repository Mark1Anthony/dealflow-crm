"use client";

import { useRef } from "react";
import { createNote } from "@/lib/actions/notes";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface NoteFormProps {
  contactId?: string;
  dealId?: string;
}

export function NoteForm({ contactId, dealId }: NoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createNote(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      {contactId && (
        <input type="hidden" name="contact_id" value={contactId} />
      )}
      {dealId && <input type="hidden" name="deal_id" value={dealId} />}

      <Textarea
        name="content"
        placeholder="Add a note..."
        rows={3}
      />

      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Add Note
        </Button>
      </div>
    </form>
  );
}
