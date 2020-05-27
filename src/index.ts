import * as React from 'react'
import * as ReactDOM from 'react-dom'

import Root from 'self://Layouts/Root'
import { Metrics } from 'self://Utils/Metrics';

async function OnDomReady() {
  Metrics.init()
  let manifest = await (await fetch("manifest.json")).json()
  window._meta = {
    version: manifest.version,
  }
}

function RemoveSizeHint() {
  // HACK: Shameless hack:
  //  The new layout is relying on flex containers for sizing elements.
  //  However for the extension to properly display in browser it must have a
  //  height set. This is problematic as flex elements will default to the smallest
  //  possible height by default.
  //
  //  As a quick and dirty solution to this a view-sizer class gives a min-height
  //  to the window allowing the extension to have a reasonable size.
  //  And to support a popout case we can listen to resize events, and once
  //  we register a resize event with a window height larger than 500.
  //  And when creating a window we create a window strictly larger than 500 by a little bit,
  //  thus causing any resize to trigger removal of the sizer.
  //
  //  This does not trigger in the extension mode, and that is good enough for me for now =].
  if (window.innerHeight > 500) {
    let body = document.querySelector('body')
    body.classList.remove('view-sizer')
    return true
  }
  return false
}

window.addEventListener('resize', function _handler(e) {
  // Unmount listener after removal succeeded.
  if (RemoveSizeHint()) {
    e.target.removeEventListener(e.type, _handler)
  }
})
window.addEventListener('DOMContentLoaded', (_e) => {
  OnDomReady().catch((_err) => {
    console.error('Failed to init the extension')
  })
})

ReactDOM.render(
  React.createElement(Root, null, null),
  document.getElementById('app')
)