import type { ReactNode } from "react";
import {
  borderDefaultClass,
  surfaceMutedClass,
  textMutedClass,
} from "@/lib/admin/ui-classes";

const divideClass = "divide-y divide-zinc-800";

export function DataTable({
  columns,
  children,
  emptyColSpan,
  emptyMessage,
  isEmpty,
  lastColumnAlign = "left",
  minWidthClass = "min-w-[480px]",
  comfortable = false,
}: {
  columns: string[];
  children: ReactNode;
  emptyColSpan: number;
  emptyMessage: string;
  isEmpty: boolean;
  lastColumnAlign?: "left" | "right";
  minWidthClass?: string;
  comfortable?: boolean;
}) {
  const cellPad = comfortable ? "px-4 py-4" : "px-4 py-2.5";

  return (
    <div className={`overflow-x-auto rounded-lg border ${borderDefaultClass}`}>
      <table className={`w-full text-left text-sm ${minWidthClass}`}>
        <thead
          className={`border-b ${borderDefaultClass} ${surfaceMutedClass} ${textMutedClass}`}
        >
          <tr>
            {columns.map((col, i) => {
              const isLast = i === columns.length - 1;
              const align =
                isLast && lastColumnAlign === "right" ? "text-right" : "";

              return (
                <th
                  key={col}
                  className={`${cellPad} text-xs font-semibold uppercase tracking-wide ${align} ${isLast && lastColumnAlign === "right" ? "w-px whitespace-nowrap" : ""}`}
                >
                  {col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={`${divideClass} bg-zinc-900 text-zinc-100`}>
          {isEmpty ? (
            <tr>
              <td
                colSpan={emptyColSpan}
                className="px-4 py-10 text-center text-sm text-zinc-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
