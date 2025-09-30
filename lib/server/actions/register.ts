"use server";

import { sql } from "@/lib/db";
import bcrypt from "bcrypt";
import { z } from "zod";
import { auth } from "@/auth";  // to check if current user is admin

export type RegisterResult = {
  ok: boolean;
  formError?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
  };
};

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["buyer", "seller", "admin"]),
});

export async function registerAction(
  _prev: RegisterResult,
  formData: FormData
): Promise<RegisterResult> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return {
      ok: false,
      fieldErrors: {
        name: issues.fieldErrors.name?.[0],
        email: issues.fieldErrors.email?.[0],
        password: issues.fieldErrors.password?.[0],
      },
    };
  }

  const { name, email, password, role } = parsed.data;

  // 👀 Enforce role rules
  const session = await auth();
  let finalRole = "buyer";

  if (session?.user?.role === "admin") {
    // Admin can create any role
    finalRole = role;
  } else {
    // Normal signup always gets buyer
    finalRole = "buyer";
  }

  const password_hash = await bcrypt.hash(password, 10);

  try {
    await sql/*sql*/`
      INSERT INTO public.users (id, name, email, password_hash, role)
      VALUES (${crypto.randomUUID()}, ${name}, ${email}, ${password_hash}, ${finalRole}::user_role)
      ON CONFLICT (email) DO NOTHING
    `;
    return { ok: true };
  } catch (err) {
    console.error("[register]", err);
    return { ok: false, formError: "Registration failed. Try another email." };
  }
}
