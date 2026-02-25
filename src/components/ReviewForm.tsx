import { useState, useRef } from "react";
import { Star, Camera, ImagePlus, Video, X, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (mediaFiles.length + files.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }
    const newFiles = [...mediaFiles, ...files];
    setMediaFiles(newFiles);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setMediaPreviews(prev => [...prev, url]);
    });
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of mediaFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("review-media").upload(path, file);
      if (error) {
        console.error("Upload error:", error);
        continue;
      }
      const { data: urlData } = supabase.storage.from("review-media").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!user) { toast.error("Please login to write a review"); return; }
    if (rating === 0) { toast.error("Please select a rating"); return; }

    setSubmitting(true);
    try {
      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        mediaUrls = await uploadMedia();
      }

      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating,
        title: title || null,
        comment: comment || null,
        media_urls: mediaUrls,
      } as any);

      if (error) { toast.error("Failed to submit review"); console.error(error); return; }

      toast.success("Review submitted successfully!");
      setRating(0); setTitle(""); setComment("");
      setMediaFiles([]); setMediaPreviews([]);
      setIsOpen(false);
      onReviewSubmitted();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <p className="text-muted-foreground">Please login to write a review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors font-medium"
        >
          ✍️ Write a Review
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Write a Review</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Star Rating */}
          <div>
            <p className="text-sm font-medium mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Review title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm"
          />

          {/* Comment */}
          <textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-secondary rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
          />

          {/* Media Upload Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              <Camera className="h-4 w-4" /> Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              <ImagePlus className="h-4 w-4" /> Photo
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              <Video className="h-4 w-4" /> Video
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            <input ref={videoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={handleFileSelect} />
          </div>

          {/* Media Previews */}
          <AnimatePresence>
            {mediaPreviews.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 flex-wrap">
                {mediaPreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    {mediaFiles[idx]?.type.startsWith("video") ? (
                      <video src={preview} className="w-full h-full object-cover" />
                    ) : (
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => removeMedia(idx)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full py-2.5 tarbo-gradient text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Review</>}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ReviewForm;
