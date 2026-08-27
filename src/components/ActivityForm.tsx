"use client";

import { useActionState, useRef } from "react";
import { createActivity } from "@/lib/actions/activities";
import { formErrorMessages } from "@/lib/utils";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface ActivityFormProps {
  /** Pre-links the entry to a contact or deal when opened from their page. */
  contactId?: string;
  dealId?: string;
}

export function ActivityForm({ contactId, dealId }: ActivityFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await createActivity(formData);
      if (!result) formRef.current?.reset();
      return result;
    },
    null,
  );

  const errors = formErrorMessages(state);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {contactId && <input type="hidden" name="contact_id" value={contactId} />}
      {dealId && <input type="hidden" name="deal_id" value={dealId} />}

      <Select name="type" label="Type" defaultValue="call">
        <option value="call">Call</option>
        <option value="email">Email</option>
        <option value="meeting">Meeting</option>
        <option value="task">Task</option>
      </Select>

      <Textarea
        name="description"
        label="What happened?"
        placeholder="Called about the renewal — they want a quote by Friday."
        rows={3}
        required
      />

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Log activity"}
        </Button>
      </div>
    </form>
  );
}
