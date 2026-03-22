"use client";

import { type ReactNode, useRef, useState, useEffect, type DragEvent } from "react";

export interface KanbanColumn<T> {
  id: string;
  label: string;
  color: string;
  items: T[];
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  renderCard: (item: T) => ReactNode;
  onAddNew?: (columnId: string) => void;
  onMove?: (itemId: string, fromColumnId: string, toColumnId: string) => void;
}

export default function KanbanBoard<T extends { id: string }>({
  columns,
  renderCard,
  onAddNew,
  onMove,
}: KanbanBoardProps<T>) {
  const dragRef = useRef<{ itemId: string; colId: string } | null>(null);
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dropTargetCol, setDropTargetCol] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Disable draggable on all inner <a> tags so they don't hijack the drag
  useEffect(() => {
    if (!onMove || !boardRef.current) return;
    const anchors = boardRef.current.querySelectorAll("a");
    anchors.forEach((a) => a.setAttribute("draggable", "false"));
  });

  function handleDragStart(e: DragEvent, itemId: string, colId: string) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
    dragRef.current = { itemId, colId };
    requestAnimationFrame(() => setDragItemId(itemId));
  }

  function handleDragEnd() {
    dragRef.current = null;
    setDragItemId(null);
    setDropTargetCol(null);
  }

  function handleDragOver(e: DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropTargetCol !== colId) setDropTargetCol(colId);
  }

  function handleDragLeave(e: DragEvent, colId: string) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      if (dropTargetCol === colId) setDropTargetCol(null);
    }
  }

  function handleDrop(e: DragEvent, colId: string) {
    e.preventDefault();
    setDropTargetCol(null);
    const ref = dragRef.current;
    if (onMove && ref && ref.colId !== colId) {
      onMove(ref.itemId, ref.colId, colId);
    }
    dragRef.current = null;
    setDragItemId(null);
  }

  return (
    <div ref={boardRef} className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const isOver =
          dropTargetCol === col.id &&
          dragRef.current !== null &&
          dragRef.current.colId !== col.id;
        return (
          <div
            key={col.id}
            className={`flex w-64 shrink-0 flex-col rounded-xl border bg-surface/50 transition-colors ${
              isOver ? "border-accent/40 bg-accent/5" : "border-border"
            }`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: col.color }}
              />
              <span className="text-sm font-semibold text-text-primary">
                {col.label}
              </span>
              <span className="ml-auto text-xs text-text-secondary">
                {col.items.length}
              </span>
              {onAddNew && (
                <button
                  type="button"
                  onClick={() => onAddNew(col.id)}
                  className="ml-1 text-lg leading-none text-text-secondary hover:text-accent"
                >
                  +
                </button>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-3">
              {col.items.length === 0 && !isOver ? (
                <div className="py-6 text-center text-xs text-text-secondary/60">
                  Empty
                </div>
              ) : (
                col.items.map((item) => (
                  <div
                    key={item.id}
                    draggable={!!onMove}
                    onDragStart={(e) => handleDragStart(e, item.id, col.id)}
                    onDragEnd={handleDragEnd}
                    className={`select-none ${
                      onMove ? "cursor-grab active:cursor-grabbing" : ""
                    } ${dragItemId === item.id ? "opacity-40" : ""}`}
                  >
                    {renderCard(item)}
                  </div>
                ))
              )}
              {isOver && (
                <div className="rounded-xl border-2 border-dashed border-accent/30 py-4 text-center text-xs text-accent">
                  Drop here
                </div>
              )}
            </div>

            {onAddNew && (
              <button
                type="button"
                onClick={() => onAddNew(col.id)}
                className="border-t border-border px-4 py-2.5 text-left text-xs text-text-secondary hover:bg-surface hover:text-text-primary"
              >
                + Create New
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
