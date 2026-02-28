import apiInstance from './ApiInstance';
import type { ContentItem, Space } from '../lib/types';

/**
 * Authentication API
 */

export const apiLogin = async (email: string, password: string) => {
    const response = await apiInstance.post('/auth/login', { email, password });
    return response.data;
};

export const apiRegister = async (userData: any) => {
    const response = await apiInstance.post('/auth/register', userData);
    return response.data;
};

/**
 * Spaces API
 */

export const getSpaces = async (): Promise<Space[]> => {
    const response = await apiInstance.get('/space');
    return response.data;
};

export const createSpace = async (title: string, description: string): Promise<Space> => {
    const response = await apiInstance.post('/space/create', { name: title, description });
    return response.data;
};

export const getSpaceById = async (id: string): Promise<{ space: Space, lectures: ContentItem[] }> => {
    const response = await apiInstance.get(`/space/${id}`);
    return response.data;
};

export const createLecture = async (data: { title: string, vttUrl: string, videoUrl: string, space_id: string }) => {
    const response = await apiInstance.post('/lecture/create', data);
    return response.data;
};

export const getLectureById = async (id: string) => {
    const response = await apiInstance.get(`/lecture/${id}`);
    return response.data;
};

export const askQuestion = async ({ space_id, lecture_id, user_id, question, model }: { space_id: string, lecture_id: string, user_id: string, question: string, model?: string }) => {
    const response = await apiInstance.post(`/chat/query`, { query: question, space_id, lecture_id, user_id, model });
    return response.data;
};

export const chatHistory = async ({ space_id, lecture_id, user_id }: { space_id: string, lecture_id: string, user_id: string }) => {
    const response = await apiInstance.post(`/chat/history`, { space_id, lecture_id, user_id });
    return response.data;
};

export const getAvailableModels = async () => {
    const response = await apiInstance.get(`/chat/models`);
    return response.data;
};

// /**
//  * Content API
//  */

// export const getContentDetail = async (id: string) => {
//     const response = await apiInstance.get(`/content/${id}`);
//     return response.data;
// };

// export const getRecents = async () => {
//     const response = await apiInstance.get('/content/recent');
//     return response.data;
// };

// /**
//  * History API
//  */

// export const getHistory = async () => {
//     const response = await apiInstance.get('/history');
//     return response.data;
// };

// export const deleteHistoryItem = async (id: string) => {
//     const response = await apiInstance.delete(`/history/${id}`);
//     return response.data;
// };

// export const clearHistory = async () => {
//     const response = await apiInstance.delete('/history');
//     return response.data;
// };

// /**
//  * Search API
//  */

// export const searchContent = async (query: string) => {
//     const response = await apiInstance.get(`/search?q=${encodeURIComponent(query)}`);
//     return response.data;
// };
