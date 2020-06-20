import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/modules',
    name: 'Modules',
    component: () => import('../views/Modules.vue')
  },
  {
    path: '/module/fields/:module',
    name: 'ModuleField',
    component: () => import('../views/ModuleField.vue')
  },
  {
    path: '/module/files/:module',
    name: 'ModuleFiles',
    component: () => import('../views/ModuleFiles.vue') // Generate Module File
  },
  {
    path: '/module/settings/:module',
    name: 'ModuleSettings',
    component: () => import('../views/ModuleSettings.vue') // Module Global Settings
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
