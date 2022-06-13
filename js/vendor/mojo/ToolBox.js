define( [
	"esri/graphic", 
	"esri/symbols/Font",			
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol", 
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/TextSymbol",
	"esri/tasks/AreasAndLengthsParameters",
	"esri/tasks/LegendLayer",
	"esri/tasks/LengthsParameters", 
	"esri/tasks/PrintParameters",
	"esri/tasks/PrintTemplate",
	"esri/toolbars/draw",
	"dojo/_base/connect",
	"dojo/_base/Color",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetBase"
	], function( Graphic, Font, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol,
		AreasAndLengthsParameters, LegendLayer, LengthsParameters, PrintParameters, PrintTemplate, 
		Draw, connect, Color, declare, lang, domClass, domConstruct, _TemplatedMixin, _WidgetBase ){
    
		var basePath = require.toUrl( "mojo" );
		var Widget = declare( [ _WidgetBase, _TemplatedMixin ], {
			templateString: 
				"<div class='mojoToolBox'>" +
					"<div class='mojoButtons'>" +
						"<div class='mojoButton identify' data-dojo-attach-point='_identify' data-dojo-attach-event='onclick:_onToolOn'></div>" +
						"<div class='mojoButton distmeasure' data-dojo-attach-point='_distmeasure' data-dojo-attach-event='onclick:_onToolOn'></div>" +
						"<div class='mojoButton areameasure' data-dojo-attach-point='_areameasure' data-dojo-attach-event='onclick:_onToolOn'></div>" +
						"<div class='mojoButton markup' data-dojo-attach-point='_markup' data-dojo-attach-event='onclick:_onToolOn'></div>" +
						"<div class='mojoButton erase' data-dojo-attach-point='_erase' data-dojo-attach-event='onclick:_onToolOn'></div>" +
						"<div class='mojoButton print' data-dojo-attach-point='_print' data-dojo-attach-event='onclick:_onToolOn'></div>" +
						//will be uncommented once polaris moves to https
						//"<div class='mojoButton geolocation' data-dojo-attach-point='_geolocation' data-dojo-attach-event='onclick:_onToolOn'></div>" +
					"</div>" +		
					"<div class='mojoButtonHorizontalPopout hidden' data-dojo-attach-point='_content' >" +					
						"<div class='toolTitle' data-dojo-attach-point='_title'></div>" +
						"<div class='toolClose mojoCont' data-dojo-attach-event='onclick:_onToolOff'></div>" +
						"<div class='identifyTool hidden' data-dojo-attach-point='_identifyResult'>" +
							"Click map to ID layers. To select property, close ID Tool and just click on map." +
						"</div>" +
						"<div class='distmeasureTool hidden' data-dojo-attach-point='_distmeasureResult'>" +
						"</div>" +
						"<div class='areameasureTool hidden' data-dojo-attach-point='_areameasureResult'>" +
						"</div>" +
						"<div class='markupTool hidden' data-dojo-attach-point='_markupResult'>" +
							"<div class='alignleft mojoButton markuppoint' data-dojo-attach-point='_markuppoint' data-dojo-attach-event='onclick:_onMarkup'></div>" +
							"<div class='alignleft mojoButton markupline' data-dojo-attach-point='_markupline' data-dojo-attach-event='onclick:_onMarkup'></div>" +
							"<div class='alignleft mojoButton markuppoly' data-dojo-attach-point='_markuppoly' data-dojo-attach-event='onclick:_onMarkup'></div>" +
						"</div>" +
						"<div class='eraseTool hidden' data-dojo-attach-point='_eraseResult'>" +
							"<div class='mojoCont'>Click on the graphics to erase individual ones.</div>" + 
							"<div class='mojoCont'>OR</div>" +
							"<div class='mojoCont'>" +
								"<input type='button' value='Erase All Graphics' data-dojo-attach-event='onclick:_onEraseAll' />" + 
							"</div>" +
						"</div>" +
						"<div class='printContentTool fixalign hidden' data-dojo-attach-point='_printResult'>" +
							"<div class='mojoCont'>Map Layout</div>" +
							"<div class='mojoCont' data-dojo-attach-event='onchange:_onLayoutChange'>"+
								"<select data-dojo-attach-point='_maplayout'>" + 
									"<option value='Landscape8x11'>Landscape 11 x 8.5</option>" +
									"<option value='Portrait8x11'>Portrait 8.5 x 11</option>" +										
									"<option value='MAP_ONLY'>Screenshot</option>" +										
								"</select>" + 
							"</div>" +
							"<div class='mojoCont' data-dojo-attach-point='_mapTitleLabel'>Map Title</div>" +
							"<div class='mojoCont' data-dojo-attach-point='_mapTitle'>" + 
								"<input type='text' placeholder='Enter Title' data-dojo-attach-point='_maptitle'/>" + 
							"</div>" +
							"<div class='mojoCont' data-dojo-attach-point='_addLegend'>" + 
								"<input type='checkbox' data-dojo-attach-point='_legend' />&nbsp;Add Legend" + 
							"</div>" +
							"<div class='mojoCont'>" + 
								"<div class='alignright'>" + 
									"<input type='button' value='Go' data-dojo-attach-event='onclick:_onPrint' />" + 
								"</div>" +	
								"<div class='alignright hidden' data-dojo-attach-point='_printprogress'>" + 
									"<img src='image/spin.gif' />" + 
								"</div>" +
							"</div>" +
							"<div class='mojoCont fixalign textcenter' data-dojo-attach-point='_printresult'>" +
							"</div>" +
						"</div>" +
						//will be uncommented once polaris moves to https
						/*"<div class='geolocationTool hidden' data-dojo-attach-point='_geolocationResult'>" +
							"<div class='mojoCont'>Selects the property at the current geographic location.</div>" + 
						"</div>" +*/
					"</div>" +		
				"</div>",
							
			options: {
				map: null,
				geometryService: null,
				printTask: null
			},	
			selectedTool: null,
			lastMeasure: null,
			selectedMarkup: null,
			eraseHandle: null,
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
			_init: function( ){
				//initialize draw toolbar
				this.drawToolbar = new Draw( this.map );
				
				//initialize draw toolbar events
				this.drawToolbar.on( "draw-end", lang.hitch( this, function( event ){
					this._OnDrawEnd( {
						selectedTool: this.selectedTool,
						selectedMarkup: this.selectedMarkup,
						geom: event.geometry,
						geomserv: this.geometryService, 	
						graphics: this.map.graphics     
					} );
				} ) );	
				
				//initialize geometry service events
				this.geometryService.on( "lengths-complete", lang.hitch( this, function( event ){	
					this._onDistMeasureComplete( { distance: event.result.lengths[ 0 ], domloc: this._distmeasureResult } );
				} ) );
				
				this.geometryService.on( "areas-and-lengths-complete", lang.hitch( this, function( event ){
					this._onAreaMeasureComplete( { 
						area: event.result.areas[ 0 ], 
						domloc: this._areameasureResult,
						geomserv: this.geometryService, 	
						graphics: this.map.graphics     
					} );
				} ) );
			},
			_onToolOn: function( event ){
				if( this.selectedTool ){
					//clear and reset visualization
					domClass.add( this[ "_" + this.selectedTool + "Result" ], "hidden" );
					domClass.remove( this[ "_" + this.selectedTool ], "selected" );
				}	
				
				if( event.target.className.indexOf( "identify" ) > -1 ){ //identify tool clicked
					domClass.add( this._identify, "selected" );
					this.selectedTool = "identify";
					domConstruct.place( "<span>Identify</span>", this._title, 'only' );
					
					//reset
					//map.graphics.clear();
					
					//deactivate draw toolbar
					if( this.drawToolbar ){ 
						this.drawToolbar.deactivate( );
					}
				}else if( event.target.className.indexOf( "distmeasure" ) > -1 ){ //distmeasure tool clicked
					domClass.add( this._distmeasure, "selected" );
					this.selectedTool = "distmeasure";
					domConstruct.place( "<span>Distance Measure</span>", this._title, 'only' );	
					domConstruct.empty( this[ "_" + this.selectedTool + "Result" ] );
					
					//reset
					//map.graphics.clear();
					
					//activate drawtoolbar
					this.drawToolbar.activate( esri.toolbars.Draw.POLYLINE );
				}else if( event.target.className.indexOf ( "areameasure" ) > -1 ){ //areameasure tool clicked
					domClass.add( this._areameasure, "selected" );
					this.selectedTool = "areameasure";
					domConstruct.place( "<span>Area Measure</span>", this._title, 'only' );
					domConstruct.empty( this[ "_" + this.selectedTool + "Result" ] );
					
					//clear all map graphics
					//map.graphics.clear();
					
					//activate drawtoolbar
					this.drawToolbar.activate( esri.toolbars.Draw.POLYGON );
					
				}else if( event.target.className.indexOf( "print" ) > -1 ){ //print tool clicked
					domClass.add( this._print, "selected" );
					this.selectedTool = "print";
					domConstruct.place( "<span>Print</span>", this._title, 'only' );
					
					//deactivate draw toolbar
					if( this.drawToolbar ){ 
						this.drawToolbar.deactivate( );
					}
				}else if( event.target.className.indexOf( "markup" ) > -1 ){ //markup tool clicked
					domClass.add( this._markup, "selected" );
					this.selectedTool = "markup";
					domConstruct.place( "<span>Markup Tools</span>", this._title, 'only' );
									
					//switch on markuppoint	
					if( this.selectedMarkup ){
						domClass.remove( this[ "_" + this.selectedMarkup ], "selected" );
					}
					
					domClass.add( this._markuppoint, "selected" );
					this.selectedMarkup = "markuppoint";
					//activate drawtoolbar
					this.drawToolbar.activate( esri.toolbars.Draw.POINT );	
					
				}else if( event.target.className.indexOf( "erase" ) > -1 ){ //erase tool clicked
					domClass.add( this._erase, "selected" );
					this.selectedTool = "erase";
					domConstruct.place( "<span>Erase Graphics</span>", this._title, 'only' );
					
					//clear all map graphics
					//map.graphics.clear();
					
					//deactivate draw toolbar
					if( this.drawToolbar ){ 
						this.drawToolbar.deactivate( );
					}
						
					this.eraseHandle = connect.connect( this.map.graphics, "onClick", lang.hitch( this, function( event ){	
						this.map.graphics.remove( event.graphic );
					} ) );
				}else if( event.target.className.indexOf( "geolocation" ) > -1 ){ //identify tool clicked
					domClass.add( this._geolocation, "selected" );
					this.selectedTool = "geolocation";
					domConstruct.place( "<span>Geolocation</span>", this._title, 'only' );
					domClass.add( this._content, "hidden" );
										
					//deactivate draw toolbar
					if( this.drawToolbar ){ 
						this.drawToolbar.deactivate( );
					}
				}
						
				domClass.remove( this[ "_" + this.selectedTool + "Result" ], "hidden" );
				domClass.remove( this._content, "hidden" );
									
				//trigger tool on event
				return this.onToolOn( { tool: this.selectedTool } );
			},
			_onToolOff: function( event ){
				//clear graphics
				//this.map.graphics.clear();
				
				//deactivate draw toolbar
				if( this.drawToolbar ){ 
					this.drawToolbar.deactivate( );
				}
			
				//clear and reset visualization
				domClass.add( this._content, "hidden" );
				domClass.remove( this[ "_" + this.selectedTool ], "selected" );
				
				this.lastMeasure = null;
				
				//remove erase handleEvent
				connect.disconnect( this.eraseHandle ); 
				
				//trigger tool off event
				return this.onToolOff( { tool: this.selectedTool } );
			},
			
			_OnDrawEnd: function( event ){
				switch( event.selectedTool ){
					case "distmeasure":
						var lengthParams = new LengthsParameters( );
						lengthParams.polylines = [ event.geom ];
						lengthParams.lengthUnit = esri.tasks.GeometryService.FEET;
						event.geomserv.lengths( lengthParams );
						event.graphics.add( 
							new Graphic( event.geom, new SimpleLineSymbol ( 
								SimpleLineSymbol.STYLE_SOLID, new Color( [ 191, 54, 38 ] ), 3 ) )
						);
						break;
							
					case "areameasure":
						var areaParams = new AreasAndLengthsParameters();
						areaParams.polygons = [ event.geom ];
						areaParams.areaUnit = esri.tasks.GeometryService.UNIT_ACRES;
						areaParams.lengthUnit = esri.tasks.GeometryService.FEET;
						event.geomserv.areasAndLengths( areaParams );							
						event.graphics.add( 
							new Graphic( 
								event.geom, 
								new SimpleFillSymbol( 
									SimpleFillSymbol.STYLE_SOLID, 
									new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color( [ 191, 54, 38 ] ), 3 ), 
									new Color( [ 191, 54, 38, 0.5 ] ) 
								) 
							) 
						);
						break;
						
					case "markup":
						switch( event.selectedMarkup ){
							case "markuppoint":
								event.graphics.add( 
									new Graphic( event.geom, new SimpleMarkerSymbol( SimpleMarkerSymbol.STYLE_SQUARE, 10,
										new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID,
										new Color( [ 209, 189, 33 ] ), 1 ),
										new Color( [ 209, 189, 33, 0.5 ] ) ) ) 
								);		
								break;
								
							case "markupline":
								event.graphics.add ( 
									new Graphic( event.geom, new SimpleLineSymbol ( 
										SimpleLineSymbol.STYLE_SOLID, new Color( [ 209, 189, 33 ] ), 3 ) )
								);
								break;	
								
							case "markuppoly":
								event.graphics.add( 
									new Graphic(
										event.geom, 
										new SimpleFillSymbol( 
											SimpleFillSymbol.STYLE_SOLID, 
											new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color( [ 209, 189, 33 ] ), 3 ), 
											new Color( [ 209, 189, 33, 0.5 ] ) 
										) 
									) 
								);
								break;		
												
						}
						break;	
				}
			},
			
			_onDistMeasureComplete: function( event ){
				domConstruct.place( "<div>" + event.distance.toFixed( 2 ) + " ft</div><div>(" + ( event.distance / 5280 ).toFixed( 2 ) + " miles)</div>", event.domloc, "only" );
				this.lastMeasure = event.distance.toFixed ( 2 ) + " ft(" + ( event.distance / 5280 ).toFixed ( 2 ) + " miles)";
			},
			
			_onAreaMeasureComplete: function( event ){
				domConstruct.place( "<div>"+ event.area.toFixed( 2 ) + " acres</div><div>(" + ( event.area * 43560 ).toFixed ( 2 ) + " sq ft)</div>", event.domloc, "only" );
				event.geomserv.simplify( [ event.graphics.graphics[ event.graphics.graphics.length-1 ].geometry ], function( geometries ){
					if( geometries[ 0 ].rings.length > 0 ){ //get label points
						event.geomserv.labelPoints( geometries, function( labelPoints ){
							labelPoints.forEach( function( labelPoint ){
								var textSymbol =  new TextSymbol( event.area.toFixed( 2 ) + " acres" )
									.setColor( new Color( [ 255, 255, 255 ] ) )
									.setFont( new Font( "12pt" ).setWeight( Font.WEIGHT_BOLD ) );
					
								event.graphics.add( new Graphic( labelPoint, textSymbol ) );	
							} );
						} );
					}
				} );
				
				this.lastMeasure = event.area.toFixed( 2 ) + " acres(" + ( event.area * 43560 ).toFixed( 2 ) + " sq ft)";
			},
			
			_onLayoutChange: function( event ){ 
				if( this._maplayout.value === "MAP_ONLY" ){
					domClass.add( this._mapTitleLabel, "hidden" );
					domClass.add( this._mapTitle, "hidden" );
					domClass.add( this._addLegend, "hidden" );
				}else{
					domClass.remove( this._mapTitleLabel, "hidden" );
					domClass.remove( this._mapTitle, "hidden" );
					domClass.remove( this._addLegend, "hidden" );
				}
			},
			
			_onMarkup: function( event ){
				domClass.remove( this[ "_" + this.selectedMarkup ], "selected" );
			
				if( event.target.className.indexOf( "markuppoint" ) > -1 ){ //identify tool clicked
					domClass.add( this._markuppoint, "selected" );
					this.selectedMarkup = "markuppoint";
						
					//activate drawtoolbar
					this.drawToolbar.activate( esri.toolbars.Draw.POINT );
				}else if( event.target.className.indexOf ( "markupline" ) > -1 ){ //identify tool clicked
					domClass.add( this._markupline, "selected" );
					this.selectedMarkup = "markupline";
					
					//activate drawtoolbar
					this.drawToolbar.activate( esri.toolbars.Draw.POLYLINE );
				}else if( event.target.className.indexOf( "markuppoly" ) > -1 ){ //identify tool clicked
					domClass.add( this._markuppoly, "selected" );
					this.selectedMarkup = "markuppoly";
					
					//activate drawtoolbar
					this.drawToolbar.activate( esri.toolbars.Draw.POLYGON );
				}else if( event.target.className.indexOf( "markuperase" ) > -1 ){ //identify tool clicked
					domClass.add( this._markuperase, "selected" );
					this.selectedMarkup = "markuperase";
				}				
			},
			
			_onPrint: function( event ){
				var template = new PrintTemplate( ),
					param = new PrintParameters( ),
					legendLyrs = [ ];
					
				//set print template 
				//layout//
				template.layout = this._maplayout.value;
							
				//format//			
				if( this._maplayout.value === "MAP_ONLY" ){
					template.format = "PNG8";
					template.exportOptions = { width: this.map.width, height: this.map.height, dpi: 96 };
				}else{ 
					template.format = "PDF"; 
					
					if( this._legend.checked ){
						template.layout += "Legend";
						
						for( var i = 0; i < this.printLegendLayers.length; i++ ){
							var srvc = this.map.getLayer( this.printLegendLayers[ i ] );
							
							if( srvc.visible ){
								var oLegend = new LegendLayer( );
								oLegend.layerId = srvc.id;
								oLegend.subLayerIds = srvc.visibleLayers;
								legendLyrs.push( oLegend );
							}
						}
					} 
				}	
				
				//layoutoptions//
				template.layoutOptions = { 
					titleText: ( this._maptitle.value.length > 0 ? this._maptitle.value.substring( 0, 60 ) : "" ), 
					legendLayers: legendLyrs,
					authorText: ( this.lastMeasure ? this.lastMeasure: "" )
				};	
				
				template.preserveScale = true;
			
				//hack to fix the basemap not showing in the print map when basemap at the 600 scale level
				map.getLayersVisibleAtScale( map.getScale( ) ).forEach( function( layer ){
					if( layer.maxScale === 600 ){
						layer.setMaxScale( 599 );
					}				} );	
					
					
				//esri.config.defaults.io.alwaysUseProxy = false;								
				this.printTask.execute( 
					lang.mixin( param, { map: map, template: template } ),
					lang.hitch( this, function( result ){
						var currbasemap,
							htmlstr = "<span class='mojoCont'><a href='" + result.url.replace( "localhost", this.printServerName ).replace( "http", "https" ) + "?" + Math.floor( Math.random( ) * 1000000001 ) + 
							"' target='_blank'>" + ( this._maplayout.value === "MAP_ONLY" ? "Screenshot" : "Print Map" ) + "</a></span>";
													
						if( this._maplayout.value !== "MAP_ONLY" && printLegend ){
							htmlstr += 	"&nbsp;&nbsp;<span class='mojoCont'><a href='" + config.ws + "v1/basemaplegend.php?legend=" + printLegend + 
								"&orientation=" + this._maplayout.value.substr( 0, 1 ) + "' target='_blank'>Basemap Legend</a></span>";
						}
											
						domClass.add( this._printprogress, "hidden" );
						domConstruct.place( htmlstr, this._printresult, "only" );
					} ), 
					
					lang.hitch( this, function( error ){
						domClass.add( this._printprogress, "hidden" );
						domConstruct.place( "<span class='mojoCont note'>Print encountered an error. Please try again<span>", this._printresult, "only" );
					} )
				);
				//esri.config.defaults.io.alwaysUseProxy = true;
				
				//show progress and clear old links
				domClass.remove( this._printprogress, "hidden" );
				domConstruct.empty( this._printresult );
			},
			
			_onEraseAll: function( event ){
				//clear all map graphics
				this.map.graphics.clear( );
			},
			
			onToolOn: { // nothing here: the extension point!
			},
			
			onToolOff: { // nothing here: the extension point!
			}
		} );
    
    return Widget;
} );