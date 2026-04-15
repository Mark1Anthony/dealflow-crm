"use client";

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useState } from "react";
import Link from "next/link";
import { moveDealToStage } from "@/lib/actions/deals";
import { formatCurrency } from "@/lib/utils";
import type { Deal, PipelineStage } from "@/lib/types";

type StageData = { stage: PipelineStage; deals: Deal[] };

export function KanbanBoard({ stageData: initial }: { stageData: StageData[] }) {
  const [columns, setColumns] = useState(initial);

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    // Save previous state for rollback
    const prevColumns = columns;

    // Optimistic update
    const newCols = columns.map(c => ({ ...c, deals: [...c.deals] }));
    const srcCol = newCols.find(c => c.stage.id === source.droppableId)!;
    const dstCol = newCols.find(c => c.stage.id === destination.droppableId)!;
    const [moved] = srcCol.deals.splice(source.index, 1);
    dstCol.deals.splice(destination.index, 0, moved);
    setColumns(newCols);

    try {
      await moveDealToStage(draggableId, destination.droppableId);
    } catch {
      setColumns(prevColumns);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(({ stage, deals }) => (
          <div key={stage.id} className="flex-shrink-0 w-[280px]">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color || "#666" }} />
              <span className="text-sm font-semibold text-zinc-300">{stage.name}</span>
              <span className="text-xs text-zinc-600 ml-auto">{deals.length}</span>
            </div>
            <Droppable droppableId={stage.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[200px] rounded-xl p-2 transition ${snapshot.isDraggingOver ? "bg-cyan-500/5 border border-cyan-500/20" : "bg-[#111218] border border-white/5"}`}
                >
                  {deals.map((deal, i) => (
                    <Draggable key={deal.id} draggableId={deal.id} index={i}>
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`bg-[#1a1b24] border border-white/5 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing transition ${snap.isDragging ? "shadow-xl shadow-black/30 border-cyan-500/30" : ""}`}
                        >
                          <Link href={`/deals/${deal.id}`} className="block" onClick={(e) => { if (snap.isDragging) e.preventDefault(); }}>
                            <div className="text-sm font-medium text-zinc-200 mb-1">{deal.title}</div>
                            {deal.value && <div className="text-sm font-bold text-zinc-100">{formatCurrency(deal.value)}</div>}
                            {deal.contact && (
                              <div className="text-xs text-zinc-500 mt-1">{deal.contact.name}</div>
                            )}
                          </Link>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
