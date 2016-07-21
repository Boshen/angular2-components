import { Component } from '@angular/core';

import { DatePicker } from '../components';

@Component({
  selector: 'date-picker',
  providers: [
  ],
  directives: [
    DatePicker
  ],
  pipes: [
  ],
  templateUrl: './date-picker.template.html'
})
export class DatePickerPage {

  constructor(
  ) {
  }

  ngOnInit() {
  }

  selectDate(date: Date) {
    console.log(date)
  }
}
