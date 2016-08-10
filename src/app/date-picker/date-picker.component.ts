import { Component } from '@angular/core';

@Component({
  selector: 'date-picker-page',
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
