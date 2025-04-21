// src/types/next-auth.d.ts
import NextAuth from "next-auth";
import { UserRole } from "../models/user.schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      last_name?: string | null;
      first_name?: string | null;
      role?: UserRole;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    last_name?: string | null;
    first_name?: string | null;
    role?: UserRole;
  }
}
