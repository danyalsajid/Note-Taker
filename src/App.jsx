import Sidebar from './components/layout/Sidebar';

export default function App() {
	return (
		<div class="d-flex">
			<Sidebar />
			<div class="flex-grow-1 p-4">
				<h1>Note Taker</h1>
				<p>Select a node from the sidebar to view notes.</p>
			</div>
		</div>
	);
}
