import { Component } from '@angular/core';

import { TimePicker } from '../components';

@Component({
  selector: 'time-picker-page',
  directives: [
    TimePicker
  ],
  templateUrl: './time-picker.template.html'
})
export class TimePickerPage {

  private startTime: Date
  private endTime: Date
  private currentTime: Date

  ngOnInit() {
    let date = new Date()
    date.setDate(date.getDate() + 1)
    this.startTime = new Date(date.toString())
    this.startTime.setHours(5)
    this.startTime.setMinutes(30)
    this.endTime = new Date(date.toString())
    this.endTime.setHours(8)
    this.endTime.setMinutes(45)
    this.currentTime = new Date(date.toString())
    this.currentTime.setHours(6)
    this.currentTime.setMinutes(30)
  }

  selectTime(date: Date) {
    console.log(date)
  }

}
