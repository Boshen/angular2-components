import { Component, Input, ViewContainerRef, AfterViewInit, OnChanges } from '@angular/core'
import { Router } from '@angular/router'

import * as d3 from 'd3'

export interface LineChartItem {
  x: Date
  y: number
}

export type LineChartData = LineChartItem[]

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.template.html',
  styleUrls: [ './line-chart.style.css' ]
})
export class LineChart implements AfterViewInit, OnChanges {

  @Input() data: LineChartData

  private render: (LineChartData) => void
  private popover = {
    display: 'none',
    top: '0px',
    left: '0px',
    text: ''
  }

  constructor(
    private viewContainerRef: ViewContainerRef,
    private router: Router
  ) { }

  ngOnChanges(changes) {
    if (this.render) {
      this.render(changes.data.currentValue)
    }
  }

  ngAfterViewInit() {
    this.render = this.getLineChart(this.viewContainerRef.element.nativeElement)
    this.render(this.data)
  }

  private getLineChart(element) {
    let margin = { top: 15, bottom: 50, left: 30, right: 15 }
    let animationSpeed = 300
    let yAxisCount = 5
    let dotRadius = 2
    let bisectData = d3.bisector((d: LineChartItem) => d.x).left
    let self = this

    let svgElem = element.getElementsByTagName('svg')[0]

    let rect = svgElem.getBoundingClientRect()
    let width = rect.width - margin.left - margin.right
    let height = rect.height - margin.top - margin.bottom

    let x = d3.time.scale().range([0, width]).nice(d3.time.day, 1)
    let y = d3.scale.linear().range([height, 0]).nice()

    let yAxis = d3.svg.axis()
      .scale(y)
      .orient('right')
      .tickSize(0)
      .ticks(yAxisCount)
      .tickFormat(d3.format(',.0f'))

    let xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(0)
      .orient('bottom')
      .tickFormat(d3.time.format('%m-%d'))

    let svg = d3.select(svgElem)
      .append('g')

    let yAxisSvg = svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(0,${margin.top})`)

    let xAxisSvg = svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(${margin.left},${height + 25})`)

    let chartContainer = svg.append('g')
      .attr('class', 'chart')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    let gridLinesContainer = chartContainer.append('g')
      .attr('class', 'grid')

    let lineChartContainer = chartContainer.append('g')
      .attr('class', 'line-chart')

    let areaChartContainer = chartContainer.append('g')
      .attr('class', 'area-chart')

    let dottedLineContainer = chartContainer.append('g')
      .attr('class', 'dotted-line')

    let dotsContainer = chartContainer.append('g')
      .attr('class', 'dots')

    let mousemoveOverlay = chartContainer.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .style('pointer-events', 'all')

    let line = d3.svg.line<LineChartItem>()
      .interpolate('linear')
      .x((d) => x(d.x))
      .y((d) => y(d.y))

    let dottedLine = d3.svg.line<LineChartItem>()
      .interpolate('linear')
      .x((d) => x(d.x))
      .y((d) => y(d.y))

    let area = d3.svg.area<LineChartItem>()
      .x((d) => x(d.x))
      .y(height)
      .y1((d) => y(d.y))

    // linear gradient for area chart
    areaChartContainer
      .append('defs')
      .append('linearGradient')
      .attr('id', 'report-chart-grad')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#3DA8F5', opacity: 0.3 },
        { offset: '100%', color: 'white', opacity: 0 }
      ])
      .enter()
      .append('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color)
      .attr('stop-opacity', (d) => d.opacity)

    return (data) => {
      if (!data.length) {
        return
      }

      // let xMax = data.length - 1
      let yMax = d3.max([1, d3.max<LineChartItem>(data, (d) => d.y)])
      x.domain([data[0].x, data[data.length - 1].x])
      y.domain([0, yMax])

      // x axis
      xAxisSvg.call(xAxis)
        .selectAll('.tick text')
        .attr('fill', '#808080')
        .style('font-size', '14px')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-40)')

      // y axis
      yAxisSvg.call(yAxis)
        .selectAll('.tick text')
        .attr('fill', '#808080')
        .style('font-size', '14px')

      // grid lines
      let gridLines = gridLinesContainer
        .selectAll('.grid')
        .data(y.ticks(yAxisCount))

      gridLines
        .exit()
        .remove()

      gridLines
        .enter()
        .append('line')
        .attr('class', 'grid')
        .attr('stroke', 'rgba(0,0,0,0.05)')
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('shape-rendering', 'crispEdges')

      gridLines
        .attr('x1', margin.left)
        .attr('x2', x(data[data.length - 1].x))
        .attr('y1', (d) => y(d))
        .attr('y2', (d) => y(d))

      // line chart
      let lineChart = lineChartContainer.selectAll('path')
        .data([data])

      lineChart
        .exit()
        .remove()

      lineChart
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke', '#3DA8F5')

      lineChart
        .transition()
        .ease('linear')
        .duration(animationSpeed)
        .attr('d', line)

      // dots
      let dots = dotsContainer
        .selectAll('circle')
        .data<LineChartItem>(data)

      dots
        .exit()
        .remove()

      dots
        .enter()
        .append('circle')
        .style('fill', '#FFF')
        .style('stroke-width', 2)
        .style('stroke', '#3DA8F5')

      dots
        .transition()
        .ease('linear')
        .duration(animationSpeed)
        .attr('cx', (d, i) => x(d.x))
        .attr('cy', (d) => y(d.y))
        .attr('r', (d) => dotRadius)

      // area chart
      let areaChart = areaChartContainer.selectAll('path')
        .data([data])

      areaChart
        .exit()
        .remove()

      areaChart
        .enter()
        .append('path')
        .attr('fill', `url(${this.router.url}#report-chart-grad)`)
        .attr('fill-opacity', 1)

      areaChart
        .transition()
        .ease('linear')
        .duration(animationSpeed)
        .attr('d', area)

      // dotted line
      let dottedData = data.length === 0 ? [] : [{
        x: data[0].x,
        y: data[0].y
      }, {
        x: data[data.length - 1].x,
        y: 0
      }]

      let dottedChart = dottedLineContainer.selectAll('path')
        .data([dottedData])

      dottedChart
        .exit()
        .remove()

      dottedChart
        .enter()
        .append('path')
        .attr('class', 'dotted')
        .attr('stroke', '#A6A6A6')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-dasharray', '5,5')

      dottedChart
        .transition()
        .ease('linear')
        .duration(animationSpeed)
        .attr('d', dottedLine)

      // show vertical and enlarge dot on mousemove
      mousemoveOverlay
        .on('mousemove', function() {
          let x0 = x.invert(d3.mouse(this)[0])
          let index = bisectData(data, x0, 1)
          let d0 = data[Math.max(0, index - 1)]
          let d1 = data[Math.min(data.length - 1, index)]
          let match = x0.getTime() - d0.x.getTime() > d1.x.getTime() - x0.getTime() ? d1 : d0

          // enlarge circle
          dotsContainer
            .selectAll('circle')
            .attr('r', (d) => d.x.getTime() === match.x.getTime() ? 5 : dotRadius)

          self.popover = {
            display: 'block',
            left: `${x(match.x)}px`,
            top: `${y(match.y)}px`,
            text: `${match.y}`
          }
        })
        .on('mouseout', function() {
          dotsContainer
            .selectAll('circle')
            .attr('r', dotRadius)

          self.popover = {
            display: 'none',
            left: '0px',
            top: '0px',
            text: ''
          }
        })
    }
  }

}
