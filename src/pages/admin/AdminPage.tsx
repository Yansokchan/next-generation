import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteAllRecords } from "@/lib/supabase";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";

export default function AdminPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteConfirmation = useConfirmation({
    title: "Delete All Records",
    description:
      "Are you sure you want to delete all records from all tables? This action cannot be undone.",
    variant: "destructive",
    onConfirm: async () => {
      setIsDeleting(true);
      try {
        const result = await deleteAllRecords();
        if (result.success) {
          toast.success("All records have been deleted successfully");
        } else {
          toast.error("Failed to delete records");
        }
      } catch (error) {
        toast.error("An error occurred while deleting records");
      } finally {
        setIsDeleting(false);
      }
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Database Management</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Use this section to manage your database records. Be careful with
            destructive actions.
          </p>

          <Button
            variant="destructive"
            onClick={deleteConfirmation.open}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete All Records"}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={deleteConfirmation.close}
        onConfirm={deleteConfirmation.dialogProps.onConfirm}
        title={deleteConfirmation.dialogProps.title}
        description={deleteConfirmation.dialogProps.description}
        confirmText={deleteConfirmation.dialogProps.confirmText}
        cancelText={deleteConfirmation.dialogProps.cancelText}
        variant={deleteConfirmation.dialogProps.variant}
      />
    </div>
  );
}
