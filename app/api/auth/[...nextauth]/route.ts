import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!
    })
  ],
  pages: {
    signIn: "/auth/signin"
  },
  callbacks: {
    async signIn({ profile }) {
      const allowedId = process.env.ALLOWED_DISCORD_USER_ID;
      const discordId = (profile as any)?.id as string | undefined;

      if (!allowedId) {
        // If not configured yet, block sign-in for safety.
        return false;
      }

      return discordId === allowedId;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };


