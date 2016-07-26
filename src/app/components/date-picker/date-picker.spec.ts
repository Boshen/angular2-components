import {
  async,
  describe,
  inject,
  it
} from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing'
import { Component, DebugElement } from '@angular/core'

import { DatePicker, Mode } from './date-picker.component'
import { locales } from './locales'

describe('DatePicker', () => {
  let builder: TestComponentBuilder
  let fixture: ComponentFixture<any>

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb
  }))

  describe('IO', () => {
    @Component({
      template: `
        <date-picker
          [startDate]="startDate"
          [language]="'zh'"
          (selectDate)="selectDate = $event"
          (onClickToday)="today = $event"
          (onClickTomorrow)="tomorrow = $event"
          (onClickClear)="clear = $event"
        >
        </date-picker>',
      `,
      directives: [ DatePicker ]
    })
    class TestIOComponent {
      startDate = new Date(2016, 6, 1)
      language = 'xxx'
    }

    let datePickerDebugElement: DebugElement
    let datePickerNativeElement: HTMLElement
    let datePickerInstance: DatePicker
    let testComponent: TestIOComponent
    let fixtureInstance
    let today

    beforeEach(async(() => {
      today = new Date(2016, 6, 20)
      jasmine.clock().mockDate(today)
      builder.createAsync(TestIOComponent).then((f) => {
        fixture = f
        fixture.detectChanges()
        fixtureInstance = fixture.componentInstance

        datePickerDebugElement = fixture.debugElement.query(By.directive(DatePicker))
        datePickerNativeElement = datePickerDebugElement.nativeElement
        datePickerInstance = datePickerDebugElement.componentInstance
        testComponent = fixture.debugElement.componentInstance
      })
    }))

    it('should handle inputs', () => {
      expect(datePickerInstance.startDate).toEqual(fixtureInstance.startDate)
    })

    it('should set default locale', () => {
      expect(datePickerInstance.locale).toEqual(locales['zh'])
    })

    it('should trigger @Output() selectDate', () => {
      let todayCell: any = datePickerNativeElement.querySelector('.cell.is-today')
      todayCell.click()
      expect(fixtureInstance.selectDate).toEqual(today)
    })

    it('should trigger @Output() onClickToday', () => {
      let todayButton: any = datePickerNativeElement.querySelector('.today')
      todayButton.click()
      expect(fixtureInstance.today).toBeDefined()
    })

    it('should trigger @Output() onClickTomorrow', () => {
      let tomorrowButton: any = datePickerNativeElement.querySelector('.tomorrow')
      tomorrowButton.click()
      expect(fixtureInstance.tomorrow).toBeDefined()
    })

    it('should trigger @Output() onClickClear', () => {
      let clearButton: any = datePickerNativeElement.querySelector('.clear')
      clearButton.click()
      expect(fixtureInstance.clear).toBeDefined()
    })

    it('should click left arrow', () => {
      spyOn(datePickerInstance, 'nextDirection').and.callThrough()
      let leftArrow: any = datePickerNativeElement.querySelector('.left-arrow')
      leftArrow.click()
      expect(datePickerInstance.nextDirection).toHaveBeenCalled()
    })

    it('should click right arrow', () => {
      spyOn(datePickerInstance, 'nextDirection').and.callThrough()
      let rightArrow: any = datePickerNativeElement.querySelector('.right-arrow')
      rightArrow.click()
      expect(datePickerInstance.nextDirection).toHaveBeenCalled()
    })

    it('should click range to change mode', () => {
      spyOn(datePickerInstance, 'prevMode').and.callThrough()
      let rangeButton: any = datePickerNativeElement.querySelector('.range')
      rangeButton.click()
      expect(datePickerInstance.prevMode).toHaveBeenCalled()
    })

  })

  describe('render', () => {
    @Component({
      template: `
        <date-picker
          [startDate]="startDate"
        >
        </date-picker>',
      `,
      directives: [ DatePicker ]
    })
    class TestRenderComponent {
      startDate = new Date(2016, 6, 19)
    }

    let datePickerDebugElement: DebugElement
    let datePickerNativeElement: HTMLElement
    let datePickerInstance: DatePicker
    let testComponent: TestRenderComponent
    let fixtureInstance
    let today

    beforeEach(async(() => {
      today = new Date(2016, 6, 20)
      jasmine.clock().mockDate(today)
      builder.createAsync(TestRenderComponent).then((f) => {
        fixture = f
        fixture.detectChanges()
        fixtureInstance = fixture.componentInstance

        datePickerDebugElement = fixture.debugElement.query(By.directive(DatePicker))
        datePickerNativeElement = datePickerDebugElement.nativeElement
        datePickerInstance = datePickerDebugElement.componentInstance
        testComponent = fixture.debugElement.componentInstance
      })
    }))

    it('should render title', () => {
      let title = datePickerNativeElement.querySelector('.range')
      expect(title.textContent.trim()).toEqual('July 2016')
    })

    it('should render arrows', () => {
      let leftArrow = datePickerNativeElement.querySelector('.left-arrow')
      expect(leftArrow.textContent.trim()).toEqual('<')
      let rightArrow = datePickerNativeElement.querySelector('.right-arrow')
      expect(rightArrow.textContent.trim()).toEqual('>')
    })

    it('should render cells', () => {
      let cells = [].slice.call(datePickerNativeElement.querySelectorAll('.cell'))

      let labelCells = cells.slice(0, 7)
      expect(labelCells.length).toEqual(7)
      labelCells.forEach((label) => {
        expect(label.classList).toContain('is-label')
        expect(label.classList).not.toContain('is-today')
        expect(label.classList).not.toContain('is-mute')
      })

      let dateCells = cells.slice(7, cells.length)
      expect(dateCells.length).toEqual(6 * 7)
      expect(dateCells[0].textContent.trim()).toEqual('26')
      dateCells.forEach((cell, i) => {
        if (i <= 4 || i >= 36) {
          expect(cell.classList).toContain('is-mute')
        }
        if (i === 23) {
          expect(cell.classList).toContain('is-selected')
        }
        if (i === 24) {
          expect(cell.classList).toContain('is-today')
        }
        expect(cell.classList).toContain('cell')
      })
    })

    it('should render footer buttons', () => {
      let todayButton = datePickerNativeElement.querySelector('.today')
      expect(todayButton.textContent.trim()).toEqual('Today')
      let tomorrowButton = datePickerNativeElement.querySelector('.tomorrow')
      expect(tomorrowButton.textContent.trim()).toEqual('Tomorrow')
      let clearButton = datePickerNativeElement.querySelector('.clear')
      expect(clearButton.textContent.trim()).toEqual('Clear')
    })

  })

  describe('method', () => {
    @Component({
      template: '<date-picker></date-picker>',
      directives: [ DatePicker ]
    })
    class TestMethodsComponent {}

    let datePickerDebugElement: DebugElement
    let datePickerNativeElement: HTMLElement
    let datePickerInstance: DatePicker
    let testComponent: TestMethodsComponent

    beforeEach(async(() => {
      builder.createAsync(TestMethodsComponent).then((f) => {
        fixture = f
        fixture.detectChanges()

        datePickerDebugElement = fixture.debugElement.query(By.directive(DatePicker))
        datePickerNativeElement = datePickerDebugElement.nativeElement
        datePickerInstance = datePickerDebugElement.componentInstance
        testComponent = fixture.debugElement.componentInstance
      })
    }))

    describe('getTitle', () => {
      let date

      beforeEach(() => {
        date = new Date(2016, 6, 20)
      })

      it('should render title for Day Mode', () => {
        let title = datePickerInstance.getTitle({currentDate: date, currentMode: Mode.Day})
        expect(title).toEqual('July 2016')
      })

      it('should render title for Month Mode', () => {
        let title = datePickerInstance.getTitle({currentDate: date, currentMode: Mode.Month})
        expect(title).toEqual('2016')
      })

      it('should render title for Year Mode', () => {
        let title = datePickerInstance.getTitle({currentDate: date, currentMode: Mode.Year})
        expect(title).toEqual('2016 - 2027')
      })

      it('should throw for other mode', () => {
        expect(() => {
          datePickerInstance.getTitle({currentDate: date, currentMode: 999})
        }).toThrow()
      })
    })

    describe('nextDirection', () => {
      let date

      beforeEach(() => {
        date = new Date(2016, 6, 20)
      })

      it('should change currentDate given direction = 1 (move right)', () => {
        let step = { years: 2, months: 2}
        let partialState = datePickerInstance.nextDirection(date, step, 1)
        expect(partialState.currentDate).toEqual(new Date(2018, 8, 1))
      })

      it('should change currentDate given direction = -1 (move left)', () => {
        let step = { years: 1, months: 1}
        let partialState = datePickerInstance.nextDirection(date, step, -1)
        expect(partialState.currentDate).toEqual(new Date(2015, 5, 1))
      })

      it('should handle null step', () => {
        let partialState = datePickerInstance.nextDirection(date, {}, -1)
        expect(partialState.currentDate).toEqual(new Date(2016, 6, 1))
      })
    })

    describe('prevMode', () => {
      let date

      beforeEach(() => {
        date = new Date(2016, 6, 20)
      })

      it('should change to start of year and Month mode if current mode is Day', () => {
        expect(datePickerInstance.prevMode(date, Mode.Day)).toEqual({
          currentMode: Mode.Month,
          currentDate: new Date(2016, 0, 1)
        })
      })

      it('should change to 6 years ago and Year mode if current mode is Month', () => {
        expect(datePickerInstance.prevMode(date, Mode.Month)).toEqual({
          currentMode: Mode.Year,
          currentDate: new Date(2010, 0, 1)
        })
      })

      it('should change nothing if current mode is Year', () => {
        expect(datePickerInstance.prevMode(date, Mode.Year)).toEqual({
          currentMode: Mode.Year,
          currentDate: date
        })
      })

      it('should throw for other mode', () => {
        expect(() => {
          datePickerInstance.nextMode(date, 999)
        }).toThrow()
      })
    })

    describe('nextMode', () => {
      let date

      beforeEach(() => {
        date = new Date(2016, 6, 20)
      })

      it('should update date and stay in Day mode if current mode is Day', () => {
        expect(datePickerInstance.nextMode(date, Mode.Day)).toEqual({
          currentMode: Mode.Day,
          currentDate: date
        })
      })

      it('should update date and change to Day mode if current mode is Month', () => {
        expect(datePickerInstance.nextMode(date, Mode.Month)).toEqual({
          currentMode: Mode.Day,
          currentDate: date
        })
      })

      it('should update date and change to Year mode if current mode is Year', () => {
        expect(datePickerInstance.nextMode(date, Mode.Year)).toEqual({
          currentMode: Mode.Month,
          currentDate: date
        })
      })

      it('should throw for other mode', () => {
        expect(() => {
          datePickerInstance.nextMode(date, 999)
        }).toThrow()
      })
    })

    describe('getToday', () => {
      it('should change state to today', () => {
        jasmine.clock().mockDate(new Date(2016, 5, 20))
        expect(datePickerInstance.getToday()).toEqual({
          currentDate: new Date(),
          currentMode: Mode.Day
        })
      })
    })

    describe('getTomorrow', () => {
      it('should change state to tomorrow', () => {
        jasmine.clock().mockDate(new Date(2016, 5, 20))
        let tmr = new Date()
        tmr.setDate(tmr.getDate() + 1)
        expect(datePickerInstance.getTomorrow()).toEqual({
          currentDate: tmr,
          currentMode: Mode.Day
        })
      })
    })

    describe('getClear', () => {
      it('should change state to start date', () => {
        expect(datePickerInstance.getClear()).toEqual({
          currentDate: datePickerInstance.startDate,
          currentMode: Mode.Day
        })
      })
    })

    describe('getRows', () => {
      let date

      beforeEach(() => {
        date = new Date(2016, 6, 20)
        spyOn(datePickerInstance, 'getDayRows')
        spyOn(datePickerInstance, 'getMonthRows')
        spyOn(datePickerInstance, 'getYearRows')
      })

      it('should call getDayRows if mode is Day', () => {
        datePickerInstance.getRows({currentDate: date, currentMode: Mode.Day})
        expect(datePickerInstance.getDayRows).toHaveBeenCalledWith(date)
        expect(datePickerInstance.getMonthRows).not.toHaveBeenCalled()
        expect(datePickerInstance.getYearRows).not.toHaveBeenCalled()
      })

      it('should call getMonthRows if mode is Month', () => {
        datePickerInstance.getRows({currentDate: date, currentMode: Mode.Month})
        expect(datePickerInstance.getDayRows).not.toHaveBeenCalled()
        expect(datePickerInstance.getMonthRows).toHaveBeenCalledWith(date)
        expect(datePickerInstance.getYearRows).not.toHaveBeenCalled()
      })

      it('should call getYearRows if mode is Year', () => {
        datePickerInstance.getRows({currentDate: date, currentMode: Mode.Year})
        expect(datePickerInstance.getDayRows).not.toHaveBeenCalled()
        expect(datePickerInstance.getMonthRows).not.toHaveBeenCalled()
        expect(datePickerInstance.getYearRows).toHaveBeenCalledWith(date)
      })

      it('should throw for other mode', () => {
        expect(() => {
          datePickerInstance.getRows({currentDate: date, currentMode: 999})
        }).toThrow()
      })
    })

    describe('getDayRows', () => {
      it('should create the correct matrix for Jul 2016 (7 * 7 matrix)', () => {
        spyOn(datePickerInstance, 'createDateObject').and.callThrough()
        let date = new Date(2016, 6, 20)
        let matrix = datePickerInstance.getDayRows(date)
        expect(matrix.length).toEqual(7) // 6 calendar rows + 1 label row
        // label row
        expect(matrix[0]).toEqual(locales.en.daysMin.map((day) => {
          return { label: day }
        }))
        // calendar rows
        matrix.slice(1, matrix.length).forEach((row, i) => {
          expect(row.length).toEqual(7)
          row.forEach((cell, j) => {
            let args = (<any>datePickerInstance.createDateObject).calls.argsFor(i * row.length + j)
            expect(args[0]).toEqual(new Date(2016, 5, 26 + i * row.length + j))
            expect(args[1]).toEqual(date)
            expect(args[2]).toEqual(Mode.Day)
          })
        })
      })

      it('should create the correct matrix for Aug 2016 (6 * 7 matrix)', () => {
        spyOn(datePickerInstance, 'createDateObject').and.callThrough()
        let date = new Date(2016, 7, 20)
        let matrix = datePickerInstance.getDayRows(date)
        expect(matrix.length).toEqual(6) // 5 calendar rows + 1 label row
        // label row
        expect(matrix[0]).toEqual(locales.en.daysMin.map((day) => {
          return { label: day }
        }))
        // calendar rows
        matrix.slice(1, matrix.length).forEach((row, i) => {
          expect(row.length).toEqual(7)
          row.forEach((cell, j) => {
            let args = (<any>datePickerInstance.createDateObject).calls.argsFor(i * row.length + j)
            expect(args[0]).toEqual(new Date(2016, 6, 31 + i * row.length + j))
            expect(args[1]).toEqual(date)
            expect(args[2]).toEqual(Mode.Day)
          })
        })
      })
    })

    describe('getMonthRows', () => {
      it('should create a 4 * 3 matrix with UI date objects', () => {
        spyOn(datePickerInstance, 'createDateObject').and.callThrough()
        let date = new Date(2016, 6, 20)
        let matrix = datePickerInstance.getMonthRows(date)
        expect(matrix.length).toEqual(4)
        matrix.forEach((row, i) => {
          expect(row.length).toEqual(3)
          row.forEach((cell, j) => {
            let args = (<any>datePickerInstance.createDateObject).calls.argsFor(i * row.length + j)
            expect(args[0]).toEqual(new Date(2016, i * row.length + j, 1))
            expect(args[1]).toEqual(date)
            expect(args[2]).toEqual(Mode.Month)
          })
        })
      })
    })

    describe('getYearRows', () => {
      it('should create a 3 * 4 matrix with UI date objects', () => {
        spyOn(datePickerInstance, 'createDateObject').and.callThrough()
        let date = new Date(2016, 6, 20)
        let matrix = datePickerInstance.getYearRows(date)
        expect(matrix.length).toEqual(3)
        matrix.forEach((row, i) => {
          expect(row.length).toEqual(4)
          row.forEach((cell, j) => {
            let args = (<any>datePickerInstance.createDateObject).calls.argsFor(i * row.length + j)
            expect(args[0]).toEqual(new Date(2016 + i * row.length + j, 0, 1))
            expect(args[1]).toEqual(date)
            expect(args[2]).toEqual(Mode.Year)
          })
        })
      })
    })

    describe('createDateObject', () => {
      let today, date, currentDate, mode

      beforeEach(() => {
        today = new Date(2016, 6, 20)
        jasmine.clock().mockDate(today)
        date = new Date(2016, 6, 21)
        currentDate = new Date(2016, 6, 20)
        mode = Mode.Day
      })

      it('should create a date object for the UI', () => {
        let object = datePickerInstance.createDateObject(date, currentDate, mode)
        expect(object.date).toEqual(date)
        expect(object.label).toBeDefined()
        expect(object.isToday).toBeDefined()
        expect(object.isMute).toBeDefined()
        expect(object.isSelected).toBeDefined()
      })

      it('should format date label', () => {
        let object = datePickerInstance.createDateObject(date, currentDate, Mode.Year)
        expect(object.label).toEqual('2016')

        object = datePickerInstance.createDateObject(date, currentDate, Mode.Month)
        expect(object.label).toEqual('Jul')

        object = datePickerInstance.createDateObject(date, currentDate, Mode.Day)
        expect(object.label).toEqual('21')

        expect(() => {
          datePickerInstance.createDateObject(date, currentDate, 999)
        }).toThrow()
      })

      it('should determine today for highlighting cell of today', () => {
        let object = datePickerInstance.createDateObject(date, currentDate, mode)
        expect(object.isToday).toBe(false)

        jasmine.clock().mockDate(date)
        object = datePickerInstance.createDateObject(date, currentDate, mode)
        expect(object.isToday).toBe(true)
      })

      it('should determine if date is in current month for muting cells in day view', () => {
        // Month View
        let object = datePickerInstance.createDateObject(date, currentDate, Mode.Month)
        expect(object.isMute).toBe(false)

        // Year View
        object = datePickerInstance.createDateObject(date, currentDate, Mode.Year)
        expect(object.isMute).toBe(false)

        // Day View
        object = datePickerInstance.createDateObject(date, currentDate, mode)
        expect(object.isMute).toBe(false)

        date = new Date(2016, 5, 30)
        object = datePickerInstance.createDateObject(date, currentDate, mode)
        expect(object.isMute).toBe(true)

        date = new Date(2016, 7, 1)
        object = datePickerInstance.createDateObject(date, currentDate, mode)
        expect(object.isMute).toBe(true)
      })

      it('should determine selected date if current mode is Day', () => {
        currentDate = new Date(2016, 6, 21)
        let object = datePickerInstance.createDateObject(date, currentDate, Mode.Day)
        expect(object.isSelected).toBe(true)

        currentDate = new Date(2016, 6, 19)
        object = datePickerInstance.createDateObject(date, currentDate, Mode.Day)
        expect(object.isSelected).toBe(false)

        object = datePickerInstance.createDateObject(date, currentDate, Mode.Month)
        expect(object.isSelected).toBe(false)

        object = datePickerInstance.createDateObject(date, currentDate, Mode.Year)
        expect(object.isSelected).toBe(false)
      })
    })

    describe('isSameDate', () => {
      let yesterday, today, tomorrow, nextmonth, prevmonth, nextyear, prevyear

      beforeEach(() => {
        yesterday = new Date(2016, 6, 19)
        today     = new Date(2016, 6, 20)
        tomorrow  = new Date(2016, 6, 21)
        nextmonth = new Date(2016, 7, 20)
        prevmonth = new Date(2016, 5, 20)
        nextyear  = new Date(2017, 6, 20)
        prevyear  = new Date(2018, 7, 20)
      })

      it('should compare day for Day mode', () => {
        expect(datePickerInstance.isSameDate(today, today, Mode.Day)).toBe(true)
        expect(datePickerInstance.isSameDate(today, tomorrow, Mode.Day)).toBe(false)
        expect(datePickerInstance.isSameDate(today, yesterday, Mode.Day)).toBe(false)
      })

      it('should compare month for Month mode', () => {
        expect(datePickerInstance.isSameDate(today, today, Mode.Month)).toBe(true)
        expect(datePickerInstance.isSameDate(today, tomorrow, Mode.Month)).toBe(true)
        expect(datePickerInstance.isSameDate(today, yesterday, Mode.Month)).toBe(true)
        expect(datePickerInstance.isSameDate(today, nextmonth, Mode.Month)).toBe(false)
        expect(datePickerInstance.isSameDate(today, prevmonth, Mode.Month)).toBe(false)
      })

      it('should compare year for Year mode', () => {
        expect(datePickerInstance.isSameDate(today, today, Mode.Year)).toBe(true)
        expect(datePickerInstance.isSameDate(today, tomorrow, Mode.Year)).toBe(true)
        expect(datePickerInstance.isSameDate(today, yesterday, Mode.Year)).toBe(true)
        expect(datePickerInstance.isSameDate(today, nextmonth, Mode.Year)).toBe(true)
        expect(datePickerInstance.isSameDate(today, prevmonth, Mode.Year)).toBe(true)
        expect(datePickerInstance.isSameDate(today, nextyear, Mode.Year)).toBe(false)
        expect(datePickerInstance.isSameDate(today, prevyear, Mode.Year)).toBe(false)
      })

      it('should should throw for other mode', () => {
        expect(() => datePickerInstance.isSameDate(today, today, 999)).toThrow()
      })
    })

    describe('getStep', () => {
      it('should return step for Day mode', () => {
        let step = datePickerInstance.getStep(Mode.Day)
        expect(step).toEqual({ months: 1 })
      })

      it('should return step for Month mode', () => {
        let step = datePickerInstance.getStep(Mode.Month)
        expect(step).toEqual({ years: 1 })
      })

      it('should return step for Year mode', () => {
        let step = datePickerInstance.getStep(Mode.Year)
        expect(step).toEqual({ years: 12 })
      })

      it('should throw for other mode', () => {
        expect(() => {
          datePickerInstance.getStep(999)
        }).toThrow()
      })
    })

  })

})
