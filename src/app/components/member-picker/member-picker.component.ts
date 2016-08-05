import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { Observable } from 'rxjs/Observable'

import { MenuService } from '../menu'
import { ScrollDirective } from '../scroll'

@Component({
  selector: 'member-picker',
  providers: [
    MenuService
  ],
  directives: [
    ScrollDirective
  ],
  templateUrl: './member-picker.template.html',
  styleUrls: [ './member-picker.style.css' ]
})
export class MemberPicker {

  @Input('members') list

  @Output() selectMember = new EventEmitter()

  @ViewChild(ScrollDirective) private scroll: ScrollDirective

  private list$: Observable<any>

  constructor(
    private menuService: MenuService
  ) { }

  ngOnInit() {
    console.log(this)
    let state$ = this.menuService.construct({
      initialList: this.list,
      scroll: this.scroll
    })

    this.list$ = state$.map((state) => state.list)
  }

  ngOnDestroy() {
    this.menuService.destruct()
  }

}
