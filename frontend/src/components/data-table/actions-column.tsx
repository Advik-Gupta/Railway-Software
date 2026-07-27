import Link from "next/link";
import { Pencil, Trash2, ExternalLink, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

interface ActionsColumnOptions<TData> {
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onView?: (row: TData) => void; // opens something in-page, e.g. a modal
  viewHref?: (row: TData) => string; // navigates to a real route
}

export function createActionsColumn<TData>({
  onEdit,
  onDelete,
  onView,
  viewHref,
}: ActionsColumnOptions<TData>): ColumnDef<TData> {
  return {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
          >
            <Eye className="mr-1.5 size-3.5" />
            Details
          </Button>
        )}
        {viewHref && (
          <Button
            variant="ghost"
            size="icon"
            render={<Link href={viewHref(row.original)} />}
          >
            <ExternalLink className="size-4" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>
    ),
  };
}
