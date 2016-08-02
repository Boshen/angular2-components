import { Directive, Input, Output, OnInit, OnDestroy,
  ViewContainerRef, EventEmitter } from '@angular/core'
import { Subject } from 'rxjs/Subject'

import { DnDService } from './dnd.service'
import { forEach } from 'lodash'

import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/takeLast'
import 'rxjs/add/operator/map'

@Directive({
  selector: '[dnd-target]'
})
export class DnDTarget implements OnInit, OnDestroy {

  @Input('dnd-target') key = ''

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
    this.subscription1 = this.dragEnd$.subscribe((o) => {
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
    })

    this.subscription2 = this.dragMove$.subscribe((o) => {
      this.onMove.emit('DRAG MOVE')
      dropTarget.insertBefore(o.dragSource, o.reference)
    })

    this.subscription3 = this.dragEnter$.subscribe((o) => {
      this.onEnter.emit('DRAG Enter')
    })
    this.subscription4 = this.dragLeave$.subscribe((o) => {
      this.onLeave.emit('DRAG Leave')
    })

  }

  ngOnDestroy() {
    this.dndService.removeTarget(this.viewContainerRef.element.nativeElement)

    this.subscription1.unsubscribe()
    this.subscription2.unsubscribe()
    this.subscription3.unsubscribe()
    this.subscription4.unsubscribe()
  }

}
