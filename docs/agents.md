# Agents API Spec
List of endpoints for agent management.

- [Agents API Spec](#agents-api-spec)
  - [Create Agent](#create-agent)
  - [Get Agent](#get-agent)
  - [Update Agent](#update-agent)
  - [Delete Agent](#delete-agent)
  - [List Agents](#list-agents)

## Create Agent

Endpoint:

```
POST /v1/agents
```

Request Body:

```json
{
  "name": "John Doe",
  "conversation_config": {
    "agent": {
      "prompt": {
        "prompt": "You are a helpful customer service",
        "llm": "gpt-4o"
      },
      "first_message": "Hi, i'm your assistant, how can i help you",
      "language": "en"
    },
    "tts": {
      "model_id": "eleven_turbo_v2",
      "voice_id": "123abc"
    }
  }
}
```

Response:

```json
{
  "data": {
    "id": "123",
    "name": "John Doe",
    "language": "en",
    "created_at": "2021-01-01T00:00:00Z",
    "updated_at": "2021-01-01T00:00:00Z"
  }
}
```

Error Response:

```json
{
  "error": "Failed to create agent"
}
```

## Get Agent

Endpoint:

```
GET /v1/agents/:id
```

Request Headers:

```
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "data": {
    "agent_id": "123",
    "name": "John Doe",
    "conversation_config": {
      ...
    },
    "platform_settings": {
      ...
    }
  }
}
```

Error Response:

```json
{
  "error": "Failed to get agent"
}
```

## Update Agent

Endpoint:

```
PATCH /v1/agents/:id
```

Request Headers:

```
Authorization: Bearer <accessToken>
```

Request Body:

```json
{
  "name": "John Doe",
  "conversation_config": {
    ...
  },
  "platform_settings": {
    ...
  }
}
```

Response:

```json
{
  "data": {
    "agent_id": "123",
    "name": "John Doe",
    "conversation_config": {
      ...
    },
    "platform_settings": {
      ...
    }
  }
}
```

Error Response:

```json
{
  "error": "Failed to update agent"
}
```

## Delete Agent

Endpoint:

```
DELETE /v1/agents/:id
```

Request Headers:

```
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "data": "Successfully deleted agent"
}
```

Error Response:

```json
{
  "error": "Failed to delete agent"
}
```

## List Agents

Endpoint:

```
GET /v1/agents
```

Request Headers:

```
Authorization: Bearer <accessToken>
```

Query Params:

- name: string
- language: string
- page: number
- limit: number

Response:

```json
{
  "data": [
    {
      "id": "123",
      "name": "John Doe",
      "language": "en",
      "created_at": "2021-01-01T00:00:00Z",
      "updated_at": "2021-01-01T00:00:00Z"
    },
    {
      "id": "124",
      "name": "Jane Smith",
      "language": "en",
      "created_at": "2021-01-01T00:00:00Z",
      "updated_at": "2021-01-01T00:00:00Z"
    }
  ],
  "current_page": 1,
  "total_pages": 10
}
```

Error Response:

```json
{
  "error": "Failed to list agents"
}
```
