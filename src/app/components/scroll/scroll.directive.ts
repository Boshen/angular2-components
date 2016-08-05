import { Directive, ElementRef } from '@angular/core'

import { isNumber } from 'lodash'

@Directive({
  selector: '[scroll]'
})
export class ScrollDirective {

  private el: HTMLElement

  constructor(el: ElementRef) {
    this.el = el.nativeElement
  }

  public scrollToTop() {
    this.el.scrollTop = 0
  }

  public scrollToIndex(index) {
    if (!this.hasScroll()) {
      return
    }
    if (!isNumber(index) || index < 0 || index >= this.el.children.length) {
      return
    }
    let child = this.el.children[index]
    let childHeight = child.getBoundingClientRect().height
    let parentHeight = this.el.getBoundingClientRect().height
    let to = childHeight * (index + 1) + childHeight / 2 - parentHeight
    this.scrollTo(this.el, to, 200)
  }

  public scrollTo(element, to, duration) {
    if (duration <= 0) {
      return
    }
    let diff = to - element.scrollTop
    let tick = diff / duration * 10
    window.setTimeout(() => {
      element.scrollTop = element.scrollTop + tick
      if (element.scrollTop === to) {
        return
      }
      this.scrollTo(element, to, duration - 10)
    }, 10)
  }

  private hasScroll() {
    let css = window.getComputedStyle(this.el)
    return css.maxHeight && css.overflowY === 'auto'
  }

}
