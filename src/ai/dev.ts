import { config } from 'dotenv';
config();

import '@/ai/flows/extract-skills-from-project-description.ts';
import '@/ai/flows/extract-skills-from-resource-cv.ts';
import '@/ai/flows/intelligent-resource-matching.ts';
import '@/ai/flows/intelligent-project-matching.ts';
import '@/ai/flows/explainable-resource-assignment.ts';
import '@/ai/flows/allocate-resources-chatbot.ts';
import '@/ai/flows/extract-info-from-cv.ts';
import '@/services/firestore-service.ts';
