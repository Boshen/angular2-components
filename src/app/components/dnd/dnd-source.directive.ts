import { Directive, Input, OnInit, OnDestroy, ViewContainerRef, HostListener } from '@angular/core'

import 'rxjs/add/operator/publishReplay'

import { DnDService } from './dnd.service'

@Directive({
  selector: '[dnd-source]'
})
export class DnDSource implements OnInit, OnDestroy {

  @Input('dnd-source') key = ''

  constructor(
    private dndService: DnDService,
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit() {
    let dropSource = this.viewContainerRef.element.nativeElement
    let parent = dropSource.parentNode
    let sourceIndex = Array.prototype.indexOf.call(parent.children, dropSource)
    let payload = {
      key: this.key,
      sourceIndex: sourceIndex
    }
    this.dndService.addSource(this.viewContainerRef.element.nativeElement, payload)
  }

  ngOnDestroy() {
    this.dndService.removeSource(this.viewContainerRef.element.nativeElement)
  }

}
