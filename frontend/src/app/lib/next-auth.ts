import { NextAuthOptions } from "next-auth"
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";

import { api } from "./axios"

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: 'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code'
    }),
  ],
  secret: process.env.SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken
      }

      return token;
    },
    async signIn({ profile }) {
      const { name, email } = profile as GoogleProfile;
      
      console.log("profile", profile)

      try {
        // const { data } = await api.post("/users/sign-in", {
        //   name,
        //   email
        // })
        
        // console.log("user data", data)

        return Promise.resolve(true);
      } catch (err) {
        console.log('RIP signIn callback', err)
        return Promise.resolve(false)
      }
    },
    async session({ session }) {
      try {
        const { user } = session;

        const { data } = await api.post("/users/sign-in", {
          name: !!user ? user.name ?? "Guest" : "Guest",
          email: !!user ? user.email ?? "guest@g.com" : "guest@g.com"
        })

        return {
          ...session,
          user: {
            ...user,
            ...data
          }
        };
      } catch (err) {
        console.log('RIP session callback', err)
        return session;
      }
    },
    async redirect({ url }) {
      const envUrl = process.env.NEXT_PUBLIC_APP_URL;

      if (url.includes('callback')) {
        return Promise.resolve('/')
      }

      return Promise.resolve(`${envUrl}/api/auth/callback/google`)
    },
  }
}