import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";

export const getGlobalStream = query(async (ctx) => {
  const posts = await ctx.db
    .query("posts")
    .order("desc")
    .collect();

  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject;

  // Get the authors and image URLs for each post
  const postsWithAuthors = await Promise.all(
    posts.map(async (post) => {
      const author = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), post.authorId))
        .first();
      
      // Get the image URL
      const imageUrl = await ctx.storage.getUrl(post.imageId);

      // Check if the current user has liked this post
      const like = userId ? await ctx.db
        .query("likes")
        .filter((q) => 
          q.and(
            q.eq(q.field("postId"), post._id),
            q.eq(q.field("userId"), userId)
          )
        )
        .first() : null;

      // Get comments for this post
      const comments = await ctx.db
        .query("comments")
        .filter((q) => q.eq(q.field("postId"), post._id))
        .collect();
      
      const postData = {
        _id: post._id,
        _creationTime: post._creationTime,
        imageId: post.imageId,
        imageUrl: imageUrl,
        authorId: post.authorId,
        caption: post.caption,
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
        authorName: author?.username || post.authorId,
        isLiked: !!like,
        comments: comments.map(c => ({
          _id: c._id,
          text: c.text,
          userId: c.userId,
          createdAt: c.createdAt
        }))
      };
      
      return postData;
    })
  );

  return postsWithAuthors;
});

export const getImageUrl = query({
  args: { imageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.imageId);
  },
});

export const getImageUrls = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    const urls: { [key: string]: string } = {};
    
    for (const post of posts) {
      const url = await ctx.storage.getUrl(post.imageId);
      if (url) {
        urls[post.imageId] = url;
      }
    }
    
    return urls;
  },
});

export const createPost = mutation({
  args: {
    imageId: v.string(),
    caption: v.optional(v.string()),
    userId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    if (!args.imageId) {
      throw new Error("Image ID is required");
    }
    if (!args.userId) {
      throw new Error("User ID is required");
    }
    if (!args.username) {
      throw new Error("Username is required");
    }

    try {
      // Verify the image exists in storage
      const imageExists = await ctx.storage.getUrl(args.imageId);
      if (!imageExists) {
        throw new Error("Image not found in storage");
      }

      // Create or update user first to ensure referential integrity
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .first();

      if (!existingUser) {
        await ctx.db.insert("users", {
          userId: args.userId,
          username: args.username,
        });
      }

      // Create the post
      const postId = await ctx.db.insert("posts", {
        imageId: args.imageId,
        authorId: args.userId,
        caption: args.caption,
        likeCount: 0,
        commentCount: 0,
      });

      if (!postId) {
        throw new Error("Failed to create post record");
      }

      return postId;
    } catch (error) {
      console.error("Create post error:", error);
      if (error instanceof Error) {
        if (error.message.includes("storage")) {
          throw new Error("Failed to verify image: " + error.message);
        } else if (error.message.includes("users")) {
          throw new Error("Failed to create/update user: " + error.message);
        } else if (error.message.includes("posts")) {
          throw new Error("Failed to create post: " + error.message);
        }
      }
      throw new Error("Failed to create post: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  },
});

export const getMyPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("authorId"), args.userId))
      .order("desc")
      .collect();
  }
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    await ctx.db.delete(args.postId);
    return true;
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  const uploadUrl = await ctx.storage.generateUploadUrl();
  return uploadUrl;
});

export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("desc")
      .collect();

    // Get usernames for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), comment.userId))
          .first();
        
        return {
          ...comment,
          username: user?.username || comment.userId
        };
      })
    );

    return commentsWithUsers;
  },
});

export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Create the comment
    const comment = await ctx.db.insert("comments", {
      postId: args.postId,
      userId: args.userId,
      text: args.text,
      createdAt: Date.now(),
    });

    // Update the post's comment count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        commentCount: (post.commentCount || 0) + 1,
      });
    }

    return comment;
  },
});

export const toggleLike = mutation({
  args: {
    postId: v.id("posts")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    // Check if the user has already liked this post
    const existingLike = await ctx.db
      .query("likes")
      .filter((q) => 
        q.and(
          q.eq(q.field("postId"), args.postId),
          q.eq(q.field("userId"), userId)
        )
      )
      .first();

    // Get the post
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (existingLike) {
      // Unlike: Delete the like and decrement the count
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, {
        likeCount: (post.likeCount || 1) - 1
      });
    } else {
      // Like: Create a new like and increment the count
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId: userId,
        createdAt: Date.now()
      });
      await ctx.db.patch(args.postId, {
        likeCount: (post.likeCount || 0) + 1
      });
    }

    return true;
  }
});

