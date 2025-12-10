import { supabase, getAccessToken } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async getToken(): Promise<string | null> {
    // If we have a manually set token, use it
    if (this.token) {
      return this.token;
    }
    // Otherwise, get from Supabase session
    return await getAccessToken();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
    // Use Supabase auth instead of backend endpoint
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    if (data.session?.access_token) {
      this.setToken(data.session.access_token);
    }

    // Fetch profile from backend
    const profile = await this.request('/auth/me');
    
    return { 
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
        department: profile.department,
      }, 
      token: data.session?.access_token 
    };
  }

  async register(userData: { email: string; password: string; full_name: string; role?: string; department?: string }) {
    // Use Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role || 'OPERATOR',
          department: userData.department,
        },
      },
    });

    if (error) throw new Error(error.message);

    if (data.session?.access_token) {
      this.setToken(data.session.access_token);
    }

    return { user: data.user, token: data.session?.access_token };
  }

  async logout() {
    await supabase.auth.signOut();
    this.token = null;
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

  async getDocumentInsights(docId: number, role: string, refresh: boolean = false, language: string = "English") {
    return this.request(`/documents/${docId}/insights?role=${role}&refresh=${refresh}&language=${encodeURIComponent(language)}`);
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
   * Upload document to Supabase with Granular Access Control.
   * Includes access_rules in form data for RBAC/ABAC enforcement.
   */
  async uploadToSupabaseWithAccess(file: File, accessRules: {
    access_level: string;
    target_department?: string;
    allowed_users?: string[];
  }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('access_rules', JSON.stringify(accessRules));

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
  async getSupabaseDocumentInsights(docId: string, role: 'engineer' | 'manager' = 'engineer', refresh = false, language: string = "English") {
    return this.request(`/search/documents/${docId}/insights?role=${role}&refresh=${refresh}&language=${encodeURIComponent(language)}`);
  }

  // ==================== SILENT HANDOVER ENDPOINTS ====================

  /**
   * Generate a Legacy Pack handover report for a departing employee.
   * Combines Neo4j graph analysis, Supabase activity/resolution data, and Gemini AI.
   */
  async generateHandoverReport(userEmail: string, userName?: string) {
    return this.request('/handover/generate', {
      method: 'POST',
      body: JSON.stringify({ user_email: userEmail, user_name: userName }),
    });
  }

  /**
   * Get list of users who are sole managers of critical assets.
   * These users should show a warning icon (⚠️) in the UI.
   */
  async getAtRiskUsers() {
    return this.request('/handover/at-risk-users');
  }

  /**
   * Simulate what happens when a user leaves.
   * Returns impact assessment for visualization.
   */
  async simulateDeparture(userEmail: string) {
    return this.request(`/handover/simulate/${encodeURIComponent(userEmail)}`, {
      method: 'POST',
    });
  }

  /**
   * Get full dependency graph for a user.
   */
  async getUserDependencies(userEmail: string) {
    return this.request(`/handover/user-dependencies/${encodeURIComponent(userEmail)}`);
  }

  /**
   * Get assets that only this user manages (orphaned if they leave).
   */
  async getOrphanedAssets(userEmail: string) {
    return this.request(`/handover/orphaned-assets/${encodeURIComponent(userEmail)}`);
  }

  /**
   * Manually create a User→Asset relationship.
   */
  async createUserAssetLink(userEmail: string, assetName: string, assetType: string = 'Machine', isPrimary: boolean = true) {
    return this.request('/handover/user-asset', {
      method: 'POST',
      body: JSON.stringify({
        user_email: userEmail,
        asset_name: assetName,
        asset_type: assetType,
        is_primary: isPrimary,
      }),
    });
  }
}

export const api = new ApiClient();

