## ADDED Requirements

### Requirement: Generate embedding for note
The system SHALL automatically generate embedding vectors for note content when notes are created or updated.

#### Scenario: Generate embedding on note creation
- **WHEN** user creates a new note
- **THEN** system generates embedding from note content
- **AND** system stores embedding in vector database
- **AND** system links embedding to note ID

#### Scenario: Update embedding on note edit
- **WHEN** user updates note content
- **THEN** system regenerates embedding from updated content
- **AND** system updates embedding in vector database

#### Scenario: Remove embedding on note deletion
- **WHEN** user deletes a note
- **THEN** system removes corresponding embedding from vector database

### Requirement: Semantic search
The system SHALL provide semantic search capability based on embedding similarity.

#### Scenario: Perform semantic search
- **WHEN** user enters search query
- **THEN** system generates embedding for query
- **AND** system searches vector database for similar embeddings
- **AND** system returns ranked list of notes sorted by similarity
- **AND** system includes similarity scores in results

#### Scenario: Empty search query
- **WHEN** user submits empty search query
- **THEN** system returns error message
- **AND** system does not perform search

### Requirement: RAG-based Q&A
The system SHALL provide question-answering capability using retrieved context from knowledge base.

#### Scenario: Answer question with context
- **WHEN** user asks a question
- **THEN** system retrieves relevant context notes via semantic search
- **AND** system constructs prompt with retrieved context
- **AND** system sends prompt to LLM
- **AND** system returns LLM response with citations to source notes

#### Scenario: No relevant context found
- **WHEN** system finds no relevant notes for question
- **THEN** system informs user that no relevant information was found
- **AND** system offers to answer without context

### Requirement: Knowledge base indexing
The system SHALL provide indexing status and maintenance for knowledge base.

#### Scenario: Check indexing status
- **WHEN** user requests indexing status
- **THEN** system returns count of indexed notes
- **AND** system returns last update timestamp
- **AND** system returns any indexing errors

#### Scenario: Rebuild index
- **WHEN** user requests to rebuild index
- **THEN** system clears existing embeddings
- **AND** system regenerates embeddings for all notes
- **AND** system reports progress and completion
