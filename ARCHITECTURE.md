# Project Architecture Diagrams

This document contains Mermaid diagrams describing the architecture of the Magazine/News Platform project.

## 1. Database Schema (ER Diagram)

```mermaid
erDiagram
    User ||--o{ Article : creates
    User ||--o{ Comment : writes
    User ||--o{ Subscription : subscribes
    User ||--o{ Notification : receives
    User ||--o{ SavedArticle : saves
    User ||--o{ Vote : votes
    User {
        int id PK
        string username
        string email
        boolean is_staff
        boolean is_premium
        datetime date_joined
    }
    
    Article ||--o{ Comment : has
    Article ||--o{ SavedArticle : saved_by
    Article }o--|| Channel : belongs_to
    Article {
        int id PK
        string title
        text content
        text excerpt
        int author_id FK
        datetime created_at
        datetime updated_at
        datetime publish_date
        string status
        string type
        string category
        boolean is_premium
        string image
        int channel_id FK
    }
    
    Comment ||--o| Comment : parent_reply
    Comment {
        int id PK
        int article_id FK
        int user_id FK
        int parent_id FK
        text content
        datetime created_at
        boolean moderated
    }
    
    Channel ||--o{ Article : contains
    Channel ||--o{ Poll : contains
    Channel ||--o{ Subscription : subscribed_to
    Channel {
        int id PK
        string name
        text description
        datetime created_at
    }
    
    Subscription {
        int id PK
        int user_id FK
        int channel_id FK
        datetime started_at
    }
    
    Notification {
        int id PK
        int user_id FK
        string text
        string link
        datetime created_at
        boolean read
    }
    
    SavedArticle {
        int id PK
        int user_id FK
        int article_id FK
        datetime created_at
    }
    
    Poll ||--o{ Choice : has
    Poll ||--o{ Vote : receives
    Poll {
        int id PK
        string question
        datetime created_at
        int channel_id FK
    }
    
    Choice ||--o{ Vote : receives
    Choice {
        int id PK
        int poll_id FK
        string text
        int votes
    }
    
    Vote {
        int id PK
        int poll_id FK
        int user_id FK
        int choice_id FK
    }
```

## 2. Backend API Architecture

```mermaid
graph TB
    subgraph "Django REST Framework"
        Router[DefaultRouter]
        
        subgraph "ViewSets"
            ArticleVS[ArticleViewSet]
            CommentVS[CommentViewSet]
            ChannelVS[ChannelViewSet]
            SubscriptionVS[SubscriptionViewSet]
            NotificationVS[NotificationViewSet]
            SavedArticleVS[SavedArticleViewSet]
            PollVS[PollViewSet]
            UserVS[UserViewSet]
            AdminUserVS[UserManagementViewSet]
        end
        
        subgraph "API Views"
            RegisterView[RegisterView]
            EmailLoginView[EmailLoginView]
            CurrentUser[current_user]
            UserMeView[UserMeView]
            ChannelPollList[ChannelPollListView]
            CreateContent[CreateContentView]
        end
        
        subgraph "Serializers"
            ArticleSerializer[ArticleSerializer]
            CommentSerializer[CommentSerializer]
            ChannelSerializer[ChannelSerializer]
            PollSerializer[PollSerializer]
            UserSerializer[UserSerializer]
        end
        
        subgraph "Permissions"
            IsAuthenticated[IsAuthenticated]
            IsAdminUser[IsAdminUser]
            IsAuthenticatedOrReadOnly[IsAuthenticatedOrReadOnly]
            IsOwnerOrAdmin[IsOwnerOrAdmin]
            IsAdminOrReadOnly[IsAdminOrReadOnly]
            AllowVoteOrAdmin[AllowVoteOrAdmin]
        end
    end
    
    subgraph "Models"
        UserModel[User Model]
        ArticleModel[Article Model]
        CommentModel[Comment Model]
        ChannelModel[Channel Model]
        PollModel[Poll Model]
        VoteModel[Vote Model]
    end
    
    subgraph "Authentication"
        JWT[JWT Tokens]
        RefreshToken[Refresh Token]
    end
    
    Router --> ArticleVS
    Router --> CommentVS
    Router --> ChannelVS
    Router --> SubscriptionVS
    Router --> NotificationVS
    Router --> SavedArticleVS
    Router --> PollVS
    Router --> UserVS
    Router --> AdminUserVS
    
    ArticleVS --> ArticleSerializer
    CommentVS --> CommentSerializer
    ChannelVS --> ChannelSerializer
    PollVS --> PollSerializer
    UserVS --> UserSerializer
    
    ArticleVS --> IsAuthenticatedOrReadOnly
    CommentVS --> IsOwnerOrAdmin
    PollVS --> AllowVoteOrAdmin
    AdminUserVS --> IsAdminUser
    
    ArticleVS --> ArticleModel
    CommentVS --> CommentModel
    ChannelVS --> ChannelModel
    PollVS --> PollModel
    
    RegisterView --> UserModel
    EmailLoginView --> JWT
    RegisterView --> JWT
    
    ArticleModel --> UserModel
    CommentModel --> ArticleModel
    CommentModel --> UserModel
    PollModel --> ChannelModel
    VoteModel --> PollModel
    VoteModel --> UserModel
```

## 3. Frontend Component Architecture

```mermaid
graph TB
    subgraph "React App"
        App[App.js]
        Router[React Router]
        Navbar[Navbar Component]
    end
    
    subgraph "Authentication Pages"
        LoginPage[LoginPage]
        RegisterPage[RegisterPage]
    end
    
    subgraph "Article Pages"
        Home[Home Page]
        ArticlesPage[ArticlesPage]
        ArticlesList[ArticlesList]
        Sport[Sport Page]
        Fashion[Fashion Page]
        News[News Page]
        CreateArticlePage[CreateArticlePage]
        EditArticlePage[EditArticlePage]
        SavedPage[SavedPage]
        CommentsSection[CommentsSection]
    end
    
    subgraph "Channel Pages"
        Subscriptions[Subscriptions Page]
        ChannelContentPage[ChannelContentPage]
        CreateArticleChannelPage[CreateArticleChannelPage]
    end
    
    subgraph "Poll Pages"
        CreatePollPage[CreatePollPage]
    end
    
    subgraph "Admin Pages"
        AdminUserManagementPage[AdminUserManagementPage]
    end
    
    subgraph "State Management"
        LocalStorage[localStorage]
        useState[useState Hooks]
        useEffect[useEffect Hooks]
    end
    
    subgraph "API Services"
        FetchAPI[Fetch API]
        APIEndpoints[API Endpoints]
    end
    
    App --> Router
    Router --> Navbar
    Router --> LoginPage
    Router --> RegisterPage
    Router --> Home
    Router --> ArticlesPage
    Router --> CreateArticlePage
    Router --> EditArticlePage
    Router --> Subscriptions
    Router --> SavedPage
    Router --> CreatePollPage
    Router --> AdminUserManagementPage
    
    ArticlesPage --> ArticlesList
    ArticlesPage --> CommentsSection
    
    Subscriptions --> ChannelContentPage
    Subscriptions --> CreateArticleChannelPage
    
    LoginPage --> LocalStorage
    RegisterPage --> LocalStorage
    ArticlesPage --> FetchAPI
    Subscriptions --> FetchAPI
    CreateArticlePage --> FetchAPI
    
    FetchAPI --> APIEndpoints
    
    LoginPage --> useState
    RegisterPage --> useState
    ArticlesPage --> useState
    ArticlesPage --> useEffect
    Subscriptions --> useState
    Subscriptions --> useEffect
```

## 4. Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        ReactApp[React Frontend]
        CSS[CSS Styles]
    end
    
    subgraph "API Layer"
        RESTAPI[REST API Endpoints]
        JWTAuth[JWT Authentication]
        CORS[CORS Headers]
    end
    
    subgraph "Django Backend"
        URLRouting[URL Routing]
        ViewSets[ViewSets & Views]
        Serializers[Serializers]
        Permissions[Permission Classes]
        Factories[Content Factories]
    end
    
    subgraph "Business Logic"
        ArticleFactory[Article Factory]
        PollFactory[Poll Factory]
        NotificationService[Notification Service]
    end
    
    subgraph "Data Layer"
        Models[Django Models]
        ORM[Django ORM]
        MySQL[(MySQL Database)]
    end
    
    subgraph "Media Storage"
        MediaFiles[Media Files]
        ImageUpload[Image Upload]
    end
    
    Browser --> ReactApp
    ReactApp --> CSS
    ReactApp --> RESTAPI
    
    RESTAPI --> JWTAuth
    RESTAPI --> CORS
    RESTAPI --> URLRouting
    
    URLRouting --> ViewSets
    ViewSets --> Serializers
    ViewSets --> Permissions
    ViewSets --> Factories
    
    Factories --> ArticleFactory
    Factories --> PollFactory
    
    ViewSets --> NotificationService
    
    ViewSets --> Models
    Models --> ORM
    ORM --> MySQL
    
    ViewSets --> MediaFiles
    MediaFiles --> ImageUpload
```

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant JWT
    
    User->>Frontend: Register/Login Request
    Frontend->>Backend: POST /api/register/ or /api/login/
    Backend->>Database: Validate/Create User
    Database-->>Backend: User Data
    Backend->>JWT: Generate Tokens
    JWT-->>Backend: Access & Refresh Tokens
    Backend-->>Frontend: Tokens + User Data
    Frontend->>Frontend: Store in localStorage
    Frontend-->>User: Redirect to Home
    
    User->>Frontend: API Request
    Frontend->>Frontend: Get Token from localStorage
    Frontend->>Backend: Request + Authorization Header
    Backend->>JWT: Verify Token
    JWT-->>Backend: Valid/Invalid
    Backend->>Database: Query Data
    Database-->>Backend: Response Data
    Backend-->>Frontend: JSON Response
    Frontend-->>User: Display Data
```

## 6. Content Creation Flow

```mermaid
flowchart TD
    Start[Admin User] --> SelectType{Select Content Type}
    
    SelectType -->|Article| ArticleForm[Article Creation Form]
    SelectType -->|Poll| PollForm[Poll Creation Form]
    SelectType -->|Channel Article| ChannelArticleForm[Channel Article Form]
    
    ArticleForm --> ArticleFactory[Article Factory]
    PollForm --> PollFactory[Poll Factory]
    ChannelArticleForm --> ArticleFactory
    
    ArticleFactory --> ValidateArticle{Validate Data}
    PollFactory --> ValidatePoll{Validate Data}
    
    ValidateArticle -->|Valid| SaveArticle[Save to Database]
    ValidateArticle -->|Invalid| ShowError[Show Error Message]
    
    ValidatePoll -->|Valid| SavePoll[Save to Database]
    ValidatePoll -->|Invalid| ShowError
    
    SaveArticle --> CreateNotification[Create Notifications]
    SavePoll --> CreateNotification
    
    CreateNotification --> NotifySubscribers[Notify Subscribers]
    NotifySubscribers --> End[Content Published]
    
    ShowError --> ArticleForm
    ShowError --> PollForm
```

## 7. User Permissions Matrix

```mermaid
graph LR
    subgraph "User Roles"
        Guest[Guest User]
        Regular[Regular User]
        Premium[Premium User]
        Admin[Admin User]
    end
    
    subgraph "Permissions"
        ReadArticles[Read Articles]
        ReadPremium[Read Premium Articles]
        Comment[Comment on Articles]
        Vote[Vote in Polls]
        SaveArticles[Save Articles]
        Subscribe[Subscribe to Channels]
        CreateArticles[Create Articles]
        EditArticles[Edit Articles]
        DeleteArticles[Delete Articles]
        ManageUsers[Manage Users]
        ManageChannels[Manage Channels]
        CreatePolls[Create Polls]
    end
    
    Guest --> ReadArticles
    Regular --> ReadArticles
    Regular --> Comment
    Regular --> Vote
    Regular --> SaveArticles
    Regular --> Subscribe
    
    Premium --> ReadArticles
    Premium --> ReadPremium
    Premium --> Comment
    Premium --> Vote
    Premium --> SaveArticles
    Premium --> Subscribe
    
    Admin --> ReadArticles
    Admin --> ReadPremium
    Admin --> Comment
    Admin --> Vote
    Admin --> SaveArticles
    Admin --> Subscribe
    Admin --> CreateArticles
    Admin --> EditArticles
    Admin --> DeleteArticles
    Admin --> ManageUsers
    Admin --> ManageChannels
    Admin --> CreatePolls
```

## 8. API Endpoints Structure

```mermaid
graph TB
    subgraph "Authentication Endpoints"
        Login[/api/login/]
        Register[/api/register/]
        Token[/api/token/]
        Refresh[/api/token/refresh/]
        CurrentUser[/api/user/]
        UserMe[/api/users/me/]
    end
    
    subgraph "Article Endpoints"
        Articles[/api/articles/]
        ArticleDetail[/api/articles/:id/]
        ArticleCategory[/api/articles/?category=:cat/]
    end
    
    subgraph "Comment Endpoints"
        Comments[/api/comments/]
        CommentDetail[/api/comments/:id/]
    end
    
    subgraph "Channel Endpoints"
        Channels[/api/channels/]
        ChannelDetail[/api/channels/:id/]
        ChannelSubscribe[/api/channels/:id/subscribe/]
        ChannelUnsubscribe[/api/channels/:id/unsubscribe/]
        ChannelArticles[/api/channels/:id/articles/]
        ChannelPolls[/api/channels/:id/polls/]
    end
    
    subgraph "Poll Endpoints"
        Polls[/api/polls/]
        PollDetail[/api/polls/:id/]
        PollVote[/api/polls/:id/vote/:choice_id/]
    end
    
    subgraph "Subscription Endpoints"
        Subscriptions[/api/subscriptions/]
    end
    
    subgraph "Notification Endpoints"
        Notifications[/api/notifications/]
    end
    
    subgraph "Saved Articles Endpoints"
        Saved[/api/saved/]
    end
    
    subgraph "Admin Endpoints"
        AdminUsers[/api/admin/users/]
        AdminUserDetail[/api/admin/users/:id/]
        TogglePremium[/api/admin/users/:id/toggle_premium/]
        AdminStats[/api/admin/users/stats/]
    end
```

## Notes

- **Database**: MySQL database with Django ORM
- **Backend**: Django REST Framework with JWT authentication
- **Frontend**: React with React Router for navigation
- **Authentication**: JWT tokens stored in localStorage
- **Permissions**: Role-based access control (Guest, Regular, Premium, Admin)
- **Content Types**: Articles (standard/premium), Polls, Channels
- **Media**: Image uploads stored in media files

