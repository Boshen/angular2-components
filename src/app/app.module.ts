import { NgModule } from '@angular/core'
import { DeprecatedFormsModule } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component'
import { routes } from './app.routes'

import { Home } from './home'
import { DatePickerPage } from './date-picker'
import { PieChartPage } from './pie-chart'
import { LineChartPage } from './line-chart'
import { ComponentsModule } from './components'

@NgModule({
  declarations: [
    AppComponent,
    Home,
    DatePickerPage,
    PieChartPage,
    LineChartPage
  ],
  imports: [
    BrowserModule,
    DeprecatedFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    ComponentsModule
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
