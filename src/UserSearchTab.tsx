import { useState } from "react";
import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";

export function UserSearchTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const allPosts = useQuery(api.posts.getGlobalStream) || [];
  const imageUrls = useQuery(api.posts.getImageUrls) || {};
  
  const searchResults = searchQuery ? 
    allPosts.filter(post => {
      const authorName = post.authorName || post.authorId; // Use authorName if available
      return authorName.toLowerCase().includes(searchQuery.toLowerCase());
    }) : [];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {searchResults.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Posts by {searchQuery}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((post) => {
              const imageUrl = imageUrls[post.imageId];
              return (
                <div key={post._id} className="rounded-lg overflow-hidden shadow-lg">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={post.caption || "Post"}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  {post.caption && (
                    <div className="p-4 dark:bg-gray-800">
                      <p className="text-gray-700 dark:text-gray-300">{post.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : searchQuery ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No users found</p>
      ) : null}
    </div>
  );
}
