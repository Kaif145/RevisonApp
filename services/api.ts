
import { Topic, RevisionInterval, User, RevisionStatus } from '../types';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const STORAGE_KEY = 'revise_master_data';

interface Store {
  users: User[];
  topics: Topic[];
}

const getStore = (): Store => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { users: [], topics: [] };
};

const saveStore = (store: Store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const mockApi = {
  login: async (email: string, pass: string): Promise<{ user: User; token: string }> => {
    await delay(800);
    const store = getStore();
    const user = store.users.find(u => u.email === email);
    if (!user) throw new Error("User not found");
    return { user, token: 'mock-jwt-token' };
  },

  signup: async (email: string, pass: string, name: string): Promise<{ user: User; token: string }> => {
    await delay(1000);
    const store = getStore();
    if (store.users.find(u => u.email === email)) throw new Error("Email already registered");
    
    const newUser: User = { id: Math.random().toString(36).substr(2, 9), email, name };
    store.users.push(newUser);
    saveStore(store);
    return { user: newUser, token: 'mock-jwt-token' };
  },

  getTopics: async (): Promise<Topic[]> => {
    await delay(500);
    const store = getStore();
    return store.topics;
  },

  getTopic: async (id: string): Promise<Topic> => {
    await delay(200);
    const store = getStore();
    const topic = store.topics.find(t => t.id === id);
    if (!topic) throw new Error("Not found");
    return topic;
  },

  createTopic: async (name: string, parentId: string | null = null): Promise<Topic> => {
    await delay(600);
    const store = getStore();
    const now = new Date();
    
    const intervals = [RevisionInterval.DAY_1, RevisionInterval.DAY_3, RevisionInterval.DAY_7, RevisionInterval.DAY_21];
    const revisions: RevisionStatus[] = intervals.map(int => {
      const due = new Date(now);
      due.setDate(due.getDate() + int);
      return { interval: int, dueDate: due.toISOString(), completedAt: null };
    });

    const newTopic: Topic = {
      id: Math.random().toString(36).substr(2, 9),
      parentId,
      userId: 'mock-user-id',
      name,
      notes: '',
      createdAt: now.toISOString(),
      revisions
    };

    store.topics.push(newTopic);
    saveStore(store);
    return newTopic;
  },

  toggleRevision: async (topicId: string, interval: RevisionInterval): Promise<Topic> => {
    await delay(300);
    const store = getStore();
    const topic = store.topics.find(t => t.id === topicId);
    if (!topic) throw new Error("Topic not found");

    const revision = topic.revisions.find(r => r.interval === interval);
    if (revision) {
      revision.completedAt = revision.completedAt ? null : new Date().toISOString();
    }
    
    saveStore(store);
    return topic;
  },

  updateTopicNotes: async (id: string, notes: string): Promise<void> => {
    await delay(300);
    const store = getStore();
    const topic = store.topics.find(t => t.id === id);
    if (topic) {
      topic.notes = notes;
      saveStore(store);
    }
  }
};
