import { RouterConfig } from '@angular/router'
import { Home } from './home'

import { DatePickerPage } from './date-picker'
import { PieChartPage } from './pie-chart'
import { LineChartPage } from './line-chart'

export const routes: RouterConfig = [
  { path: '', component: Home },
  { path: 'date-picker', component: DatePickerPage },
  { path: 'pie-chart', component: PieChartPage },
  { path: 'line-chart', component: LineChartPage }
]
