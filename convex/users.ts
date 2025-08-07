import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query) return [];
    
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.query))
      .collect();
  },
});

export const getUserPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("authorId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const createUser = mutation({
  args: {
    userId: v.string(),
    username: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if username already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();
    
    if (existingUser) {
      // If the user exists but doesn't have a userId, update it
      if (!existingUser.userId) {
        await ctx.db.patch(existingUser._id, {
          userId: args.userId,
          username: args.username,
          name: args.name,
          isAnonymous: false,
        });
        return existingUser._id;
      }
      throw new Error("Username already taken");
    }

    // Create new user
    return await ctx.db.insert("users", {
      userId: args.userId,
      username: args.username,
      name: args.name,
      isAnonymous: false,
    });
  },
});
