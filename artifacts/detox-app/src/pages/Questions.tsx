import { useState } from "react";
import { useQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion } from "@/hooks/use-questions";
import { Plus, Search, Trash2, Pencil, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Questions() {
  const { data: questions, isLoading } = useQuestions();
  const createQ = useCreateQuestion();
  const deleteQ = useDeleteQuestion();
  const updateQ = useUpdateQuestion();

  const [isAdding, setIsAdding] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [search, setSearch] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.trim() || !newA.trim()) return;
    createQ.mutate(
      { data: { question: newQ, answer: newA } },
      { onSuccess: () => { setIsAdding(false); setNewQ(""); setNewA(""); } }
    );
  };

  const handleSaveEdit = (id: number) => {
    if (!editQ.trim() || !editA.trim()) return;
    updateQ.mutate(
      { id, data: { question: editQ, answer: editA } },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setEditQ(q.question);
    setEditA(q.answer);
  };

  const filtered = questions?.filter(q => q.question.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto pb-24 md:pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Custom Questions</h1>
          <p className="text-muted-foreground">Manage the knowledge required to unlock your device.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>Add Question</span>
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="bg-card border border-border rounded-2xl p-6 overflow-hidden"
            onSubmit={handleCreate}
          >
            <h3 className="text-lg font-semibold mb-4">New Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Question</label>
                <input
                  autoFocus
                  type="text"
                  value={newQ}
                  onChange={e => setNewQ(e.target.value)}
                  placeholder="e.g. What is the capital of France?"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Answer</label>
                <input
                  type="text"
                  value={newA}
                  onChange={e => setNewA(e.target.value)}
                  placeholder="e.g. Paris"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newQ.trim() || !newA.trim() || createQ.isPending}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
              >
                {createQ.isPending ? "Saving..." : "Save Question"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="relative mb-8">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
        />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-card rounded-2xl border border-border" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border border-dashed rounded-2xl">
            <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No questions found</h3>
            <p className="text-muted-foreground">Add some questions to challenge your future self.</p>
          </div>
        ) : (
          filtered.map(q => (
            <div key={q.id} className="bg-card border border-border rounded-2xl p-5 hover:border-border/80 transition-colors group">
              {editingId === q.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editQ}
                    onChange={e => setEditQ(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                  <input
                    type="text"
                    value={editA}
                    onChange={e => setEditA(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                  <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleSaveEdit(q.id)} disabled={updateQ.isPending} className="p-2 bg-primary text-primary-foreground rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="pr-8">
                    <p className="font-medium text-foreground text-lg mb-1 leading-tight">{q.question}</p>
                    <div className="inline-flex items-center space-x-2 bg-secondary px-3 py-1 rounded-md mt-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Answer:</span>
                      <span className="text-sm text-foreground">{q.answer}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(q)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteQ.mutate({ id: q.id })}
                      disabled={deleteQ.isPending}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
