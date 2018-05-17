import preact from 'preact'
import Router from 'preact-router'

import { NitroSdk } from '../../nitro.sdk'

import Lists from './views/lists.jsx'
import Tasks from './views/task/index.jsx'
import { NotFound } from './views/notfound.jsx'
import Login from './views/login.jsx'
import ContextMenu from './views/contextmenu.jsx'
import DialogBox from './views/dialogbox.jsx'

const App = () => (
  <div class="app">
    <div class="desktop-grid">
      <Lists />
      <Router>
        <Tasks path="/" />
        <Tasks path="/lists/:list/:task?" />
        <NotFound default />
      </Router>
    </div>
    <Login />
    <ContextMenu />
    <DialogBox />
  </div>
)

window.sdk = NitroSdk

document.addEventListener('DOMContentLoaded', function() {
  const elem = document.getElementById('app-shell')
  elem.innerHTML = 'Rendering...'
  document.body.style.setProperty('--real-height', document.documentElement.clientHeight + 'px')
  window.addEventListener('resize', function() {
    requestAnimationFrame(() => {
      document.body.style.setProperty('--real-height', document.documentElement.clientHeight + 'px')
    })
  })

  Promise.all(polyfill()).then(() => {
    window.history.scrollRestoration = 'manual'

    if (process.env.NODE_ENV === 'production') {
      elem.className = 'production'
      const Runtime = require('offline-plugin/runtime')
      Runtime.install()
    } else {
      console.info('Service Worker is disabled in development.')
    }

    NitroSdk.loadData().then(() => {
      elem.innerHTML = ''
      preact.render(App(), elem)
      setTimeout(function() {
        elem.className = ''
      }, 500)
    }).catch(err => {
      console.error(err)
      elem.innerHTML = '<b>Error:</b> ' + err.message
    })

  })
})

const polyfill = function() {
  const promises = []
  if (typeof window.IntersectionObserver === 'undefined') {
    // promises.push(import(/* webpackChunkName: "polyfill" */ 'intersection-observer').then(() => {
    //   log('loaded intersection-observer polyfill')
    // }).catch(err => error(err)))
  }
  return promises
}