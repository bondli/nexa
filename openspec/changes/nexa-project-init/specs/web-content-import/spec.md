## ADDED Requirements

### Requirement: Import webpage content by URL
The system SHALL allow users to import webpage content by providing a URL.

#### Scenario: Successful URL import
- **WHEN** user provides a valid webpage URL
- **THEN** system fetches webpage content
- **AND** system extracts main text content
- **AND** system creates a new note with imported content
- **AND** system displays success message

#### Scenario: Invalid URL format
- **WHEN** user provides invalid URL format
- **THEN** system displays validation error
- **AND** system does not proceed with import

#### Scenario: Failed to fetch webpage
- **WHEN** system fails to fetch webpage content
- **THEN** system displays error message with reason
- **AND** system does not create note

### Requirement: Import webpage content by paste
The system SHALL allow users to import webpage content by pasting text directly.

#### Scenario: Successful paste import
- **WHEN** user pastes webpage text content
- **THEN** system processes pasted content
- **AND** system creates a new note with pasted content
- **AND** system displays success message

#### Scenario: Empty paste import
- **WHEN** user pastes empty content
- **THEN** system displays error message
- **AND** system does not create note

### Requirement: Extract metadata from webpage
The system SHALL automatically extract metadata from imported webpages.

#### Scenario: Extract webpage title
- **WHEN** system imports webpage content
- **THEN** system extracts webpage title
- **AND** system uses title as note title

#### Scenario: Extract webpage URL
- **WHEN** system imports webpage content
- **THEN** system stores original URL as note metadata
