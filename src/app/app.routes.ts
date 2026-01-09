import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { SignUp } from './components/sign-up/sign-up';
import { Dashboard } from './components/dashboard/dashboard';
import { Layout } from './components/layout/layout';
import { Dashboard2 } from './components/dashboard2/dashboard2';
import { Product } from './components/product/product';
import { CategoryList } from './components/category-list/category-list';
import { Category } from './components/category/category';

// In your routing module (e.g., app.routes.ts)
export const routes: Routes = [
  {
    path: "login",
    component: Login
  },
  {
    path: "signup",  // Make sure you have this route
    component: SignUp
  },
  {
    path: "",  // Default route
    redirectTo: "/login",
    pathMatch: "full"
  },
  // {
  //   path: "dashboard",  // Make sure you have this route
  //   component: Dashboard
  // },
  {
    path: "home", 
    component: Layout,
    children:[
      {
        path: "",  // Default route
        component: Dashboard
      },
      {
        path:"dashboard",
        component: Dashboard
      },
      {
        path:"dashboard2",
        component: Dashboard2
      },
      {
        path:"category",
        component: Category
      },
      {
        // Edit existing category (with ID parameter)
        path: "category/edit/:id",
        component: Category
      },
      {
        path:"categorylist",
        component: CategoryList
      },
      {
        path:"product",
        component: Product
      }
      
    ]
  },
];