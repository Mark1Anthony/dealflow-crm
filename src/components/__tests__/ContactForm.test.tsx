import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from '@/components/ContactForm';
import type { Contact } from '@/lib/types';

const h = vi.hoisted(() => ({
  createContact: vi.fn(),
  updateContact: vi.fn(),
}));

vi.mock('@/lib/actions/contacts', () => ({
  createContact: h.createContact,
  updateContact: h.updateContact,
}));

const existing: Contact = {
  id: 'c1',
  user_id: 'u1',
  name: 'Anna Schneider',
  email: 'anna.schneider@techwerk.de',
  phone: '+49 30 1234567',
  company: 'TechWerk GmbH',
  position: 'Geschaeftsfuehrerin',
  notes: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
} as Contact;

beforeEach(() => {
  h.createContact.mockReset();
  h.updateContact.mockReset();
});

describe('ContactForm', () => {
  it('renders an empty form with name marked required', () => {
    render(<ContactForm />);

    const name = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(name).toBeRequired();
    expect(name.value).toBe('');
    expect(screen.getByRole('button', { name: /create contact/i })).toBeInTheDocument();
  });

  it('prefills the fields when editing an existing contact', () => {
    render(<ContactForm contact={existing} />);

    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe('Anna Schneider');
    expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe(
      'anna.schneider@techwerk.de',
    );
    expect((screen.getByLabelText(/company/i) as HTMLInputElement).value).toBe('TechWerk GmbH');
    expect(screen.getByRole('button', { name: /update contact/i })).toBeInTheDocument();
  });

  // The actions answer { error: fieldErrors } from a failed Zod parse, not a
  // plain string - see formErrorMessages in lib/utils.
  it('shows the validation error returned by the action', async () => {
    h.createContact.mockResolvedValue({ error: { name: ['Name is required'] } });
    render(<ContactForm />);

    fireEvent.submit(screen.getByRole('button', { name: /create contact/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('shows every field error, not "[object Object]"', async () => {
    h.createContact.mockResolvedValue({
      error: { name: ['Name is required'], email: ['Invalid email'] },
    });
    render(<ContactForm />);

    fireEvent.submit(screen.getByRole('button', { name: /create contact/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.queryByText(/\[object Object\]/)).not.toBeInTheDocument();
  });

  it('submits new contacts through createContact', async () => {
    h.createContact.mockResolvedValue(null);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Neuer Kontakt' } });
    fireEvent.submit(screen.getByRole('button', { name: /create contact/i }).closest('form')!);

    await waitFor(() => expect(h.createContact).toHaveBeenCalledTimes(1));
    const formData = h.createContact.mock.calls[0][0] as FormData;
    expect(formData.get('name')).toBe('Neuer Kontakt');
  });

  it('submits edits through updateContact with the contact id', async () => {
    h.updateContact.mockResolvedValue(null);
    render(<ContactForm contact={existing} />);

    fireEvent.submit(screen.getByRole('button', { name: /update contact/i }).closest('form')!);

    await waitFor(() => expect(h.updateContact).toHaveBeenCalledTimes(1));
    expect(h.updateContact.mock.calls[0][0]).toBe('c1');
  });
});
