const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return { user: data.user, token: data.access_token };
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    return response.json();
  }

  async getDocuments(params?: { status?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/documents?${query}`);
  }

  async getDocument(id: number) {
    return this.request(`/documents/${id}`);
  }

  async updateDocument(id: number, content: string, commitMessage: string) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content, commitMessage }),
    });
  }

  async revertDocument(id: number, version: number) {
    return this.request(`/documents/${id}/revert/${version}`, {
      method: 'POST',
    });
  }

  async createApproval(actionType: string, resourceId: number) {
    return this.request('/approvals', {
      method: 'POST',
      body: JSON.stringify({ actionType, resourceId }),
    });
  }

  async approveAction(id: number, decision: 'approve' | 'reject') {
    return this.request(`/approvals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    });
  }

  async getApprovals() {
    return this.request('/approvals');
  }

  async grantCinderellaAccess(userId: number, durationMinutes: number) {
    return this.request('/auth/cinderella', {
      method: 'POST',
      body: JSON.stringify({ userId, durationMinutes }),
    });
  }

  async checkCinderellaAccess() {
    return this.request('/auth/cinderella');
  }

  async sendChatMessage(message: string, conversationHistory: any[]) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    });
  }

  async extractGraph(text: string, documentName: string) {
    return this.request('/graph/extract', {
      method: 'POST',
      body: JSON.stringify({ text, documentName }),
    });
  }

  async getDashboardStats() {
    return this.request('/documents/stats/dashboard');
  }

  async getDocumentInsights(docId: number, role: 'engineer' | 'manager') {
    return this.request(`/documents/${docId}/insights?role=${role}`);
  }
}

export const api = new ApiClient();
