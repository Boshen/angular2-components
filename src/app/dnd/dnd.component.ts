import { Component } from '@angular/core'
import { range } from 'lodash'

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

  private list = range(1, 10)

  private onSourceStart(data) {
    console.log('source start', data)
  }

  private onSourceMove(data) {
    console.log('source move', data)
  }

  private onSourceEnd(data) {
    console.log('source end', data)
  }

  private onTargetAdd(data) {
    console.log('target add', data)
  }

  private onTargetRemove(data) {
    console.log('target remove', data)
  }

  private onTargetUpdate(data) {
    console.log('target update', data)
  }

  private onTargetEnter(data) {
    console.log('target enter', data)
  }

  private onTargetLeave(data) {
    console.log('target leave', data)
  }

  private onTargetMove(data) {
    console.log('target move', data)
  }

}
