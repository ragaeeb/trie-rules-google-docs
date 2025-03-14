import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();
  
  if (session.isLoggedIn) {
    redirect("/dashboard");
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-4xl font-bold text-center">
        Google Docs Formatter
      </h1>
      
      <p className="text-xl text-center max-w-md">
        A secure way to format your Google Docs. Login with your Google account to get started.
      </p>
      
      <div className="mt-8">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}