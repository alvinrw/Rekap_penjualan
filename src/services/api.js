const API_BASE_URL = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Health check
  async checkHealth() {
    return request('/health');
  },

  // Auth
  async login(username, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async logout(userId) {
    return request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Users
  async getUsers() {
    return request('/users');
  },

  async createUser(userData) {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(userId, updatedData) {
    return request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
  },

  async deleteUser(userId) {
    return request(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Kloters
  async getKloters() {
    return request('/kloters');
  },

  async createKloter(kloterData) {
    return request('/kloters', {
      method: 'POST',
      body: JSON.stringify(kloterData),
    });
  },

  async updateKloter(kloterId, kloterData) {
    return request(`/kloters/${kloterId}`, {
      method: 'PUT',
      body: JSON.stringify(kloterData),
    });
  },

  async updateKloterStatus(kloterId, status) {
    return request(`/kloters/${kloterId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async deleteKloter(kloterId) {
    return request(`/kloters/${kloterId}`, {
      method: 'DELETE',
    });
  },

  // Transactions
  async createPengeluaran(data) {
    return request('/pengeluaran', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deletePengeluaran(id) {
    return request(`/pengeluaran/${id}`, {
      method: 'DELETE',
    });
  },

  async createKematian(data) {
    return request('/kematian', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteKematian(id) {
    return request(`/kematian/${id}`, {
      method: 'DELETE',
    });
  },

  async createPanen(data) {
    return request('/panen', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deletePanen(id) {
    return request(`/panen/${id}`, {
      method: 'DELETE',
    });
  },

  // Penjualan
  async getSales() {
    return request('/penjualan');
  },

  async createSale(saleData) {
    return request('/penjualan', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  },

  async updateSale(saleId, saleData) {
    return request(`/penjualan/${saleId}`, {
      method: 'PUT',
      body: JSON.stringify(saleData),
    });
  },

  async deleteSale(saleId) {
    return request(`/penjualan/${saleId}`, {
      method: 'DELETE',
    });
  },

  getStrukPdfUrl(saleId) {
    return `/api/penjualan/${saleId}/struk-pdf`;
  },

  // Harga Config
  async getHargaConfig() {
    return request('/harga');
  },

  async updateHarga(hargaBaru, catatan, diubahOleh) {
    return request('/harga/update', {
      method: 'POST',
      body: JSON.stringify({ hargaBaru, catatan, diubahOleh }),
    });
  },

  // Audit Logs
  async getAuditLogs() {
    return request('/audit-logs');
  },

  async createAuditLog(logData) {
    return request('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  },

  // Jadwal Export
  async getJadwalExport() {
    return request('/jadwal-export');
  },

  async createJadwalExport(data) {
    return request('/jadwal-export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleJadwalExport(id, statusAktif) {
    return request(`/jadwal-export/${id}/toggle`, {
      method: 'PUT',
      body: JSON.stringify({ statusAktif }),
    });
  },

  async deleteJadwalExport(id) {
    return request(`/jadwal-export/${id}`, {
      method: 'DELETE',
    });
  },
};
