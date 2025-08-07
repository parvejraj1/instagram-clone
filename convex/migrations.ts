import { internalMutation } from "./_generated/server";

export const migrateAnonymousUser = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isAnonymous"), true))
      .collect();

    for (const user of users) {
      if (!user.userId || !user.username) {
        const tempUsername = `user_${user._id}`;
        await ctx.db.patch(user._id, {
          userId: tempUsername,
          username: tempUsername,
          isAnonymous: false
        });
      }
    }
  },
});
