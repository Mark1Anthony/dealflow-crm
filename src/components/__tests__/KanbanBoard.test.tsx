import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { KanbanBoard } from '@/components/KanbanBoard';
import type { Deal, PipelineStage } from '@/lib/types';

// The render-prop signatures the dnd library hands its children. Only the
// fields KanbanBoard actually reads are modelled.
type DroppableChildren = (
  provided: { innerRef: () => void; droppableProps: object; placeholder: null },
  snapshot: { isDraggingOver: boolean },
) => React.ReactNode;

type DraggableChildren = (
  provided: { innerRef: () => void; draggableProps: object; dragHandleProps: object },
  snapshot: { isDragging: boolean },
) => React.ReactNode;

// @hello-pangea/dnd needs a real pointer sequence to produce a drag. The shim
// below keeps the component's own markup but hands us onDragEnd directly, so a
// drop can be simulated. next/link is replaced because it wants a router.
const h = vi.hoisted(() => ({
  onDragEnd: { current: null as null | ((result: unknown) => void) },
  moveDealToStage: vi.fn(),
}));

vi.mock('@/lib/actions/deals', () => ({
  moveDealToStage: h.moveDealToStage,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragEnd: (result: unknown) => void;
  }) => {
    h.onDragEnd.current = onDragEnd;
    return <div>{children}</div>;
  },
  Droppable: ({ children }: { children: DroppableChildren }) => (
    <div>
      {children(
        { innerRef: () => {}, droppableProps: {}, placeholder: null },
        { isDraggingOver: false },
      )}
    </div>
  ),
  Draggable: ({ children }: { children: DraggableChildren }) => (
    <div>
      {children(
        { innerRef: () => {}, draggableProps: {}, dragHandleProps: {} },
        { isDragging: false },
      )}
    </div>
  ),
}));

function stage(id: string, name: string, position: number): PipelineStage {
  return {
    id,
    user_id: 'u1',
    name,
    position,
    color: '#3B82F6',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

function deal(id: string, title: string, stageId: string, value: number | null): Deal {
  return {
    id,
    user_id: 'u1',
    title,
    value,
    contact_id: null,
    stage_id: stageId,
    expected_close: null,
    description: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  } as Deal;
}

const stageData = [
  { stage: stage('s1', 'Lead', 1), deals: [deal('d1', 'TechWerk Migration', 's1', 85000)] },
  { stage: stage('s2', 'Qualified', 2), deals: [] },
];

const dropD1IntoS2 = {
  draggableId: 'd1',
  source: { droppableId: 's1', index: 0 },
  destination: { droppableId: 's2', index: 0 },
};

beforeEach(() => {
  h.onDragEnd.current = null;
  h.moveDealToStage.mockReset();
});

describe('KanbanBoard', () => {
  it('renders every stage with its name and deal count', () => {
    render(<KanbanBoard stageData={stageData} />);

    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    // Deal counts per column: 1 and 0
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders deal title and formatted value', () => {
    render(<KanbanBoard stageData={stageData} />);

    expect(screen.getByText('TechWerk Migration')).toBeInTheDocument();
    // 85000 cents -> 850,00 EUR in de-DE
    expect(screen.getByText(/850/)).toBeInTheDocument();
  });

  it('calls moveDealToStage with deal and destination stage on drop', async () => {
    h.moveDealToStage.mockResolvedValue(undefined);
    render(<KanbanBoard stageData={stageData} />);

    await h.onDragEnd.current!(dropD1IntoS2);

    expect(h.moveDealToStage).toHaveBeenCalledWith('d1', 's2');
  });

  it('does nothing when the card is dropped outside a column', async () => {
    render(<KanbanBoard stageData={stageData} />);

    await h.onDragEnd.current!({
      draggableId: 'd1',
      source: { droppableId: 's1', index: 0 },
      destination: null,
    });

    expect(h.moveDealToStage).not.toHaveBeenCalled();
  });

  it('moves the card optimistically before the action resolves', async () => {
    let resolveAction: () => void = () => {};
    h.moveDealToStage.mockReturnValue(new Promise<void>((r) => { resolveAction = r; }));

    render(<KanbanBoard stageData={stageData} />);
    h.onDragEnd.current!(dropD1IntoS2);

    // Counts have swapped: Lead 0, Qualified 1 - while the action is pending.
    await waitFor(() => {
      const counts = screen.getAllByText(/^[01]$/).map((el) => el.textContent);
      expect(counts).toEqual(['0', '1']);
    });

    resolveAction();
  });

  it('rolls the card back when the action rejects', async () => {
    h.moveDealToStage.mockRejectedValue(new Error('Deal not found'));

    render(<KanbanBoard stageData={stageData} />);
    await h.onDragEnd.current!(dropD1IntoS2);

    await waitFor(() => {
      const counts = screen.getAllByText(/^[01]$/).map((el) => el.textContent);
      expect(counts).toEqual(['1', '0']);
    });
  });
});
