## ADDED Requirements

### Requirement: Generate embeddings
The system SHALL use GLM4.7 embedding model to generate text embeddings.

#### Scenario: Generate embedding for text
- **WHEN** service requests embedding for text
- **THEN** system calls GLM4.7 embedding API
- **AND** system returns embedding vector

#### Scenario: Handle embedding API failure
- **WHEN** GLM4.7 embedding API fails
- **THEN** system logs error
- **AND** system returns error to caller

### Requirement: Call LLM for chat
The system SHALL use GLM4.7 LLM for chat and generation tasks.

#### Scenario: Send chat message to LLM
- **WHEN** service sends chat message
- **THEN** system calls GLM4.7 chat API
- **AND** system returns LLM response

#### Scenario: Send prompt with context to LLM
- **WHEN** service sends prompt with retrieved context
- **THEN** system constructs full prompt with context
- **AND** system sends to GLM4.7 chat API
- **AND** system returns LLM response

#### Scenario: Handle LLM API failure
- **WHEN** GLM4.7 chat API fails
- **THEN** system logs error
- **AND** system returns error to caller

### Requirement: Configure AI models
The system SHALL allow configuration of AI models through settings.

#### Scenario: Configure GLM4.7 API key
- **WHEN** user provides GLM4.7 API key
- **THEN** system stores API key securely
- **AND** system uses configured key for API calls

#### Scenario: Configure remote model provider
- **WHEN** user configures remote model provider
- **THEN** system saves provider configuration
- **AND** system routes requests to configured provider

### Requirement: LangChain integration
The system SHALL use LangChain.js for AI agent and chain implementations.

#### Scenario: Create RAG chain
- **WHEN** service needs to perform RAG
- **THEN** system creates LangChain RAG chain with retriever
- **AND** system uses chain to answer questions with context

#### Scenario: Create conversation chain
- **WHEN** service needs multi-turn conversation
- **THEN** system creates LangChain conversation chain
- **AND** system maintains conversation history

### Requirement: AI service abstraction
The system SHALL provide unified AI service interface.

#### Scenario: Call embedding through AI service
- **WHEN** service needs embedding
- **THEN** service calls aiService.generateEmbedding()
- **AND** AI service handles provider-specific logic

#### Scenario: Call LLM through AI service
- **WHEN** service needs LLM response
- **THEN** service calls aiService.chat() or aiService.generate()
- **AND** AI service handles provider-specific logic
