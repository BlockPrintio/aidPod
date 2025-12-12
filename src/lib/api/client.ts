const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    walletAddress?: string
): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (walletAddress) {
        headers['x-wallet-address'] = walletAddress;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new APIError(
                error.error || 'API request failed',
                response.status,
                error.code
            );
        }

        return response.json();
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError(
            error instanceof Error ? error.message : 'Network error',
            0
        );
    }
}

// ============================================================================
// CAMPAIGN API
// ============================================================================

export const campaignAPI = {
    /**
     * Create a new campaign
     */
    create: async (walletAddress: string, formData: FormData) => {
        return apiRequest('/api/campaign', {
            method: 'POST',
            body: formData,
        }, walletAddress);
    },

    /**
     * Get all campaigns with pagination
     */
    getAll: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return apiRequest(`/api/campaign${query ? `?${query}` : ''}`);
    },

    /**
     * Get campaign by ID
     */
    getById: async (id: string | number) => {
        return apiRequest(`/api/campaign?id=${id}`);
    },

    /**
     * Set escrow address for campaign
     */
    setEscrow: async (
        id: string | number,
        walletAddress: string,
        escrowAddress: string
    ) => {
        return apiRequest(`/api/campaign/${id}/escrow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ escrow_address: escrowAddress }),
        }, walletAddress);
    },

    /**
     * Get campaign escrow address
     */
    getEscrow: async (id: string | number) => {
        return apiRequest(`/api/campaign/${id}/escrow`);
    },
};

// ============================================================================
// HOSPITAL API
// ============================================================================

export const hospitalAPI = {
    /**
     * Register a new hospital
     */
    register: async (walletAddress: string, formData: FormData) => {
        return apiRequest('/api/hospital', {
            method: 'POST',
            body: formData,
        }, walletAddress);
    },

    /**
     * Get all hospitals with pagination
     */
    getAll: async (params?: {
        page?: number;
        limit?: number;
        status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return apiRequest(`/api/hospital${query ? `?${query}` : ''}`);
    },

    /**
     * Get only verified hospitals with NFTs (for campaign creation)
     */
    getVerified: async () => {
        return apiRequest('/api/hospital/verified');
    },

    /**
     * Get hospital by ID
     */
    getById: async (id: string | number) => {
        return apiRequest(`/api/hospital/${id}`);
    },

    /**
     * Verify hospital status
     */
    verify: async (
        id: string | number,
        walletAddress: string,
        status: 'PENDING' | 'VERIFIED' | 'REJECTED'
    ) => {
        return apiRequest(`/api/hospital/${id}/verify`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        }, walletAddress);
    },

    /**
     * Check if hospital can mint NFT
     */
    getNFTStatus: async (walletAddress: string) => {
        return apiRequest('/api/hospital/nft-status', {}, walletAddress);
    },

    /**
     * Record hospital NFT minting
     */
    recordNFTMint: async (walletAddress: string, tokenId: string, txHash: string) => {
        return apiRequest('/api/hospital/mint-nft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenId, txHash }),
        }, walletAddress);
    },

    /**
     * Approve a campaign
     */
    approveCampaign: async (campaignId: string | number, walletAddress: string) => {
        return apiRequest(`/api/hospital/campaigns/${campaignId}/approve`, {
            method: 'POST',
        }, walletAddress);
    },

    /**
     * Get pending campaigns for hospital
     */
    getPendingCampaigns: async () => {
        return apiRequest('/api/hospital/campaigns/pending');
    },
};

// ============================================================================
// PATIENT API
// ============================================================================

export const patientAPI = {
    /**
     * Register a new patient
     */
    register: async (walletAddress: string, data: {
        firstname: string;
        lastname: string;
        email?: string;
        age?: number;
        walletAddress?: string;
        hospitalId?: number;
    }) => {
        return apiRequest('/api/patient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }, walletAddress);
    },

    /**
     * Get all patients
     */
    getAll: async (params?: {
        page?: number;
        limit?: number;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());

        const query = searchParams.toString();
        return apiRequest(`/api/patient${query ? `?${query}` : ''}`);
    },

    /**
     * Get patient by ID
     */
    getById: async (id: string | number) => {
        return apiRequest(`/api/patient/${id}`);
    },

    /**
     * Get campaigns for a patient
     */
    getCampaigns: async (id: string | number) => {
        return apiRequest(`/api/patient/${id}/campaigns`);
    },

    /**
     * Check patient NFT status
     */
    getNFTStatus: async (walletAddress: string) => {
        return apiRequest('/api/patient/nft-status', {}, walletAddress);
    },

    /**
     * Record patient NFT minting
     */
    recordNFTMint: async (walletAddress: string, patientId: number, tokenId: string, txHash: string) => {
        return apiRequest('/api/patient/mint-nft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId, tokenId, txHash }),
        }, walletAddress);
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if API is reachable
 */
export async function checkAPIHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get API base URL
 */
export function getAPIBaseURL(): string {
    return API_BASE_URL;
}
