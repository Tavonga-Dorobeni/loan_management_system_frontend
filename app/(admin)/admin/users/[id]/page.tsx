import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/admin/users/UserForm";
import { ChangePasswordModal } from "@/components/admin/users/ChangePasswordModal";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { ApiError } from "@/lib/api-client";
import { getUser } from "@/lib/api/users";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = {
  title: "Edit user — Loan Management",
};

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const session = getSessionUser();
  let user;
  try {
    user = await getUser(params.id);
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) notFound();
    throw e;
  }

  const isSelf = !!session && String(session.id) === String(user.id);
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back to users
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{fullName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm mode="edit" user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            {isSelf
              ? "Change your sign-in password."
              : "Set a new password for this user without their current one."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordModal userId={user.id} isSelf={isSelf} />
        </CardContent>
      </Card>

      {!isSelf && (
        <Card>
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>
              Deleting a user revokes their access immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteUserDialog userId={user.id} userLabel={fullName} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
