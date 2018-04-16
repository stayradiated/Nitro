import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, TextInput, StyleSheet } from 'react-native'

import { NitroSdk } from '../../../nitro.sdk'
import { vars } from '../../styles.js'

import { Checkbox } from './checkbox.jsx'

export class TaskExpanded extends React.Component {
  static propTypes = {
    triggerBack: PropTypes.func,
    setTaskHeight: PropTypes.func
  }
  constructor(props) {
    super(props)
    this.wrapper = React.createRef()

    const task = this.getTask(props)
    this.state = { ...task, hidden: true }
  }
  componentDidMount() {
    this.measureWrapper()
    requestAnimationFrame(() => {
      this.setState({
        hidden: false
      })
    })
  }
  getTask = (props = this.props) => {
    const task = NitroSdk.getTask(props.match.params.task)
    return {
      name: task.name,
      notes: task.notes,
      checked: task.completed !== null
    }
  }
  measureWrapper = () => {
    this.wrapper.current.measure((x, y, width, height, pageX, pageY) => {
      this.props.setTaskHeight(height)
    })
  }
  triggerOverlay = () => {
    this.props.triggerBack()
  }
  triggerChange = field => {
    return e => {
      this.setState({
        [field]: e.currentTarget.value
      })
    }
  }
  triggerBlur = field => {
    return e => {
      NitroSdk.updateTask(this.props.match.params.task, {
        [field]: this.state[field]
      })
    }
  }
  triggerChecked = () => {
    // temporary! this component needs some smarts on how to trigger updates.
    this.setState({
      checked: !this.state.checked
    })

    NitroSdk.completeTask(this.props.match.params.task)
  }
  render() {
    let top = 0
    if (this.props.position !== null) {
      top = this.props.position + vars.padding * 2
    }
    let opacity = 1
    let overlayOpacity = 0.5
    let transform = [{ translateY: 0 }]
    if (this.state.hidden) {
      opacity = 0
      overlayOpacity = 0
      transform = [{ translateY: -2 * vars.padding }]
    }
    return (
      <React.Fragment>
        <View
          style={[
            styles.wrapper,
            { top: top, opacity: opacity, transform: transform }
          ]}
          ref={this.wrapper}
        >
          <View style={styles.topRow}>
            <Checkbox
              checked={this.state.checked}
              onClick={this.triggerChecked}
            />
            <TextInput
              style={styles.header}
              value={this.state.name}
              placeholder="Task Name"
              onChange={this.triggerChange('name')}
              onBlur={this.triggerBlur('name')}
            />
          </View>
          <TextInput
            style={styles.notes}
            value={this.state.notes || ''}
            placeholder="Notes"
            multiline={true}
            numberOfLines={3}
            onChange={this.triggerChange('notes')}
            onBlur={this.triggerBlur('notes')}
          />
        </View>
        <View
          style={[styles.overlay, { top: top - 100, opacity: overlayOpacity }]}
          onClick={this.triggerOverlay}
        />
      </React.Fragment>
    )
  }
}
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 10,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: '#fff',
    opacity: 0.5,
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease',
    transitionProperty: 'opacity'
  },
  wrapper: {
    position: 'absolute',
    zIndex: 11,
    left: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: vars.padding,
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    transitionDuration: '300ms, 300ms',
    transitionTimingFunction: 'ease, ease',
    transitionProperty: 'opacity, transform'
  },
  topRow: {
    flex: 1,
    flexDirection: 'row'
  },
  header: {
    fontSize: vars.taskExpandedFontSize,
    outline: '0'
  },
  notes: {
    fontSize: vars.taskFontSize,
    paddingTop: vars.padding,
    outline: '0'
  }
})
