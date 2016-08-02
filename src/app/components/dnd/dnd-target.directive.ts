import { Directive, Input, Output, OnInit, OnDestroy,
  ViewContainerRef, EventEmitter } from '@angular/core'
import { Subject } from 'rxjs/Subject'

import { DnDService } from './dnd.service'
import { forEach } from 'lodash'

import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/takeLast'
import 'rxjs/add/operator/map'

@Directive({
  selector: '[dnd-target]'
})
export class DnDTarget implements OnInit, OnDestroy {

  @Input('dnd-target') key = ''

  @Input() customRenderFn

  // element is added to the current list
  @Output() onAdd = new EventEmitter()

  // element is removed from the current list
  @Output() onRemove = new EventEmitter()

  // changed sorting within the current list
  @Output() onUpdate = new EventEmitter()

  // element entered container
  @Output() onEnter = new EventEmitter()

  // element left container
  @Output() onLeave = new EventEmitter()

  // element moving inside container
  @Output() onMove = new EventEmitter()

  private dragEnter$ = new Subject<any>()
  private dragLeave$ = new Subject<any>()
  private dragMove$ = new Subject<any>()
  private dragEnd$ = new Subject<any>()

  private subscription1
  private subscription2
  private subscription3
  private subscription4
  private scrollIntervalId
  private triggerScroll = true

  constructor(
    private dndService: DnDService,
    private viewContainerRef: ViewContainerRef
  ) {
  }

  ngOnInit() {
    this.dndService.addTarget(this.viewContainerRef.element.nativeElement, {
      dragEnd$: this.dragEnd$,
      dragMove$: this.dragMove$,
      dragEnter$: this.dragEnter$,
      dragLeave$: this.dragLeave$,
      key: this.key
    })

    let dropTarget = this.viewContainerRef.element.nativeElement
    this.subscription1 = this.dragEnd$.debounceTime(30).subscribe((o) => {
      let insertIndex
      forEach(dropTarget.children, (child, i) => {
        if (child === o.reference) {
          insertIndex = i
        }
      })
      if (dropTarget === o.parent) { // source within target
        if (insertIndex) {
          this.onUpdate.emit({removeIndex: o.payload.sourceIndex, insertIndex: insertIndex})
        } else {
          this.onRemove.emit({removeIndex: o.payload.sourceIndex})
        }
      } else {
        this.onAdd.emit({insertIndex: insertIndex})
      }
      window.clearInterval(this.scrollIntervalId)
    })

    this.subscription2 = this.dragMove$.subscribe((o) => {
      this.onMove.emit('DRAG Move')
      this.render(dropTarget, o)
      if (this.triggerScroll) {
        this.scroll(dropTarget, o)
      }
    })

    this.subscription3 = this.dragEnter$.subscribe((o) => {
      this.onEnter.emit('DRAG Enter')
      this.triggerScroll = true
    })
    this.subscription4 = this.dragLeave$.subscribe((o) => {
      this.onLeave.emit('DRAG Leave')
      window.clearInterval(this.scrollIntervalId)
      this.triggerScroll = false
    })

  }

  ngOnDestroy() {
    this.dndService.removeTarget(this.viewContainerRef.element.nativeElement)

    this.subscription1.unsubscribe()
    this.subscription2.unsubscribe()
    this.subscription3.unsubscribe()
    this.subscription4.unsubscribe()
  }

  private render(dropTarget, o) {
    if (typeof this.customRenderFn === 'function') {
      this.customRenderFn(dropTarget, o)
    } else {
      dropTarget.insertBefore(o.dragSource, o.reference)
    }
  }

  private scroll(dropTarget, o) {
    let x = o.event.clientX
    let y = o.event.clientY
    let rect = dropTarget.getBoundingClientRect()
    let elemRect = o.dragSource.getBoundingClientRect()
    let xOffset = Math.round(elemRect.width / 4)
    let yOffset = Math.round(elemRect.height / 4)

    let vx = (Number(Math.abs(rect.right - x) <= xOffset)) - (Number(Math.abs(rect.left - x) <= xOffset))
    let vy = (Number(Math.abs(rect.bottom - y) <= yOffset)) - (Number(Math.abs(rect.top - y) <= yOffset))

    window.clearInterval(this.scrollIntervalId)
    if (vx !== 0 || vy !== 0) {
      this.scrollIntervalId = window.setInterval(() => {
        if (vx) {
          dropTarget.scrollLeft += vx * xOffset
        }
        if (vy) {
          dropTarget.scrollTop += vy * yOffset
        }
      }, 24)
    }
  }

}
