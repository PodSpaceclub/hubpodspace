import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { partner: true },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        if (user.role === "PARTNER" && user.partner?.status === "PENDING") {
          throw new Error("PENDING_APPROVAL");
        }

        if (user.role === "PARTNER" && user.partner?.status === "REJECTED") {
          throw new Error("ACCOUNT_REJECTED");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          partnerId: user.partner?.id,
          partnerSlug: user.partner?.slug,
          partnerStatus: user.partner?.status,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.partnerId = (user as any).partnerId;
        token.partnerSlug = (user as any).partnerSlug;
        token.partnerStatus = (user as any).partnerStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).partnerId = token.partnerId;
        (session.user as any).partnerSlug = token.partnerSlug;
        (session.user as any).partnerStatus = token.partnerStatus;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
