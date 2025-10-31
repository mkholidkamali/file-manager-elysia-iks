import ExplorerView from '../views/ExplorerView.vue';

const routes = [
  {
    path: '/',
    name: 'Explorer',
    component: ExplorerView
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
];

export default routes;