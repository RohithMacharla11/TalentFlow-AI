import type { Project, Resource, Allocation } from './types';

export const resources: Resource[] = [
  {
    id: 'res-1',
    name: 'Alice Johnson',
    role: 'Frontend Developer',
    avatar: 'https://picsum.photos/id/1027/200/200',
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
    availability: 30,
    email: 'alice@talentflow.ai',
  },
  {
    id: 'res-2',
    name: 'Bob Williams',
    role: 'Backend Developer',
    avatar: 'https://picsum.photos/id/1005/200/200',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
    availability: 40,
    email: 'bob@talentflow.ai',
  },
  {
    id: 'res-3',
    name: 'Charlie Brown',
    role: 'UI/UX Designer',
    avatar: 'https://picsum.photos/id/1011/200/200',
    skills: ['Figma', 'Prototyping', 'User Research'],
    availability: 20,
    email: 'charlie@talentflow.ai',
  },
  {
    id: 'res-4',
    name: 'Diana Prince',
    role: 'Project Manager',
    avatar: 'https://picsum.photos/id/1025/200/200',
    skills: ['Agile', 'Scrum', 'Jira', 'Risk Management'],
    availability: 40,
    email: 'diana@talentflow.ai',
  },
];

export const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Project Phoenix',
    description: 'A web app for tracking expenses.',
    requiredSkills: ['React', 'Node.js', 'Figma'],
    deadline: '2024-09-30T23:59:59.999Z',
    priority: 'High',
  },
  {
    id: 'proj-2',
    name: 'Project Neptune',
    description: 'A mobile app for social networking.',
    requiredSkills: ['React Native', 'Python', 'GraphQL'],
    deadline: '2024-10-15T23:59:59.999Z',
    priority: 'Medium',
  },
  {
    id: 'proj-3',
    name: 'Project Titan',
    description: 'Data analysis dashboard for sales.',
    requiredSkills: ['Python', 'SQL', 'Tableau'],
    deadline: '2024-08-25T23:59:59.999Z',
    priority: 'Low',
  },
];

export const allocations: Allocation[] = [
  { projectId: 'proj-1', resourceId: 'res-1', match: 95, status: 'matched' },
  { projectId: 'proj-1', resourceId: 'res-2', match: 80, status: 'matched' },
  { projectId: 'proj-1', resourceId: 'res-3', match: 70, status: 'partial' },
  { projectId: 'proj-2', resourceId: 'res-1', match: 60, status: 'partial' },
  { projectId: 'proj-2', resourceId: 'res-4', match: 90, status: 'matched' },
  { projectId: 'proj-3', resourceId: 'res-2', match: 40, status: 'conflict' },
];

// Add projects to the project data
projects.forEach(p => {
    p.allocatedResources = allocations.filter(a => a.projectId === p.id);
});
