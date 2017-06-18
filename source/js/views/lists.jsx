import preact from 'preact'
import { route } from 'preact-router'
import { ListsCollection } from '../models/listsCollection.js'
import { TasksCollection } from '../models/tasksCollection.js'

export default class Lists extends preact.Component {
  constructor(props) {
    super(props)
    this.state = {
      lists: ListsCollection.all()
    }
  }
  componentWillMount() {
    TasksCollection.bind('update', this.update)
    ListsCollection.bind('update', this.update)
  }
  componentWillUnmount() {
    TasksCollection.unbind('update', this.update)
    ListsCollection.unbind('update', this.update)
  }
  // essentially just updates the count & lists in view
  update = () => {
    this.setState({
      lists: ListsCollection.all()
    })
  }
  navigate(id) {
    return () => {
      route(`/lists/${id}`)
    }
  }
  createList() {
    ListsCollection.add({
      name: Math.random().toString()
    })
  }
  render() {
    let focus = []
    let lists = []
    this.state.lists.forEach((item) => {
      const count = TasksCollection.findListCount(item.id)

      let el = (
        <li onClick={this.navigate(item.id)} class={item.id}>
          <span class="icon"></span>
          <span class="label">{item.name}</span>
          <span class="count">{count}</span>
        </li>
      )
      if (item.id === 'inbox' || item.id === 'today' || item.id === 'next' || item.id === 'all') {
        focus.push(el)
      } else {
        lists.push(el)
      }
    })
    return (
      <div class="sidebar-container">
        <header class="material-header main-nav"> 
          <h1 class="brand">
            <img src="/img/icons/logo.svg" />
            Nitro
          </h1>
          <h1 class="pwa">Lists</h1>
          <div class="search">
            <img src="/img/icons/search.svg" />
          </div>
          <div class="menu">
            <img src="/img/icons/menu.svg" />
          </div>
        </header>
      
        <div class="lists-sidebar">
          <div class="search-container">
            <input type="text" placeholder="Search Everything"/>
          </div>
          <ul class="lists-list">
            {focus}
            {lists}
            <li class="add" onClick={this.createList}>
              <span class="icon"></span>
              <span class="label">Add List</span>
            </li>
          </ul>
        </div>
        <footer class="subtle-footer">
          <button class="feedback" aria-label="Feedback"/>
          <button class="settings" aria-label="Settings"/>
        </footer>
      </div>
    )
  }
}