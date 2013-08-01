Meteor.startup(function () {

  $("#map").height($(window).height() - 18)

  var map = L.map('map').setView([51.505, -0.09], 5)

  new L.StamenTileLayer("watercolor").addTo(map)

  Meteor.subscribe("positions")

  var positions = Positions.findByTimestampAsc()
    , marker = null
    , ships = ["aircraft", "container", "container2", "ferry", "fishing", "power", "power2", "rescue", "sail", "speed"]

  positions.observe({
    added: function (pos) {

      var latlng = [pos.latitude, pos.longitude]

      if (!marker) {
        var icon = L.icon({iconUrl: "img/icon-ship-"+ships[Math.floor(Math.random()*ships.length)]+".svg", iconSize: [60, 60], iconAnchor: [30, 30]})
        marker = L.marker(latlng, {icon: icon, iconAngle: pos.heading}).addTo(map)
      }

      // Move marker to new position
      marker.setLatLng(latlng).setIconAngle(pos.heading)

      // Move map view
      map.setView(latlng, map.getZoom())

      Meteor.setTimeout(drawTracks, 500)
    },
    // When start a new voyage, remove marker so we get a new ship graphic
    removed: function () {
      if (Positions.findByTimestampAsc().count() == 0) {
        map.removeLayer(marker)
        marker = null
      }
    }
  })

  var tracks = null

  function drawTracks () {

    if (tracks) {
      map.removeLayer(tracks)
    }

    tracks = L.polyline(Positions.findByTimestampAsc().fetch().map(function (d) {
      return [d.latitude, d.longitude]
    })).addTo(map)
  }
})

