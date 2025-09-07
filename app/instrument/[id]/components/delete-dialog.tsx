import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteInstrumentDoc } from "@/features/instrument/api";

type DeleteDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string;
  instrumentId: string;
};

export function DeleteDialog({
  open,
  setOpen,
  userId,
  instrumentId,
}: DeleteDialogProps): React.JSX.Element {
  const router = useRouter();

  const [isPendingDelete, startTransitionDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string>("");

  function handleDelete() {
    setDeleteError("");

    startTransitionDelete(async () => {
      try {
        await deleteInstrumentDoc(instrumentId);

        // On success, return to user page
        router.push(`/user/${userId}`);
      } catch {
        setDeleteError("An error occurred during deletion.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Instrument</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this instrument? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError && (
          <Alert variant="destructive">
            <FaExclamationCircle className="h-4 w-4" />
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPendingDelete}
            onClick={() => setOpen(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPendingDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPendingDelete ? (
              <>
                <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
