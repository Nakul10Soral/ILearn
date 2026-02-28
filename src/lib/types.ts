export type User = {
    _id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

export type Space = {
  _id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentItem = {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  space_id: string;
  vvtUrl?: string;
  flashcards: {
    question: string;
    answer: string;
  }[];
  quizzes: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  notes?: string;
  summary?: string;
  cheatsheet?: string;
  mindmap?: any;
  topics: {
    title?: string;
    summary?: string;
    timestamp?: number;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type Chapter = {
  id: string;
  content_item_id: string;
  title: string;
  description: string | null;
  timestamp_seconds: number;
  order_index: number | null;
  created_at: string;
};

export type Transcript = {
  _id: string;
  text: string;
  end: number;
  start: number;
};

export type HistoryItem = {
  id: string;
  user_id: string;
  content_item_id: string;
  watched_at: string;
  duration_watched_seconds: number;
};
