import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API
export const authAPI = {
    signup: (data: {
        fullName: { firstName: string; lastName: string };
        email: string;
        enrollmentNumber: string;
        password: string;
    }) => api.post('/auth/signup', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    logout: () => api.post('/auth/logout'),

    getUser: () => api.get('/auth/me'),
};

// Chambers API
export const chambersAPI = {
    getChambers: () => api.get('/chambers'),

    getChamberById: (chamberId: string) => api.get(`/chambers/${chamberId}`),

    createChamber: (data: { name: string; description?: string }) =>
        api.post('/chambers', data),

    updateChamber: (chamberId: string, data: { name: string; description?: string }) =>
        api.patch(`/chambers/${chamberId}`, data),

    deleteChamber: (chamberId: string) => api.delete(`/chambers/${chamberId}`),

    searchChambers: (query?: string) =>
        api.get('/chambers/search', { params: { q: query } }),

    requestJoin: (chamberId: string, message?: string) =>
        api.post(`/chambers/${chamberId}/join`, { message }),

    getJoinRequests: (chamberId: string) =>
        api.get(`/chambers/${chamberId}/requests`),

    handleJoinRequest: (chamberId: string, requestId: string, action: 'approve' | 'reject', permissions?: any) =>
        api.post(`/chambers/${chamberId}/requests/${requestId}`, { action, permissions }),

    getMembers: (chamberId: string) =>
        api.get(`/chambers/${chamberId}/members`),

    updateMemberPermissions: (chamberId: string, memberId: string, permissions: any) =>
        api.patch(`/chambers/${chamberId}/members/${memberId}`, { permissions }),

    removeMember: (chamberId: string, memberId: string) =>
        api.delete(`/chambers/${chamberId}/members/${memberId}`),

    leaveChamber: (chamberId: string) =>
        api.post(`/chambers/${chamberId}/leave`),
};

// Cases API
export const casesAPI = {
    getCases: (chamberId?: string) =>
        api.get('/cases', { params: { chamberId } }),

    getCaseById: (caseId: string) => api.get(`/cases/${caseId}`),

    createCase: (formData: FormData) =>
        api.post('/cases', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    updateCase: (caseId: string, formData: FormData) =>
        api.patch(`/cases/${caseId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    deleteCase: (caseId: string) => api.delete(`/cases/${caseId}`),
};
