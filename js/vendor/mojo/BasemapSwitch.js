define( [
		"dojo/_base/declare",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/_base/lang",
		"dojo/dom-class",
		"dojo/touch",
		"dijit/form/HorizontalSlider",
		"dijit/form/HorizontalRuleLabels",
		"esri/dijit/BasemapGallery" ], function( declare, _WidgetBase, _TemplatedMixin, lang, domClass, touch, 
		HorizontalSlider, HorizontalRuleLabels, BasemapGallery ){
  
		var Widget = declare( [ _WidgetBase, _TemplatedMixin ], {
			declaredClass: "mojo.BasemapSwitch",
			templateString: 
				"<div class='mojoBasemapSwitch' data-dojo-attach-point='_basemapswitch'>" +
					"<div class='mojoButtons'>" + 
						"<div class='mojoButton alignleft streets selected' data-dojo-attach-point='_streets' data-dojo-attach-event='onclick:_onClick'>Streets</div>" +
						"<div class='mojoButton alignleft aerials' data-dojo-attach-point='_aerials' data-dojo-attach-event='onclick:_onClick'>Aerials</div>" +						
						"<div class='mojoButton alignleft hybrid' data-dojo-attach-point='_hybrid' data-dojo-attach-event='onclick:_onClick'>Hybrid</div>" +
						"<div class='mojoButton alignleft topo' data-dojo-attach-point='_topo' data-dojo-attach-event='onclick:_onClick'>Topo</div>" +
						"<div class='fixalign'></div>" +
					"</div>" +
					"<div class='mojoButtonPopout hidden' data-dojo-attach-point='_aerialslider' >" +
						"<div class='slider'>" +
							"<div data-dojo-attach-point='_slider'></div>" +
						"</div>" +
						"<div class='rulelabel'>" +
							"<div data-dojo-attach-point='_rulelabel'></div>" +
						"</div>" +
					"</div>" +
				"</div>",
			options: {
				map: null,
				aerialsLayers: null,
				selectedBasemap: "streets",
				basemaps: [ ]
			},	
			
			refreshID: null,
			
			constructor: function( options, srcRefNode ){
				// mix in settings and defaults
				lang.mixin( this.options, options );
				
				//mix options with properties
				lang.mixin( this, this.options );
			},
			
			// start widget. called by user
			startup: function( ){
				this._init( );
			},
			
			// bind listener for touch action
			postCreate: function( ){
				touch.over( this._basemapswitch, lang.hitch( this, this._onMouseover ) );
				touch.out( this._basemapswitch, lang.hitch( this, this._onMouseout ) );	
			},
									
			_init: function( ){ 
				//add basemap gallery
				this.basemapgallery = new BasemapGallery( { 
					showArcGISBasemaps : false, 
					basemaps : this.basemaps, 
					map : this.map 
				} );
				
				var slider = new HorizontalSlider( {
					name: "slider",
					value: 0,
					minimum: 0,
					maximum: 6,
					discreteValues: 7,
					intermediateChanges: true,
					showButtons: true,
					style: "width:166px;",
					onChange: lang.hitch( this, function( value ) {
						this.basemaps [ 1 ].layers.splice( 0, 1, this.aerialsLayers[ value ] );
						this.basemaps [ 2 ].layers.splice( 0, 1, this.aerialsLayers[ value ] );
						this.basemapgallery.select( this.selectedBasemap );
												
						var filteredArr = this.basemaps.filter( lang.hitch( this, function( item ) {
						  return item.id == this.selectedBasemap;
						} ) );
					
						var lyrs = "";
						filteredArr[ 0 ].layers.forEach ( function( layer, i ){
							lyrs += ( lyrs.length === 0 ? "": ",") + layer.url.replace ( "http://gisags03/ArcGIS03/rest/services/", "" ).replace ( "/MapServer", "" ) ; 						
						} );
						
						return this.onBaseMapChange( lyrs );
					} ) 
				}, this._slider ).startup( );
				
				var sliderLabels = new HorizontalRuleLabels( {
					labels: [ "2020", "2019", "2018", "2017", "2016", "2015", "2014" ],
					style: "font-size:8px;"
				}, this._rulelabel );
			},
			
			_onClick: function( event ){
				if( event.target.className.indexOf( "selected" ) === -1 ){
					domClass.remove( this["_" + this.selectedBasemap], "selected" );
					
					if( event.target.className.indexOf( "streets" ) > -1 ){
						this.selectedBasemap = "streets";
						domClass.add( this._aerialslider, "hidden" );
					}else if( event.target.className.indexOf( "aerials" ) > -1 ){
						this.selectedBasemap = "aerials";
						domClass.remove( this._aerialslider, "hidden" );
					}else if( event.target.className.indexOf( "hybrid" ) > -1 ){
						this.selectedBasemap = "hybrid";
						domClass.remove( this._aerialslider, "hidden" );
					}else if( event.target.className.indexOf( "topo" ) > -1 ){
						this.selectedBasemap = "topo";
						domClass.add( this._aerialslider, "hidden" );
					}
					
					domClass.add( this[ "_" + this.selectedBasemap ], "selected" );
					this.basemapgallery.select( this.selectedBasemap );
										
					var filteredArr = this.basemaps.filter( lang.hitch( this, function( item ){
					  return item.id == this.selectedBasemap;
					} ) );
					
					var lyrs = "";
					
					filteredArr[ 0 ].layers.forEach( function( layer, i ){
						lyrs += ( lyrs.length === 0 ? "": ",") + layer.url.replace ( "http://gisags03/ArcGIS03/rest/services/", "" ).replace ( "/MapServer", "" ) ; 						
					} );
					
					return this.onBaseMapChange( lyrs );
				}
			},
			
			_onMouseover: function( event ){
				if ( this.selectedBasemap === "aerials" || this.selectedBasemap === "hybrid" ){
					if( this.refreshID ){
						this.refreshID = window.clearInterval( this.refreshID ); 
					}
					
					//show dashboard
					domClass.remove( this._aerialslider, "hidden");
				}
			},
			
			_onMouseout: function( event ){
				if( this.selectedBasemap === "aerials" || this.selectedBasemap === "hybrid" ){
					//start timer to hide dashboard
					this.refreshID = self.setInterval( lang.hitch( this, function( ){ 
					domClass.add( this._aerialslider, "hidden" ); 
					} ), 2000 );
				}	
			},
			
			onBaseMapChange: { // nothing here: the extension point!
			}
		} );
    return Widget;
} );