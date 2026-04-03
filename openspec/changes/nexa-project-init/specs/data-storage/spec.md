## ADDED Requirements

### Requirement: Store notes in MySQL
The system SHALL store note data in MySQL database using Sequelize ORM.

#### Scenario: Create note record
- **WHEN** system creates a new note
- **THEN** system creates record in notes table
- **AND** system includes all required fields (id, title, content, category, user, timestamps)

#### Scenario: Update note record
- **WHEN** system updates an existing note
- **THEN** system updates corresponding record in notes table
- **AND** system updates updatedAt timestamp

#### Scenario: Query notes with filters
- **WHEN** system queries notes with filters (category, tags, status)
- **THEN** system returns filtered results from database
- **AND** system applies all specified filters

### Requirement: Store embeddings in vector database
The system SHALL store text embeddings in Chroma vector database.

#### Scenario: Store note embedding
- **WHEN** system generates embedding for note
- **THEN** system stores embedding vector in Chroma collection
- **AND** system links embedding to note ID
- **AND** system stores note metadata

#### Scenario: Query similar embeddings
- **WHEN** system performs semantic search
- **THEN** system queries Chroma for similar embeddings
- **AND** system returns results with similarity scores
- **AND** system sorts results by similarity descending

### Requirement: Database initialization
The system SHALL initialize databases on application startup.

#### Scenario: Initialize MySQL database
- **WHEN** application starts
- **THEN** system connects to MySQL database
- **AND** system runs migrations if needed
- **AND** system creates tables if they don't exist

#### Scenario: Initialize vector database
- **WHEN** application starts
- **THEN** system connects to Chroma vector database
- **AND** system creates collection if it doesn't exist

### Requirement: Data persistence
The system SHALL ensure all data is properly persisted.

#### Scenario: Handle transaction rollback
- **WHEN** database operation fails during transaction
- **THEN** system rolls back transaction
- **AND** system returns error to caller

#### Scenario: Handle connection failure
- **WHEN** database connection fails
- **THEN** system logs error
- **AND** system retries connection up to configured limit
