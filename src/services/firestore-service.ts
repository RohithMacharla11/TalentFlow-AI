
'use server';

/**
 * @fileOverview Service functions for interacting with Firestore.
 */

import { collection, getDocs, addDoc, serverTimestamp, doc, setDoc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project, Resource, Allocation, User, ProjectRequest } from '@/lib/types';


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
 * Fetches a single project by its ID from Firestore.
 * @param projectId - The ID of the project to fetch.
 * @returns A promise that resolves to the project data or null if not found.
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
    const projectDoc = await getDoc(doc(db, "projects", projectId));
    if (projectDoc.exists()) {
        return { id: projectDoc.id, ...projectDoc.data() } as Project;
    }
    return null;
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
 * Fetches a single resource by its email from Firestore.
 * @param email - The email of the resource to fetch.
 * @returns A promise that resolves to the resource data or null if not found.
 */
export async function getResourceByEmail(email: string): Promise<Resource | null> {
    const q = query(collection(db, "resources"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        return { id: docData.id, ...docData.data() } as Resource;
    }
    return null;
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

/**
 * Creates a new project request in Firestore.
 * @param requestData - The project request data to save.
 * @returns A promise that resolves when the request is created.
 */
export async function createProjectRequest(requestData: Omit<ProjectRequest, 'id' | 'requestedAt' | 'status'>): Promise<void> {
  await addDoc(collection(db, 'requests'), {
    ...requestData,
    status: 'pending',
    requestedAt: serverTimestamp(),
  });
}

/**
 * Updates the status of a project request in Firestore.
 * @param requestId - The ID of the request to update.
 * @param status - The new status of the request.
 * @returns A promise that resolves when the request is updated.
 */
export async function updateProjectRequestStatus(requestId: string, status: 'approved' | 'rejected'): Promise<void> {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, { status });
}
