import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { LineChart } from './line-chart.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    LineChart
  ],
  declarations: [
    LineChart
  ]
})
export class LineChartModule {}
