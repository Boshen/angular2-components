import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { DatePipe } from '@angular/common'

import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { range } from 'lodash'

import { MenuService } from '../menu'
import { ScrollDirective } from '../scroll'

import 'rxjs/add/operator/startWith'

const TIME_REG = /^(([01]?[0-9])|(2[0-3])):[0-5]?[0-9]$/

@Component({
  selector: 'time-picker',
  providers: [
    MenuService
  ],
  directives: [
    ScrollDirective
  ],
  templateUrl: './time-picker.template.html',
  styleUrls: [ './time-picker.style.css' ]
})
export class TimePicker {

  @Input() currentTime: Date = new Date()
  @Input() startTime: Date
  @Input() endTime: Date
  @Input() hourStep: number = 1
  @Input() minuteStep: number = 15

  @Output() selectTime: EventEmitter<Date> = new EventEmitter<Date>()

  @ViewChild(ScrollDirective) private scroll: ScrollDirective

  private list$: Observable<any>
  private query$: Observable<any>
  private disableButton$: Observable<any>

  private subscription1: Subscription
  private subscription2: Subscription

  constructor(
    private menuService: MenuService
  ) { }

  ngOnInit() {
    let startOfDay = new Date(this.currentTime.toString())
    startOfDay.setHours(0)
    startOfDay.setMinutes(0)

    let endOfDay = new Date(this.currentTime.toString())
    endOfDay.setHours(23)
    endOfDay.setMinutes(45)

    let startTime = this.startTime || startOfDay
    let endTime = this.endTime || endOfDay

    let list = this.generateList(startTime, endTime)
    let state$ = this.menuService.construct({
      initialList: list,
      selected: this.currentTime.getTime(),
      scroll: this.scroll,
      filterFn: null
    })

    this.list$ = state$.map((state) => state.list)
    this.query$ = state$.map((state) => state.query)

    this.subscription1 = this.menuService.selectItem$
      .subscribe((item) => this.onSelectTime(item.time))

    this.subscription2 = this.menuService.submitInput$
      .subscribe((query) => {
        console.log(query)
        if (!this.disableButton(query, startTime, endTime)) {
          let time = this.queryToTime(query)
          this.onSelectTime(time)
          this.menuService.onClear()
        }
      })

    this.disableButton$ = state$
      .startWith({query: ''})
      .map((state) => this.disableButton(state.query, startTime, endTime))
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe()
    this.subscription2.unsubscribe()
    this.menuService.destruct()
  }

  generateList(startTime: Date, endTime: Date) {
    let list = []
    let tmpDate = new Date(startTime.toString())
    range(0, 24, this.hourStep).forEach((i) => {
      range(0, 59, this.minuteStep).forEach((j) => {
        let date = new Date(tmpDate.toString())
        date.setHours(i)
        date.setMinutes(j)
        if (date >= startTime && date <= endTime) {
          list.push({
            title: new DatePipe().transform(date, 'HH:mm'),
            value: date.getTime(),
            time: date
          })
        }
      })
    })
    return list
  }

  changeQuery(query) {
    this.menuService.onInputChange(query)
  }

  onSelectTime(item) {
    this.selectTime.emit(item)
  }

  disableButton(query, startTime, endTime) {
    if (!TIME_REG.test(query)) {
      return true
    }
    let date = this.queryToTime(query)
    return !(date >= startTime && date <= endTime)
  }

  queryToTime(query) {
    let split = query.split(':')
    let hours = Number(split[0])
    let minutes = Number(split[1])
    let date = new Date(this.currentTime.toString())
    date.setHours(hours)
    date.setMinutes(minutes)
    return date
  }

  onSubmit() {
    this.menuService.onSubmit()
    this.menuService.onClear()
  }

}
