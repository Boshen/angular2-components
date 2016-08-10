import { Component } from '@angular/core';

import { range } from 'lodash'

@Component({
  selector: 'pie-chart-page',
  styleUrls: [ './pie-chart.style.css' ],
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
