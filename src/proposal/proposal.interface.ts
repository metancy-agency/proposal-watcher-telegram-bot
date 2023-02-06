export interface IProposalService {
    fetchAvatarData(address: string): Promise<IAvatarData>;
    fetchProposalData(id: string): Promise<{ proposal: IProposal }>;
    getScores(ids: string[]): Promise<{ proposals: IScores[]}>;
}

export interface IProposal {
    title: string
    start: number
    end: number
    state: string
    scores: [number, number];
}

export interface IScores {
    scores: [number, number];
}

export interface IAvatarData {
    timestamp: number
    avatars: [{
        hasClaimedName: boolean
        name: string
        description: string
    }]
}