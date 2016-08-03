import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { DatePickerModule } from './date-picker'
import { PieChartModule } from './pie-chart'
import { LineChartModule } from './line-chart'

@NgModule({
  imports: [
    CommonModule,
    DatePickerModule,
    PieChartModule,
    LineChartModule
  ],
  exports: [
    DatePickerModule,
    PieChartModule,
    LineChartModule
  ]
})
export class ComponentsModule {}
