// Apply patches first - must be before any other imports
import './src/patches/early-patch';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);