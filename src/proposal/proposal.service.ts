import axios from "axios";

import { IAvatarData, IProposal, IProposalService, IScores } from "./proposal.interface";

export class ProposalService implements IProposalService {
    async fetchAvatarData(address: string): Promise<IAvatarData> {
        const url = `https://peer.decentraland.org/lambdas/profiles/?id=${address}`
        const { data } = await axios.get<IAvatarData>(url)
        return data
    }

    async fetchProposalData(id: string): Promise<{ proposal: IProposal }> {
        const { data } =  await axios.post<{ data: { proposal: IProposal } }>('https://hub.snapshot.org/graphql', {
            operationName: "Proposal",
            variables: { id },
            query: `query Proposal($id: String!) {
                proposal(id: $id) {
                title
                start
                end
                state
                scores
                }
            }`
        })

        return data.data
    }

    async getScores(ids: string[]): Promise<{ proposals: IScores[] }> {

        const payload = `query Proposals {  
            proposals (
                first: 20, 
                skip: 0, 
                where: { id_in: [${[...ids]}] },
                orderBy: "created", 
                orderDirection: desc  
            ) { 
                scores 
            }
        }`

        const { data } =  await axios.post<{ data: { proposals: IScores[] } }>('https://hub.snapshot.org/graphql', {
            operationName: "Proposals",
            query: payload
        })

        return data.data
    }
}