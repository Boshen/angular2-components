import { Component, Input, Output, EventEmitter } from '@angular/core'
import { DatePipe } from '@angular/common'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { range } from 'lodash'

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/startWith'

export enum Mode {
  Day,
  Month,
  Year
}

export enum Action {
  MoveLeft,
  MoveRight,
  ChangeMode,
  Today,
  Tomorrow,
  Clear,
  ClickCell
}

@Component({
  selector: 'date-picker',
  directives: [
  ],
  templateUrl: './date-picker.template.html',
  styleUrls: [ './date-picker.style.css' ]
})
export class DatePicker {

  @Input() startDate: Date = new Date()

  @Input() formatDay: string = 'dd'
  @Input() formatDayHeader: string = 'EEE'
  @Input() formatDayTitle: string = 'MMMM yyyy'
  @Input() formatYear: string = 'yyyy'

  @Input() formatMonth: string = 'MMM'
  @Input() formatMonthTitle: string = 'yyyy'

  @Output() selectDate: EventEmitter<Date> = new EventEmitter<Date>()
  @Output() onClickToday: EventEmitter<Date> = new EventEmitter<Date>()
  @Output() onClickTomorrow: EventEmitter<Date> = new EventEmitter<Date>()
  @Output() onClickClear: EventEmitter<Date> = new EventEmitter<Date>()

  private YEAR_RANGE = 12

  private defaultState = {
    currentDate: this.startDate,
    currentMode: Mode.Day,
    step: this.getStep(Mode.Day)
  }

  private action$: Subject<any> = new Subject<any>()

  private state$: Observable<any> = this.action$
    .startWith(this.defaultState)
    .scan((state, action) => {
      let newState = this.reducer(state, action)
      this.sideEffect(newState, action)
      return newState
    })

  // tslint:disable-next-line: no-unused-variable
  private title$: Observable<string> = this.state$
    .map((state) => this.getTitle(state))

  // tslint:disable-next-line: no-unused-variable
  private rows$: Observable<Array<any>> = this.state$
    .map((state) => this.getRows(state))

  reducer(state, action) {
    let newPartialState
    switch (action.type) {
      case Action.MoveLeft:
        newPartialState = this.nextDirection(
          state.currentDate,
          this.getStep(state.currentMode),
          -1 // direction left
        )
        break
      case Action.MoveRight:
        newPartialState = this.nextDirection(
          state.currentDate,
          this.getStep(state.currentMode),
          1 // direction right
        )
        break
      case Action.ChangeMode:
        newPartialState = this.prevMode(state.currentDate, state.currentMode)
        break
      case Action.Today:
        newPartialState = this.getToday()
        break
      case Action.Tomorrow:
        newPartialState = this.getTomorrow()
        break
      case Action.Clear:
        newPartialState = this.getClear()
        break
      case Action.ClickCell:
        newPartialState = this.nextMode(action.data, state.currentMode)
        break
      default:
        throw new Error()
    }
    return Object.assign({}, state, newPartialState)
  }

  sideEffect(state, action) {
    switch (action.type) {
      case Action.Today:
        this.onClickToday.emit(state.currentDate)
        break
      case Action.Tomorrow:
        this.onClickTomorrow.emit(state.currentDate)
        break
      case Action.Clear:
        this.onClickClear.emit(state.currentDate)
        break
      case Action.ClickCell:
        if (state.currentMode === Mode.Day) {
          this.selectDate.emit(action.data)
        }
        break
      default:
        break
    }
  }

  moveLeft() {
    this.action$.next({ type: Action.MoveLeft })
  }

  moveRight() {
    this.action$.next({ type: Action.MoveRight })
  }

  changeMode() {
    this.action$.next({ type: Action.ChangeMode })
  }

  today() {
    this.action$.next({ type: Action.Today })
  }

  tomorrow() {
    this.action$.next({ type: Action.Tomorrow })
  }

  clear() {
    this.action$.next({ type: Action.Clear })
  }

  onClickCell(cell) {
    if (!cell.date) { // skip label cell
      return
    }
    this.action$.next({ type: Action.ClickCell, data: cell.date })
  }

  getTitle({ currentDate, currentMode }): string {
    switch (currentMode) {
      case Mode.Day:
        return new DatePipe().transform(currentDate, this.formatDayTitle)
      case Mode.Month:
        return new DatePipe().transform(currentDate, this.formatMonthTitle)
      case Mode.Year:
        let startingYear = currentDate.getFullYear()
        let endingYear = startingYear + this.YEAR_RANGE - 1
        return [
          new DatePipe().transform(new Date(startingYear, 1, 0), this.formatYear),
          new DatePipe().transform(new Date(endingYear, 1, 0), this.formatYear)
        ].join(' - ')
      default:
        throw new Error()
    }
  }

  nextDirection(date, step, direction) {
    let year = date.getFullYear() + direction * (step.years || 0)
    let month = date.getMonth() + direction * (step.months || 0)
    date = new Date(date.toString())
    date.setFullYear(year, month, 1)
    return { currentDate: date }
  }

  prevMode(currentDate, currentMode) {
    switch (currentMode) {
      case Mode.Day:
        return {
          currentMode: Mode.Month,
          currentDate: new Date(currentDate.getFullYear(), 0, 1)
        }
      case Mode.Month:
        let startYear = currentDate.getFullYear() - this.YEAR_RANGE / 2
        return {
          currentMode: Mode.Year,
          currentDate: new Date(startYear, 0, 1)
        }
      case Mode.Year:
        return {
          currentMode: Mode.Year,
          currentDate: currentDate
        }
      default:
        throw new Error()
    }
  }

  nextMode(date, mode) {
    switch (mode) {
      case Mode.Day:
        return {
          currentMode: Mode.Day,
          currentDate: date
        }
      case Mode.Month:
        return {
          currentMode: Mode.Day,
          currentDate: date
        }
      case Mode.Year:
        return {
          currentMode: Mode.Month,
          currentDate: date
        }
      default:
        throw new Error()
    }
  }

  getToday() {
    return {
      currentDate: new Date(),
      currentMode: Mode.Day
    }
  }

  getTomorrow() {
    let tmr = new Date()
    tmr.setDate(tmr.getDate() + 1)
    return {
      currentDate: tmr,
      currentMode: Mode.Day
    }
  }

  getClear() {
    return {
      currentDate: this.startDate,
      currentMode: Mode.Day
    }
  }

  getRows({ currentDate, currentMode }): Array<any> {
    switch (currentMode) {
      case Mode.Day:
        return this.getDayRows(currentDate)
      case Mode.Month:
        return this.getMonthRows(currentDate)
      case Mode.Year:
        return this.getYearRows(currentDate)
      default:
        throw new Error()
    }
  }

  getDayRows(date: Date): Array<any> {
    let year = date.getFullYear()
    let month = date.getMonth()

    let currentMonthDays = new Date(year, month + 1, 0).getDate()
    let prevMonthDays = new Date(year, month, 0).getDate()

    let firstDayOfMonth = new Date(year, month, 1)
    let lastDayOfMonth = new Date(year, month, currentMonthDays)

    let startDate = new Date(firstDayOfMonth.toString())
    if (startDate.getDay() > 0) {
      startDate = new Date(year, month - 1, prevMonthDays - startDate.getDay() + 1)
    }

    let endDate = new Date(lastDayOfMonth.toString())
    if (endDate.getDay() < 6) {
      endDate = new Date(year, month + 1, (6 - endDate.getDay()))
    }

    let days = []
    let tmpDate = new Date(startDate.toString())
    while (tmpDate.valueOf() <= endDate.valueOf()) {
      days.push(this.createDateObject(new Date(tmpDate.toString()), date, this.formatDay, Mode.Day))
      tmpDate.setDate(tmpDate.getDate() + 1)
      tmpDate = new Date(tmpDate.toString())
    }
    days = this.split(days, 7)

    let labels = days[0].map((day) => {
      return {
        label: new DatePipe().transform(day.date, this.formatDayHeader)
      }
    })

    return [labels].concat(days)
  }

  getMonthRows(date: Date): Array<any> {
    let year = date.getFullYear()
    let months = range(12).map((i) => {
      return this.createDateObject(new Date(year, i, 1), date, this.formatMonth, Mode.Month)
    })
    return this.split(months, 3)
  }

  getYearRows(date: Date): Array<any> {
    let start = date.getFullYear()
    let years = range(this.YEAR_RANGE).map((i) => {
      return this.createDateObject(new Date(start + i, 0, 1), date, this.formatYear, Mode.Year)
    })
    return this.split(years, 4)
  }

  createDateObject(date, currentDate, format, mode) {
    return {
      date: date,
      label: new DatePipe().transform(date, format),
      isToday: this.isSameDate(date, new Date(), mode),
      isMute: mode === Mode.Day ? !this.isSameDate(date, currentDate, Mode.Month) : false
    }
  }

  isSameDate(date: Date, current: Date, mode) {
    let d1, d2
    switch (mode) {
      case Mode.Day:
        d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        d2 = new Date(current.getFullYear(), current.getMonth(), current.getDate())
        break
      case Mode.Month:
        d1 = new Date(date.getFullYear(), date.getMonth())
        d2 = new Date(current.getFullYear(), current.getMonth())
        break
      case Mode.Year:
        d1 = new Date(date.getFullYear())
        d2 = new Date(current.getFullYear())
        break
      default:
        throw new Error()
    }
    return !(d1.valueOf() - d2.valueOf())
  }

  split(arr, size) {
    let arrays = []
    while (arr.length > 0) {
      arrays.push(arr.splice(0, size))
    }
    return arrays
  }

  getStep(mode): any {
    switch (mode) {
      case Mode.Day:
        return { months: 1 }
      case Mode.Month:
        return { years: 1 }
      case Mode.Year:
        return { years: this.YEAR_RANGE }
      default:
        throw new Error()
    }
  }

}
