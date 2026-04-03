## ADDED Requirements

### Requirement: List knowledge bases
The system SHALL allow users to view list of knowledge bases.

#### Scenario: Display knowledge base list
- **WHEN** user navigates to knowledge base management page
- **THEN** system displays list of all knowledge bases
- **AND** each entry shows name, note count, and last update time

### Requirement: Create knowledge base
The system SHALL allow users to create new knowledge bases.

#### Scenario: Successful knowledge base creation
- **WHEN** user provides knowledge base name and description
- **THEN** system creates new knowledge base
- **AND** system generates unique knowledge base ID
- **AND** system adds knowledge base to list

#### Scenario: Duplicate knowledge base name
- **WHEN** user provides name that already exists
- **THEN** system displays validation error
- **AND** system does not create knowledge base

### Requirement: Delete knowledge base
The system SHALL allow users to delete knowledge bases.

#### Scenario: Successful knowledge base deletion
- **WHEN** user confirms deletion of knowledge base
- **THEN** system removes knowledge base
- **AND** system removes all associated documents from index
- **AND** system updates knowledge base list

### Requirement: List documents in knowledge base
The system SHALL allow users to view documents within a knowledge base.

#### Scenario: Display document list
- **WHEN** user selects a knowledge base
- **THEN** system displays list of documents in that knowledge base
- **AND** each entry shows note title, summary, and indexing status

### Requirement: Add note to knowledge base
The system SHALL allow users to add notes to knowledge bases.

#### Scenario: Successful note addition
- **WHEN** user adds a note to knowledge base
- **THEN** system creates link between note and knowledge base
- **AND** system indexes note content for that knowledge base

### Requirement: Remove document from knowledge base
The system SHALL allow users to remove documents from knowledge bases.

#### Scenario: Successful document removal
- **WHEN** user removes document from knowledge base
- **THEN** system removes link between note and knowledge base
- **AND** system removes note from index for that knowledge base
