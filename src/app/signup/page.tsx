
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserProfile } from '@/services/firestore-service';
import type { UserRole } from '@/lib/types';
import { Bot } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({
        title: 'Role not selected',
        description: 'Please select a role to continue.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user role to Firestore
      await createUserProfile({
        uid: user.uid,
        name,
        email,
        role,
      });

      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Sign-up failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50 py-12">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <Bot className="w-8 h-8 text-primary" />
        <div className="font-headline text-2xl font-semibold">
          TalentFlow
        </div>
      </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join TalentFlow to manage your teams intelligently.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="grid gap-4">
             <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
               <Select onValueChange={(value) => setRole(value as UserRole)} value={role} disabled={isLoading}>
                 <SelectTrigger id="role">
                   <SelectValue placeholder="Select your role" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Administrator">Administrator</SelectItem>
                   <SelectItem value="Project Manager">Project Manager</SelectItem>
                   <SelectItem value="Team Member">Team Member</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
             <p className="text-xs text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline font-medium text-primary">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
