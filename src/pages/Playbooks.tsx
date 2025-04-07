
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface TradeNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const PlaybooksPage = () => {
  const [notes, setNotes] = useState<TradeNote[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('tradeNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);
  
  // Save notes to localStorage when updated
  useEffect(() => {
    localStorage.setItem('tradeNotes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    
    if (editingNoteId) {
      // Update existing note
      const updatedNotes = notes.map(note => 
        note.id === editingNoteId 
          ? { ...note, title, content, createdAt: new Date().toISOString() } 
          : note
      );
      setNotes(updatedNotes);
      
      toast({
        title: "Note updated",
        description: "Your trading note has been updated successfully"
      });
    } else {
      // Create new note
      const newNote: TradeNote = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString()
      };
      
      setNotes([newNote, ...notes]);
      
      toast({
        title: "Note created",
        description: "Your trading note has been saved successfully"
      });
    }
    
    // Reset form
    setTitle('');
    setContent('');
    setEditingNoteId(null);
  };
  
  const editNote = (note: TradeNote) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingNoteId(note.id);
  };
  
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    
    if (editingNoteId === id) {
      setTitle('');
      setContent('');
      setEditingNoteId(null);
    }
    
    toast({
      title: "Note deleted",
      description: "The trading note has been removed"
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trading Notes</h1>
      <p className="text-muted-foreground">
        Keep track of your trading insights, patterns, and lessons learned.
      </p>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingNoteId ? "Edit Note" : "Create New Note"}</CardTitle>
          <CardDescription>Record your observations and insights about trading patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4"
            />
            <Textarea
              placeholder="Write your trading notes, observations, or strategies here..."
              className="resize-none min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            {editingNoteId && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setTitle('');
                  setContent('');
                  setEditingNoteId(null);
                }}
              >
                Cancel
              </Button>
            )}
            <Button onClick={handleCreateNote}>
              <Save className="mr-2 h-4 w-4" />
              {editingNoteId ? "Update Note" : "Save Note"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map(note => (
            <Card key={note.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{note.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => editNote(note)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-center">No Notes Yet</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Start documenting your trading insights and patterns
              </p>
              <Button onClick={() => {
                setTitle('');
                setContent('');
                setEditingNoteId(null);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Note
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlaybooksPage;
