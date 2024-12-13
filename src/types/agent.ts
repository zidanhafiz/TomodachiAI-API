export type Agent = {
  id: string;
  name: string;
  language: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
};

export type WebhookTool = {
  type: "webhook";
  name: string;
  description: string;
  placeholder_statement: string;
  api_schema: {
    url: string;
    method: "GET";
    path_params_schema: Record<string, unknown>;
    query_params_schema: {
      properties: Record<string, unknown>;
      required: string[];
    };
    request_body_schema: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
      description: string;
    };
    request_headers: Record<string, unknown>;
  };
};

export type KnowledgeBaseItem = {
  type: "file" | "url";
  name: string;
  id: string;
};

export type ConversationConfig = {
  agent: {
    server: {
      url: string;
      server_events: string[];
      secret: string;
      timeout: number;
      num_retries: number;
      error_message: string;
    };
    prompt: {
      prompt: string;
      llm: string;
      temperature: number;
      max_tokens: number;
      tools: WebhookTool[];
      knowledge_base: KnowledgeBaseItem[];
    };
    first_message: string;
    language: string;
  };
  asr: {
    quality: string;
    provider: string;
    user_input_audio_format: string;
    keywords: string[];
  };
  turn: {
    turn_timeout: number;
  };
  tts: {
    model_id: string;
    voice_id: string;
    agent_output_audio_format: string;
    optimize_streaming_latency: number;
    stability: number;
    similarity_boost: number;
  };
  conversation: {
    max_duration_seconds: number;
    client_events: string[];
  };
};

export type PlatformSettings = {
  auth: {
    enable_auth: boolean;
  };
  evaluation: {
    criteria: Array<{
      id: string;
      name: string;
      type: string;
      conversation_goal_prompt: string;
    }>;
  };
  widget: {
    variant: string;
    avatar: {
      type: string;
      color_1: string;
      color_2: string;
    };
    custom_avatar_path: string;
    bg_color: string;
    text_color: string;
    btn_color: string;
    btn_text_color: string;
    border_color: string;
    focus_color: string;
    border_radius: number;
    btn_radius: number;
    action_text: string;
    start_call_text: string;
    end_call_text: string;
    expand_text: string;
    listening_text: string;
    speaking_text: string;
  };
  data_collection: Record<string, unknown>;
  name: string;
};
