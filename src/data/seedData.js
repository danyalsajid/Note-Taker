// Seed data for the healthcare notes application
export const seedData = {
  organizations: [
    {
      id: 'org-1',
      name: 'City General Hospital',
      type: 'Hospital',
      createdAt: '2024-01-15T10:00:00Z',
      teams: ['team-1', 'team-2', 'team-3']
    },
    {
      id: 'org-2',
      name: 'Regional Medical Center',
      type: 'Medical Center',
      createdAt: '2024-02-01T09:00:00Z',
      teams: ['team-4']
    },
    {
      id: 'org-3',
      name: 'New Hospital',
      type: 'Hospital',
      createdAt: '2024-03-10T11:00:00Z',
      teams: ['team-5']
    }
  ],

  teams: [
    {
      id: 'team-1',
      name: 'Cardiology Department',
      organizationId: 'org-1',
      createdAt: '2024-01-16T10:00:00Z',
      clients: ['client-1', 'client-2']
    },
    {
      id: 'team-2',
      name: 'Emergency Department',
      organizationId: 'org-1',
      createdAt: '2024-01-17T10:00:00Z',
      clients: ['client-3']
    },
    {
      id: 'team-3',
      name: 'Pediatrics',
      organizationId: 'org-1',
      createdAt: '2024-01-18T10:00:00Z',
      clients: []
    },
    {
      id: 'team-4',
      name: 'Pediatrics',
      organizationId: 'org-2',
      createdAt: '2024-02-02T10:00:00Z',
      clients: ['client-4']
    },
    {
      id: 'team-5',
      name: 'New Team',
      organizationId: 'org-3',
      createdAt: '2024-03-11T10:00:00Z',
      clients: []
    }
  ],

  clients: [
    {
      id: 'client-1',
      name: 'John Smith',
      teamId: 'team-1',
      createdAt: '2024-01-20T10:00:00Z',
      episodes: ['episode-1', 'episode-2']
    },
    {
      id: 'client-2',
      name: 'Sarah Johnson',
      teamId: 'team-1',
      createdAt: '2024-01-21T10:00:00Z',
      episodes: []
    },
    {
      id: 'client-3',
      name: 'Michael Brown',
      teamId: 'team-2',
      createdAt: '2024-01-22T10:00:00Z',
      episodes: ['episode-3']
    },
    {
      id: 'client-4',
      name: 'Michael Brown',
      teamId: 'team-4',
      createdAt: '2024-02-03T10:00:00Z',
      episodes: []
    }
  ],

  episodes: [
    {
      id: 'episode-1',
      name: 'Follow-up Consultation',
      clientId: 'client-1',
      createdAt: '2024-02-10T08:30:00Z',
      notes: ['note-1']
    },
    {
      id: 'episode-2',
      name: 'Chest Pain Assessment',
      clientId: 'client-1',
      createdAt: '2024-01-25T09:00:00Z',
      notes: []
    },
    {
      id: 'episode-3',
      name: 'Routine Checkup',
      clientId: 'client-3',
      createdAt: '2024-01-30T14:00:00Z',
      notes: []
    }
  ],

  notes: [
    {
      id: 'note-1',
      episodeId: 'episode-1',
      content: 'Prescribed Lisinopril 10mg daily for hypertension. Patient advised to monitor blood pressure at home.',
      tags: ['Medication', 'Follow-up'],
      createdAt: '2024-02-10T08:30:00Z',
      updatedAt: '2024-02-10T08:30:00Z'
    }
  ],

  users: [
    {
      id: 'user-1',
      name: 'Dr. Admin',
      email: 'admin@hospital.com',
      role: 'Admin',
      avatar: 'https://via.placeholder.com/40x40/4285f4/ffffff?text=DA'
    }
  ],

  tags: [
    { id: 'tag-1', name: 'Assessment', color: '#4285f4' },
    { id: 'tag-2', name: 'Follow-up', color: '#34a853' },
    { id: 'tag-3', name: 'Medication', color: '#ea4335' },
    { id: 'tag-4', name: 'Urgent', color: '#fbbc04' }
  ]
};

// Helper functions to work with seed data
export const getOrganizations = () => seedData.organizations;

export const getTeamsByOrganization = (orgId) => 
  seedData.teams.filter(team => team.organizationId === orgId);

export const getClientsByTeam = (teamId) => 
  seedData.clients.filter(client => client.teamId === teamId);

export const getEpisodesByClient = (clientId) => 
  seedData.episodes.filter(episode => episode.clientId === clientId);

export const getNotesByEpisode = (episodeId) => 
  seedData.notes.filter(note => note.episodeId === episodeId);

export const getItemById = (type, id) => {
  const collection = seedData[type];
  return collection ? collection.find(item => item.id === id) : null;
};

export const getAllTags = () => seedData.tags;

export const getCurrentUser = () => seedData.users[0];
