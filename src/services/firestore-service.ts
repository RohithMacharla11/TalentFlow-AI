
'use server';

/**
 * @fileOverview Service functions for interacting with Firestore.
 */

import { collection, getDocs, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Resource, Allocation } from '@/lib/types';

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
