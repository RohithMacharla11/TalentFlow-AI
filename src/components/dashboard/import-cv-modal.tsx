'use client';
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud } from 'lucide-react';
import { extractInfoFromCv } from '@/ai/flows/extract-info-from-cv';
import type { ResourceFormValues } from './add-resource-modal';

interface ImportCvModalProps {
  setPrefillData: (data: Partial<ResourceFormValues>) => void;
  setAddResourceOpen: (open: boolean) => void;
}

export function ImportCvModal({ setPrefillData, setAddResourceOpen }: ImportCvModalProps) {
  const [open, setOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleParse = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please select a CV to parse.', variant: 'destructive' });
      return;
    }

    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUri = reader.result as string;
        const result = await extractInfoFromCv({ cvDataUri: dataUri });
        
        setPrefillData({
            name: result.name,
            email: result.email,
            skills: result.skills.join(', '),
            seniority: result.seniority,
        });
        
        toast({
          title: "CV Parsed Successfully",
          description: `Prefilled form for ${result.name}. Please verify the details.`,
        });

        setOpen(false);
        setAddResourceOpen(true);
      };
      reader.onerror = (error) => {
        throw error;
      };
    } catch (error) {
      console.error("Error parsing CV: ", error);
      toast({
        title: "Error",
        description: "Failed to parse CV. Please try again or add manually.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <UploadCloud className="mr-2 h-4 w-4" /> Import from CV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import from CV</DialogTitle>
          <DialogDescription>
            Upload a CV (PDF, DOCX) and let AI extract the details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="cv-file">CV File</Label>
            <Input id="cv-file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleParse} disabled={isParsing || !file}>
            {isParsing ? 'Parsing...' : 'Parse and Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
