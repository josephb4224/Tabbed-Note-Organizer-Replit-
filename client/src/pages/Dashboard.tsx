import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useNotes, useUpdateNote } from "@/hooks/use-notes";
import { Sidebar } from "@/components/layout/Sidebar";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteDialog } from "@/components/notes/NoteDialog";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Note } from "@shared/schema";

export default function Dashboard() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: notes = [], isLoading: loadingNotes } = useNotes(selectedCategoryId || undefined);
  const updateNoteMutation = useUpdateNote();

  // Derived state
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleNoteClick = (note: Note) => {
    setEditingNote(note);
    setIsNoteDialogOpen(true);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsNoteDialogOpen(true);
  };

  const handleToggleFavorite = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    updateNoteMutation.mutate({
      id: note.id,
      isFavorite: !note.isFavorite
    });
  };

  if (loadingCategories) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar 
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onAddCategory={() => setIsCategoryDialogOpen(true)}
      />

      {/* Main "Drawer" Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 bg-background/80 backdrop-blur-md sticky top-0 border-b border-border/40">
          <div>
            <motion.h2 
              key={selectedCategoryId || 'all'}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-display font-bold text-foreground"
            >
              {selectedCategoryId ? selectedCategory?.name : "All Notes"}
            </motion.h2>
            <p className="text-muted-foreground mt-1">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-primary/30 transition-all"
              />
            </div>
            <Button 
              onClick={handleCreateNote}
              className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </Button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 dark:bg-background">
          {loadingNotes ? (
             <div className="flex h-40 items-center justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
             </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No notes found</h3>
              <p className="text-muted-foreground max-w-sm">
                {searchQuery 
                  ? "We couldn't find any notes matching your search." 
                  : "This drawer is empty. Start by creating your first note!"}
              </p>
              {!searchQuery && (
                <Button variant="link" onClick={handleCreateNote} className="mt-4 text-primary">
                  Create a note now &rarr;
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    category={categories.find(c => c.id === note.categoryId)}
                    onClick={() => handleNoteClick(note)}
                    onToggleFavorite={(e) => handleToggleFavorite(e, note)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      <NoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        note={editingNote}
        defaultCategoryId={selectedCategoryId}
        categories={categories}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />
    </div>
  );
}
