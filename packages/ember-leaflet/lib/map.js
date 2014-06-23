/**
  `EmberLeaflet.MapView` is an `Ember.View` object present in the DOM, and
  also instantiates a Leaflet map inside.
 
  @class MapView
  @namespace EmberLeaflet
  @extends EmberLeaflet.ContainerLayerMixin
*/

var DEFAULT_CENTER = L.latLng(40.713282, -74.006978);

EmberLeaflet.MapView = Ember.View.extend(EmberLeaflet.ContainerLayerMixin, {
  options: {},
  center: DEFAULT_CENTER,
  zoom: 16,
  
  isMoving: false,
  isZooming: false,

  // Events this map can respond to.
  events: [
    'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
    'mousemove', 'contextmenu', 'focus', 'blur', 'preclick', 'load',
    'unload', 'viewreset', 'movestart', 'move', 'moveend', 'dragstart',
    'drag', 'dragend', 'zoomstart', 'zoomend', 'zoomlevelschange',
    'resize', 'autopanstart', 'layeradd', 'layerremove',
    'baselayerchange', 'overlayadd', 'overlayremove', 'locationfound',
    'locationerror', 'popupopen', 'popupclose'],

  init: function() {
    this._super();
    if(this.get('childLayers') === undefined) {
      this.set('childLayers', [EmberLeaflet.DefaultTileLayer]);
    }
  },

  didInsertElement: function() {
    this._super();
    this._createLayer();
  },

  willDestroyElement: function() {
    this._destroyLayer();
  },

  _createLayer: function() {
    if(this._layer) { return; }
    Ember.assert("Center must be set before creating map, was " +
      this.get('center'), !!this.get('center'));
    Ember.assert("Zoom must be set before creating map, was " + 
      this.get('zoom'), !!this.get('zoom'));
    this.willCreateLayer();
    this.propertyWillChange('layer');
    this._layer = L.map(this.get('elementId'), this.get('options'));
    this._layer.setView(this.get('center'), this.get('zoom'));
    this._addEventListeners();
    this.propertyDidChange('layer');
    this.didCreateLayer();
  },

  _destroyLayer: function() {
    this.willDestroyLayer();
    this.propertyWillChange('layer');
    if(!this._layer) { return; }
    if(this._defaultChildLayer) {
      this._layer.removeLayer(this._defaultChildLayer);
      this._defaultChildLayer = null;
    }
    this._removeEventListeners();
    this._layer.remove();
    this._layer = null;
    this.propertyDidChange('layer');
    this.didDestroyLayer();
  },

  zoomstart: function(e) {
    this.set('isZooming', true);
  },

  zoomend: function(e) {
    this.setProperties({isZooming: false, zoom: this._layer.getZoom()});
    // if two zooms are called at once, a zoom could get queued. So
    // set zoom to the queued one if relevant.
    if(this._queuedZoom) {
      if(this._queuedZoom !== this._layer.getZoom()) {
        this._layer.setZoom(this._queuedZoom); }
      this._queuedZoom = null;
    }
  },

  movestart: function(e) {
    this.set('isMoving', true);
  },

  moveend: function(e) {
    this.set('isMoving', false);
  },

  move: function(e) {
    this.set('center', this._layer.getCenter());    
  },
  
  viewDidChange: Ember.observer(function() {
    if (!this._layer || Em.isNone(get(this, "center")) || 
      get(this, "isMoving") || get(this, "isZooming")) { return; }
  
      return this._layer.setView(get(this, "center"), get(this, "zoom"));
    }, "zoom", "center")
});
