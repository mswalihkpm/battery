import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUploader = ({ images, onImagesChange, maxImages = 5 }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadImage } = useImageUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith("image/")
    );
    
    await handleFiles(files);
  }, [images, maxImages, onImagesChange]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [images, maxImages, onImagesChange]);

  const handleFiles = async (files: File[]) => {
    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    
    const newImages = [...images];
    
    for (const file of filesToUpload) {
      const url = await uploadImage(file);
      if (url) {
        newImages.push(url);
      }
    }
    
    onImagesChange(newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Product Images ({images.length}/{maxImages})
      </label>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((url, index) => (
            <div 
              key={`${url}-${index}`} 
              className="relative aspect-square rounded-lg overflow-hidden border border-border group"
            >
              <img 
                src={url} 
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-1 bg-destructive/90 rounded-full text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors
            ${isDragging 
              ? "border-primary bg-primary/10" 
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
            }
            ${uploading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Upload className="h-6 w-6" />
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-foreground">
                    Drop images here or click to upload
                  </span>
                  <p className="text-xs mt-1">
                    JPG, PNG, WEBP or GIF (max 5MB each)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
