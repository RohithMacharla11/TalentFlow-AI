export type Resource = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  availability: number; // hours per week
  email: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  deadline: string; // ISO date string
  priority: 'High' | 'Medium' | 'Low';
};

export type Allocation = {
  resourceId: string;
  projectId: string;
  match: number; // 0-100
  status: 'matched' | 'partial' | 'conflict';
};
