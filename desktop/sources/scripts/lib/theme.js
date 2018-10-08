'use strict'

function Theme (default_theme = { background: '#222', f_high: '#fff', f_med: '#ccc', f_low: '#999', f_inv: '#fff', b_high: '#888', b_med: '#666', b_low: '#444', b_inv: '#000' }) {
  let themer = this

  this.el = document.createElement('style')
  this.el.type = 'text/css'

  this.collection = {
    default: default_theme,
    noir: { background: '#222', f_high: '#fff', f_med: '#ccc', f_low: '#999', f_inv: '#fff', b_high: '#888', b_med: '#666', b_low: '#444', b_inv: '#000' },
    pale: { background: '#e1e1e1', f_high: '#000', f_med: '#777', f_low: '#fff', f_inv: '#000', b_high: '#eee', b_med: '#999', b_low: '#ccc', b_inv: '#fff' }
  }
  
  // Currently, the custom_serif font is Zilla Slab and the custom_sans_serif font is Roboto Condensed. These can be changed by replacing the serif.ttf and sans_serif.ttf fonts in the media/fonts folder.
  
  this.fonts = [
    "input_mono_regular",
    "custom_serif",
    "custom_sans_serif",
  ]
  
  this.font_index = 0

  this.install = function (host = document.body, callback) {
    console.log('Theme', 'Installing..')
    host.appendChild(this.el)
    this.callback = callback
  }

  this.start = function () {
    console.log('Theme', 'Starting..')
    let storage = isJSON(localStorage.theme) ? JSON.parse(localStorage.theme) : this.collection.default
    this.load(!storage.background ? this.collection.default : storage)
  }

  this.save = function (theme) {
    console.log('Theme', 'Saving..')
    this.active = theme
    localStorage.setItem('theme', JSON.stringify(theme))
  }

  this.load = function (theme, fall_back = this.collection.noir) {
    if (!theme || !theme.background) { console.warn('Theme', 'Not a theme', theme); return }

    this.save(theme)
    this.apply(theme)

    if (this.callback) {
      this.callback()
    }
  }

  this.apply = function (theme) {
    this.el.innerHTML = `
    :root {
      --background: ${theme.background};
      --f_high: ${theme.f_high};
      --f_med: ${theme.f_med};
      --f_low: ${theme.f_low};
      --f_inv: ${theme.f_inv};
      --b_high: ${theme.b_high};
      --b_med: ${theme.b_med};
      --b_low: ${theme.b_low};
      --b_inv: ${theme.b_inv};
    }`
  }

  this.parse = function (any) {
    if (any && any.background) { return any } else if (any && any.data) { return any.data } else if (any && isJSON(any)) { return JSON.parse(any) } else if (any && isHTML(any)) { return this.extract(any) }

    return null
  }

  this.extract = function (text) {
    let svg = new DOMParser().parseFromString(text, 'text/xml')

    try {
      return {
        'background': svg.getElementById('background').getAttribute('fill'),
        'f_high': svg.getElementById('f_high').getAttribute('fill'),
        'f_med': svg.getElementById('f_med').getAttribute('fill'),
        'f_low': svg.getElementById('f_low').getAttribute('fill'),
        'f_inv': svg.getElementById('f_inv').getAttribute('fill'),
        'b_high': svg.getElementById('b_high').getAttribute('fill'),
        'b_med': svg.getElementById('b_med').getAttribute('fill'),
        'b_low': svg.getElementById('b_low').getAttribute('fill'),
        'b_inv': svg.getElementById('b_inv').getAttribute('fill')
      }
    } catch (err) {
      console.warn('Theme', 'Incomplete SVG Theme', err)
    }
  }

  this.reset = function () {
    this.load(this.collection.default)
  }

  // Defaults

  this.pale = function () {
    this.load(this.collection.pale)
  }

  this.noir = function () {
    this.load(this.collection.noir)
  }

  this.invert = function () {
    this.load(this.active.background === this.collection.noir.background ? this.collection.pale : this.collection.noir)
  }
  
  this.previous_font = function () {
    this.font_index--
    if (this.font_index < 0) this.font_index = this.fonts.length - 1
    document.body.style.fontFamily = this.fonts[this.font_index]
  }
  
  this.next_font = function () {
    this.font_index = (this.font_index + 1) % this.fonts.length
    document.body.style.fontFamily = this.fonts[this.font_index]
  }
  
  this.decrease_font_size = function () {
    const font_size = parseInt(window.getComputedStyle(document.body).getPropertyValue('font-size'));
    document.body.style.fontSize = (font_size - 1) + "px";
  }
  
  this.increase_font_size = function () {
    const font_size = parseInt(window.getComputedStyle(document.body).getPropertyValue('font-size'));
    document.body.style.fontSize = (font_size + 1) + "px";
  }
  
  this.reset_font_size = function () {
    document.body.style.fontSize = "12px";
  }

  // Drag

  this.drag = function (e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  this.drop = function (e) {
    e.preventDefault()
    e.stopPropagation()

    let file = e.dataTransfer.files[0]

    if (!file || !file.name) { console.warn('Theme', 'Unnamed file.'); return }
    if (file.name.indexOf('.thm') < 0 && file.name.indexOf('.svg') < 0) { console.warn('Theme', 'Skipped, not a theme'); return }

    let reader = new FileReader()
    reader.onload = function (e) {
      themer.load(themer.parse(e.target.result))
    }
    reader.readAsText(file)
  }

  window.addEventListener('dragover', this.drag)
  window.addEventListener('drop', this.drop)

  function isJSON (text) { try { JSON.parse(text); return true } catch (error) { return false } }
  function isHTML (text) { try { new DOMParser().parseFromString(text, 'text/xml'); return true } catch (error) { return false } }
}

module.exports = Theme
