import { hierarchyNodes, hierarchyClosure, notes, users } from './schema.js';

function getSeedUsers() {
	return [
		{
			id: 'user-1',
			username: 'admin',
			password: '$2b$10$oTT/NBnCnex7rgma0nAp/ug8dSuwDRwUB93JQQxLlGDCOHNYnYp.C', // password: Test@123
			email: 'admin@healthcare.com',
			name: 'Admin',
			role: 'admin',
			createdAt: new Date().toISOString()
		},
		{
			id: 'user-2',
			username: 'clinician',
			password: '$2b$10$oTT/NBnCnex7rgma0nAp/ug8dSuwDRwUB93JQQxLlGDCOHNYnYp.C', // password: Test@123
			email: 'clinician@healthcare.com',
			name: 'Clinician',
			role: 'clinician',
			createdAt: new Date().toISOString()
		}
	];
}

function getSeedHierarchyNodes() {
	return [
		// Organizations
		{
			id: 'org-1',
			type: 'organisation',
			name: 'City General Hospital',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: 'org-2',
			type: 'organisation',
			name: 'Regional Medical Center',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		// Teams
		{
			id: 'team-1',
			type: 'team',
			name: 'Cardiology Department',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: 'team-2',
			type: 'team',
			name: 'Emergency Department',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: 'team-3',
			type: 'team',
			name: 'Pediatrics',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		// Clients
		{
			id: 'client-1',
			type: 'client',
			name: 'John Smith',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: 'client-2',
			type: 'client',
			name: 'Sarah Johnson',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: 'client-3',
			type: 'client',
			name: 'Michael Brown',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		// Episodes
		{
			id: 'episode-1',
			type: 'episode',
			name: 'Chest Pain Assessment',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: 'episode-2',
			type: 'episode',
			name: 'Follow-up Consultation',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: 'episode-3',
			type: 'episode',
			name: 'Routine Checkup',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	];
}

function getSeedClosureRelationships() {
	return [
		// Self-references (depth 0) - every node references itself
		{ ancestor: 'org-1', descendant: 'org-1', depth: 0 },
		{ ancestor: 'org-2', descendant: 'org-2', depth: 0 },
		{ ancestor: 'team-1', descendant: 'team-1', depth: 0 },
		{ ancestor: 'team-2', descendant: 'team-2', depth: 0 },
		{ ancestor: 'team-3', descendant: 'team-3', depth: 0 },
		{ ancestor: 'client-1', descendant: 'client-1', depth: 0 },
		{ ancestor: 'client-2', descendant: 'client-2', depth: 0 },
		{ ancestor: 'client-3', descendant: 'client-3', depth: 0 },
		{ ancestor: 'episode-1', descendant: 'episode-1', depth: 0 },
		{ ancestor: 'episode-2', descendant: 'episode-2', depth: 0 },
		{ ancestor: 'episode-3', descendant: 'episode-3', depth: 0 },

		// Org -> Teams (depth 1)
		{ ancestor: 'org-1', descendant: 'team-1', depth: 1 }, // City General -> Cardiology
		{ ancestor: 'org-1', descendant: 'team-2', depth: 1 }, // City General -> Emergency
		{ ancestor: 'org-2', descendant: 'team-3', depth: 1 }, // Regional -> Pediatrics

		// Teams -> Clients (depth 1)
		{ ancestor: 'team-1', descendant: 'client-1', depth: 1 }, // Cardiology -> John Smith
		{ ancestor: 'team-1', descendant: 'client-2', depth: 1 }, // Cardiology -> Sarah Johnson
		{ ancestor: 'team-2', descendant: 'client-3', depth: 1 }, // Emergency -> Michael Brown

		// Orgs -> Clients (depth 2, through teams)
		{ ancestor: 'org-1', descendant: 'client-1', depth: 2 }, // City General -> John Smith
		{ ancestor: 'org-1', descendant: 'client-2', depth: 2 }, // City General -> Sarah Johnson
		{ ancestor: 'org-1', descendant: 'client-3', depth: 2 }, // City General -> Michael Brown
		{ ancestor: 'org-2', descendant: 'client-3', depth: 2 }, // Regional -> Michael Brown

		// Clients -> Episodes (depth 1)
		{ ancestor: 'client-1', descendant: 'episode-1', depth: 1 }, // John -> Chest Pain
		{ ancestor: 'client-1', descendant: 'episode-2', depth: 1 }, // John -> Follow-up
		{ ancestor: 'client-2', descendant: 'episode-3', depth: 1 }, // Sarah -> Routine Checkup

		// Teams -> Episodes (depth 2, through clients)
		{ ancestor: 'team-1', descendant: 'episode-1', depth: 2 }, // Cardiology -> Chest Pain
		{ ancestor: 'team-1', descendant: 'episode-2', depth: 2 }, // Cardiology -> Follow-up
		{ ancestor: 'team-1', descendant: 'episode-3', depth: 2 }, // Cardiology -> Routine Checkup

		// Orgs -> Episodes (depth 3, through teams and clients)
		{ ancestor: 'org-1', descendant: 'episode-1', depth: 3 }, // City General -> Chest Pain
		{ ancestor: 'org-1', descendant: 'episode-2', depth: 3 }, // City General -> Follow-up
		{ ancestor: 'org-1', descendant: 'episode-3', depth: 3 }  // City General -> Routine Checkup
	];
}

function getSeedNotes() {
	return [
		{
			id: 'note-1',
			content: 'Patient presents with chest pain. ECG shows normal sinus rhythm. Vital signs stable.',
			attachedToId: 'episode-1',
			attachedToType: 'episode',
			tags: JSON.stringify(['Urgent', 'Assessment']),
			createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString()
		},
		{
			id: 'note-2',
			content: 'Cardiology department meeting scheduled for next week to discuss new protocols.',
			attachedToId: 'team-1',
			attachedToType: 'team',
			tags: JSON.stringify(['Follow-up']),
			createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString()
		},
		{
			id: 'note-3',
			content: 'Patient education provided regarding heart-healthy lifestyle choices.',
			attachedToId: 'client-1',
			attachedToType: 'client',
			tags: JSON.stringify([]),
			createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString()
		},
		{
			id: 'note-4',
			content: 'Prescribed Lisinopril 10mg daily for hypertension. Patient advised to monitor blood pressure at home.',
			attachedToId: 'episode-2',
			attachedToType: 'episode',
			tags: JSON.stringify(['Medication', 'Follow-up']),
			createdAt: new Date('2024-01-02T08:30:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-02T08:30:00.000Z').toISOString()
		},
		{
			id: 'note-5',
			content: 'Emergency department protocol updated for triage procedures. All staff to review by end of week.',
			attachedToId: 'team-2',
			attachedToType: 'team',
			tags: JSON.stringify(['Urgent']),
			createdAt: new Date('2024-01-02T10:15:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-02T10:15:00.000Z').toISOString()
		},
		{
			id: 'note-6',
			content: 'Patient reports improvement in symptoms. Blood pressure readings within normal range.',
			attachedToId: 'client-2',
			attachedToType: 'client',
			tags: JSON.stringify(['Assessment']),
			createdAt: new Date('2024-01-03T14:20:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-03T14:20:00.000Z').toISOString()
		},
		{
			id: 'note-7',
			content: 'Routine checkup completed. All vital signs normal. Next appointment scheduled in 6 months.',
			attachedToId: 'episode-3',
			attachedToType: 'episode',
			tags: JSON.stringify([]),
			createdAt: new Date('2024-01-03T16:45:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-03T16:45:00.000Z').toISOString()
		},
		{
			id: 'note-8',
			content: 'Patient experiencing severe allergic reaction. Administered epinephrine. Monitoring closely.',
			attachedToId: 'client-3',
			attachedToType: 'client',
			tags: JSON.stringify(['Urgent', 'Medication']),
			createdAt: new Date('2024-01-04T11:30:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-04T11:30:00.000Z').toISOString()
		},
		{
			id: 'note-9',
			content: 'New pediatric guidelines received from health ministry. Training session to be organized.',
			attachedToId: 'team-3',
			attachedToType: 'team',
			tags: JSON.stringify(['Follow-up']),
			createdAt: new Date('2024-01-04T13:00:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-04T13:00:00.000Z').toISOString()
		},
		{
			id: 'note-10',
			content: 'Patient discharged with home care instructions. Family members briefed on care procedures.',
			attachedToId: 'org-1',
			attachedToType: 'organisation',
			tags: JSON.stringify([]),
			createdAt: new Date('2024-01-05T09:15:00.000Z').toISOString(),
			updatedAt: new Date('2024-01-05T09:15:00.000Z').toISOString()
		}
	];
}

// Seed database with initial data using bulk inserts
async function seedDatabase(db) {
	console.log('Seeding database with initial data');

	try {
		// insert users
		console.log('Creating users');
		const seedUsers = getSeedUsers();
		await db.insert(users).values(seedUsers).onConflictDoNothing();

		// insert hierarchy nodes
		console.log('Creating hierarchy nodes');
		const seedHierarchyNodes = getSeedHierarchyNodes();
		await db.insert(hierarchyNodes).values(seedHierarchyNodes).onConflictDoNothing();

		// insert notes
		console.log('Creating notes');
		const seedNotes = getSeedNotes();
		await db.insert(notes).values(seedNotes).onConflictDoNothing();

		// insert closure relationships
		console.log('Creating hierarchy relationships');
		const seedClosureRelationships = getSeedClosureRelationships();
		await db.insert(hierarchyClosure).values(seedClosureRelationships).onConflictDoNothing();

	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}

export { seedDatabase };