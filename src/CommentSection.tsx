import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

export function CommentSection({ postId, initialComments }: { postId: Id<"posts">, initialComments: any[] }) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addComment = useMutation(api.posts.addComment);
  const fetchedComments = useQuery(api.posts.getComments, { postId });
  const comments = fetchedComments ?? initialComments;

  if (fetchedComments === undefined && !initialComments?.length) {
    return (
      <div className="mt-4 text-center text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment({
        postId,
        text: newComment.trim(),
      });
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3">
        {comments.map((comment: any) => (
          <div key={comment._id} className="flex items-start space-x-2">
            <span className="font-medium text-gray-800">{comment.authorName}</span>
            <p className="text-gray-600">{comment.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </form>
    </div>
  );
}
