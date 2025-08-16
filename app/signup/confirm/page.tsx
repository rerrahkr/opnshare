"use client";

import { FirebaseError } from "firebase/app";
import {
  type Auth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User,
  updatePassword,
  validatePassword,
} from "firebase/auth";
import { LucideAlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createUserDocWithUserIdCheck,
  testUserDocExistsByUid,
} from "@/features/user/api";
import {
  type EditableUserDoc,
  editableUserDocSchema,
  userIdSchema,
} from "@/features/user/models";
import { auth } from "@/lib/firebase";
import { useAuthStore, useAuthUser } from "@/stores/auth";

async function reauthenticateAndUpdatePassword(
  auth: Auth,
  user: User,
  emailToUse: string,
  password: string
): Promise<void> {
  try {
    // Reauthenticate with email link.

    if (emailToUse && isSignInWithEmailLink(auth, window.location.href)) {
      // console.log("Attempting reauthentication with email link...");
      await signInWithEmailLink(auth, emailToUse, window.location.href);
      await updatePassword(user, password);
      // console.log("Password updated successfully after reauthentication");
    } else {
      // console.error("Cannot reauthenticate: Email link not available");
      throw "Authentication expired. Please sign in again from the email link.";
    }
  } catch (reauthError) {
    // console.error("Reauthentication failed:", reauthError);
    if (
      reauthError instanceof FirebaseError &&
      reauthError.code === "auth/invalid-action-code"
    ) {
      throw "The email link has expired. Please request a new registration link.";
    }
  }
}

type ConfirmFormData = {
  userId: string;
  displayName: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpConfirmPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { register, handleSubmit, watch } = useForm<ConfirmFormData>({
    defaultValues: {
      userId: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const buttonIsDisabled = (() => {
    const watchedFields = watch();
    const { userId, displayName, password, confirmPassword } = watchedFields;
    return (
      !userId.trim() ||
      !displayName.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      password !== confirmPassword ||
      isSubmitting
    );
  })();

  const setUserIdGlobal = useAuthStore((state) => state.setUserId);
  const [invalidUserIdMessages, setInvalidUserIdMessages] = useState<string[]>(
    []
  );
  const [invalidPassword, setInvalidPassword] = useState<string>("");
  const [invalidDisplayName, setInvalidDisplayName] = useState<string>("");

  const user = useAuthUser();

  useEffect(() => {
    (async () => {
      // Check if user information is fulfilled.
      if (user) {
        if (await testUserDocExistsByUid(user.uid)) {
          // No need to confirm again if user already exists.
          router.push("/");
        }

        // If some data is not completed, stay on this page.
        return;
      }

      // If user is not signed in, check if the email link is valid.
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt("Please provide your email for confirmation.");
        }

        try {
          await signInWithEmailLink(auth, email || "", window.location.href);
        } catch (_error: unknown) {
          // console.error("Error confirming registration:", _error);
          router.push("/signup");
        }
      } else {
        // console.error("Invalid sign-in link");
        router.push("/signup");
      }
    })();
  }, [router, user]);

  async function handleSubmitAction(formData: ConfirmFormData) {
    if (!user) {
      router.push("/signup");
      return;
    }

    setIsSubmitting(true);
    setInvalidDisplayName("");
    setInvalidUserIdMessages([]);
    setInvalidPassword("");

    let checkIsPassed = true;

    // User ID check
    const userIdValidation = userIdSchema.safeParse(formData.userId);
    if (!userIdValidation.success) {
      setInvalidUserIdMessages(
        userIdValidation.error.issues.map((e) => e.message)
      );
      checkIsPassed = false;
    }

    // Password check
    if (!formData.password || formData.password !== formData.confirmPassword) {
      setInvalidPassword("Passwords do not match.");
      checkIsPassed = false;
    } else {
      const status = await validatePassword(auth, formData.password);
      if (!status.isValid) {
        setInvalidPassword("Password must be at least 6 characters long.");
        checkIsPassed = false;
      }
    }

    // User profile check
    const profile: EditableUserDoc = {
      displayName: formData.displayName,
      bio: "",
    };
    const parseResult = editableUserDocSchema.safeParse(profile);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        const issueField = issue.path[0];
        switch (issueField) {
          case "displayName":
            setInvalidDisplayName(issue.message);
            break;

          default:
            break;
        }
      }
      checkIsPassed = false;
    }

    if (!checkIsPassed) {
      setIsSubmitting(false);
      return;
    }

    // Update password
    try {
      await updatePassword(user, formData.password);
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/weak-password":
            setInvalidPassword("Password must be at least 6 characters long.");
            setIsSubmitting(false);
            return;

          case "auth/requires-recent-login":
            try {
              const savedEmail = window.localStorage.getItem("emailForSignIn");
              const emailToUse = user.email || savedEmail || "";
              await reauthenticateAndUpdatePassword(
                auth,
                user,
                emailToUse,
                formData.password
              );
            } catch (err: unknown) {
              if (typeof err === "string") {
                window.alert(err);
              }
              router.push("/signup");
              return;
            }
            break;

          default:
            // console.error("Error updating password:", err);
            setIsSubmitting(false);
            return;
        }
      }
    }

    try {
      await createUserDocWithUserIdCheck(
        formData.userId,
        user.uid,
        profile as EditableUserDoc
      );
      window.localStorage.removeItem("emailForSignIn");
      // console.log("Registration completed successfully");
    } catch (error: unknown) {
      if (error === "UserIDAlreadyExists") {
        setInvalidUserIdMessages([
          "This user ID is already taken. Please choose another one.",
        ]);
      } else {
        window.alert(
          "Failed to complete registration. Please try again later."
        );
      }
      // console.error("Error completing registration:", error);

      setIsSubmitting(false);
      return;
    }

    setUserIdGlobal(formData.userId);
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Registration</CardTitle>
          <p className="text-muted-foreground">
            Please enter your profile information
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(handleSubmitAction)}>
            {/* User ID */}
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input {...register("userId")} disabled={isSubmitting} />
            </div>
            {invalidUserIdMessages.length > 0 && (
              <Alert variant="destructive">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {invalidUserIdMessages.length === 1 ? (
                    invalidUserIdMessages[0]
                  ) : (
                    <ul className="list-inside list-disc">
                      {invalidUserIdMessages.map((msg) => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Display Name */}
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

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                {...register("password")}
                type="password"
                disabled={isSubmitting}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                {...register("confirmPassword")}
                type="password"
                disabled={isSubmitting}
              />
            </div>
            {invalidPassword !== "" && (
              <Alert variant="destructive">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>{invalidPassword}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={buttonIsDisabled}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
