import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return {
      name: identity.name,
      email: identity.email,
      profileImage: identity.pictureUrl,
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
    };
  },
});
