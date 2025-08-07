export default {
  providers: [
    {
      name: "github",
      domain: "https://github.com",
      clientID: process.env.VITE_GITHUB_OAUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_CLIENT_SECRET!
    }
  ]
};