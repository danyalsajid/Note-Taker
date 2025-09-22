import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { eq, and } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Database 
import { db } from './db/connection.js';
import { notes, users, hierarchyNodes, hierarchyClosure } from './db/schema.js';
import { initializeDatabase } from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize database
await initializeDatabase();

app.use(cors());
app.use(bodyParser.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

///////////////////////////////////
// Authentication routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, name, role = 'user' } = req.body;

    if (!username || !password || !email || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        username,
        password: hashedPassword,
        email,
        name,
        role
      })
      .returning();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

///////////////////////////////////
// Hierarchy nodes CRUD routes

// Get all hierarchy nodes with their relationships
app.get('/api/hierarchy', authenticateToken, async (req, res) => {
  try {
    // Get all nodes
    const allNodes = await db.select().from(hierarchyNodes);
    
    // Get all relationships
    const relationships = await db.select().from(hierarchyClosure).where(eq(hierarchyClosure.depth, 1));
    
    // Build hierarchy tree
    const nodeMap = new Map();
    allNodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Add children to parents
    relationships.forEach(rel => {
      const parent = nodeMap.get(rel.ancestor);
      const child = nodeMap.get(rel.descendant);
      if (parent && child) {
        parent.children.push(child);
      }
    });

    // Get root nodes (organizations)
    const rootNodes = allNodes
      .filter(node => node.type === 'organisation')
      .map(node => nodeMap.get(node.id));

    res.json(rootNodes);
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    res.status(500).json({ error: 'Failed to fetch hierarchy' });
  }
});

// Create new hierarchy node
app.post('/api/hierarchy', authenticateToken, async (req, res) => {
  try {
    const { name, type, parentId } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const nodeId = uuidv4();
    const [newNode] = await db
      .insert(hierarchyNodes)
      .values({
        id: nodeId,
        name,
        type
      })
      .returning();

    // Add to hierarchy closure table
    if (parentId) {
      // Add self-reference
      await db.insert(hierarchyClosure).values({
        ancestor: nodeId,
        descendant: nodeId,
        depth: 0
      });

      // Add parent relationships
      const parentRelations = await db.select().from(hierarchyClosure).where(eq(hierarchyClosure.descendant, parentId));
      
      for (const relation of parentRelations) {
        await db.insert(hierarchyClosure).values({
          ancestor: relation.ancestor,
          descendant: nodeId,
          depth: relation.depth + 1
        });
      }
    } else {
      // Root node - only self-reference
      await db.insert(hierarchyClosure).values({
        ancestor: nodeId,
        descendant: nodeId,
        depth: 0
      });
    }

    res.status(201).json(newNode);
  } catch (error) {
    console.error('Error creating hierarchy node:', error);
    res.status(500).json({ error: 'Failed to create hierarchy node' });
  }
});

// Update hierarchy node
app.put('/api/hierarchy/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [updatedNode] = await db
      .update(hierarchyNodes)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(hierarchyNodes.id, id))
      .returning();

    if (!updatedNode) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(updatedNode);
  } catch (error) {
    console.error('Error updating hierarchy node:', error);
    res.status(500).json({ error: 'Failed to update hierarchy node' });
  }
});

// Delete hierarchy node
app.delete('/api/hierarchy/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from hierarchy closure (cascades)
    await db.delete(hierarchyClosure).where(eq(hierarchyClosure.ancestor, id));
    await db.delete(hierarchyClosure).where(eq(hierarchyClosure.descendant, id));

    // Delete the node
    await db.delete(hierarchyNodes).where(eq(hierarchyNodes.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting hierarchy node:', error);
    res.status(500).json({ error: 'Failed to delete hierarchy node' });
  }
});

///////////////////////////////////
// Notes CRUD routes

// Get notes for a specific hierarchy node
app.get('/api/notes/:nodeId', authenticateToken, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const nodeNotes = await db.select().from(notes).where(eq(notes.attachedToId, nodeId));
    res.json(nodeNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create new note
app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { content, attachedToId, attachedToType, tags } = req.body;

    if (!content || !attachedToId || !attachedToType) {
      return res.status(400).json({ error: 'Content, attachedToId, and attachedToType are required' });
    }

    const noteId = uuidv4();
    const [newNote] = await db
      .insert(notes)
      .values({
        id: noteId,
        content,
        attachedToId,
        attachedToType,
        tags: tags ? JSON.stringify(tags) : null
      })
      .returning();

    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, tags } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const [updatedNote] = await db
      .update(notes)
      .set({ 
        content, 
        tags: tags ? JSON.stringify(tags) : null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(notes.id, id))
      .returning();

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(notes).where(eq(notes.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

/////////////////////////////////
// Routes end

// Health check endpoint for Railway
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the dist directory (built frontend) - AFTER API routes
app.use(express.static(path.join(__dirname, '../dist')));

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://localhost:${PORT}`);
});