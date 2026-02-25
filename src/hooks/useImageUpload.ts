import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BUCKET_NAME = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface UseImageUploadReturn {
  uploading: boolean;
  uploadImage: (file: File) => Promise<string | null>;
  uploadMultipleImages: (files: File[]) => Promise<string[]>;
  deleteImage: (url: string) => Promise<boolean>;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, WEBP, or GIF images.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Maximum size is 5MB.";
    }
    return null;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return null;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload image");
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const url = await uploadImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }
      return uploadedUrls;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = url.split(`${BUCKET_NAME}/`);
      if (urlParts.length < 2) {
        toast.error("Invalid image URL");
        return false;
      }
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete image");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
      return false;
    }
  };

  return {
    uploading,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
  };
};
