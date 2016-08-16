/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.style.css'
  ],
  template: `
    <nav>
      <span>
        <a [routerLink]=" ['./'] ">
          Index
        </a>
        |
        <a [routerLink]=" ['./date-picker'] ">
          Date Picker
        </a>
        |
        <a [routerLink]=" ['./pie-chart'] ">
          Pie Chart
        </a>
        |
        <a [routerLink]=" ['./line-chart'] ">
          Line Chart
        </a>
      </span>
    </nav>

    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
}
