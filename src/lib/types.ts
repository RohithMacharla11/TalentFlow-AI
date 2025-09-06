export type Resource = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  skills: string[];
  availability: number; // hours per week
  location: string;
  timezone: string;
  seniority: 'Intern' | 'Junior' | 'Mid-level' | 'Senior' | 'Lead';
};

export type Project = {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  deadline: string; // ISO date string
  priority: 'High' | 'Medium' | 'Low';
  budget?: number;
};

export type Allocation = {
  resourceId: string;
  projectId: string;
  match: number; // 0-100
  status: 'matched' | 'partial' | 'conflict';
};
