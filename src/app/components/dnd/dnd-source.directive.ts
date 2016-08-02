import { Directive, Input, Output, OnDestroy, ViewContainerRef, HostListener, ContentChild, AfterViewInit, EventEmitter } from '@angular/core'

import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import 'rxjs/add/operator/publishReplay'

import { DnDService } from './dnd.service'

@Directive({
  selector: '[dnd-source]'
})
export class DnDSource implements OnDestroy, AfterViewInit {

  @Input('dnd-source') key = ''

  @Output() onStart = new EventEmitter()
  @Output() onMove = new EventEmitter()
  @Output() onEnd = new EventEmitter()

  @ContentChild('dndHandler') dragElement

  private dragStart$ = new Subject<any>()
  private subscription

  constructor(
    private dndService: DnDService,
    private viewContainerRef: ViewContainerRef
  ) { }

  ngAfterViewInit() {
    let dragSource = this.viewContainerRef.element.nativeElement
    let dragElement = this.dragElement ? this.dragElement.nativeElement : dragSource

    let parent = dragSource.parentNode
    let sourceIndex = Array.prototype.indexOf.call(parent.children, dragSource)
    let payload = {
      key: this.key,
      sourceIndex: sourceIndex
    }

    this.subscription = Observable.fromEvent(dragElement, 'mousedown')
      .subscribe((e) => {
        this.dragStart$.next({
          e: e,
          payload: payload
        })
        // this.onStart.emit({ removeIndex: sourceIndex })
      })

    this.dndService.addSource(dragSource, this.dragStart$, {
      onStart: this.onStart,
      onMove: this.onMove,
      onEnd: this.onEnd
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
    // this.dndService.removeSource(this.viewContainerRef.element.nativeElement)
  }

}
