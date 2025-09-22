import { db } from './connection.js';
import { hierarchyNodes, hierarchyClosure, notes } from './schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
/**
 * Get nodes by type (e.g., all organisations)
 */
export async function getNodesByType(type) {
    return db.select()
        .from(hierarchyNodes)
        .where(eq(hierarchyNodes.type, type))
        .orderBy(hierarchyNodes.createdAt);
}

/**
 * Get all children of a node at a specific depth (1 = direct children)
 */
export async function getChildren(nodeId, depth = 1) {
    return db.select({
        id: hierarchyNodes.id,
        type: hierarchyNodes.type,
        name: hierarchyNodes.name,
        createdAt: hierarchyNodes.createdAt,
        updatedAt: hierarchyNodes.updatedAt,
    })
        .from(hierarchyNodes)
        .innerJoin(hierarchyClosure, eq(hierarchyNodes.id, hierarchyClosure.descendant))
        .where(and(
            eq(hierarchyClosure.ancestor, nodeId),
            eq(hierarchyClosure.depth, depth)
        ))
        .orderBy(hierarchyNodes.createdAt);
}