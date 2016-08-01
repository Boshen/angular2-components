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
    1,2,3,4,5
  ]

  constructor(
  ) {
  }
}
