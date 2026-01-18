
import { Topic, RevisionInterval, User, RevisionStatus } from '../types';

const STORAGE_KEY = 'revisemaster_v2_storage';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface Store {
  users: User[];
  topics: Topic[];
}

const getStore = (): Store => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { users: [], topics: [] };
  return JSON.parse(data);
};

const saveStore = (store: Store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const mockApi = {
  login: async (email: string, pass: string): Promise<{ user: User; token: string }> => {
    await delay(500);
    const store = getStore();
    const user = store.users.find(u => u.email === email) || { id: 'u-' + Date.now(), email, name: email.split('@')[0] };
    if (!store.users.find(u => u.email === email)) {
      store.users.push(user);
      saveStore(store);
    }
    return { user, token: 'mock-jwt' };
  },

  // Added signup method to fix the missing property error in components/Auth.tsx
  signup: async (email: string, pass: string, name: string): Promise<{ user: User; token: string }> => {
    await delay(500);
    const store = getStore();
    if (store.users.find(u => u.email === email)) {
      throw new Error("User already exists");
    }
    const user = { id: 'u-' + Date.now(), email, name };
    store.users.push(user);
    saveStore(store);
    return { user, token: 'mock-jwt' };
  },

  guestLogin: async (): Promise<{ user: User; token: string }> => {
    await delay(300);
    const store = getStore();
    const guestUser = { id: 'guest-id', email: 'guest@revisemaster.pro', name: 'Guest Learner' };
    
    // Add some demo data if guest is empty
    if (store.topics.length === 0) {
      const demoId = 'demo-1';
      const now = new Date();
      store.topics.push({
        id: demoId,
        parentId: null,
        userId: 'guest-id',
        name: 'Welcome: Organic Chemistry',
        notes: 'Start your journey here!',
        createdAt: now.toISOString(),
        revisions: [1, 3, 7, 21].map(int => ({
          interval: int,
          dueDate: new Date(now.getTime() + int * 86400000).toISOString(),
          completedAt: null
        }))
      });
      saveStore(store);
    }
    
    return { user: guestUser, token: 'guest-token' };
  },

  getTopics: async (): Promise<Topic[]> => {
    await delay(200);
    return getStore().topics;
  },

  getTopic: async (id: string): Promise<Topic> => {
    const topic = getStore().topics.find(t => t.id === id);
    if (!topic) throw new Error("Topic not found");
    return topic;
  },

  createTopic: async (name: string, parentId: string | null = null): Promise<Topic> => {
    await delay(300);
    const store = getStore();
    const now = new Date();
    // Normalize to start of day for cleaner logic
    now.setHours(0, 0, 0, 0);

    const revisions: RevisionStatus[] = [1, 3, 7, 21].map(int => {
      const due = new Date(now);
      due.setDate(due.getDate() + int);
      return { interval: int, dueDate: due.toISOString(), completedAt: null };
    });

    const newTopic: Topic = {
      id: 't-' + Math.random().toString(36).substr(2, 9),
      parentId,
      userId: 'user-id',
      name,
      notes: '',
      createdAt: new Date().toISOString(),
      revisions
    };

    store.topics.push(newTopic);
    saveStore(store);
    return newTopic;
  },

  toggleRevision: async (topicId: string, interval: RevisionInterval): Promise<Topic> => {
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
    const store = getStore();
    const topic = store.topics.find(t => t.id === id);
    if (topic) {
      topic.notes = notes;
      saveStore(store);
    }
  }
};
