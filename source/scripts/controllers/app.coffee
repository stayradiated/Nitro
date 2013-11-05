# Load librariess
libs = require '../vendor/libs'

# Base
Base = require 'base'
Base.touchify = require '../utils/touchify'
$ = require 'jqueryify'

# Utilities
Keys      = require '../utils/keys'
translate = require '../utils/translate'
Event     = require '../utils/event'

# Models
Task    = require '../models/task'
List    = require '../models/list'
Setting = require '../models/setting'

# Controllers
# Panel         = require # '../controllers/panel'
# Settings      = require # '../controllers/Settings'
# Modal         = require # '../controllers/modal'
# Sync          = require # '../controllers/sync'
# Pro           = require # '../controllers/pro'
Auth          = require '../controllers/auth'

# Views
Keys          = require '../views/keys'
LoadingScreen = require '../views/loading_screen'
Lists         = require '../views/lists'
Title         = require '../views/title'
ListButtons   = require '../views/list_buttons'
Tasks         = require '../views/tasks'

class App

  constructor: ->

    # Load Settings
    Setting.trigger 'fetch'

    # Init Settings
    # Settings = new Settings

    # Load translations
    translate.init()

    # Load controllers
    @auth = new Auth()

    # Load Views
    new Lists()
    new Tasks()
    new Title()
    new ListButtons()
    new LoadingScreen()

    # Load views
    @keys = new Keys()

    # Init Modals
    # Modal.init()

    # Load data from disk
    Task.trigger 'fetch'
    List.trigger 'fetch'

    # Make sure inbox list exists
    # TODO: Move somewhere elese
    if List.exists('inbox') is false
      List.create
        id: 'inbox'
        name: translate 'Inbox'
        permanent: yes

    # Doesn't run in the Settings constructor. Bit of a pain
    # TODO: Move somewhere else?
    # if Setting.completedDuration is 'day'
      # Settings.moveCompleted()

    # Select the first list on load
    # @lists.showInbox()

    # Login to sync
    if Setting.loggedin
      Sync.connect(Setting.uid, Setting.token)
    else
      Event.trigger 'app:offline'

    Event.trigger 'app:ready'

module.exports = App
