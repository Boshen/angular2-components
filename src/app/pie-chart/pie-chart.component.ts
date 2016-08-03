import { Component } from '@angular/core';

import { PieChart } from '../components'
import { range } from 'lodash'

@Component({
  selector: 'pie-chart-page',
  directives: [
    PieChart
  ],
  styleUrls: [
    './pie-chart.style.css'
  ],
  templateUrl: './pie-chart.template.html'
})
export class PieChartPage {

  private _pieChartData = range(6).map((i) => {
    return {
      id: i,
      value: i * 100
    }
  })

  private _onClickSlice(data) {
    console.log(data)
  }

}
