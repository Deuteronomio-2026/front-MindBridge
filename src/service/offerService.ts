import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://videochat-sfu-app.azurewebsites.net/api";

export interface Offer {
    id: string;
    title: string;
    description: string;
    benefits: string[];
    boostMultiplier: number;
    discountPercent: number;
    startDate: string;
    endDate: string;
    status: 'OPEN' | 'TAKEN'| 'CANCELLED'  
    psychologistId?: string;
}

export const offerService = {

    getActiveOffers: async (): Promise<Offer[]> => {
        const response = await axios.get<Offer[]>(`${API_BASE_URL}/offers/active`);
        return response.data;
    },

    getTakenOffers: async (): Promise<Offer[]> => {
        const response = await axios.get<Offer[]>(`${API_BASE_URL}/offers/taken`);
        return response.data;
    },

    createOffer: async (offerData: Omit<Offer, 'id' | 'status' | 'psychologistId'>): Promise<Offer> => {
        const response = await axios.post<Offer>(`${API_BASE_URL}/offers`, offerData);
        return response.data;
    },

    subscribeOffer: async (offerId: string, psychologistId: string): Promise<Offer> => {
        const response = await axios.post(`${API_BASE_URL}/offers/${offerId}/subscribe`, { psychologistId });
        return response.data;
    },

    cancelOffer: async (offerId: string): Promise<Offer> => {
        const response = await axios.patch(`${API_BASE_URL}/offers/${offerId}/cancel`);
        return response.data;
    }
};