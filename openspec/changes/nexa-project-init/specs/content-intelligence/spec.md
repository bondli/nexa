## ADDED Requirements

### Requirement: Auto-generate tags
The system SHALL automatically generate tags for notes based on content analysis.

#### Scenario: Generate tags on note creation
- **WHEN** user creates a new note with content
- **THEN** system analyzes note content
- **AND** system extracts relevant tags
- **AND** system assigns tags to note

#### Scenario: Regenerate tags on request
- **WHEN** user requests to regenerate tags for a note
- **THEN** system reanalyzes note content
- **AND** system updates note tags with new results

### Requirement: Extract key points
The system SHALL extract key points and main ideas from note content.

#### Scenario: Extract key points from note
- **WHEN** user requests key points extraction for a note
- **THEN** system analyzes note content
- **AND** system returns list of key points
- **AND** system displays key points to user

### Requirement: Generate structured summary
The system SHALL generate structured summary of note content.

#### Scenario: Generate structured summary
- **WHEN** user requests structured summary for a note
- **THEN** system analyzes note content
- **AND** system generates summary with sections (e.g., main idea, key points, details)
- **AND** system displays structured summary to user

### Requirement: Generate summary card
The system SHALL generate visual summary card from note content that can be exported as image.

#### Scenario: Generate summary card
- **WHEN** user requests summary card for a note
- **THEN** system generates card with title, summary, and key points
- **AND** system displays card preview

#### Scenario: Export summary card as image
- **WHEN** user exports summary card
- **THEN** system renders card as image
- **AND** system saves image file to disk

### Requirement: Content analysis triggers
The system SHALL provide automatic and manual triggers for content intelligence features.

#### Scenario: Auto-trigger on note save
- **WHEN** user saves note content
- **THEN** system automatically generates tags and key points
- **AND** system updates note metadata

#### Scenario: Manual analysis request
- **WHEN** user manually requests content analysis
- **THEN** system performs full analysis (tags, key points, summary)
- **AND** system displays analysis results
