
export enum RevisionInterval {
  DAY_1 = 1,
  DAY_3 = 3,
  DAY_7 = 7,
  DAY_21 = 21
}

export interface RevisionStatus {
  interval: RevisionInterval;
  dueDate: string; // ISO string
  completedAt: string | null; // ISO string or null
}

export interface Topic {
  id: string;
  parentId: string | null;
  userId: string;
  name: string;
  notes: string;
  createdAt: string;
  revisions: RevisionStatus[];
  subTopics?: Topic[]; // Used in memory for tree view
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
