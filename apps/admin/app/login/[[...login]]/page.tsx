import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <SignIn path="/login" routing="path" />
    </div>
  );
}