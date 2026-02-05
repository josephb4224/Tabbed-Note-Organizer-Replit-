import { forwardRef } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Star, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Note, Category } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface NoteCardProps {
  note: Note;
  category?: Category;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const NoteCard = forwardRef<HTMLDivElement, NoteCardProps>(({ note, category, onClick, onToggleFavorite }, ref) => {
  // Strip HTML or markdown for preview (simple approach)
  const previewText = note.content.substring(0, 120) + (note.content.length > 120 ? "..." : "");

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative bg-white dark:bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 cursor-pointer transition-all duration-300 flex flex-col h-64"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          {category && (
            <Badge 
              variant="secondary" 
              className="mb-2 text-[10px] px-2 py-0.5 h-5 font-medium tracking-wide"
              style={{ 
                backgroundColor: `${category.color}15`, 
                color: category.color,
                borderColor: `${category.color}30`
              }}
            >
              {category.name}
            </Badge>
          )}
          <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {note.title}
          </h3>
        </div>
        <button
          onClick={onToggleFavorite}
          className={cn(
            "p-2 rounded-full transition-all duration-200 hover:bg-muted",
            note.isFavorite 
              ? "text-yellow-400 hover:text-yellow-500" 
              : "text-muted-foreground/30 hover:text-yellow-400"
          )}
        >
          <Star className={cn("w-5 h-5", note.isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap font-body line-clamp-4">
          {previewText || <span className="italic opacity-50">No content...</span>}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          {note.createdAt && format(new Date(note.createdAt), "MMM d, yyyy")}
        </div>
        
        <div className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
          Open
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
      
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
    </motion.div>
  );
});

NoteCard.displayName = "NoteCard";
