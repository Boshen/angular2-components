import { Component, Input, Output, EventEmitter,
  ViewContainerRef, AfterViewInit } from '@angular/core'

import * as d3 from 'd3'
import { min, sum, filter, map } from 'lodash'

export interface PieChartItem {
  id: string | number
  value: number
}

export type PieChartData = PieChartItem[]

@Component({
  selector: 'pie-chart',
  template: '<svg></svg>'
})
export class PieChart implements AfterViewInit {

  @Input() data: PieChartData

  @Output() onClick: EventEmitter<PieChartItem> = new EventEmitter<PieChartItem>()

  constructor(
    private viewContainerRef: ViewContainerRef
  ) { }

  ngAfterViewInit() {
    let render = this.getPieChart(this.viewContainerRef.element.nativeElement)
    render(this.data, this.colorFn())
  }

  private getPieChart(element) {
    let animateSpeed = 1000
    let pieSliceOffset = 10
    let margin = { top: 0, right: 0, bottom: 0, left: 0 }

    let rect = element.getBoundingClientRect()
    let width = rect.width - margin.left - margin.right
    let height = rect.height - margin.top - margin.bottom
    let elem = element.getElementsByTagName('svg')[0]

    let radius = min([width, height]) / 2

    let svg =
      d3.select(elem)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    let g =
      svg.append('g')
        .attr('transform', `translate(${width / 2},${radius + pieSliceOffset + margin.top})`)

    let slicesContainer =
      g.append('g')
        .attr('class', 'slices')

    let arc =
      d3.svg.arc()
        .outerRadius(radius * 0.7)
        .innerRadius(0)

    let pie =
      d3.layout.pie<PieChartItem>()
        .value((d) => d.value)
        .sort((a, b) => {
          return b.value - a.value
        })

    let sliceOut = (id) => {
      if (id) {
        svg
          .selectAll('.slice')
          .filter((d) => d.data.id === id)
          .interrupt()
          .transition()
          .ease('linear')
          .attr('transform', (d) => {
            let c = arc.centroid(d)
            let x = c[0]
            let y = c[1]
            let h = Math.sqrt(x * x + y * y)
            return `translate(${x / h * pieSliceOffset},${y / h * pieSliceOffset})`
          })
      } else {
        svg
          .selectAll('.slice')
          .interrupt()
          .transition()
          .ease('linear')
          .attr('transform', (d) => 'translate(0,0)')
      }
    }

    let onClick = this.onClick

    return (data, colorFn) => {
      if (data.length === 0) {
        return
      }

      let total = sum(map(data, 'value'))

      data = filter(data, (d: PieChartItem) => {
        return d.value / total > 1e-6
      })

      let pieData = pie(data)

      let path =
        slicesContainer.selectAll('path')
          .data(pieData)

      path
        .exit()
        .on('click', null)
        .on('mouseover', null)
        .on('mouseout', null)
        .transition()
        .duration(animateSpeed)
        .style('opacity', 1e-6)
        .remove()

      path
        .enter()
        .append('path')
        .attr('class', 'slice')
        .style('opacity', 1e-6)

      path
        .on('click', null)
        .on('mouseover', null)
        .on('mouseout', null)
        .style('fill', (d: any) => colorFn(d.data.id))
        .transition()
        .duration(animateSpeed)
        .style('opacity', 1)
        .attr('cursor', 'pointer')
        .attrTween('d', function(d) {
          this.current = this.current || {startAngle: 0, endAngle: 0, value: 0}
          let interpolate = d3.interpolate(this.current, <any> d)
          this.current = interpolate(0)
          return function(t) {
            return arc(<any> interpolate(t))
          }
        })
        .each('end', function() {
          d3.select(this)
            .on('click', (d) => {
              onClick.emit(d.data)
            })
            .on('mouseover', (d) => {
              sliceOut(d.data.id)
            })
            .on('mouseout', () => {
              sliceOut(null)
            })
        })

    }
  }

  private colorFn() {
    let colors = [
      '#1C3144',
      '#D00000',
      '#FFBA08',
      '#A2AEBB',
      '#3F88C5'
    ]
    return d3.scale.ordinal().range(colors)
  }

}
