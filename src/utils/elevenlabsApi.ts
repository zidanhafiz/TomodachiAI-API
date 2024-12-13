import { CreateAgentSchema } from "./schemas/agentSchemas";

export class ElevenLabsApi {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.ELEVENLABS_BASE_URL || "";
  }

  public async createAgent(agent: CreateAgentSchema) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/convai/agents/create`, {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agent),
      });

      if (!response.ok) {
        const error = await response.json();
        throw Error(error);
      }

      const data = await response.json();
      return data as { agent_id: string };
    } catch (error) {
      console.error(error);
      throw new Error("Create agent API call failed");
    }
  }

  public async getAgent(agentId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/convai/agents/${agentId}`, {
        method: "GET",
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw Error(error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw new Error("Get agent API call failed");
    }
  }
}
