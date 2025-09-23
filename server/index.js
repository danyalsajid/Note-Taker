import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { eq, and, or } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();


// Database 
import { db } from './db/connection.js';
import { notes, users, hierarchyNodes, hierarchyClosure, attachments } from './db/schema.js';
import { initializeDatabase } from './db/database.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'healthcare-notes-secret-key-2024';

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


// Initialize database
await initializeDatabase();

// CORS for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx|xls|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only common file types are allowed (images, PDFs, documents)'));
    }
  }
});

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve static files from dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Generate unique ID
const generateId = () => randomUUID();

// Database utility functions
const getNodesByType = async (type) => {
  return await db.select().from(hierarchyNodes).where(eq(hierarchyNodes.type, type));
};

const getNodeById = async (id) => {
  const result = await db.select().from(hierarchyNodes).where(eq(hierarchyNodes.id, id)).limit(1);
  return result[0] || null;
};

const getChildren = async (parentId) => {
  const children = await db.select({
    id: hierarchyNodes.id,
    type: hierarchyNodes.type,
    name: hierarchyNodes.name,
    createdAt: hierarchyNodes.createdAt,
    updatedAt: hierarchyNodes.updatedAt
  })
  .from(hierarchyNodes)
  .innerJoin(hierarchyClosure, eq(hierarchyNodes.id, hierarchyClosure.descendant))
  .where(and(
    eq(hierarchyClosure.ancestor, parentId),
    eq(hierarchyClosure.depth, 1)
  ));
  
  return children;
};

const getParent = async (childId) => {
  const parent = await db.select({
    id: hierarchyNodes.id,
    type: hierarchyNodes.type,
    name: hierarchyNodes.name,
    createdAt: hierarchyNodes.createdAt,
    updatedAt: hierarchyNodes.updatedAt
  })
  .from(hierarchyNodes)
  .innerJoin(hierarchyClosure, eq(hierarchyNodes.id, hierarchyClosure.ancestor))
  .where(and(
    eq(hierarchyClosure.descendant, childId),
    eq(hierarchyClosure.depth, 1)
  ))
  .limit(1);
  
  return parent[0] || null;
};

const createHierarchyNode = async (type, name, parentId = null) => {
  const id = generateId();
  const now = new Date().toISOString();
  
  const newNode = {
    id,
    type,
    name,
    createdAt: now,
    updatedAt: now
  };
  
  // Insert the node
  await db.insert(hierarchyNodes).values(newNode);
  
  // Insert self-reference in closure table
  await db.insert(hierarchyClosure).values({
    ancestor: id,
    descendant: id,
    depth: 0
  });
  
  // If has parent, insert parent relationships
  if (parentId) {
    // Get all ancestors of the parent
    const parentAncestors = await db.select()
      .from(hierarchyClosure)
      .where(eq(hierarchyClosure.descendant, parentId));
    
    // Insert relationships for all ancestors
    for (const ancestor of parentAncestors) {
      await db.insert(hierarchyClosure).values({
        ancestor: ancestor.ancestor,
        descendant: id,
        depth: ancestor.depth + 1
      });
    }
  }
  
  return newNode;
};

const updateNode = async (id, name) => {
  const now = new Date().toISOString();
  
  const updated = await db.update(hierarchyNodes)
    .set({ name, updatedAt: now })
    .where(eq(hierarchyNodes.id, id))
    .returning();
    
  return updated[0] || null;
};

const deleteNodeAndDescendants = async (nodeId) => {
  // Get all descendants (including self)
  const descendants = await db.select()
    .from(hierarchyClosure)
    .where(eq(hierarchyClosure.ancestor, nodeId));
  
  const descendantIds = descendants.map(d => d.descendant);
  
  // Delete all notes attached to these nodes
  for (const id of descendantIds) {
    await db.delete(notes).where(eq(notes.attachedToId, id));
  }
  
  // Delete closure table entries
  for (const id of descendantIds) {
    await db.delete(hierarchyClosure).where(
      or(
        eq(hierarchyClosure.ancestor, id),
        eq(hierarchyClosure.descendant, id)
      )
    );
  }
  
  // Delete the nodes themselves
  for (const id of descendantIds) {
    await db.delete(hierarchyNodes).where(eq(hierarchyNodes.id, id));
  }
  
  return descendantIds.length;
};

// Helper function to build hierarchical data
async function buildHierarchicalData() {
  const organisations = await getNodesByType('organisation');
  const result = {
    organisations: [],
    teams: [],
    clients: [],
    episodes: [],
    notes: []
  };

  // Get all nodes
  for (const org of organisations) {
    result.organisations.push(org);
    
    const teams = await getChildren(org.id);
    for (const team of teams) {
      result.teams.push({ ...team, parentId: org.id });
      
      const clients = await getChildren(team.id);
      for (const client of clients) {
        result.clients.push({ ...client, parentId: team.id });
        
        const episodes = await getChildren(client.id);
        for (const episode of episodes) {
          result.episodes.push({ ...episode, parentId: client.id });
        }
      }
    }
  }

  // Get all notes
  const allNotes = await db.select().from(notes);
  result.notes = allNotes.map(note => ({
    id: note.id,
    content: note.content,
    attachedToId: note.attachedToId,
    attachedToType: note.attachedToType,
    tags: note.tags ? JSON.parse(note.tags) : [],
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  }));

  return result;
}

////////////
// Routes
////////////

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


////////////
// Auth Starts
////////////

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const userList = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
    const user = userList[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, email, name, role, adminPasscode } = req.body;
    
    // Validation
    if (!username || !password || !email || !name) {
      return res.status(400).json({ error: 'Username, password, email, and name are required' });
    }
    
    // Role validation - only allow admin and clinician
    const allowedRoles = ['admin', 'clinician'];
    if (role && !allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role. Only admin and clinician roles are allowed' });
    }
    
    // Admin passcode validation
    if (role && role.toLowerCase() === 'admin') {
      if (!adminPasscode) {
        return res.status(400).json({ error: 'Admin passcode is required for administrator accounts' });
      }
      if (adminPasscode !== '000000') {
        return res.status(400).json({ error: 'Invalid admin passcode' });
      }
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    // Check if user already exists (case insensitive)
    const existingUsers = await db.select().from(users).where(
      eq(users.username, username.toLowerCase())
    );
    
    const existingEmails = await db.select().from(users).where(
      eq(users.email, email)
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    if (existingEmails.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: generateId(),
      username: username.toLowerCase(),
      password: hashedPassword,
      email,
      name,
      role: role ? role.toLowerCase() : 'clinician', // Default role
      createdAt: new Date().toISOString()
    };
    
    // Insert user
    await db.insert(users).values(newUser);
    
    // Generate token for immediate login
    const token = jwt.sign(
      { 
        id: newUser.id, 
        username: newUser.username, 
        role: newUser.role,
        name: newUser.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      token,
      user: userWithoutPassword,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const userList = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const user = userList[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

////////////
// Auth Ends
////////////

////////////
// CRUD Operations Start
////////////

// Get all data
app.get('/api/data', requireAuth, async (req, res) => {
  try {
    const data = await buildHierarchicalData();
    res.json(data);
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Get items by type
app.get('/api/:type', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (type === 'notes') {
      const allNotes = await db.select().from(notes);
      return res.json(allNotes);
    }
    
    // Convert plural to singular for database lookup
    const singularType = type.slice(0, -1); // Remove 's'
    const items = await getNodesByType(singularType);
    
    // Add parentId for compatibility
    const itemsWithParent = await Promise.all(
      items.map(async (item) => {
        const parent = await getParent(item.id);
        return {
          ...item,
          parentId: parent ? parent.id : null
        };
      })
    );
    
    res.json(itemsWithParent);
  } catch (error) {
    console.error(`Get ${req.params.type} error:`, error);
    res.status(500).json({ error: `Failed to fetch ${req.params.type}` });
  }
});

// Get item by ID
app.get('/api/:type/:id', requireAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    
    if (type === 'notes') {
      const noteList = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
      const note = noteList[0];
      
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      
      return res.json(note);
    }
    
    const item = await getNodeById(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Add parentId for compatibility
    const parent = await getParent(item.id);
    const itemWithParent = {
      ...item,
      parentId: parent ? parent.id : null
    };
    
    res.json(itemWithParent);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create new note (must come before the generic :type route)
app.post('/api/notes', requireAuth, async (req, res) => {
  try {
    const { content, attachedToId, attachedToType, tags = [] } = req.body;
    
    if (!content || !attachedToId || !attachedToType) {
      return res.status(400).json({ error: 'Content, attachedToId, and attachedToType are required' });
    }
    
    const newNote = {
      id: generateId(),
      content,
      attachedToId,
      attachedToType,
      tags: JSON.stringify(tags),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.insert(notes).values(newNote);
    
    // Return note with parsed tags
    // TODO: the response should be coming from db operation
    const responseNote = {
      ...newNote,
      tags: tags
    };
    
    res.status(201).json(responseNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Upload file attachment for a note
app.post('/api/notes/:noteId/attachments', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { noteId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Check if note exists
    const note = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    if (note.length === 0) {
      // Clean up uploaded file if note doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const attachment = {
      id: generateId(),
      noteId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      createdAt: new Date().toISOString()
    };
    
    await db.insert(attachments).values(attachment);
    
    res.status(201).json({
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      createdAt: attachment.createdAt
    });
  } catch (error) {
    console.error('File upload error:', error);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get attachments for a note
app.get('/api/notes/:noteId/attachments', requireAuth, async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const noteAttachments = await db.select({
      id: attachments.id,
      filename: attachments.filename,
      originalName: attachments.originalName,
      mimeType: attachments.mimeType,
      size: attachments.size,
      createdAt: attachments.createdAt
    }).from(attachments).where(eq(attachments.noteId, noteId));
    
    res.json(noteAttachments);
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

// Download attachment
app.get('/api/attachments/:attachmentId/download', requireAuth, async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const attachment = await db.select().from(attachments).where(eq(attachments.id, attachmentId)).limit(1);
    
    if (attachment.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const file = attachment[0];
    
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
});

// Delete attachment
app.delete('/api/attachments/:attachmentId', requireAuth, async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const attachment = await db.select().from(attachments).where(eq(attachments.id, attachmentId)).limit(1);
    
    if (attachment.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const file = attachment[0];
    
    // Delete from database
    await db.delete(attachments).where(eq(attachments.id, attachmentId));
    
    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

// Create new item
app.post('/api/:type', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { name, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Convert plural to singular for database
    const singularType = type.slice(0, -1); // Remove 's'
    
    // Check if user is trying to create an organization
    if (singularType === 'organisation' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can create organizations' });
    }
    
    const newItem = await createHierarchyNode(singularType, name, parentId);
    
    res.status(201).json({
      ...newItem,
      type: singularType
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update note
app.put('/api/notes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, tags = [] } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const updatedNote = await db.update(notes)
      .set({ 
        content, 
        tags: JSON.stringify(tags),
        updatedAt: new Date().toISOString() 
      })
      .where(eq(notes.id, id))
      .returning();
    
    if (updatedNote.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Return note with parsed tags
    const responseNote = {
      ...updatedNote[0],
      tags: tags
    };
    
    res.json(responseNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
app.delete('/api/notes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedNote = await db.delete(notes)
      .where(eq(notes.id, id))
      .returning();
    
    if (deletedNote.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Get notes for a specific item
app.get('/api/notes/:attachedToType/:attachedToId', requireAuth, async (req, res) => {
  try {
    const { attachedToType, attachedToId } = req.params;
    
    const itemNotes = await db.select().from(notes).where(
      and(
        eq(notes.attachedToId, attachedToId),
        eq(notes.attachedToType, attachedToType)
      )
    );
    
    // Parse tags for each note
    const notesWithParsedTags = itemNotes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : []
    }));
    
    res.json(notesWithParsedTags);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Update hierarchy item
app.put('/api/:type/:id', requireAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const updatedItem = await updateNode(id, name);
    
    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Add parentId for compatibility
    const parent = await getParent(updatedItem.id);
    const itemWithParent = {
      ...updatedItem,
      parentId: parent ? parent.id : null
    };
    
    res.json(itemWithParent);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete hierarchy item (with cascading delete)
app.delete('/api/:type/:id', requireAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Check if item exists
    const item = await getNodeById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Convert plural to singular for type checking
    const singularType = type.slice(0, -1); // Remove 's'
    
    // Check if user is trying to delete an organization
    if (singularType === 'organisation' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can delete organizations' });
    }
    
    // Delete the node and all its descendants
    const deletedCount = await deleteNodeAndDescendants(id);
    
    res.json({ 
      message: 'Item and all children deleted successfully',
      deletedCount 
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Catch-all handler for SPA in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

////////////
// CRUD Operations END
////////////

////////////
// AI Operations Start
////////////

// AI Summary endpoint
app.post('/api/ai/summarize', requireAuth, async (req, res) => {
  console.log('Google API key configured:', !!process.env.GOOGLE_API_KEY)

  try {
    const { notes } = req.body;
    
    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ error: 'Notes array is required and must not be empty' });
    }
    
    // Check if Google API key is configured
    if (!process.env.GOOGLE_API_KEY) {
      console.log('Google API key not configured');
      return res.status(500).json({ 
        error: 'AI service not configured. Please contact your administrator.' 
      }); 
    }
    
    // Prepare notes content
    const notesContent = notes.map((note, index) => {
      const createdDate = new Date(note.createdAt).toLocaleDateString();
      const updatedDate = note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : createdDate;
      
      return `Note ${index + 1} (Created: ${createdDate}${updatedDate !== createdDate ? `, Updated: ${updatedDate}` : ''}):\n${note.content}`;
    }).join('\n\n---\n\n');
    
    // Create the AI prompt
    const prompt = `Please analyze the following healthcare notes and provide a short summary. ${notesContent}`;

    // Call Google Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    res.json({ 
      summary,
      notesCount: notes.length,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI Summary error:', error);
    
    res.status(500).json({ 
      error: 'Failed to generate AI summary. Please try again later.' 
    });
  }
});

////////////
// AI Operations End
////////////


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} with Drizzle ORM and SQLite database`);
});
