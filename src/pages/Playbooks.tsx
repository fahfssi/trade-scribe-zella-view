
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PlaybookImage {
  id: string;
  imageUrl: string;
  description: string;
  createdAt: string;
}

const PlaybooksPage = () => {
  const [playbookImages, setPlaybookImages] = useState<PlaybookImage[]>([]);
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  
  // Load saved images from localStorage
  useEffect(() => {
    const savedImages = localStorage.getItem('playbookImages');
    if (savedImages) {
      setPlaybookImages(JSON.parse(savedImages));
    }
  }, []);
  
  // Save images to localStorage when updated
  useEffect(() => {
    localStorage.setItem('playbookImages', JSON.stringify(playbookImages));
  }, [playbookImages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const newImage: PlaybookImage = {
          id: Date.now().toString(),
          imageUrl: reader.result,
          description: description,
          createdAt: new Date().toISOString()
        };
        
        setPlaybookImages(prev => [newImage, ...prev]);
        setDescription('');
        
        toast({
          title: "Image added",
          description: "Your trade image has been added to the playbook"
        });
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const deleteImage = (id: string) => {
    setPlaybookImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: "Image removed",
      description: "The trade image has been removed from your playbook"
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Strategy Playbooks</h1>
      <p className="text-muted-foreground">
        Create and manage your trading strategies and setups. Upload images of successful trades to build your playbook.
      </p>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Trade Example</CardTitle>
          <CardDescription>Upload a screenshot of your trade with notes to build your playbook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter description or notes about this trade setup..."
            className="resize-none min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              id="image-upload"
              className="hidden"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload" className="w-full">
              <Button variant="outline" className="w-full cursor-pointer" asChild>
                <div>
                  <Upload className="mr-2 h-4 w-4" /> Upload Trade Image
                </div>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbookImages.length > 0 ? (
          playbookImages.map(img => (
            <Card key={img.id} className="overflow-hidden">
              <div className="relative">
                <img 
                  src={img.imageUrl} 
                  alt="Trade example" 
                  className="w-full h-48 object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => deleteImage(img.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="pt-4">
                <p className="text-sm">{img.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(img.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-center">No Trade Examples Yet</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Upload images of your trades with descriptions to build your playbook
              </p>
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Your First Example
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlaybooksPage;
