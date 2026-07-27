import Link from "next/link";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

interface ActionsColumnOptions<TData> {
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  viewHref?: (row: TData) => string;
}

export function createActionsColumn<TData>({
  onEdit,
  onDelete,
  viewHref,
}: ActionsColumnOptions<TData>): ColumnDef<TData> {
  return {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
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
