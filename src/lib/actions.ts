"use server";

import { signIn as authSignIn, signOut as authSignOut } from "@/src/lib/auth";

export async function loginAction(formData: FormData) {
  await authSignIn("credentials", {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    redirectTo: "/dashboard",
  });
}

export async function signOutAction() {
  await authSignOut({ redirectTo: "/login" });
}

export { authSignIn, authSignOut };