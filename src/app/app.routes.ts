import { RouterConfig } from '@angular/router';
import { Home } from './home';

import { DatePickerPage } from './date-picker'
import { DnDPage } from './dnd'

export const routes: RouterConfig = [
  { path: '', component: Home },
  { path: 'date-picker', component: DatePickerPage },
  { path: 'dnd', component: DnDPage },
];

// Async load a component using Webpack's require with es6-promise-loader and webpack `require`
// asyncRoutes is needed for our @angularclass/webpack-toolkit that will allow us to resolve
// the component correctly

export const asyncRoutes: AsyncRoutes = {
};

// Optimizations for initial loads
// An array of callbacks to be invoked after bootstrap to prefetch async routes
export const prefetchRouteCallbacks: Array<IdleCallbacks> = [
];

// Es6PromiseLoader and AsyncRoutes interfaces are defined in custom-typings
