import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription } from 'rxjs/Subscription'

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

  private sources = new Map<any, any>()
  private targets = new Map<any, any>()
  private mouseup$: Observable<any> = Observable.fromEvent(document, 'mouseup')
  private mousemove$: Observable<any> = Observable.fromEvent(document, 'mousemove')
  public dragEnter$: Subject<any> = new Subject<any>()

  constructor() {
  }

  addSource(element, payload) {
    if (!this.sources.has(element)) {
      let subscription = this.listenSource(element, payload)
      this.sources.set(element, subscription)
    }
  }

  removeSource(element) {
    let subscription: Subscription = this.sources.get(element)
    subscription.unsubscribe()
    this.sources.delete(element)
  }

  addTarget(element, subject) {
    this.targets.set(element, subject)
  }

  removeTarget(element) {
    this.targets.delete(element)
  }

  private listenSource(element, payload) {
    return Observable.fromEvent(element, 'mousedown')
      .filter((e: any) => {
        return !(this.whichMouseButton(e) !== 1 || e.metaKey || e.ctrlKey)
      })
      .concatMap((md: any) => {
        let parent = element.parentNode
        let rect = element.getBoundingClientRect()
        let clone = element.cloneNode(true)
        clone.style.width = this.getRectWidth(rect) + 'px'
        clone.style.height = this.getRectHeight(rect) + 'px'
        clone.style.position = 'fixed'
        clone.style.display = 'none'
        clone.className += ' drag-clone'
        element.style.opacity = 0.2
        document.body.appendChild(clone)

        let offset = this.getOffset(element);
        let offsetX = this.getCoord('pageX', md) - offset.left;
        let offsetY = this.getCoord('pageY', md) - offset.top;

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
                clone: clone,
                element: element,
                reference: reference,
                payload: payload
              })
            }
            return {
              parent: parent,
              clone: clone,
              dropTarget: dropTarget,
              element: element,
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
            element.style.opacity = 1
          }))
          .takeLast(1)
          .do((o) => {
            if (o.dropTarget && o.reference) {
              if (this.targets.has(parent) && parent !== o.dropTarget) {
                this.targets.get(parent).dragEnd$.next(o)
              }
              this.targets.get(o.dropTarget).dragEnd$.next(o)
            }
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
  getOffset(el) {
    var rect = el.getBoundingClientRect();
    return {
      left: rect.left + this.getScroll('scrollLeft', 'pageXOffset'),
      top: rect.top + this.getScroll('scrollTop', 'pageYOffset')
    };
  }
  getScroll(scrollProp, offsetProp) {
    if (typeof global[offsetProp] !== 'undefined') {
      return global[offsetProp];
    }
    if (document.documentElement.clientHeight) {
      return document.documentElement[scrollProp];
    }
    return document.body[scrollProp];
  }
  getCoord(coord, e) {
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
  getEventHost(e) {
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
    if (e.which !== void 0 && e.which !== 0) { return e.which; } // see https://github.com/bevacqua/dragula/issues/261
    if (e.buttons !== void 0) { return e.buttons; }
    var button = e.button;
    if (button !== void 0) { // see https://github.com/jquery/jquery/blob/99e8ff1baa7ae341e94bb89c3e84570c7c3ad9ea/src/event.js#L573-L575
      return button & 1 ? 1 : button & 2 ? 3 : (button & 4 ? 2 : 0);
    }
  }
  manually(el) {
    var sibling = el
    do {
      sibling = sibling.nextSibling
    } while (sibling && sibling.nodeType !== 1)
    return sibling
  }
  nextEl(el) {
    return el.nextElementSibling || this.manually(el)
  }
  getImmediateChild(dropTarget, target) {
    var immediate = target;
    while (immediate !== dropTarget && this.getParent(immediate) !== dropTarget) {
      immediate = this.getParent(immediate);
      if (!immediate || immediate === document.documentElement) {
        return null;
      }
    }
    return immediate;
  }
  getParent(el) {
   return el.parentNode === document ? null : el.parentNode
  }
  getReference(dropTarget, target, x, y) {
    if (target !== dropTarget) {
      return this.inside(target, x, y)
    } else {
      return this.outside(dropTarget, x, y)
    }
  }
  outside(dropTarget, x, y) { // slower, but able to figure out any position
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

  inside(target, x, y) { // faster, but only available if dropped inside a child element
    let rect = target.getBoundingClientRect();
    // if (horizontal) {
      // return resolve(x > rect.left + getRectWidth(rect) / 2);
    // }
    return this.resolve(y > rect.top + this.getRectHeight(rect) / 2, target);
  }

  resolve (after, target) {
    return after ? this.nextEl(target) : target;
  }

}
