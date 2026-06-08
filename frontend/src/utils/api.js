const API_BASE_URL = "http://localhost:8000/api";

/**
 * Função auxiliar genérica para lidar com requisições HTTP e capturar erros.
 * Garante logs de auditoria no console e fornece feedback consistente ao frontend.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Define os cabeçalhos padrão
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.detail || `Erro na API: ${response.status} ${response.statusText}`;
      // Registro de logs estruturado no console do navegador para governança/segurança
      console.error(
        `[AUDIT_ERROR] - URL: ${url} - STATUS: ${response.status} - ERROR: ${errorMsg}`,
        { requestData: options.body ? JSON.parse(options.body) : null }
      );
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[CONNECTION_ERROR] - Falha na requisição para ${url}:`, error.message);
    throw error;
  }
}

export const api = {
  // --- DASHBOARD STATS ---
  async getStats() {
    return apiRequest("/dashboard/stats");
  },

  // --- COLABORADORES ---
  async getColaboradores(search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest(`/colaboradores${query}`);
  },

  async createColaborador(colaborador) {
    return apiRequest("/colaboradores", {
      method: "POST",
      body: JSON.stringify(colaborador),
    });
  },

  async updateColaborador(id, data) {
    return apiRequest(`/colaboradores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // --- SOFTWARES ---
  async getSoftwares() {
    return apiRequest("/softwares");
  },

  async createSoftware(software) {
    return apiRequest("/softwares", {
      method: "POST",
      body: JSON.stringify(software),
    });
  },

  // --- MATRIZ DE ACESSOS ---
  async getAcessos() {
    return apiRequest("/acessos");
  },

  async createAcesso(acesso) {
    return apiRequest("/acessos", {
      method: "POST",
      body: JSON.stringify(acesso),
    });
  },

  async revokeAcesso(id) {
    return apiRequest(`/acessos/${id}`, {
      method: "DELETE",
    });
  },

  // --- EQUIPAMENTOS ---
  async getEquipamentos(search = "", status = "") {
    let query = [];
    if (search) query.push(`search=${encodeURIComponent(search)}`);
    if (status) query.push(`status=${encodeURIComponent(status)}`);
    const queryString = query.length ? `?${query.join("&")}` : "";
    return apiRequest(`/equipamentos${queryString}`);
  },

  async createEquipamento(equipamento) {
    return apiRequest("/equipamentos", {
      method: "POST",
      body: JSON.stringify(equipamento),
    });
  },

  async updateEquipamento(id, data) {
    return apiRequest(`/equipamentos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteEquipamento(id) {
    return apiRequest(`/equipamentos/${id}`, {
      method: "DELETE",
    });
  },
};

