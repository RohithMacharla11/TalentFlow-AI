
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Resource } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';

const resourceSchema = z.object({
  name: z.string().min(1, 'Resource name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  skills: z.string().min(1, 'Skills are required'),
  availability: z.coerce.number().min(0, 'Availability must be positive'),
  location: z.string().min(1, 'Location is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  seniority: z.enum(['Intern', 'Junior', 'Mid-level', 'Senior', 'Lead']),
});

export type ResourceFormValues = z.infer<typeof resourceSchema>;

interface AddResourceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  prefillData?: Partial<ResourceFormValues>;
  isCompletingProfile?: boolean;
}

export function AddResourceModal({ open, setOpen, prefillData, isCompletingProfile = false }: AddResourceModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: prefillData || {
      seniority: 'Junior',
    }
  });

  React.useEffect(() => {
    if (prefillData) {
      reset(prefillData);
    }
  }, [prefillData, reset]);

  const onSubmit = async (data: ResourceFormValues) => {
    try {
      await addDoc(collection(db, 'resources'), {
        ...data,
        skills: Array.isArray(data.skills) ? data.skills : data.skills.split(',').map(s => s.trim()),
        avatar: `https://picsum.photos/seed/${data.name}/200/200`,
        createdAt: serverTimestamp(),
      });
      toast({
        title: isCompletingProfile ? "Profile Completed!" : "Resource Added",
        description: isCompletingProfile ? "You can now request to join projects." : `${data.name} has been successfully added.`,
      });
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "Failed to save resource details. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (user?.role === 'Project Manager') return null;

  const getTrigger = () => {
    if (isCompletingProfile) {
      return (
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Complete Your Profile
        </Button>
      );
    }
    if (user?.role === 'Administrator') {
      return (
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      )
    }
    return null;
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {getTrigger()}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isCompletingProfile ? 'Complete Your Resource Profile' : 'Add New Resource'}</DialogTitle>
          <DialogDescription>
            {isCompletingProfile 
                ? "Fill in your details to be added to the resource pool."
                : "Fill in the details below to add a new resource."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} disabled={isCompletingProfile} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} disabled={isCompletingProfile} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role / Job Title</Label>
            <Input id="role" {...register('role')} placeholder="e.g. Software Engineer"/>
            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" {...register('skills')} placeholder="e.g. React, TypeScript, Figma" />
            {errors.skills && <p className="text-red-500 text-sm">{errors.skills.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="availability">Availability (hrs/wk)</Label>
              <Input id="availability" type="number" {...register('availability')} />
              {errors.availability && <p className="text-red-500 text-sm">{errors.availability.message}</p>}
            </div>
             <div className="grid gap-2">
               <Label htmlFor="seniority">Seniority</Label>
               <Controller
                  name="seniority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select level" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Intern">Intern</SelectItem>
                         <SelectItem value="Junior">Junior</SelectItem>
                         <SelectItem value="Mid-level">Mid-level</SelectItem>
                         <SelectItem value="Senior">Senior</SelectItem>
                         <SelectItem value="Lead">Lead</SelectItem>
                       </SelectContent>
                     </Select>
                  )}
                />
             </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="e.g. San Francisco, CA" />
              {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" {...register('timezone')} placeholder="e.g. PST, GMT+5" />
              {errors.timezone && <p className="text-red-500 text-sm">{errors.timezone.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
