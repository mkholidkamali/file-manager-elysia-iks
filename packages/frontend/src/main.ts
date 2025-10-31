import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

// PrimeVue imports
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// Tailwind CSS
import './assets/css/tailwind.css';

// Import PrimeVue components
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Toolbar from 'primevue/toolbar';
import Breadcrumb from 'primevue/breadcrumb';
import PanelMenu from 'primevue/panelmenu';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ContextMenu from 'primevue/contextmenu';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

// Import routes
import routes from './router/index';

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Create pinia store
const pinia = createPinia();

// Create app
const app = createApp(App);

// Use plugins
app.use(PrimeVue);
app.use(router);
app.use(pinia);
app.use(ToastService);
app.use(ConfirmationService);

// Register components
app.component('Splitter', Splitter);
app.component('SplitterPanel', SplitterPanel);
app.component('Toolbar', Toolbar);
app.component('Breadcrumb', Breadcrumb);
app.component('PanelMenu', PanelMenu);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ContextMenu', ContextMenu);
app.component('Dialog', Dialog);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Toast', Toast);
app.component('FileUpload', FileUpload);
app.component('Button', Button);
app.component('InputText', InputText);

// Mount app
app.mount('#app');
