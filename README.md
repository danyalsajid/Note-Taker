# Healthcare Note Taker

Note-taking web app for healthcare organisations with a flexible hierarchy (e.g., Organisation → Team → Client → Episode → Note)
For the frontend I am using solidjs with vite and bootstrap for styling.
For the backend I am using nodejs with express and sqlite with drizzle ORM.

## Core Flow
- User lands on the signIn page. Where he/she can login/signUp. (Demo creds are shown for quick login)
- After authentication, you can see the home page. 
- The Side bar contains the selectable hierarchy of the organization. Which can be extended by adding a child to it.
- After selecting a hierarchy, all the attached notes will be shown on the right side.
- You can Add, Delete or update notes at any level of hierarchy.
- You can attach a file to the hierarchy along with custom tags.
- AI summarize button will give you the short summary of all the notes in the selected hierarchy.
- On the header Navigate through all the notes through breadcrumbs.
   Search note through search bar
   Filter notes based on tags filter

## Key Features (with assumptions mentioned)
- User authentication (admin/clinician)
   - (Assumption) Admin can signUp only with a special passcode he will receive in their email after some validations. For now use 000000 as the passcode for the signUp
- Role-based access control
   - (Assumption) Only Admin can create organization. Ideally he is supposed to give access for the customizability to other users. But for the scope of this task, he can only add the organization.
- Hierarchical data management
- Real-time updates
- Responsive design
- Typed notes with tags.
- File attachment in the notes
- Tags to attach in a note.
- Filter based on tags
- Search notes.
- AI assisted summary of notes.
   - (Assumption) AI is configured with limited tokens. More AI features can be added like AI suggestions.
- Offline notes capture
   - (Assumption) Ideally service workers with application cache should be implemented. But for the scope of this task, I used the browser's local storage for offline capture.


## Technical features:
- Basic auth with JWT authentication
- Hierarchical data management with sqlite and drizzle ORM with closure table
- Responsive design with bootstrap
- AI integration with Google Gemini
- Offline notes capture through browser local storage

### Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Role-based access control (user/admin)
- Secure session management
- Protected API endpoints

### Hierarchical Data Management
- **Organizations**: Top-level 
- **Teams**: Child of organizations
- **Clients**: Child of teams
- **Episodes**: Child of clients
- **Notes**: Child of any level of the hierarchy

### Note Management
- Create, read, update, and delete notes
- Attach notes to any level of the hierarchy
- Custom tagging for notes.


### Search & Discovery
- Search across all notes
- Tag based filtering
- Hierarchical Tree in the sidebar for navigation

### AI Integration
- AI-assisted note summarization
- Anthropic Claude integration

## Tech Stack

### Frontend
- SolidJS 
- Bootstrap

### Backend
- Express.js 
- JWT 
- bcryptjs 

### Database
- SQLite 
- Drizzle ORM 


### Installation
   ```bash
   npm install

   # Run both frontend and backend concurrently
   npm run dev:all
   
   # run separately:
   npm run dev        # Frontend (port 3000)
   npm run dev:server # Backend (port 3001)
   npm run build        # Build for production
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Hierarchy Management
- `GET /api/data` - Get complete hierarchy tree
- `GET /api/:type` - Get items by type (organizations, teams, clients, episodes)
- `GET /api/:type/:id` - Get specific item by ID
- `POST /api/:type` - Create new hierarchy item
- `PUT /api/:type/:id` - Update hierarchy item
- `DELETE /api/:type/:id` - Delete hierarchy item (cascading)

### Notes Management
- `GET /api/notes/:attachedToType/:attachedToId` - Get notes for specific item
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Health check
- `GET /api/health` - Health check endpoint

## Database Schema

### Users
- User authentication and profile information
- Role-based access control

### Hierarchy Nodes
- Organizations, teams, clients, and episodes
- Hierarchical relationships via closure table

### Notes
- Rich text content with tagging
- Attached to any hierarchy level
- Timestamped creation and updates

### Hierarchy Closure
- Efficient tree traversal and relationship management
- Supports complex hierarchical queries