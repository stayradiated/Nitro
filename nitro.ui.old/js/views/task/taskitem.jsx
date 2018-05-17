import preact from 'preact'

import { NitroSdk } from '../../../../nitro.sdk'

import { shallowCompare } from '../../helpers/compare.js'
import { formatDate } from '../../helpers/date.js'
import { taskMenu, headerMenu } from './contextmenu.jsx'
import { taskExpandedStore } from '../../stores/taskexpanded.js'

import moreSvg from '../../../../assets/icons/material/task-more.svg'

export default class Task extends preact.Component {
  constructor(props) {
    super(props)
    this.state = this.installState(props.data, false)
    this.state.expanded = props.selectedTask
  }
  componentDidMount() {
    NitroSdk.bind('update', this.triggerUpdate)
    if (this.props.selectedTask) {
      setTimeout(() => {
        const rect = this.el.getBoundingClientRect()
        // TODO: Offset may be 64?
        // the 16 is a offset because it's already open
        taskExpandedStore.create(this.props.data.id, rect.top - 16)
      }, 25)
    }
  }
  componentWillUnmount() {
    NitroSdk.unbind('update', this.triggerUpdate)
  }
  onDragStart() {
    return false
  }
  onContextMenu = e => {
    e.preventDefault()
    // hopefully filters out to only do right clicks, and not long touches
    if (e.button === 0) {
      return
    }
    if (this.state.type === 'header') {
      headerMenu(this.props.data.id, e.clientX, e.clientY)
    } else {
      taskMenu(this.props.data.id, this.props.headersAllowed, e.clientX, e.clientY)
    }
  }
  triggerCheck = () => {
    NitroSdk.completeTask(this.props.data.id)
  }
  triggerChange = prop => {
    return e => {
      const value = e.currentTarget.value
      NitroSdk.updateTask(this.props.data.id, { [prop]: value })
    }
  }
  triggerUpdate = (data, value) => {
    if (data === 'tasks' && value === 'update-all') {
      this.setState(this.installState(this.props.data.id))
    } else if (data === this.props.data.id || data === 'all') {
      this.setState(this.installState(this.props.data.id))
    }
  }
  installState = (id, lookup = true) => {
    let data = id
    if (lookup) {
      data = NitroSdk.getTask(id)
    }
    return {
      name: data.name,
      type: data.type,
      notes: data.notes,
      list: data.list,
      date: data.date,
      deadline: data.deadline,
      completed: data.completed
    }
  }
  triggerKeyUp = e => {
    if (e.keyCode === 13) {
      e.currentTarget.blur()
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedTask && this.state.expanded === false) {
      this.setState({ expanded: true })
      const rect = this.el.getBoundingClientRect()
      taskExpandedStore.create(this.props.data.id, rect.top)
    } else if (!nextProps.selectedTask && this.state.expanded === true) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          this.setState({ expanded: false })
        })
      }, 275)
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }
  triggerMenu = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    headerMenu(this.props.data.id, rect.left + 30, rect.top + window.scrollY, 'top', 'right')
  }
  buildIndicators = () => {
    const frontIndicators = []
    const indicators = []
    if (this.state.notes !== null && this.state.notes.length > 0) {
      indicators.push(
        <span key="notes-indicator" class="indicator indicator-notes" />
      )
    }
    if (this.state.deadline !== null) {
      indicators.push(<span key="deadline-indicator" class="indicator indicator-deadline" />)
      indicators.push(<span class="indicator indicator-deadline-label">{formatDate(this.state.deadline, this.state.type, 'deadline')}</span>)
    }
    if (['today', 'next'].indexOf(this.props.currentList) > -1) {
      const heading = this.props.currentHeading.split('-')
      if (
        this.state.list !== 'inbox' &&
        heading.length === 1 &&
        this.state.list !== heading[0]
      ) {
        indicators.push(
          <span class="indicator indicator-date">
            {NitroSdk.getList(this.state.list).name}
          </span>
        )
      }
      if (this.props.data.heading && heading.length === 1) {
        indicators.push(
          <span class="indicator indicator-date">
            {this.props.data.heading}
          </span>
        )
      }
    }

    if (this.state.date !== null && this.state.completed === null) {
      const date = formatDate(this.state.date, this.state.type, 'today')
      // doesn't today on today list, or under today heading, or on completed tasks. also doesn't show overdue pill.
      if (date === 'Today') {
        if (this.props.currentList !== 'today' && this.props.currentHeading !== 'today') {
          frontIndicators.push(<span class="front-indicator indicator-today" />)
        }
      } else if (this.props.currentHeading !== 'overdue') {
        indicators.push(<span class="indicator indicator-date">{date}</span>)
      }
    }
    // removed support for 'next' for now
    // } else if (
    //   this.state.type === 'next' &&
    //   this.props.currentList !== 'next' &&
    //   this.state.completed === null
    // ) {
    //   indicators.push(<span class="indicator indicator-date">Next</span>)
    // }
    return [frontIndicators, indicators]
  }
  render() {
    let className = 'task-item'
    if (this.props.selectedTask) {
      className += ' expanded'
    } else if (this.state.expanded === true) {
      className += ' closing'
    } else if (this.props.shouldMove) {
      className += ' offset-down'
      if (this.props.shouldMove === 'little') {
        className += ' no-transition'
      }
    }
    if (this.state.completed !== null) {
      className += ' completed'
    }
    if (this.props.collapse) {
      className += ' collapse'
    }

    let label = null
    let indicators = [null, null]
    if (this.state.type === 'header') {
      className = className.replace('task-item', 'header-item')
      label = (
        <input
          value={this.state.name}
          onChange={this.triggerChange('name')}
          onKeyUp={this.triggerKeyUp}
          disabled={!this.props.headersAllowed && this.state.type === 'header'}
        />
      )

      let menu = null
      if (this.props.headersAllowed) {
        menu = (
          <button alt="Sublist Menu" class="menu" onClick={this.triggerMenu}>
            <img src={moreSvg} />
          </button>
        )
      }
      return (
        <li class={className} onContextMenu={this.onContextMenu}>
          <button class="collapse-btn" onClick={() => this.props.onCollapse(this.props.data.id)}>▼</button>
          {label}
          {menu}
        </li>
      )
    } else {
      indicators = this.buildIndicators()
      label = (
        <div class="label" onClick={this.props.onClick}>
          {indicators[0]}
          {this.state.name}
          {indicators[1]}
        </div>
      )
      return (
        <li
          class={className}
          onMouseDown={this.props.onDown}
          onTouchStart={this.props.onDown}
          onTouchMove={this.props.onMove}
          onTouchEnd={this.props.onUp}
          onTouchCancel={this.props.onUp}
          onContextMenu={this.onContextMenu}
          ref={e => this.el = e}
        >
          <div class="check" onClick={this.triggerCheck}>
            <div class="box" />
          </div>
          {label}
        </li>
      )
    }
  }
}
