import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CONTRIBUTEUR";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "CONTRIBUTEUR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CONTRIBUTEUR";
  }
}
