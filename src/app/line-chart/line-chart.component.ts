import { Component } from '@angular/core'

import { range } from 'lodash'

@Component({
  selector: 'line-chart-page',
  styleUrls: [ './line-chart.style.css' ],
  templateUrl: './line-chart.template.html'
})
export class LineChartPage {

  private _lineChartData = range(32).map(this._data)

  // ngAfterViewInit() {
    // setTimeout(() => {
      // this._lineChartData = range(Math.round(Math.random() * 20)).map(this._data)
    // }, 1000)
  // }

  private _data(i) {
    let date = new Date()
    date.setDate(i)
    let y = 32 - i - 1 // Math.round(Math.random() * 100)
    return {
      x: date,
      y: y < 0 ? 0 : y
    }
  }

}
