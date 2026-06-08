const API_BASE = 'http://localhost:8000/api';

export interface SearchItem {
  id: string;
  type: 'judge' | 'prosecutor' | 'legislator';
  display_name: string;
  state: string;
  current_score: number;
}

export interface JudgeProfile {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  jurisdiction: string;
  current_bji: number;
  confidence_weight: number;
  sample_size: number;
  party_affiliation: string | null;
  biography: string | null;
  avatar_url: string | null;
}

export interface HistoricalBJIPoint {
  year: number;
  average_bji: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  deviation: number;
}

export interface JudgeScoresResponse {
  historical_bji: HistoricalBJIPoint[];
  case_distribution: CategoryBreakdown[];
}

export interface ProsecutorProfile {
  id: string;
  first_name: string;
  last_name: string;
  office_name: string;
  pdi_aggressiveness: number;
  charge_reduction_rate: number;
  conviction_rate: number;
  dismissal_rate: number;
  confidence_weight: number;
  sample_size: number;
  avatar_url: string | null;
}

export interface LegislatorProfile {
  id: string;
  first_name: string;
  last_name: string;
  party: string;
  chamber: string;
  district: string | null;
  legislative_influence_index: number;
  participation_rate: number;
  district_alignment: number;
  confidence_weight: number;
  sample_size: number;
  biography: string | null;
  avatar_url: string | null;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  search: (q: string, type?: string, state?: string) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (type) params.append('type', type);
    if (state) params.append('state', state);
    return apiFetch<SearchItem[]>(`/search?${params.toString()}`);
  },

  getJudge: (id: string) => apiFetch<JudgeProfile>(`/judges/${id}`),
  getJudgeScores: (id: string) => apiFetch<JudgeScoresResponse>(`/judges/${id}/scores`),
  recalculateJudge: (id: string) => apiFetch<{ status: string; calculated_score: number }>(`/judges/${id}/recalculate`, { method: 'POST' }),

  getProsecutor: (id: string) => apiFetch<ProsecutorProfile>(`/prosecutors/${id}`),
  recalculateProsecutor: (id: string) => apiFetch<{ status: string; calculated_score: number }>(`/prosecutors/${id}/recalculate`, { method: 'POST' }),

  getLegislator: (id: string) => apiFetch<LegislatorProfile>(`/legislators/${id}`),
  recalculateLegislator: (id: string) => apiFetch<{ status: string; calculated_score: number }>(`/legislators/${id}/recalculate`, { method: 'POST' }),

  searchCourtListener: async (q: string, court?: string, cursor?: string, type?: string): Promise<CourtListenerSearchResponse> => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (court) params.append('court', court);
    if (cursor) params.append('cursor', cursor);
    if (type) params.append('type', type);

    const res = await fetch(`/api/courtlistener?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
};

export interface CourtListenerResult {
  absolute_url: string;
  caseName?: string;
  caseNameFull?: string;
  citation?: string[];
  citeCount?: number;
  cluster_id?: number;
  court?: string;
  court_citation_string?: string;
  court_id?: string;
  dateArgued?: string | null;
  dateFiled?: string;
  docketNumber?: string;
  docket_id?: number;
  id?: number | string;
  document_type?: 'opinion' | 'docket' | 'audio';
  snippet?: string;
}

export interface CourtListenerSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourtListenerResult[];
}

