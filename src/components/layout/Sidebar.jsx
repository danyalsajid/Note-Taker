import { createSignal, onMount, For, Show } from "solid-js";

// API base URL
const getApiBase = () => {
	const protocol = window.location.protocol;
	const hostname = window.location.hostname;
	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		return `${protocol}//localhost:3002/api`;
	}
	return `${protocol}//${hostname}/api`;
};

const API_BASE = getApiBase();

// Tree Node Component
function TreeNode({ node, level = 0 }) {
	const [isExpanded, setIsExpanded] = createSignal(false);
	const hasChildren = () => node.children && node.children.length > 0;

	const toggleExpanded = () => {
		if (hasChildren()) {
			setIsExpanded(!isExpanded());
		}
	};

	const getNodeIcon = (type) => {
		switch (type) {
			case 'organization':
				return 'fas fa-building';
			case 'team':
				return 'fas fa-users';
			case 'client':
				return 'fas fa-user';
			case 'episode':
				return 'fas fa-file-medical';
			default:
				return 'fas fa-folder';
		}
	};

	return (
		<div class="tree-node">
			<div 
				class={`tree-item d-flex align-items-center py-2 px-3 ${hasChildren() ? 'cursor-pointer' : ''}`}
				style={`padding-left: ${level * 20 + 12}px`}
				onClick={toggleExpanded}
			>
				<Show when={hasChildren()}>
					<i class={`fas ${isExpanded() ? 'fa-chevron-down' : 'fa-chevron-right'} me-2 text-muted`}></i>
				</Show>
				<Show when={!hasChildren()}>
					<span class="me-2" style="width: 12px;"></span>
				</Show>
				<i class={`${getNodeIcon(node.type)} me-2 text-primary`}></i>
				<span class="flex-grow-1">{node.name}</span>
				<Show when={node.noteCount > 0}>
					<span class="badge bg-secondary ms-2">{node.noteCount}</span>
				</Show>
			</div>
			<Show when={isExpanded() && hasChildren()}>
				<div class="tree-children">
					<For each={node.children}>
						{(child) => <TreeNode node={child} level={level + 1} />}
					</For>
				</div>
			</Show>
		</div>
	);
}

export default function Sidebar() {
	const [nodes, setNodes] = createSignal([]);
	const [loading, setLoading] = createSignal(true);
	const [isCollapsed, setIsCollapsed] = createSignal(false);

	// Transform flat data into hierarchical tree structure
	const buildHierarchy = (data) => {
		const { organisations, teams, clients, episodes, notes } = data;
		
		// Create a map to count notes for each node
		const noteCountMap = {};
		notes.forEach(note => {
			const key = note.attachedToId;
			noteCountMap[key] = (noteCountMap[key] || 0) + 1;
		});

		// Build the tree structure
		const orgTree = organisations.map(org => ({
			...org,
			noteCount: noteCountMap[org.id] || 0,
			children: teams
				.filter(team => team.parentId === org.id)
				.map(team => ({
					...team,
					noteCount: noteCountMap[team.id] || 0,
					children: clients
						.filter(client => client.parentId === team.id)
						.map(client => ({
							...client,
							noteCount: noteCountMap[client.id] || 0,
							children: episodes
								.filter(episode => episode.parentId === client.id)
								.map(episode => ({
									...episode,
									noteCount: noteCountMap[episode.id] || 0,
									children: []
								}))
						}))
				}))
		}));

		return orgTree;
	};

	// Fetch hierarchy data from backend
	const fetchNodes = async () => {
		try {
			setLoading(true);
			const res = await fetch(`${API_BASE}/data`);
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			const data = await res.json();
			const hierarchicalData = buildHierarchy(data);
			setNodes(hierarchicalData);
		} catch (err) {
			console.error("Error fetching nodes:", err);
		} finally {
			setLoading(false);
		}
	};

	const toggleSidebar = () => {
		setIsCollapsed(!isCollapsed());
	};

	onMount(fetchNodes);

	return (
		<>
			{/* Mobile toggle button */}
			<button 
				class="btn btn-primary d-md-none position-fixed"
				style="top: 10px; left: 10px; z-index: 1050;"
				onClick={toggleSidebar}
			>
				<i class="fas fa-bars"></i>
			</button>

			{/* Sidebar */}
			<div class={`sidebar bg-light border-end ${isCollapsed() ? 'collapsed' : ''}`}>
				<div class="sidebar-header p-3 border-bottom bg-primary text-white">
					<div class="d-flex justify-content-between align-items-center">
						<h5 class="mb-0">
							<i class="fas fa-sitemap me-2"></i>
							Hierarchy
						</h5>
						<button 
							class="btn btn-sm btn-outline-light d-md-none"
							onClick={toggleSidebar}
						>
							<i class="fas fa-times"></i>
						</button>
					</div>
				</div>

				<div class="sidebar-content">
					<Show when={loading()}>
						<div class="p-3 text-center">
							<div class="spinner-border spinner-border-sm me-2" role="status">
								<span class="visually-hidden">Loading...</span>
							</div>
							Loading hierarchy...
						</div>
					</Show>

					<Show when={!loading()}>
						<div class="tree-container">
							<Show when={nodes().length === 0}>
								<div class="p-3 text-muted text-center">
									<i class="fas fa-folder-open fa-2x mb-2"></i>
									<p class="mb-0">No hierarchy data found</p>
								</div>
							</Show>
							<Show when={nodes().length > 0}>
								<For each={nodes()}>
									{(node) => <TreeNode node={node} />}
								</For>
							</Show>
						</div>
					</Show>
				</div>

			</div>

			{/* Overlay for mobile */}
			<Show when={!isCollapsed()}>
				<div 
					class="sidebar-overlay d-md-none"
					onClick={toggleSidebar}
				></div>
			</Show>
		</>
	);
}
