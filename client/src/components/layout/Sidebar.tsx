import { motion } from "framer-motion";
import { FolderOpen, Plus, Settings2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeleteCategory } from "@/hooks/use-categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onAddCategory: () => void;
}

export function Sidebar({ categories, selectedCategoryId, onSelectCategory, onAddCategory }: SidebarProps) {
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  return (
    <div className="w-20 md:w-64 flex flex-col h-screen border-r bg-muted/30 relative z-20">
      {/* Header */}
      <div className="p-4 md:p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <FolderOpen className="w-6 h-6" />
        </div>
        <div className="hidden md:block">
          <h1 className="font-bold text-lg text-foreground leading-tight">Organizer</h1>
          <p className="text-xs text-muted-foreground">My Notes</p>
        </div>
      </div>

      <div className="px-4 mb-2 hidden md:block">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Categories</p>
      </div>

      {/* Tabs List */}
      <ScrollArea className="flex-1 px-2 md:px-4 pb-4">
        <div className="space-y-1">
          {/* All Notes 'Tab' */}
          <button
            onClick={() => onSelectCategory(null)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden",
              selectedCategoryId === null
                ? "bg-white text-primary shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {selectedCategoryId === null && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"
              />
            )}
            <span className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-primary transition-colors ml-1" />
            <span className="font-medium hidden md:block truncate">All Notes</span>
          </button>

          {/* Category Tabs */}
          {categories.map((category) => (
            <div key={category.id} className="group/item relative flex items-center">
              <button
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 relative overflow-hidden",
                  selectedCategoryId === category.id
                    ? "bg-white text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {selectedCategoryId === category.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: category.color || 'var(--primary)' }}
                  />
                )}
                
                <span 
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-transparent transition-all ml-1 shrink-0"
                  style={{ 
                    backgroundColor: category.color || '#94a3b8',
                    boxShadow: selectedCategoryId === category.id ? `0 0 8px ${category.color}40` : 'none'
                  }}
                />
                <span className="font-medium hidden md:block truncate flex-1">{category.name}</span>
              </button>
              
              {/* Delete Action (Hover only on desktop) */}
              <div className="absolute right-2 opacity-0 group-hover/item:opacity-100 transition-opacity hidden md:block">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the category "{category.name}". Notes will not be deleted but will become uncategorized (optional implementation detail).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(category.id);
                        }}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
        <Button 
          onClick={onAddCategory}
          variant="outline" 
          className="w-full justify-center md:justify-start gap-2 border-dashed text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Category</span>
        </Button>
      </div>
    </div>
  );
}
