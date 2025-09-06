'use client';
import React, { useState } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

const resourceSchema = z.object({
  name: z.string().min(1, 'Resource name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  skills: z.string().min(1, 'Skills are required'),
  availability: z.coerce.number().min(0, 'Availability must be positive'),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

export function AddResourceModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
  });

  const onSubmit = async (data: ResourceFormValues) => {
    try {
      await addDoc(collection(db, 'resources'), {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()),
        avatar: `https://picsum.photos/seed/${data.name}/200/200`,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Resource Added",
        description: `${data.name} has been successfully added.`,
      });
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "Failed to add resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new resource.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" {...register('role')} />
            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" {...register('skills')} />
            {errors.skills && <p className="text-red-500 text-sm">{errors.skills.message}</p>}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="availability">Availability (hours/week)</Label>
            <Input id="availability" type="number" {...register('availability')} />
            {errors.availability && <p className="text-red-500 text-sm">{errors.availability.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
