{spawn, exec} = require 'child_process'
node_static = require 'node-static'
http = require 'http'
fs = require 'fs'

# Modules
SCRUNCH    = './node_modules/coffee-scrunch/bin/scrunch.js'
UGLIFY     = './node_modules/uglify-js/bin/uglifyjs'
SASS_COMPILER = './node_modules/node-sass/bin/node-sass'

# Configuration
INPUT  = 'app/init.coffee'
OUTPUT = 'public/application.js'
SASS   = 'css/index.scss'
CSS    = 'public/application.css'

# Options
option '-p', '--port [port]', 'Set port for cake server'
option '-w', '--watch', 'Watch the folder for changes'

# Functions
run = (cmd, args) ->
  terminal = spawn(cmd, args)
  terminal.stdout.on 'data', (data) -> console.log(data.toString())
  terminal.stderr.on 'data', (data) -> console.log(data.toString())
  terminal.on 'error', (data) -> console.log(data.toString())

compileCoffee = (options={}) ->
  args = [INPUT, '--out', OUTPUT, '--compile']
  if options.watch
    args.push('--watch')
  run(SCRUNCH, args)

compileSass = (options={}) ->
  args = [SASS, CSS]
  if options.watch then args.unshift('--watch', 'css')
  run(SASS_COMPILER, args)

minifyApp = ->
  args = [OUTPUT, '-c', '-m', '-o', OUTPUT]
  run(UGLIFY, args)

# Tasks
task 'server', 'Start server', (options) ->

  # Compile files
  compileCoffee(options)
  compileSass(options)

  # Start Server
  port = options.port or 9294
  file= new(node_static.Server)('./public')
  server = http.createServer (req, res) ->
    req.addListener( 'end', ->
      file.serve(req, res)
    ).resume()
  server.listen(port)

  console.log 'Server started on ' + port

task 'build', 'Compile CoffeeScript and SASS', (options) ->
  compileCoffee(options)
  compileSass(options)

task 'minify', 'Minify application.js', minifyApp
