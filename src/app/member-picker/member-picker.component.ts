import { Component } from '@angular/core';

import { MemberPicker } from '../components';
import { range } from 'lodash'

@Component({
  selector: 'member-picker-page',
  directives: [
    MemberPicker
  ],
  templateUrl: './member-picker.template.html'
})
export class MemberPickerPage {

  private _members = range(20).map((i) => {
    return { value: i, title: 'Member ' + i }
  })

  private _selectMember(member) {
    console.log(member)
  }
}
