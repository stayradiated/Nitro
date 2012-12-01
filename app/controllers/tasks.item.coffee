Spine = require('spine')
List = require('models/list')
$ = Spine.$

class TaskItem extends Spine.Controller
  template: require('views/task')
  ENTER_KEY = 13
  ESCAPE_KEY = 27

  elements:
    '.name': 'name'
    '.notes': 'notes'

  events:
    'click .delete': 'remove'
    'click .checkbox': 'toggleStatus'

    # Editing the actual task
    'click': 'expand'
    'blur .name': 'endEdit'
    'keypress .name': 'endEditOnEnter'

    # Make notes editable
    'focus .notes': 'notesEdit'
    'blur .notes': 'notesSave'


  constructor: ->
    super
    throw "@task required" unless @task
    @task.bind 'update', @update
    @task.bind 'destroy', @release
    @task.bind 'change', @change

  render: =>
    @replace @template @task
    @el.draggable
      revert: "invalid"
      revertDuration: 200
      distance: 10
      scroll: false
      cursorAt:
        top: 15
        right: 30
      helper: =>
        $("body").append("<div class=\"helper\">#{ @task.name }</div>")
        $(".helper")
    @

  # Remove task if it is no longer in the current list
  change: (task) =>
    if List.current.id isnt "all" and task.list isnt List.current.id
      @release()

  update: =>
    @name.text @task.name
    @el.toggleClass "completed", @task.completed

  # Delete Button
  remove: ->
    @task.destroy()

  toggleStatus: ->
    @task.completed = !@task.completed
    @task.save()

  expand: (e) ->
    if e.target.className isnt "checkbox"
      @el.parent().find(".expanded").removeClass("expanded")
      @el.addClass("expanded animout")
      @el.draggable({ disabled: true })

  endEdit: ->
    @el.draggable({ disabled: false })
    val = @name.text()
    if val then @task.updateAttribute("name", val) else @task.destroy()

  endEditOnEnter: (e) =>
    if e.which is ENTER_KEY
      e.preventDefault()
      @name.blur()

  notesEdit: =>
    if @notes.text() is "Notes:" then @notes.text("")
    @notes.removeClass("placeholder")
    @notes.focus()

  notesSave: =>
    text = @notes.text()
    if text is ""
      @notes.text("Notes:")
      @notes.addClass("placeholder")
    else
      @task.updateAttribute "notes", text

module.exports = TaskItem
