import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	password: text('password').notNull(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	role: text('role').notNull().default('user'),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Hierarchy nodes table
export const hierarchyNodes = sqliteTable('hierarchy_nodes', {
	id: text('id').primaryKey(),
	type: text('type').notNull(), // 'organisation', 'team', 'client', 'episode'
	name: text('name').notNull(),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Notes Table
export const notes = sqliteTable('notes', {
	id: text('id').primaryKey(),
	content: text('content').notNull(),
	attachedToId: text('attached_to_id').notNull().references(() => hierarchyNodes.id, { onDelete: 'cascade' }),
	attachedToType: text('attached_to_type').notNull(),
	tags: text('tags'), // JSON string array of custom tags
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// File attachments table
export const attachments = sqliteTable('attachments', {
	id: text('id').primaryKey(),
	noteId: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	path: text('path').notNull(),
	createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Hierarchy closure table for relationships
export const hierarchyClosure = sqliteTable('hierarchy_closure', {
	ancestor: text('ancestor').notNull().references(() => hierarchyNodes.id, { onDelete: 'cascade' }),
	descendant: text('descendant').notNull().references(() => hierarchyNodes.id, { onDelete: 'cascade' }),
	depth: integer('depth').notNull(), // 0 = self, 1 = direct child, 2 = grandchild, etc.
}, (table) => ({ // Compose primary key
	pk: primaryKey({ columns: [table.ancestor, table.descendant] }),
}));