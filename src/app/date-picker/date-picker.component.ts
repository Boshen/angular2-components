import { Component } from '@angular/core';

import { DatePicker } from '../components';

@Component({
  selector: 'date-picker',
  directives: [
    DatePicker
  ],
  templateUrl: './date-picker.template.html'
})
export class DatePickerPage {

  startDate: Date

  ngOnInit() {
    let date = new Date()
    date.setDate(date.getDay() + 1) // tomorrow
    this.startDate = date
  }

  selectDate(date: Date) {
    console.log(date)
  }
}
