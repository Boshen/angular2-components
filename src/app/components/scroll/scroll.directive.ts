import { Directive, ElementRef } from '@angular/core'

import { isNumber } from 'lodash'

@Directive({
  selector: '[scroll]'
})
export class ScrollDirective {

  scrollIndex: number

  private el: HTMLElement

  constructor(el: ElementRef) {
    this.el = el.nativeElement
  }

  scrollToIndex(index) {
    let css = window.getComputedStyle(this.el);
    let hasScroll = css.maxHeight && css.overflowY === 'auto';
    if (hasScroll && isNumber(index) && index >= 0 && index < this.el.children.length) {
      (<any> this.el.children[index]).scrollIntoView(true)
    }
  }

  scrollToTop() {
    this.el.scrollTop = 0
  }

}
