
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Save, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradeNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<TradeNote[]>([]);
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
            <Card key={note.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{note.title}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {note.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={note.imageUrl} 
                      alt={`Visual for ${note.title}`} 
                      className="max-h-[300px] rounded-md border border-gray-200" 
                    />
                  </div>
                )}
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
                Create notes in the Playbooks section to see them here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
