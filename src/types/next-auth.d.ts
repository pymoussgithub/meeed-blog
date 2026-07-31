import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CONTRIBUTEUR";
      credentialsVersion: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "CONTRIBUTEUR";
    credentialsVersion: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "CONTRIBUTEUR";
    lastCheckedAt?: number;
    credentialsVersion?: string;
  }
}
