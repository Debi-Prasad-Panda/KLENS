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

    const response = await fetch(`${API_URL}/documents/`, {
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

  async getDocumentInsights(docId: number, role: string, refresh: boolean = false) {
    return this.request(`/documents/${docId}/insights?role=${role}&refresh=${refresh}`);
  }

  // ==================== SUPABASE ENDPOINTS ====================

  /**
   * Hybrid search combining semantic (AI) and keyword matching.
   * Uses Supabase knowledge_hub with pgvector.
   */
  async hybridSearch(query: string, limit: number = 10) {
    return this.request('/search/', {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });
  }

  /**
   * Upload document to Supabase (async processing).
   * Returns immediately, processing happens in background.
   */
  async uploadToSupabase(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  /**
   * Upload document to Supabase (sync processing).
   * Waits for full processing before returning.
   * Use for smaller files when immediate search is needed.
   */
  async uploadToSupabaseSync(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  /**
   * Get all documents from Supabase knowledge hub.
   */
  async getKnowledgeHubDocuments(limit: number = 50, offset: number = 0) {
    return this.request(`/search/documents?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get AI insights for a Supabase document (UUID).
   */
  async getSupabaseDocumentInsights(docId: string, role: 'engineer' | 'manager' = 'engineer', refresh = false) {
    return this.request(`/search/documents/${docId}/insights?role=${role}&refresh=${refresh}`);
  }
}

export const api = new ApiClient();
