import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const USERS: Record<string, { passwordHash: string; name: string }> = {
  loic: {
    passwordHash: process.env.USER_LOIC_HASH!,
    name: "Loic",
  },
  sofie: {
    passwordHash: process.env.USER_SOFIE_HASH!,
    name: "Sofie",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = (credentials?.username as string)?.toLowerCase().trim();
        const password = credentials?.password as string;

        if (!username || !password) return null;

        const user = USERS[username];
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: username, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
