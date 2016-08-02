import { Component, ViewEncapsulation } from '@angular/core'

import { DnDSource, DnDTarget } from '../components'

@Component({
  selector: 'dnd-page',
  providers: [
  ],
  directives: [
    DnDSource,
    DnDTarget
  ],
  pipes: [
  ],
  styleUrls: ['./dnd.style.css'],
  templateUrl: './dnd.template.html',
})
export class DnDPage {
  private list = [
    1,2,3,4,5,6,7,8
  ]

  constructor(
  ) {
  }

  dndOptions = {
    test: 'test'
  }

  onSourceStart(data) {
    console.log('source start', data)
  }

  onSourceMove(data) {
    console.log('source move', data)
  }

  onSourceEnd(data) {
    console.log('source end', data)
  }

  onTargetAdd(data) {
    console.log('target add', data)
  }

  onTargetRemove(data) {
    console.log('target remove', data)
  }

  onTargetUpdate(data) {
    console.log('target update', data)
  }

  onTargetEnter(data) {
    console.log('target enter', data)
  }

  onTargetLeave(data) {
    console.log('target leave', data)
  }

  onTargetMove(data) {
    console.log('target move', data)
  }

}
