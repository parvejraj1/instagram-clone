import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { CommentSection } from "./CommentSection";

interface StreamTabProps {
  isDarkMode: boolean;
}

export function StreamTab({ isDarkMode }: StreamTabProps) {
  const posts = useQuery(api.posts.getGlobalStream);
  const toggleLike = useMutation(api.posts.toggleLike);

  const handleLike = async (postId: Id<"posts">) => {
    try {
      await toggleLike({ postId });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (posts === undefined) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No posts yet. Be the first to share something!
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="divide-y">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-6`}>Global Stream</h2>
        <div className="space-y-6">
          {posts.map((post) => (
          <div key={post._id} className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">{post.authorName}</span>
                <span className="text-sm text-gray-500">
                  {new Date(post._creationTime).toLocaleDateString()}
                </span>
              </div>
              {post.caption && (
                <p className="text-gray-700 mt-2">{post.caption}</p>
              )}
            </div>
            
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full max-h-96 object-cover"
              />
            )}
            
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                    post.isLiked
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-lg">{post.isLiked ? "❤️" : "🤍"}</span>
                  <span className="font-medium">{post.likeCount}</span>
                </button>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">{post.commentCount || 0} comments</span>
              </div>
              
              <div className="mt-4">
                <CommentSection postId={post._id} initialComments={post.comments || []} />
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
