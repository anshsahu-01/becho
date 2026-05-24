import { ReactNode } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

const ADMIN_EMAIL = "anshsahu.dev@gmail.com";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress;

  if (userEmail !== ADMIN_EMAIL) {
    redirect("/unauthorized");
  }

  return (
    <div className="md:flex">
      <Sidebar />
      <div className="min-h-screen flex-1">
        <Topbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}