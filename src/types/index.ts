export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface WorkDiary {
  id: string;
  clientId: string;
  clientName: string;
  address: string;
  team: string;
  date: string;
  startTime: string;
  endTime: string;
  servicesExecuted: string;
  geotestSignature: string;
  geotestSignatureImage?: string;
  responsibleSignature: string;
  observations: string;
  createdBy: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; code?: string; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}