import { LucideAlertCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEdit, FaSpinner } from "react-icons/fa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserDoc } from "@/features/user/api";
import {
  type EditableUserDoc,
  editableUserDocSchema,
} from "@/features/user/models";

type EditProfileDialogProps = {
  userId: string;
  editableProfile: EditableUserDoc;
  setEditableProfile: (editedProfile: EditableUserDoc) => void;
};

export function EditProfileDialog({
  userId,
  editableProfile,
  setEditableProfile,
}: EditProfileDialogProps): React.JSX.Element {
  const [profileEditOpen, setProfileEditOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { register, handleSubmit } = useForm<EditableUserDoc>({
    defaultValues: editableProfile,
  });

  const [invalidDisplayName, setInvalidDisplayName] = useState<string>("");
  const [invalidBio, setInvalidBio] = useState<string>("");

  async function handleSubmitAction(data: EditableUserDoc) {
    setIsSubmitting(true);

    try {
      const parseResult = editableUserDocSchema.safeParse(data);
      if (!parseResult.success) {
        for (const issue of parseResult.error.issues) {
          const issueField = issue.path[0];
          switch (issueField) {
            case "displayName":
              setInvalidDisplayName(issue.message);
              break;

            case "bio":
              setInvalidBio(issue.message);
              break;
          }
        }
        return;
      }

      try {
        await updateUserDoc(userId, data);
        setEditableProfile(data);
        setProfileEditOpen(false);
      } catch (_error) {
        // console.error("Failed to update profile:", _error);
        window.alert("Failed to update profile. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={profileEditOpen} onOpenChange={setProfileEditOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FaEdit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription className="sr-only">
            Make changes to your profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input {...register("displayName")} disabled={isSubmitting} />
            </div>
            {invalidDisplayName !== "" && (
              <Alert variant="destructive">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>{invalidDisplayName}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea {...register("bio")} disabled={isSubmitting} rows={4} />
            </div>
            {invalidBio !== "" && (
              <Alert variant="destructive">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>{invalidBio}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setProfileEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
