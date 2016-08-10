import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { PieChart } from './pie-chart.component'

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
    PieChart
  ],
  declarations: [
    PieChart
  ]
})
export class PieChartModule {}
