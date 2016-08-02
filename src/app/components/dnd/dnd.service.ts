import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/takeLast'
import 'rxjs/add/operator/switch'

@Injectable()
export class DnDService {

  public dragEnter$: Subject<any> = new Subject<any>()

  private targets = new Map<any, any>()
  private mouseup$: Observable<any> = Observable.fromEvent(document, 'mouseup')
  private mousemove$: Observable<any> = Observable.fromEvent(document, 'mousemove')
  private previousDropTarget

  addSource(dragSource, dragStart$, sourceEvents) {
    this.listenSource(dragSource, dragStart$, sourceEvents)
  }

  addTarget(element, subject) {
    this.targets.set(element, subject)
  }

  removeTarget(element) {
    this.targets.delete(element)
  }

  private listenSource(dragSource, dragStart$, sourceEvents) {
    dragStart$
      .filter(({e}) => {
        return !(this.whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey)
      })
      .do(({payload}) => {
        sourceEvents.onStart.emit({removeIndex: payload.sourceIndex})
      })
      .concatMap(({e, payload}) => {
        let parent = dragSource.parentNode
        let rect = dragSource.getBoundingClientRect()
        let clone = dragSource.cloneNode(true)
        clone.style.width = this.getRectWidth(rect) + 'px'
        clone.style.height = this.getRectHeight(rect) + 'px'
        clone.style.position = 'fixed'
        clone.style.display = 'none'
        clone.className += ' drag-clone'
        dragSource.style.opacity = 0.2
        document.body.appendChild(clone)

        let offset = this.getOffset(dragSource);
        let offsetX = this.getCoord('pageX', e) - offset.left;
        let offsetY = this.getCoord('pageY', e) - offset.top;

        return this.mousemove$
          // .debounceTime(100)
          .map((mm: any) => {
            mm.preventDefault()
            let clientX = this.getCoord('clientX', mm);
            let clientY = this.getCoord('clientY', mm);
            let left = clientX - offsetX
            let top  = clientY - offsetY
            clone.style.top = top + 'px'
            clone.style.left = left + 'px'
            clone.style.display = 'block'

            let immediate
            let reference
            let elementBehindCursor = this.getElementBehindPoint(clone, mm.clientX, mm.clientY)
            let dropTarget = this.getDropTarget(elementBehindCursor, payload.key)

            if (dropTarget) {
              immediate = this.getImmediateChild(dropTarget, elementBehindCursor)
              reference = this.getReference(dropTarget, immediate, clientX, clientY)
              this.targets.get(dropTarget).dragMove$.next({
                event: mm,
                clone: clone,
                dragSource: dragSource,
                reference: reference,
                payload: payload
              })
              if (!this.previousDropTarget) {
                this.previousDropTarget = dropTarget
                this.targets.get(dropTarget).dragEnter$.next()
              }
            } else {
              if (this.previousDropTarget) {
                this.targets.get(this.previousDropTarget).dragLeave$.next()
                this.previousDropTarget = null
              }
            }

            sourceEvents.onMove.emit()

            return {
              parent: parent,
              clone: clone,
              dropTarget: dropTarget,
              dragSource: dragSource,
              immediate: immediate,
              reference: reference,
              payload: payload
            }
          })
          .takeUntil(this.mouseup$.do(() => {
            let parentNode = clone.parentNode
            if (parentNode) {
              parentNode.removeChild(clone)
            }
            clone.remove()
            dragSource.style.opacity = 1
          }))
          .takeLast(1)
          .do((o) => {
            if (o.dropTarget && o.reference) {
              if (this.targets.has(parent) && parent !== o.dropTarget) {
                this.targets.get(parent).dragEnd$.next(o)
              }
              this.targets.get(o.dropTarget).dragEnd$.next(o)
            }
            sourceEvents.onEnd.emit()
          })
      }).subscribe()
  }

  private getRectWidth(rect) {
    return rect.width || (rect.right - rect.left)
  }

  private getRectHeight(rect) {
    return rect.height || (rect.bottom - rect.top)
  }

  private getDropTarget(el, key) {
    while (el && el.parentNode !== document.body) {
      if (this.targets.has(el) && this.targets.get(el).key === key) {
        return el
      }
      el = el.parentNode
    }
    return null
  }

  private getElementBehindPoint(point, x, y) {
    let p = point || {};
    let state = p.className;
    let el;
    p.className += ' drag-hide';
    el = document.elementFromPoint(x, y);
    p.className = state;
    return el;
  }

  private getOffset(el) {
    let rect = el.getBoundingClientRect();
    return {
      left: rect.left + this.getScroll('scrollLeft', 'pageXOffset'),
      top: rect.top + this.getScroll('scrollTop', 'pageYOffset')
    };
  }

  private getScroll(scrollProp, offsetProp) {
    if (typeof global[offsetProp] !== 'undefined') {
      return global[offsetProp];
    }
    if (document.documentElement.clientHeight) {
      return document.documentElement[scrollProp];
    }
    return document.body[scrollProp];
  }

  private getCoord(coord, e) {
    let host = this.getEventHost(e);
    let missMap = {
        pageX: 'clientX', // IE8
        pageY: 'clientY' // IE8
      };
    if (coord in missMap && !(coord in host) && missMap[coord] in host) {
        coord = missMap[coord];
      }
    return host[coord];
  }

  private getEventHost(e) {
    // on touchend event, we have to use `e.changedTouches`
    // see http://stackoverflow.com/questions/7192563/touchend-event-properties
    // see https://github.com/bevacqua/dragula/issues/34
    if (e.targetTouches && e.targetTouches.length) {
      return e.targetTouches[0];
    }
    if (e.changedTouches && e.changedTouches.length) {
      return e.changedTouches[0];
    }
    return e;
  }

  private whichMouseButton (e) {
    if (e.touches !== void 0) { return e.touches.length; }
    // see https://github.com/bevacqua/dragula/issues/261
    if (e.which !== void 0 && e.which !== 0) { return e.which; }
    if (e.buttons !== void 0) { return e.buttons; }
    let button = e.button;
    // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
    if (button !== void 0) {
      // tslint:disable-next-line:no-bitwise
      return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
    }
  }

  private manually(el) {
    let sibling = el
    do {
      sibling = sibling.nextSibling
    } while (sibling && sibling.nodeType !== 1)
    return sibling
  }

  private nextEl(el) {
    return el.nextElementSibling || this.manually(el)
  }

  private getImmediateChild(dropTarget, target) {
    let immediate = target;
    while (immediate !== dropTarget && this.getParent(immediate) !== dropTarget) {
      immediate = this.getParent(immediate);
      if (!immediate || immediate === document.documentElement) {
        return null;
      }
    }
    return immediate;
  }

  private getParent(el) {
   return el.parentNode === document ? null : el.parentNode
  }

  private getReference(dropTarget, target, x, y) {
    if (target !== dropTarget) {
      return this.inside(target, x, y)
    } else {
      return this.outside(dropTarget, x, y)
    }
  }

  private outside(dropTarget, x, y) { // slower, but able to figure out any position
    let len = dropTarget.children.length;
    let el;
    let rect;
    for (let i = 0; i < len; i++) {
      el = dropTarget.children[i];
      rect = el.getBoundingClientRect();
      // if (horizontal && (rect.left + rect.width / 2) > x) { return el; }
      // if (!horizontal && (rect.top + rect.height / 2) > y) { return el; }
      if ((rect.top + rect.height / 2) > y) { return el; }
    }
    return null;
  }

  private inside(target, x, y) { // faster, but only available if dropped inside a child element
    let rect = target.getBoundingClientRect();
    // if (horizontal) {
      // return resolve(x > rect.left + getRectWidth(rect) / 2);
    // }
    return this.resolve(y > rect.top + this.getRectHeight(rect) / 2, target);
  }

  private resolve(after, target) {
    return after ? this.nextEl(target) : target;
  }

}
