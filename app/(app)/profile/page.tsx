import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordModal } from "@/components/admin/users/ChangePasswordModal";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = {
  title: "Profile — Loan Management",
};

export default function ProfilePage() {
  const user = getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>
            {user.firstName} {user.lastName}
          </CardTitle>
          <CardDescription>
            {user.email} · {user.role}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Update the password you use to sign in. You&apos;ll need your current password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordModal userId={user.id} isSelf />
        </CardContent>
      </Card>
    </div>
  );
}
