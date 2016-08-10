import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { DatePickerModule } from './date-picker'
import { PieChartModule } from './pie-chart'

@NgModule({
  imports: [
    CommonModule,
    DatePickerModule,
    PieChartModule,
  ],
  exports: [
    DatePickerModule,
    PieChartModule,
  ]
})
export class ComponentsModule {}
