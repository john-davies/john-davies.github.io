// Javascript stuff

// Coloured markers to use with Leaflet, set up when page loaded
var redIcon;
var yellowIcon;
var greenIcon;
var blueIcon;
var greyIcon;
var blackIcon;

// Map
var map;
// Pano viewer
var viewer;
var hotSpotDebug = false; // Change to false for release

// List of extra data for each trig point
var trigPointDetails = {};

function initPage() {
  // Set up the "About" popup window
  var aboutPopup = document.getElementById("aboutText");
  document.getElementById("aboutShow").onclick = function() {
    aboutPopup.style.display = "block";
  }
  document.getElementById("aboutDismiss").onclick = function() {
    aboutPopup.style.display = "none";
  }

  // Set up the 3D viewer pop up close button
  var view3DPopup = document.getElementById("view3DModel");
  document.getElementById("view3DDismiss").onclick = function() {
    view3DPopup.style.display = "none";
  }

  // Set up the coloured markers for Leaflet
  redIcon = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-red.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  redIconNA = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-red-na.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  yellowIcon = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-yellow.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  yellowIconNA = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-yellow-na.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  greenIcon = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-green.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  greenIconNA = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-green-na.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  blueIcon = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-blue.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  blueIconNA = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-blue-na.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  greyIcon = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-grey.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  blackIcon = new L.Icon({
    iconUrl: 'assets/markers/marker-icon-black.png',
    shadowUrl: 'assets/markers/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Get the trig point data
  fetch("assets/trigList.json", {cache: "no-store"} )
  .then(response => {
      if (!response.ok) {
          throw new Error("HTTP error " + response.status);
      }
      return response.json();
  })
  .then(trigList => {
    console.log( "trigList.json loaded" );
    console.log( "Interface version: " + trigList.interfaceVersion );
    populateScreen( trigList );
  })
  .catch(err => {
      console.log( err );
  });

};

function populateScreen( trigList ) {
  // Loop through the downloaded trig points and set up the panoramas
  let firstPoint = true;
  for( const entry of trigList.scenes ){

    console.log( "Loading scene: " + entry.id );

    // Populate the extra data array
    let tempData = {};
    tempData.displayName = entry.extraData.displayName;
    tempData.imagePath = entry.extraData.imagePath;
    tempData.height = entry.extraData.height;
    tempData.LatLong = entry.mapData.lat + " / " + entry.mapData.long;
    tempData.OsGridRef = entry.extraData.OsGridRef;
    tempData.comment = entry.extraData.comment;

    if( firstPoint ) {
      // Initialise the map and set the first point as the default origin
      map = L.map('map').setView([entry.mapData.lat, entry.mapData.long], 11);
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'}).addTo(map);
      // Initialise the panorama viewer and load the first scene
      viewer = pannellum.viewer('panorama', {
        "default": { "firstScene": entry.id, "sceneFadeDuration": 1000 },
        "scenes": {
            [entry.id] : {
               "hfov": entry.imageData.hfov,
               "vaov": entry.imageData.vaov,
               "vOffset": entry.imageData.vOffset,
               "minPitch": entry.imageData.minPitch,
               "pitch": entry.imageData.pitch,
               "maxPitch": entry.imageData.maxPitch,
               "avoidShowingBackground": entry.imageData.avoidShowingBackground,
               "autoLoad": entry.imageData.autoLoad,
               "hotSpotDebug": hotSpotDebug,
               "type": "multires",
               "multiRes": {
                 "basePath": entry.multiRes.basePath,
                 "path": entry.multiRes.path,
                 "fallbackPath": entry.multiRes.fallbackPath,
                 "extension": entry.multiRes.extension,
                 "tileResolution": entry.multiRes.tileResolution,
                 "maxLevel": entry.multiRes.maxLevel,
                 "cubeResolution": entry.multiRes.cubeResolution
               }
             }
           }
         }
       )
    }
    else {
      // Append the scene to the existing viewer
      viewer.addScene( entry.id, {
        "hfov": entry.imageData.hfov,
        "vaov": entry.imageData.vaov,
        "vOffset": entry.imageData.vOffset,
        "minPitch": entry.imageData.minPitch,
        "pitch": entry.imageData.pitch,
        "maxPitch": entry.imageData.maxPitch,
        "avoidShowingBackground": entry.imageData.avoidShowingBackground,
        "autoLoad": entry.imageData.autoLoad,
        "hotSpotDebug": hotSpotDebug,
        "type": "multires",
        "multiRes": {
          "basePath": entry.multiRes.basePath,
          "path": entry.multiRes.path,
          "fallbackPath": entry.multiRes.fallbackPath,
          "extension": entry.multiRes.extension,
          "tileResolution": entry.multiRes.tileResolution,
          "maxLevel": entry.multiRes.maxLevel,
          "cubeResolution": entry.multiRes.cubeResolution
        } } );
    }

    // Add hotspots to scene
    for( var i=0; i<entry.hotSpots.length; i++ ) {
      var hotSpot = entry.hotSpots[i];

      if( hotSpot.type == "scene" ) {
        viewer.addHotSpot( { "pitch":hotSpot.pitch, "yaw":hotSpot.yaw,
                             "type":"scene", "text":hotSpot.text, "sceneId":hotSpot.sceneId,
                             "targetPitch":hotSpot.targetPitch, "targetYaw":hotSpot.targetYaw,
                             "createTooltipFunc": customTooltipFunction,
                             "createTooltipArgs": [hotSpot.text, hotSpot.sceneId]
        }, entry.id);
        console.log( "  Hotspot/scene: " + hotSpot.text );
      }
      else if( hotSpot.type == "info" ) {
        if ( typeof hotSpot.URL == "undefined" ) {
          // No URL for hotspot
          viewer.addHotSpot( { "pitch":hotSpot.pitch, "yaw":hotSpot.yaw,
                               "type":"info", "text":hotSpot.text
          }, entry.id);
        }
        else {
          viewer.addHotSpot( { "pitch":hotSpot.pitch, "yaw":hotSpot.yaw,
                               "type":"info", "text":hotSpot.text, "URL":hotSpot.URL
          }, entry.id);
        }
        console.log( "  Hotspot/info: " + hotSpot.text );
      }
      else if( hotSpot.type == "3d" ) {
        viewer.addHotSpot( { "pitch":hotSpot.pitch, "yaw":hotSpot.yaw,
                             "type":"info", "text":hotSpot.text,
                             "cssClass": "view3D-hotspot",
                             "clickHandlerFunc": view3DHandler,
                             "clickHandlerArgs" : [ hotSpot.URL, hotSpot.Comment ]
        }, entry.id);
        console.log( "  Hotspot/3d: " + hotSpot.text );
        console.log( "    URL: " + hotSpot.URL );
        console.log( "    Comment: " + hotSpot.Comment );
      }
      else {
        console.log( "  Hotspot/unknown type: " + hotSpot.type );
      }
    }

    // Add map marker
    tempData.marker = addMarker( entry.mapData.lat, entry.mapData.long, entry.extraData.order,
                                  entry.extraData.displayName, entry.id, firstPoint );

    // Store details for this entry
    trigPointDetails[entry.id] = tempData;

    if( firstPoint ) {
      // Update the extra section
      updateExtraData( entry.id );
      firstPoint = false;
    }
  }

  // Set up the scene change listener for the pano view
  viewer.on('scenechange', sceneChangeListener);

};

function addMarker( lat, long, order, name, id, first ) {
  let iconColour = blackIcon;
  switch( order ) {
    case 1:
      iconColour = redIcon;
      break;
    case 2:
      iconColour = yellowIcon;
      break;
    case 3:
      iconColour = greenIcon;
      break;
    case 4:
      iconColour = blueIcon;
      break;
    case 11:
      iconColour = redIconNA;
      break;
    case 12:
      iconColour = yellowIconNA;
      break;
    case 13:
      iconColour = greenIconNA;
      break;
    case 14:
      iconColour = blueIconNA;
      break;
    default:
      iconColour = blackIcon;
  };

  let tempMarker = L.marker([lat, long],{icon: iconColour, id: id})
                        .bindPopup( name, { closeButton: false, autoClose: false, closeOnClick: false });
  tempMarker.addTo(map);
  tempMarker.on('click', mapClick );
  tempMarker.on('mouseover', function (e) { this.openPopup(); });
  tempMarker.on('mouseout', function (e) {
    // Don't close if this is the currently selected scene
    if ( this != trigPointDetails[viewer.getScene()].marker) {
        this.closePopup();
    }
  });

  // If it's the first one then open the pop up
  if ( first ) {
    tempMarker.openPopup();
  }
  return tempMarker;
};

function mapClick( e ) {
  if (viewer.getScene() != this.options.id ) {
    // Only load the scene if it's changed
    viewer.loadScene( this.options.id );
  }
  else {
    // There appears to be a bug in Leaflet.js where popups that
    // are clicked are closed automatically. This is a workaround because
    // fixes suggested in, e.g. https://github.com/Leaflet/Leaflet/issues/1391
    // don't work
    this.openPopup();
  }
};

function sceneChangeListener() {
  // Close all map popups
  for( var trigPoint in trigPointDetails ){
    trigPointDetails[trigPoint].marker.closePopup();
  }
  // Open new popup and change extra mapData
  var scene = viewer.getScene();
  trigPointDetails[scene].marker.openPopup();
  updateExtraData(scene);
};

function updateExtraData( entryID ) {
  document.getElementById("extraTextTitle").innerText = trigPointDetails[entryID].displayName;
  document.getElementById("extraTextHeight").innerText = trigPointDetails[entryID].height;
  document.getElementById("extraTextLatLong").innerText = trigPointDetails[entryID].LatLong;
  document.getElementById("extraTextGridRef").innerText = trigPointDetails[entryID].OsGridRef;
  document.getElementById("extraTextImage").src = trigPointDetails[entryID].imagePath;
};

function customTooltipFunction(div, createTooltipArgs) {
  div.classList.add('pnlm-tooltip');
  var span = document.createElement('span');
  span.innerHTML = createTooltipArgs[0];
  div.appendChild(span);
  span.style.width = span.scrollWidth - 20 + 'px';
  span.style.marginLeft = -(span.scrollWidth - div.offsetWidth) / 2 + 'px';
  span.style.marginTop = -span.scrollHeight - 12 + 'px';
  div.addEventListener('mouseover', function(e) {
    var targetName = createTooltipArgs[1];
    // Do something here to highlight map marker
    trigPointDetails[targetName].marker.openPopup();
  }, 'false');
  div.addEventListener('mouseout', function(e) {
    var targetName = createTooltipArgs[1];
    // Do something here to highlight map marker
    trigPointDetails[targetName].marker.closePopup();
  }, 'false');
};

function view3DHandler( div, clickHandlerArgs ) {
  var view3DPopup = document.getElementById("view3DModel");
  var view3DModelIframe = document.getElementById("view3DModelIframe");
  var view3DText = document.getElementById("view3DModelComment");

  view3DModelIframe.src = clickHandlerArgs[0];
  view3DText.innerHTML = clickHandlerArgs[1];
  view3DPopup.style.display = "block";
};
