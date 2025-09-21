/* src/index.jsx */
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { render } from 'solid-js/web';
import App from './App';
import './styles.css';

render(() => <App />, document.getElementById('root'));
