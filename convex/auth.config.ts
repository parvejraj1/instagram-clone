import { defineConfig } from "convex/server";
import { github } from "convex/auth";

export default {
  providers: [
    {
      domain: "https://github.com",
      applicationID: process.env.VITE_GITHUB_OAUTH_CLIENT_ID as string,
    }
  ]
};