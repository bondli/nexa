## ADDED Requirements

### Requirement: Configure AI models
The system SHALL allow users to configure AI model settings.

#### Scenario: Configure GLM4.7 settings
- **WHEN** user enters GLM4.7 API key and endpoint
- **THEN** system saves GLM4.7 configuration
- **AND** system validates configuration

#### Scenario: Configure remote model
- **WHEN** user selects remote model provider
- **THEN** system saves provider configuration
- **AND** system configures AI service to use provider

### Requirement: Startup settings
The system SHALL allow users to configure application startup behavior.

#### Scenario: Enable startup on login
- **WHEN** user user enables startup on login
- **THEN** system configures OS to launch app on login

#### Scenario: Disable startup on login
- **WHEN** user disables startup on login
- **THEN** system removes startup configuration

#### Scenario: Start minimized to tray
- **WHEN** user enables start minimized
- **THEN** system starts application minimized to system tray

### Requirement: Settings persistence
The system SHALL persist all settings across application sessions.

#### Scenario: Load settings on startup
- **WHEN** application starts
- **THEN** system loads saved settings
- **AND** system applies settings to application

#### Scenario: Save settings on change
- **WHEN** user modifies any setting
- **THEN** system saves updated settings
- **AND** settings persist across restarts

### Requirement: Settings validation
The system SHALL validate settings before applying them.

#### Scenario: Validate API key format
- **WHEN** user enters API key
- **THEN** system validates key format
- **AND** system shows error if format is invalid

#### Scenario: Validate endpoint URL
- **WHEN** user enters API endpoint
- **THEN** system validates URL format
- **AND** system shows error if format is invalid
