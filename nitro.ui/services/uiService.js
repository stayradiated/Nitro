// @flow
import { Events } from '../../nitro.sdk'

// TODO: This needs to update on resize
const MOBILE_BREAKPOINT = 850
const defaultPosition = window.innerWidth > MOBILE_BREAKPOINT ? 'max' : 'map'

class uiService extends Events {
  constructor(props) {
    super(props)
  }
  state = {
    scrollPosition: 0,

    // root card positions
    oldCardPosition: defaultPosition,
    cardPosition: defaultPosition,

    // the scrollspy on list of tasks
    listIntersection: false,

    // used for proper touch rejection
    headerEvent: null,
    listsIsDragging: false,

    // used for drag and drop
    // please don't mutate unless you know what you're doing
    currentList: null,
    currentListsOrder: [],
    currentListTasksOrder: []
  }

  scrollView = null
  drawerScrollView = null
  tasksContainer = null

  getScroll(): number {
    if (this.scrollView === null) {
      return 0
    }
    return this.scrollView.current.scrollTop
  }

  scrollTo(scrollObject: object): number {
    if (this.scrollView === null) {
      return
    }
    scrollObject.y = scrollObject.top
    scrollObject.x = scrollObject.left
    if (this.scrollView.current) {
      this.scrollView.current.scrollTo(scrollObject)
    }
  }

  scrollBy(scrollObject: object): number {
    if (this.scrollView === null) {
      return
    }
    scrollObject.y = scrollObject.top
    scrollObject.x = scrollObject.left
    if (this.scrollView.current) {
      this.scrollView.current.scrollBy(scrollObject)
    }
  }

  setCardPosition(
    position: object,
    animate: boolean = true,
    manual: boolean = false
  ) {
    // desktop is always max
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      position = 'max'
    }
    // don't need to do anything if it's already in the right position
    if (this.state.cardPosition === position) {
      return
    }
    if (position === 'toggle') {
      if (this.state.cardPosition === 'default') {
        position = 'map'
      } else if (this.state.cardPosition === 'max') {
        // position = 'default'
        position = 'map'
      } else if (this.state.cardPosition === 'map') {
        // position = 'default'
        position = 'max'
      }
    }
    this.state.cardPosition = position
    this.trigger('card-position', position, animate, manual)
    if (animate === true) {
      setTimeout(() => {
        this.state.oldCardPosition = position
      }, 200)
    } else {
      this.state.oldCardPosition = position
    }
  }

  setCardScroll(top: number) {
    if (this.drawerScrollView === null) {
      return
    }
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      this.drawerScrollView.current.scrollTop = top
    }
  }
}

export let UiService = new uiService()
