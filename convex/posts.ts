import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";

const DEMO_USER_ID = "demo_user_123456789";

async function getLoggedInUser() {
  return DEMO_USER_ID;
}

export const generateUploadUrl = mutation(async ({ storage }) => {
  try {
    const uploadUrl = await storage.generateUploadUrl();
    if (!uploadUrl) {
      throw new Error("Failed to generate upload URL");
    }
    return uploadUrl;
  } catch (error) {
    console.error("Error generating upload URL:", error);
    throw error;
  }
});

export const createPost = mutation({
  args: {
    imageId: v.string(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const userId = await getLoggedInUser();
      
      // Verify the image exists in storage
      const imageUrl = await ctx.storage.getUrl(args.imageId);
      if (!imageUrl) {
        throw new Error("Image not found in storage");
      }
      
      const postId = await ctx.db.insert("posts", {
        imageId: args.imageId,
        authorId: userId,
        caption: args.caption,
        likeCount: 0.0,
        commentCount: 0.0,
      });
      
      return { success: true, postId };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },
});

export const getGlobalStream = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .take(50);
    
    return Promise.all(
      posts.map(async (post) => {
        // Get image URL from storage
        const imageUrl = await ctx.storage.getUrl(post.imageId);
        
        // Get like status for demo user
        const userId = await getLoggedInUser();
        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) => 
            q.eq("userId", userId).eq("postId", post._id)
          )
          .unique();
          
        // Get the latest comments
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .order("desc")
          .take(3);
        
        return {
          ...post,
          authorName: "Anonymous", // Since we're not using auth, everyone is anonymous
          imageUrl,
          isLiked: !!like,
          comments: comments.map(comment => ({
            ...comment,
            authorName: "Anonymous",
          })),
        };
      })
    );
  },
});

export const getMyPosts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser();
    
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
    
    return Promise.all(
      posts.map(async (post) => {
        const imageUrl = await ctx.storage.getUrl(post.imageId);
        return {
          ...post,
          imageUrl,
        };
      })
    );
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser();
    
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    // Delete all likes for this post
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }
    
    // Delete the post
    await ctx.db.delete(args.postId);
  },
});

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser();
    
    // Verify the post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      userId,
      text: args.text,
      createdAt: Date.now(),
    });
    
    // Update the comment count
    await ctx.db.patch(args.postId, {
      commentCount: (post.commentCount || 0) + 1,
    });
    
    return commentId;
  },
});

export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();
    
    return comments.map(comment => ({
      ...comment,
      authorName: "Anonymous",
    }));
  },
});

export const migratePostsToIncludeCommentCount = mutation({
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    
    for (const post of posts) {
      if (post.commentCount === undefined) {
        // Count existing comments for this post
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();
        
        // Update the post with the comment count
        await ctx.db.patch(post._id, {
          commentCount: comments.length * 1.0
        });
      }
    }
  },
});

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser();
    
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) => 
        q.eq("userId", userId).eq("postId", args.postId)
      )
      .unique();
    
    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, {
        likeCount: post.likeCount - 1,
      });
    } else {
      // Like
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.postId, {
        likeCount: post.likeCount + 1,
      });
    }
  },
});
