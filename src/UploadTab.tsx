import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface UploadTabProps {
  isDarkMode: boolean;
  onUploadComplete?: () => void;
}

export function UploadTab({ isDarkMode, onUploadComplete }: UploadTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const resetForm = () => {
    setCaption("");
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      createPreviewUrl(imageFile);
    } else {
      toast.error("Please drop an image file");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      createPreviewUrl(file);
    } else {
      toast.error("Please select an image file");
    }
  }, []);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createPreviewUrl = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setSelectedFile(file); // Store the file for later upload
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      toast.error("No image selected");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      if (!uploadUrl) {
        throw new Error("Failed to get upload URL");
      }
      
      // Step 2: Upload file with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Content-Type', selectedFile.type);
        xhr.responseType = 'json';
        xhr.send(selectedFile);
      });
      
      const response = await uploadPromise;
      const storageId = (response as any).storageId;
      
      if (!storageId) {
        throw new Error("No storage ID returned from upload");
      }
      
      // Step 3: Create post
      await createPost({
        imageId: storageId,
        caption: caption || undefined,
      });
      
      toast.success("Post created successfully!");
      resetForm();
      setSelectedFile(null);
      
      // Navigate to stream tab after successful upload
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Create a New Post</h2>
      
      <div className="space-y-6">
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : isDarkMode 
                  ? "border-gray-600 hover:border-gray-500" 
                  : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="space-y-4">
              <div className="text-5xl">📸</div>
              <div>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Drag and drop your photo here
                </p>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full max-h-[500px] object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption for your photo..."
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none`}
                rows={3}
                disabled={isUploading}
              />
            </div>

            <button
              onClick={uploadImage}
              disabled={isUploading || !selectedFile}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading... {uploadProgress}%</span>
                </div>
              ) : (
                'Post'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
