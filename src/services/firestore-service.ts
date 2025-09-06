
'use server';

/**
 * @fileOverview Service functions for interacting with Firestore.
 */

import { collection, getDocs, addDoc, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Resource, Allocation, User } from '@/lib/types';


/**
 * Creates a user profile document in Firestore.
 * @param user - The user data to save.
 * @returns A promise that resolves when the profile is created.
 */
export async function createUserProfile(user: Omit<User, 'id'>): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

/**
 * Updates a user profile document in Firestore.
 * @param uid - The user's unique ID.
 * @param data - The data to update.
 * @returns A promise that resolves when the profile is updated.
 */
export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
}


/**
 * Fetches all projects from Firestore.
 * @returns A promise that resolves to an array of projects.
 */
export async function getProjects(): Promise<Project[]> {
  const projectsCol = collection(db, 'projects');
  const projectSnapshot = await getDocs(projectsCol);
  const projectList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  return projectList;
}

/**
 * Fetches all resources from Firestore.
 * @returns A promise that resolves to an array of resources.
 */
export async function getResources(): Promise<Resource[]> {
  const resourcesCol = collection(db, 'resources');
  const resourceSnapshot = await getDocs(resourcesCol);
  const resourceList = resourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
  return resourceList;
}

/**
 * Fetches all allocations from Firestore.
 * @returns A promise that resolves to an array of allocations.
 */
export async function getAllocations(): Promise<Allocation[]> {
    const allocationsCol = collection(db, 'allocations');
    const allocationSnapshot = await getDocs(allocationsCol);
    const allocationList = allocationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Allocation));
    return allocationList;
}


/**
 * Creates a new allocation in Firestore.
 * @param allocation - The allocation data to save.
 * @returns A promise that resolves when the allocation is created.
 */
export async function allocateResource(allocation: Omit<Allocation, 'id'>): Promise<void> {
  await addDoc(collection(db, 'allocations'), {
    ...allocation,
    createdAt: serverTimestamp(),
  });
}
