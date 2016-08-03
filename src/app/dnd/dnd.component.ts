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

  private _list = range(1, 20)

  private _onSourceStart(data) {
    // console.log('source start', data)
  }

  private _onSourceMove(data) {
    // console.log('source move', data)
  }

  private _onSourceEnd(data) {
    // console.log('source end', data)
  }

  private _onTargetAdd(data) {
    // console.log('target add', data)
  }

  private _onTargetRemove(data) {
    // console.log('target remove', data)
  }

  private _onTargetUpdate(data) {
    // console.log('target update', data)
  }

  private _onTargetEnter(data) {
    // console.log('target enter', data)
  }

  private _onTargetLeave(data) {
    // console.log('target leave', data)
  }

  private _onTargetMove(data) {
    // console.log('target move', data)
  }

}
