import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Tag, Trash2, X, Eye, Edit3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import type { Note, Category } from "@shared/schema";
import { insertNoteSchema } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/use-notes";
import { z } from "zod";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null; // null for create mode
  defaultCategoryId: number | null;
  categories: Category[];
}

// Extend schema for form usage if needed (e.g. coerce types)
const formSchema = insertNoteSchema.extend({
  categoryId: z.coerce.number().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function NoteDialog({ open, onOpenChange, note, defaultCategoryId, categories }: NoteDialogProps) {
  const [viewMode, setViewMode] = useState<"edit" | "view">("edit");
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: defaultCategoryId,
      isFavorite: false,
    },
  });

  useEffect(() => {
    if (open) {
      setViewMode(note ? "view" : "edit");
      if (note) {
        form.reset({
          title: note.title,
          content: note.content,
          categoryId: note.categoryId,
          isFavorite: note.isFavorite || false,
        });
      } else {
        form.reset({
          title: "",
          content: "",
          categoryId: defaultCategoryId,
          isFavorite: false,
        });
      }
    }
  }, [open, note, defaultCategoryId, form]);

  const onSubmit = (data: FormValues) => {
    // Ensure categoryId is number or null/undefined, not 0 if empty
    const cleanData = {
      ...data,
      categoryId: data.categoryId || null,
    };

    if (note) {
      updateMutation.mutate(
        { id: note.id, ...cleanData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(cleanData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const handleDelete = () => {
    if (note && confirm("Are you sure you want to delete this note?")) {
      deleteMutation.mutate(note.id, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const content = form.watch("content");
  const title = form.watch("title");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl border-0 shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-background">
            {/* Header / Toolbar */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                  <Calendar className="w-4 h-4" />
                  {note?.createdAt 
                    ? format(new Date(note.createdAt), "MMMM d, yyyy") 
                    : "New Entry"}
                </div>
                
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "edit" | "view")} className="h-8">
                  <TabsList className="grid w-[160px] grid-cols-2 h-8 p-1">
                    <TabsTrigger value="edit" className="text-xs h-6 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="view" className="text-xs h-6 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      View
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center gap-2">
                {note && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} type="button">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Main Editor/Viewer Area */}
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="p-6 pb-0">
                {viewMode === "edit" ? (
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Note Title" 
                            className="text-3xl font-display font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 bg-transparent"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ) : (
                  <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                    {title || <span className="text-muted-foreground/40 italic">Untitled Note</span>}
                  </h1>
                )}

                <div className="flex items-center gap-4 mt-2 mb-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="flex-1 max-w-[240px]">
                        <Select 
                          onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))}
                          value={field.value?.toString() || "none"}
                          disabled={viewMode === "view"}
                        >
                          <FormControl>
                            <SelectTrigger className="border-0 bg-muted/50 hover:bg-muted transition-colors rounded-lg font-medium text-muted-foreground h-9">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                <SelectValue placeholder="Uncategorized" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Uncategorized</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#000' }} />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex-1 px-6 pb-6">
                {viewMode === "edit" ? (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="h-full">
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Start typing your thoughts in Markdown..." 
                            className="resize-none h-full min-h-[400px] border-none px-0 shadow-none focus-visible:ring-0 text-lg leading-relaxed font-mono bg-transparent"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary min-h-[400px]">
                    {content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    ) : (
                      <p className="italic text-muted-foreground/50">No content provided.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-muted/10 flex justify-end">
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full sm:w-auto min-w-[120px] font-semibold text-base py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                {isPending ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
