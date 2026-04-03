## 1. Project Setup

- [x] 1.1 Initialize project structure (frontend, server, electron, declare directories)
- [x] 1.2 Initialize frontend with React + TypeScript + Vite
- [x] 1.3 Install frontend dependencies (antd6, less, axios, react-router-dom)
- [x] 1.4 Initialize server with Node.js + Express + TypeScript
- [x] 1.5 Install server dependencies (express, mysql2, sequelize, cors)
- [x] 1.6 Initialize Electron configuration (main process, preload script)
- [x] 1.7 Install Electron dependencies (electron, electron-builder)
- [x] 1.8 Install AI dependencies (chromadb, langchain)
- [x] 1.9 Configure build scripts and unified package.json
- [x] 1.10 Set up TypeScript configuration
- [x] 1.11 Set up ESLint and Prettier

## 2. Data Layer

- [x] 2.1 Create Sequelize database connection
- [x] 2.2 Define Note model (id, title, content, category, userId, status, deadline, priority, tags, timestamps)
- [x] 2.3 Define User model
- [x] 2.4 Define Category model
- [x] 2.5 Define KnowledgeBase model
- [x] 2.6 Create migrations for all models
- [x] 2.7 Initialize Chroma vector database connection
- [x] 2.8 Create Chroma collection for embeddings
- [x] 2.9 Implement vector store service

## 3. AI Service Layer

- [x] 3.1 Create AI service base structure
- [x] 3.2 Implement generateEmbedding function (GLM4.7)
- [x] 3.3 Implement chat function (GLM4.7)
- [x] 3.4 Implement generate function (GLM4.7)
- [x] 3.5 Implement summarize function
- [x] 3.6 Implement rewrite function
- [x] 3.7 Implement expand function
- [x] 3.8 Implement adjustTone function
- [x] 3.9 Implement extractKeyPoints function
- [x] 3.10 Implement autoGenerateTags function
- [x] 3.11 Implement generateStructuredSummary function
- [x] 3.12 Set up LangChain integration
- [x] 3.13 Create RAG chain implementation
- [x] 3.14 Create conversation chain implementation

## 4. Server Service Layer

- [x] 4.1 Create note controller (CRUD operations)
- [x] 4.2 Create note service (business logic)
- [x] 4.3 Create knowledge base controller
- [x] 4.4 Create knowledge base service
- [x] 4.5 Create search service (semantic search)
- [x] 4.6 Create chat service (RAG Q&A)
- [x] 4.7 Create user controller
- [x] 4.8 Create user service
- [x] 4.9 Create settings controller
- [x] 4.10 Create settings service
- [x] 4.11 Set up Express routes and middleware
- [x] 4.12 Implement CORS and error handling middleware

## 5. Electron Main Process

- [x] 5.1 Implement main process initialization with server startup
- [x] 5.2 Create application window with correct paths
- [x] 5.3 Implement IPC handlers for note operations
- [x] 5.4 Implement IPC handlers for knowledge base operations
- [x] 5.5 Implement IPC handlers for chat operations
- [x] 5.6 Implement IPC handlers for settings operations
- [x] 5.7 Implement preload script with exposed APIs
- [x] 5.8 Handle application lifecycle (ready, quit, window-all-closed)
- [x] 5.9 Implement system tray support
- [x] 5.10 Manage server process lifecycle from Electron

## 6. Frontend Service Layer

- [ ] 6.1 Create API client with axios
- [ ] 6.2 Create note service (frontend)
- [ ] 6.3 Create knowledge base service (frontend)
- [ ] 6.4 Create chat service (frontend)
- [ ] 6.5 Create settings service (frontend)
- [ ] 6.6 Create user service (frontend)
- [ ] 6.7 Create AI service (frontend wrapper)

## 7. Frontend Components - Common

- [ ] 7.1 Create Layout component
- [ ] 7.2 Create Sidebar/Navigation component
- [ ] 7.3 Create Header component
- [ ] 7.4 Create Loading component
- [ ] 7.5 Create ErrorBoundary component

## 8. Frontend Components - Note System

- [ ] 8.1 Create NoteList component
- [ ] 8.2 Create NoteCard component
- [ ] 8.3 Create NoteEditor component
- [ ] 8.4 Create MarkdownEditor component
- [ ] 8.5 Create TagSelector component
- [ ] 8.6 Create CategorySelector component
- [ ] 8.7 Create NoteFilter component
- [ ] 8.8 Create CreateNoteModal component

## 9. Frontend Components - Knowledge Base

- [ ] 9.1 Create KnowledgeBaseList component
- [ ] 9.2 Create KnowledgeBaseCard component
- [ ] 9.3 Create DocumentList component
- [ ] 9.4 Create IndexStatus component
- [ ] 9.5 Create CreateKnowledgeBaseModal component

## 10. Frontend Components - Chat

- [ ] 10.1 Create Chat component using antd
- [ ] 10.2 Create MessageList component
- [ ] 10.3 Create MessageInput component
- [ ] 10.4 Create CitationCard component

## 11. Frontend Components - Settings

- [ ] 11.1 Create SettingsPage component
- [ ] 11.2 Create AIConfigForm component
- [ ] 11.3 Create StartupSettingsForm component

## 12. Frontend Components - User Profile

- [ ] 12.1 Create UserProfile component
- [ ] 12.2 Create AvatarUpload component
- [ ] 12.3 Create PasswordChangeForm component

## 13. Frontend Components - Web Import

- [ ] 13.1 Create WebContentImport component
- [ ] 13.2 Create URLImportForm component
- [ ] 13.3 Create PasteImportForm component

## 14. Frontend Components - AI Writing Assistant

- [ ] 14.1 Create WritingAssistantMenu component
- [ ] 14.2 Create RewriteDialog component
- [ ] 14.3 Create SummarizeDialog component
- [ ] 14.4 Create ExpandDialog component
- [ ] 14.5 Create ToneAdjustDialog component

## 15. Frontend Components - Content Intelligence

- [ ] 15.1 Create SummaryCard component
- [ ] 15.2 Create KeyPointsViewer component
- [ ] 15.3 Create StructuredSummaryViewer component
- [ ] 15.4 Create AutoTagsViewer component

## 16. Frontend Pages

- [ ] 16.1 Create NoteListPage
- [ ] 16.2 Create NoteEditPage
- [ ] 16.3 Create KnowledgeBasePage
- [ ] 16.4 Create ChatPage
- [ ] 16.5 Create SettingsPage
- [ ] 16.6 Create UserProfilePage

## 17. Theme System

- [ ] 17.1 Implement theme context provider
- [ ] 17.2 Create light theme configuration
- [ ] 17.3 Create dark theme configuration
- [ ] 17.4 Implement theme persistence
- [ ] 17.5 Create ThemeToggle component
- [ ] 17.6 Integrate theme with Ant Design

## 18. Integration & Wiring

- [ ] 18.1 Set up React Router
- [ ] 18.2 Connect IPC bridge between frontend and main process
- [ ] 18.3 Connect frontend services to IPC bridge
- [ ] 18.4 Connect main process IPC to server
- [ ] 18.5 Implement data flow from UI to database
- [ ] 18.6 Implement data flow from database to UI
- [ ] 18.7 Implement real-time updates via IPC

## 19. Building & Packaging

- [x] 19.1 Configure Vite build settings
- [x] 19.2 Configure electron-builder for macOS
- [x] 19.3 Configure electron-builder for Windows
- [x] 19.4 Create build scripts (now in root package.json)
- [ ] 19.5 Test local build
- [ ] 19.6 Test macOS packaging
- [ ] 19.7 Test Windows packaging

## 20. Testing & Polish

- [ ] 20.1 Test note CRUD operations
- [ ] 20.2 Test Markdown editor
- [ ] 20.3 Test web content import
- [ ] 20.4 Test semantic search
- [ ] 20.5 Test RAG chat
- [ ] 20.6 Test AI writing assistant
- [ ] 20.7 Test content intelligence features
- [ ] 20.8 Test knowledge base management
- [ ] 20.9 Test theme switching
- [ ] 20.10 Test settings persistence
- [ ] 20.11 Test user profile management
- [ ] 20.12 Test IPC communication
- [ ] 20.13 Test error handling
- [ ] 20.14 Performance optimization
- [ ] 20.15 Final integration testing
