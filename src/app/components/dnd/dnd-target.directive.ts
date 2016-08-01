import { Directive, Input, Output, OnInit, OnDestroy, ViewContainerRef, HostListener } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

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

  private dragEnd$ = new Subject<any>()
  private dragMove$ = new Subject<any>()
  private subscription1
  private subscription2

  constructor(
    private dndService: DnDService,
    private viewContainerRef: ViewContainerRef
  ) {
  }

  ngOnInit() {
    this.dndService.addTarget(this.viewContainerRef.element.nativeElement, {
      dragEnd$: this.dragEnd$,
      dragMove$: this.dragMove$,
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
        console.log('self', 'add: ',  insertIndex, 'remove: ', o.payload.sourceIndex)
      } else {
        console.log('self', 'add: ',  insertIndex)
      }
    })

    this.subscription2 = this.dragMove$.subscribe((o) => {
      dropTarget.insertBefore(o.element, o.reference)
    })
  }

  ngOnDestroy() {
    this.dndService.removeTarget(this.viewContainerRef.element.nativeElement)

    this.subscription1.unsubscribe()
    this.subscription2.unsubscribe()
  }

}
