export default {
  providers: [
    {
      provider: "github",
      applicationID: process.env.VITE_GITHUB_OAUTH_CLIENT_ID ?? "",
      applicationSecret: process.env.AUTH_CLIENT_SECRET ?? ""
    }
  ]
};