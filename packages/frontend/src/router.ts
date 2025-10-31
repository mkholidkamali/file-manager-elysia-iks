import { RouteRecordRaw } from 'vue-router';

// Define routes
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Explorer',
    component: () => import('./views/ExplorerView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./views/NotFoundView.vue')
  }
];

export default routes;