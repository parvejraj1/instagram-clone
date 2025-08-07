import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import { PostView } from "./PostView";

interface MyPhotosTabProps {
  isDarkMode: boolean;
}

export function MyPhotosTab({ isDarkMode }: MyPhotosTabProps) {
  const posts = useQuery(api.posts.getMyPosts);
  const deletePost = useMutation(api.posts.deletePost);
  const [selectedPost, setSelectedPost] = useState<NonNullable<typeof posts>[0] | null>(null);

  const handleDelete = async (postId: Id<"posts">) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      try {
        await deletePost({ postId });
        setSelectedPost(null);
        toast.success("Photo deleted successfully");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete photo");
      }
    }
  };

  const handlePostClick = (post: NonNullable<typeof posts>[0]) => {
    setSelectedPost(post);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="text-4xl mb-4">📷</div>
        <p className="text-lg">You haven't uploaded any photos yet.</p>
        <p className="text-sm">Switch to the Upload tab to share your first photo!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Photos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} onClick={() => handlePostClick(post)} className="cursor-pointer">
            <PostView 
              post={{
                ...post,
                authorName: "You",
                isLiked: false,
                comments: [],
                commentCount: post.commentCount || 0,
                likeCount: post.likeCount || 0,
                imageUrl: post.imageUrl || undefined
              }} 
              isDarkMode={isDarkMode} 
            />
            <div className="p-4">
              {post.caption && (
                <p className="text-gray-700 mb-3">{post.caption}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>❤️ {post.likeCount}</span>
                  <span>•</span>
                  <span>{new Date(post._creationTime).toLocaleDateString()}</span>
                </div>
                
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for expanded view */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-2 right-2 text-white bg-black/50 p-2 rounded-full"
              >
                ✕
              </button>
              <PostView
                post={{
                  ...selectedPost,
                  authorName: "You",
                  isLiked: false,
                  comments: [],
                  commentCount: selectedPost.commentCount || 0,
                  likeCount: selectedPost.likeCount || 0,
                  imageUrl: selectedPost.imageUrl || undefined
                }}
                isDarkMode={isDarkMode}
                isExpandedView={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
