
export interface AnalysisResult {
  coreConcept: string;
  designElements: {
    label: string;
    value: string;
  }[];
  keywords: string[];
  actionableInstruction: string;
  rawMarkdown: string;
}

export interface SavedPrompt {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface User {
  email: string;
  isAdmin: boolean;
  isGuest?: boolean;
}

export interface AppSettings {
  isGuestLoginEnabled: boolean;
}
