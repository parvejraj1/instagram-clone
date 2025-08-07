import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    userId: v.optional(v.string()), // Keep optional during migration
    username: v.optional(v.string()), // Keep optional during migration
    email: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_username", ["username"]),
  posts: defineTable({
    imageId: v.string(),
    authorId: v.string(),
    caption: v.optional(v.string()),
    likeCount: v.float64(),
    commentCount: v.optional(v.float64()),
  }).index("by_author", ["authorId"]),
  likes: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
    createdAt: v.optional(v.number()),
  })
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId", "postId"]),
  comments: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),
});
