## ADDED Requirements

### Requirement: Create note
The system SHALL allow users to create new notes with title, content, category, tags, priority, and deadline.

#### Scenario: Successful note creation
- **WHEN** user provides valid note data including title and content
- **THEN** system creates a new note with unique ID and current timestamp
- **AND** system stores the note in database
- **AND** system generates embedding for the note content
- **AND** system returns created note to UI

#### Scenario: Note creation without title
- **WHEN** user attempts to create note without title
- **THEN** system displays validation error
- **AND** system does not create the note

### Requirement: Edit note
The system SHALL allow users to edit existing notes including title, content, category, tags, priority, and deadline.

#### Scenario: Successful note edit
- **WHEN** user modifies note fields and saves
- **THEN** system updates note in database
- **AND** system regenerates embedding for note content
- **AND** system updates updatedAt timestamp
- **AND** system returns updated note to UI

#### Scenario: Edit non-existent note
- **WHEN** user attempts to edit note that does not exist
- **THEN** system returns 404 error

### Requirement: Delete note
The system SHALL allow users to delete notes by ID.

#### Scenario: Successful note deletion
- **WHEN** user requests deletion of existing note by ID
- **THEN** system removes note from database
- **AND** system removes corresponding embedding from vector database
- **AND** system returns success confirmation

#### Scenario: Delete non-existent note
- **WHEN** user attempts to delete note that does not exist
- **THEN** system returns 404 error

### Requirement: List notes
The system SHALL allow users to list notes with filtering and pagination.

#### Scenario: List all notes
- **WHEN** user requests list of notes without filters
- **THEN** system returns paginated list of all notes
- **AND** system includes total count

#### Scenario: Filter notes by category
- **WHEN** user requests notes filtered by category ID
- **THEN** system returns notes belonging to specified category

#### Scenario: Filter notes by tags
- **WHEN** user requests notes filtered by tag names
- **THEN** system returns notes containing all specified tags

#### Scenario: Filter notes by status
- **WHEN** user requests notes filtered by status
- **THEN** system returns notes with specified status

### Requirement: Move note
The system SHALL allow users to move notes to different categories.

#### Scenario: Successful note move
- **WHEN** user moves note to new category
- **THEN** system updates note's category ID
- **AND** system returns updated note

### Requirement: Set note priority
The system SHALL allow users to set note priority levels.

#### Scenario: Set note priority
- **WHEN** user sets note priority
- **THEN** system updates note's priority field
- **AND** system returns updated note

### Requirement: Set note deadline
The system SHALL allow users to set note deadline date.

#### Scenario: Set note deadline
- **WHEN** user sets note deadline
- **THEN** system updates note's deadline field
- **AND** system returns updated note
