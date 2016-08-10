import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { DatePicker } from './date-picker.component'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    DatePicker
  ],
  declarations: [
    DatePicker
  ]
})
export class DatePickerModule {}
