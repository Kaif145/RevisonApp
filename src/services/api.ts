
import { Topic, RevisionInterval, User, RevisionStatus } from '../types';

const API_BASE = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Make API requests with auth header
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API Error');
  }

  return response.json();
};

export const mockApi = {
  login: async (email: string, pass: string): Promise<{ user: User; token: string }> => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      return { user: data.user, token: data.token };
    } catch (error) {
      throw new Error('Login failed: ' + (error as Error).message);
    }
  },

  signup: async (email: string, pass: string, name: string): Promise<{ user: User; token: string }> => {
    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass, name }),
      });
      return { user: data.user, token: data.token };
    } catch (error) {
      throw new Error('Signup failed: ' + (error as Error).message);
    }
  },

  guestLogin: async (): Promise<{ user: User; token: string }> => {
    // For demo purposes - you can create a guest account or use a test account
    const guestUser = { id: 'guest-id', email: 'guest@revisemaster.pro', name: 'Guest Learner' };
    return { user: guestUser, token: 'guest-token' };
  },

  getTopics: async (): Promise<Topic[]> => {
    try {
      const data = await apiCall('/topics');
      return data.topics.map((topic: any) => ({
        id: topic._id,
        parentId: null,
        userId: topic.userId,
        name: topic.title,
        notes: topic.description || '',
        createdAt: topic.createdAt,
        revisions: [] // Will be populated from progress
      }));
    } catch (error) {
      throw new Error('Failed to fetch topics: ' + (error as Error).message);
    }
  },

  getTopic: async (id: string): Promise<Topic> => {
    try {
      const data = await apiCall(`/topics/${id}`);
      const progressData = await apiCall(`/progress/${id}`);
      
      return {
        id: data.topic._id,
        parentId: null,
        userId: data.topic.userId,
        name: data.topic.title,
        notes: data.topic.description || '',
        createdAt: data.topic.createdAt,
        revisions: progressData.progress?.reviewIntervals?.map((interval: any) => ({
          interval: interval.intervalDays,
          dueDate: interval.scheduledDate,
          completedAt: interval.isCompleted ? interval.completedDate : null
        })) || []
      };
    } catch (error) {
      throw new Error('Topic not found: ' + (error as Error).message);
    }
  },

  createTopic: async (name: string, parentId: string | null = null): Promise<Topic> => {
    try {
      const response = await apiCall('/topics', {
        method: 'POST',
        body: JSON.stringify({ title: name, description: '' }),
      });
      
      const topic = response.topic;
      
      // Create progress with default intervals
      await apiCall('/progress', {
        method: 'POST',
        body: JSON.stringify({ topicId: topic._id }),
      });

      return {
        id: topic._id,
        parentId,
        userId: topic.userId,
        name: topic.title,
        notes: topic.description || '',
        createdAt: topic.createdAt,
        revisions: [1, 3, 7, 21].map(int => {
          const due = new Date();
          due.setDate(due.getDate() + int);
          return { interval: int, dueDate: due.toISOString(), completedAt: null };
        })
      };
    } catch (error) {
      throw new Error('Failed to create topic: ' + (error as Error).message);
    }
  },

  toggleRevision: async (topicId: string, interval: RevisionInterval): Promise<Topic> => {
    try {
      // Get current progress
      const progressData = await apiCall(`/progress/${topicId}`);
      const currentInterval = progressData.progress.reviewIntervals.find(
        (i: any) => i.intervalDays === interval
      );

      // Toggle completion
      await apiCall(`/progress/${topicId}/interval/${interval}`, {
        method: 'PUT',
        body: JSON.stringify({
          isCompleted: !currentInterval.isCompleted,
        }),
      });

      // Return updated topic
      return mockApi.getTopic(topicId);
    } catch (error) {
      throw new Error('Failed to toggle revision: ' + (error as Error).message);
    }
  },

  updateTopicNotes: async (id: string, notes: string): Promise<void> => {
    try {
      await apiCall(`/topics/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ description: notes }),
      });
    } catch (error) {
      throw new Error('Failed to update notes: ' + (error as Error).message);
    }
  },

  deleteTopic: async (id: string): Promise<void> => {
    try {
      // Delete progress first
      await apiCall(`/progress/${id}`, { method: 'DELETE' });
      // Then delete topic
      await apiCall(`/topics/${id}`, { method: 'DELETE' });
    } catch (error) {
      throw new Error('Failed to delete topic: ' + (error as Error).message);
    }
  }
};
