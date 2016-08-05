import { Injectable } from '@angular/core'
import { Observable }    from 'rxjs/Observable'
import { Subject }    from 'rxjs/Subject'

import { findIndex, isNumber } from 'lodash'

import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/startWith'

export interface MenuItem {
  title: string
  value: any
}

enum Action {
  ChangeInput,
  MoveUp,
  MoveDown,
  Submit,
  Clear
}

@Injectable()
export class MenuService {

  action$: Subject<any> = new Subject<any>()
  state$: Observable<any>

  selectItem$: Subject<any> = new Subject<any>()
  submitInput$: Subject<any> = new Subject<any>()

  private keyboardSubScription

  construct({ initialList, selected = null, filterFn = null, scroll = null }) {

      let scrollIndex = selected && findIndex(initialList || [], (item: MenuItem) => {
        return item.value === selected
      })

      let list = initialList.map((item, i) => {
        return Object.assign({}, item, {
          originalObject: item,
          __isActive__: i === scrollIndex
        })
      })

      let defaultState = {
        initialList: list,
        list: list,
        query: '',
        scroll: scroll,
        activeIndex: scrollIndex,
        filterFn: filterFn
      }

      this.state$ = this.action$
        .startWith(defaultState)
        .scan((state, action) => {
          let newState = this.reducer(state, action)
          this.sideEffect(newState, action)
          return newState
        })
        .publishReplay(1)
        .refCount()

      this.keyboardSubScription = Observable.fromEvent(document, 'keyup')
        .do(($event: any) => $event.stopPropagation())
        .map(($event: any) => $event.keyCode )
        .map((keyCode) => {
          switch (keyCode) {
            case 13: // enter
              this.onSubmit()
              break
            case 38: // up
              this.action$.next({ type: Action.MoveUp })
              break
            case 40: // down
              this.action$.next({ type: Action.MoveDown })
              break
            default:
              break
          }
        })
        .subscribe()

      return this.state$
  }

  destruct() {
    this.keyboardSubScription.unsubscribe()
  }

  reducer(state, action) {
    let partialState
    switch (action.type) {
      case Action.ChangeInput:
        partialState = this.changeInput(state, action.payload)
        break
      case Action.MoveUp:
        partialState = this.moveUp(state)
        break
      case Action.MoveDown:
        partialState = this.moveDown(state)
        break
      case Action.Clear:
        partialState = {
          list: state.initialList,
          query: '',
          activeIndex: -1
        }
        break
      default:
        partialState = {}
    }
    return Object.assign({}, state, partialState)
  }

  sideEffect(state, action) {
    switch (action.type) {
      case Action.Submit:
        if (isNumber(state.activeIndex) &&
            state.activeIndex >= 0 && state.activeIndex <= state.list.length) {
          this.selectItem$.next(state.list[state.activeIndex].originalObject)
          if (state.scroll) {
            state.scroll.scrollToTop()
          }
        } else if (state.query.length) {
          this.submitInput$.next(state.query)
          if (state.scroll) {
            state.scroll.scrollToTop()
          }
        }
        break
      default:
        if (state.scroll) {
          state.scroll.scrollToIndex(state.activeIndex)
        }
        break
    }
  }

  onInputChange(query) {
    this.action$.next({ type: Action.ChangeInput, payload: query })
  }

  onSubmit() {
    this.action$.next({ type: Action.Submit })
  }

  onClear() {
    this.action$.next({ type: Action.Clear })
  }

  changeInput(state, query): any {
    if (state.query === query) {
      return {}
    } else {
      let list = this.filterList(state.initialList, query, state.filterFn || this.defaultFilterFn)
      let activeIndex = list.length && query.length ? 0 : -1
      list = this.assignIsActive(list, activeIndex)
      return {
        list: list,
        query: query,
        activeIndex: activeIndex
      }
    }
  }

  filterList(list, query, filterFn) {
    if (query.length) {
      return list.filter((item) => {
        return filterFn(item, query)
      })
    } else {
      return list
    }
  }

  defaultFilterFn(item, query) {
    return item.title.toLowerCase().indexOf(query) > -1
  }

  moveUp(state): any {
    if (!state.list.length) {
      return {}
    }
    let nextIndex = state.activeIndex - 1
    let activeIndex = nextIndex < 0 ? state.list.length - 1 : nextIndex
    let list = this.assignIsActive(state.list, activeIndex)
    return { list: list, activeIndex: activeIndex }
  }

  moveDown(state): any {
    if (!state.list.length) {
      return {}
    }
    let nextIndex = state.activeIndex + 1
    let activeIndex = nextIndex === state.list.length ? 0 : nextIndex
    let list = this.assignIsActive(state.list, activeIndex)
    return { list: list, activeIndex: activeIndex }
  }

  assignIsActive(list, activeIndex) {
    return list.map((item, i) => {
      return Object.assign({}, item, { __isActive__: i === activeIndex })
    })
  }

}
