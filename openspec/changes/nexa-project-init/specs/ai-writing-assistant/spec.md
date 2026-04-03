## ADDED Requirements

### Requirement: Rewrite text
The system SHALL provide AI-powered text rewriting capability.

#### Scenario: Rewrite selected text
- **WHEN** user selects text and requests rewrite
- **THEN** system sends text to AI rewrite service
- **AND** system returns rewritten text
- **AND** user can accept or reject the rewrite

### Requirement: Summarize content
The system SHALL provide AI-powered content summarization capability.

#### Scenario: Summarize note content
- **WHEN** user requests summary for a note
- **THEN** system sends note content to AI summarization service
- **AND** system returns summary
- **AND** system displays summary to user

#### Scenario: Summarize selected text
- **WHEN** user selects text and requests summary
- **THEN** system sends selected text to AI summarization service
- **AND** system returns summary
- **AND** system displays summary to user

### Requirement: Expand content
The system SHALL provide AI-powered content expansion capability.

#### Scenario: Expand note content
- **WHEN** user requests expansion for a note
- **THEN** system sends note content to AI expansion service
- **AND** system returns expanded content
- **AND** user can accept or reject the expansion

### Requirement: Adjust tone
The system SHALL provide AI-powered tone adjustment capability.

#### Scenario: Adjust to formal tone
- **WHEN** user requests formal tone adjustment for selected text
- **THEN** system sends text with tone instruction to AI service
- **AND** system returns text with formal tone

#### Scenario: Adjust to casual tone
- **WHEN** user requests casual tone adjustment for selected text
- **THEN** system sends text with tone instruction to AI service
- **AND** system returns text with casual tone

#### Scenario: Adjust to professional tone
- **WHEN** user requests professional tone adjustment for selected text
- **THEN** system sends text with tone instruction to AI service
- **AND** system returns text with professional tone

### Requirement: AI writing assistance integration
The system SHALL integrate AI writing assistance features into the note editor.

#### Scenario: Access writing assistant from editor
- **WHEN** user opens note editor
- **THEN** editor toolbar includes AI writing assistant menu
- **AND** menu shows available AI operations (rewrite, summarize, expand, adjust tone)

#### Scenario: Apply AI result
- **WHEN** user accepts AI-generated text
- **THEN** editor replaces selected text with AI result
- **AND** editor maintains cursor position
