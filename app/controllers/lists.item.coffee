# Spine
Spine = require 'spine'

# Models
Task  = require '../models/task.coffee'
List  = require '../models/list.coffee'

class ListItem extends Spine.Controller
  template: require '../views/list'

  elements:
    '.name': 'name'
    '.count': 'count'

  events:
    'click': 'click'

  constructor: ->
    Spine.touchify(@events)
    super
    throw "@list required" unless @list
    # Update is bound to something else so we don't keep rewriting the dom
    @list.bind "update", @updateList
    @list.bind "update:tasks", @updateListCount
    @list.bind "kill", @remove
    Task.bind "change", @updateTask
    @list.bind "changeList", @current

  render: =>
    @list.count = Task.active(@list.id).length
    @replace @template @list
    @el.droppable
      hoverClass: "ui-state-active"
      tolerance: "pointer"
      drop: (event, ui) =>
        movedTask = Task.find(ui.draggable.attr("id").slice(5))
        List.current.moveTask(movedTask, @list)
    @current()
    @

  updateTask: (task) =>
    # Only update if the task was in the list or current list
    if task.list is @list.id or @list.eql(List.current)
      @updateListCount()

  updateListCount: =>
    @count.text Task.active(@list.id).length

  updateList: (list) =>
    # Called when a list name is updated
    @name.text list.name

  click: ->
    List.trigger "changeList", @list

  current: =>
    if List.current?.id is @list.id
      @el.parent().parent().find(".current").removeClass("current")
      @el.addClass "current"

  remove: =>
    # Delete all tasks
    for task in Task.list(@list.id)
      if task.completed isnt false
        task.updateAttribute('list', 'inbox')
      else
        task.destroy
          sync: no
    # Remove element and bindings
    @release()
    @list.destroy()

module.exports = ListItem
