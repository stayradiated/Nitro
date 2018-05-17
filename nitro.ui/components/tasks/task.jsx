import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, Image, StyleSheet } from 'react-native'
import { Draggable } from 'react-beautiful-dnd'

import { NitroSdk } from '../../../nitro.sdk'
import { vars } from '../../styles.js'
import { formatDate } from '../../helpers/date.js'
import { TasksExpandedService } from '../../services/tasksExpandedService.js'
import { Checkbox } from './checkbox.jsx'
import { TaskHeader } from './taskHeader.jsx'

import todayIcon from '../../../assets/icons/feather/today.svg'
import notesIcon from '../../../assets/icons/material/note.svg'

export class Task extends React.Component {
  static propTypes = {
    index: PropTypes.number,
    listId: PropTypes.string,
    data: PropTypes.object,
    currentHeading: PropTypes.string,
    selected: PropTypes.bool,
    selectedHeight: PropTypes.number,
    selectedCallback: PropTypes.func,
    headersAllowed: PropTypes.bool,
    dragDisabled: PropTypes.bool
  }
  constructor(props) {
    super(props)
    this.viewRef = React.createRef()
  }
  componentDidMount() {
    this.triggerPosition()
  }
  componentWillReceiveProps(newProps) {
    if (newProps.selected !== this.props.selected) {
      this.triggerPosition(newProps)
    }
  }
  triggerPosition = (newProps = this.props) => {
    if (newProps.selected) {
      this.viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        newProps.selectedCallback(y, pageY)
      })
    }
  }
  triggerClick = () => {
    this.viewRef.current.measure((x, y, width, height, pageX, pageY) => {
      // TODO: this should be the same as pageY, but on iOS it's broken
      // so using this manual calculation for now
      const scrollby = y + 171
      // console.log(scrollby === pageY)
      TasksExpandedService.triggerTask(
        this.props.listId,
        this.props.data.id,
        scrollby
      )
    })
  }
  triggerCheckbox = e => {
    NitroSdk.completeTask(this.props.data.id)
  }
  render() {
    const item = this.props.data
    let innerItem
    if (item.type === 'header') {
      innerItem = (
        <TaskHeader
          data={this.props.data}
          disabled={!this.props.headersAllowed}
        />
      )
    } else {
      let indicatorsBefore = null
      let indicatorsAfter = null
      let deadlineIndicator = null
      if (item.date !== null && item.completed === null) {
        const date = formatDate(item.date, item.type, 'today')
        if (date === 'Today') {
          // don't render anything if it's under one of those headers
          if (
            this.props.listId !== 'today' &&
            this.props.currentHeading !== 'today'
          ) {
            indicatorsBefore = (
              <Image
                accessibilityLabel="Do Today"
                source={todayIcon}
                resizeMode="contain"
                style={styles.frontIcon}
              />
            )
          }
        } else if (this.props.currentHeading !== 'overdue') {
          indicatorsBefore = (
            <View key="date-indicator" style={styles.indicator}>
              <Text style={styles.indicatorText}>{date}</Text>
            </View>
          )
        }
      }
      if (item.notes !== null && item.notes.length > 0) {
        indicatorsAfter = (
          <Image
            accessibilityLabel="Notes"
            source={notesIcon}
            resizeMode="contain"
            style={styles.backIcon}
          />
        )
      }
      if (item.deadline !== null) {
        deadlineIndicator = (
          <Text style={styles.subText}>
            {formatDate(item.deadline, item.type, 'deadline')}
          </Text>
        )
      }
      let listIndicators = []
      if (['today', 'next'].indexOf(this.props.listId) > -1) {
        const heading = this.props.currentHeading.split('-')
        if (
          heading.length === 1 &&
          this.props.data.list !== 'inbox' &&
          this.props.data.list !== heading[0]
        ) {
          listIndicators.push(
            <Text key="list-indicator" style={styles.subText}>
              {deadlineIndicator || listIndicators.length > 0 ? ' · ' : ''}
              {NitroSdk.getList(this.props.data.list).name}
            </Text>
          )
        }
        if (this.props.data.heading && heading.length === 1) {
          listIndicators.push(
            <Text key="heading-indicator" style={styles.subText}>
              {deadlineIndicator || listIndicators.length > 0 ? ' · ' : ''}
              {this.props.data.heading}
            </Text>
          )
        }
      }

      // if the bottom row isn't empty, we apply our padded out styles
      const wrapperStyles =
        deadlineIndicator || listIndicators.length > 0
          ? [styles.wrapper, styles.wrapperPadding]
          : styles.wrapper
      innerItem = (
        <View style={wrapperStyles}>
          <Checkbox
            onPress={this.triggerCheckbox}
            checked={this.props.data.completed !== null}
          />
          <View onClick={this.triggerClick} style={styles.textDisplay}>
            {indicatorsBefore}
            <View style={styles.textRow}>
              <View style={styles.textWrapper}>
                <Text numberOfLines={1} style={styles.text}>
                  {this.props.data.name}
                </Text>
                {indicatorsAfter}
              </View>
              <View style={styles.subTextRow}>
                {deadlineIndicator}
                {listIndicators}
              </View>
            </View>
          </View>
        </View>
      )
    }

    return (
      <Draggable
        draggableId={item.id}
        index={this.props.index}
        isDragDisabled={this.props.dragDisabled}
      >
        {(provided, snapshot) => (
          <View ref={this.viewRef} style={styles.transitionStyle}>
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style
              )}
            >
              {innerItem}
            </div>
            {provided.placeholder}
          </View>
        )}
      </Draggable>
    )
  }
}
const styles = StyleSheet.create({
  wrapper: {
    paddingLeft: vars.padding / 2,
    paddingRight: vars.padding / 2,
    flex: 1,
    flexDirection: 'row'
  },
  wrapperPadding: {
    marginTop: vars.padding * 0.25,
    marginBottom: vars.padding * 0.375
  },
  textDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textRow: {
    flex: 1
  },
  frontIcon: {
    width: 24,
    height: 24,
    marginRight: vars.padding * 0.375
  },
  backIcon: {
    width: 18,
    height: 22,
    marginLeft: vars.padding * 0.375,
    marginRight: vars.padding / 4
  },
  text: {
    fontFamily: vars.fontFamily,
    fontSize: vars.taskFontSize,
    lineHeight: 22,
    color: vars.taskTextColor
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'row'
  },
  indicator: {
    paddingLeft: vars.padding / 4,
    paddingRight: vars.padding / 4,
    paddingTop: vars.padding / 4,
    paddingBottom: vars.padding / 4,
    backgroundColor: vars.indicatorColor,
    marginRight: vars.padding * 0.375,
    borderRadius: 3
  },
  indicatorText: {
    fontFamily: vars.fontFamily,
    fontSize: vars.taskFontSize - 3,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)'
  },
  transitionStyle: {
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease',
    transitionProperty: 'transform'
  },
  subTextRow: {
    flex: 1,
    flexDirection: 'row'
  },
  subText: {
    fontFamily: vars.fontFamily,
    fontSize: vars.taskFontSize - 3,
    color: vars.taskSubtextColor
  }
})
const getItemStyle = (isDragging, draggableStyle) => {
  const style = {
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    borderRadius: isDragging ? 3 : 0,

    // change background colour if dragging
    background: isDragging ? vars.dragColor : '',

    // styles we need to apply on draggables
    ...draggableStyle
  }
  return style
}
