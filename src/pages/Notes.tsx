
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronDown, ChevronUp, Image, Maximize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TradeNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<TradeNote[]>([]);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('tradeNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);
  
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    
    // Update localStorage
    const updatedNotes = notes.filter(note => note.id !== id);
    localStorage.setItem('tradeNotes', JSON.stringify(updatedNotes));
    
    toast({
      title: "Note deleted",
      description: "The trading note has been removed"
    });

    // Close the note if it was open
    if (openNoteId === id) {
      setOpenNoteId(null);
    }
  };

  const toggleNote = (id: string) => {
    setOpenNoteId(openNoteId === id ? null : id);
  };

  const openImagePreview = (imageUrl: string) => {
    setImagePreview(imageUrl);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trading Notes Archive</h1>
      <p className="text-muted-foreground">
        Review your saved trading notes and insights.
      </p>
      
      {/* Graph from the provided URL */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Market Performance</CardTitle>
          <CardDescription>Visual representation of market trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full overflow-hidden rounded-md">
            <iframe 
              src="https://html.cafe/x9c6c7d39" 
              width="100%" 
              height="450" 
              style={{ border: 'none' }} 
              title="Market Performance Chart"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map(note => (
            <Collapsible
              key={note.id}
              open={openNoteId === note.id}
              onOpenChange={() => toggleNote(note.id)}
              className="rounded-md border shadow-sm"
            >
              <div className="flex items-center justify-between p-4 bg-card hover:bg-accent/20 transition-colors cursor-pointer">
                <CollapsibleTrigger className="flex-1 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{note.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {openNoteId === note.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="ml-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent>
                <div className="p-4 pt-0 border-t">
                  {note.imageUrl && (
                    <div className="mb-4">
                      <div className="relative group">
                        <img 
                          src={note.imageUrl} 
                          alt={`Visual for ${note.title}`} 
                          className="max-h-[300px] rounded-md border border-gray-200 cursor-zoom-in" 
                          onClick={() => openImagePreview(note.imageUrl as string)}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openImagePreview(note.imageUrl as string)}
                        >
                          <Maximize className="h-4 w-4 mr-1" />
                          Expand
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-center">No Notes Yet</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Create notes in the Playbooks section to see them here
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="p-1">
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-auto object-contain max-h-[80vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
