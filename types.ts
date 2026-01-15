
export interface YouTubeContent {
  titles: string[];
  titlePercentages: number[];
  description: string;
  platformTags: string;
  metadataTags: string;
  platformScores: {
    youtube: number;
    deepseek: number;
    google: number;
    duckduckgo: number;
    tiktok: number;
    snackvideo: number;
  };
}

export enum LoadingStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
