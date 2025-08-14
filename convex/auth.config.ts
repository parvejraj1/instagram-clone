export default {
  providers: [
    {
      domain: "https://github.com",
      applicationID: process.env.VITE_GITHUB_OAUTH_CLIENT_ID ?? "",
      applicationSecret: process.env.AUTH_CLIENT_SECRET ?? "",
      service: "github"
    }
  ]
};