import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface AdImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

const AdImageUploader = ({ imageUrl, onImageChange }: AdImageUploaderProps) => {
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
    
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleFile = async (file: File) => {
    const url = await uploadImage(file);
    if (url) {
      onImageChange(url);
    }
  };

  const handleRemoveImage = () => {
    onImageChange("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Banner Image
      </label>

      {/* Image Preview */}
      {imageUrl && (
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border group max-w-md">
          <img 
            src={imageUrl} 
            alt="Banner preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1.5 bg-destructive/90 rounded-full text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {!imageUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors max-w-md
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
                    Drop image here or click to upload
                  </span>
                  <p className="text-xs mt-1">
                    Recommended: 1920×480 or 16:9 ratio
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

export default AdImageUploader;
