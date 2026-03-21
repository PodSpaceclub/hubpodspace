import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const user = session.user as any;
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "PARTNER") redirect("/dashboard");
  }

  redirect("/login");
}
