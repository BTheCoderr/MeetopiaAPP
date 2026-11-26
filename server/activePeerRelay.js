'use strict'

// Only the server-authoritative, mutually paired socket IDs may exchange
// WebRTC offers, ICE candidates, chat and other in-call signaling.
function isActivePeerRelay(activePairs, from, to) {
  return (
    typeof from === 'string' &&
    typeof to === 'string' &&
    from.length > 0 &&
    to.length > 0 &&
    from !== to &&
    activePairs.get(from) === to &&
    activePairs.get(to) === from
  )
}

module.exports = { isActivePeerRelay }
