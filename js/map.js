var geolocWatch;

//Toolbox Initialization
function toolboxInit( printLegendLayers ){
	require ( [ 
		"mojo/ToolBox",
		"esri/tasks/GeometryService",
		"esri/tasks/PrintTask",
		"dojo/dom",
		"dojo/io-query" ], function( ToolBox, GeometryService, PrintTask, dom, ioQuery ){
		// Initialize basemapswitch control
		var toolbox = new ToolBox( { 
			map: map ,
			geometryService: new GeometryService( config.geometry_service ),
			printTask: new PrintTask( config.print_task ),
			printLegendLayers: printLegendLayers,
			onToolOn: function( event ){
				if( event.tool === "print" ){ 
					mapClick = "property";
				}else if( event.tool === "geolocation" ){ 
					mapClick = "property";
					
					if( navigator.geolocation ){  
						geolocWatch = navigator.geolocation.watchPosition ( geoLocate, geoLocateError );
					}else{
						alert ( "Browser doesn't support Geolocation. Visit http://caniuse.com to see browser support for the Geolocation API." );
					}
				}else{
					var selectionLayer = agsServices[ serviceNames.indexOf( "selection" ) ];
	
					//disable click event of the selected feature
					selectionLayer.disableMouseEvents( );
					mapClick = event.tool;
				}
			},
			onToolOff: function( event ){
				if( event.tool === "identify" ){
					delLocationGraphic( );
				}else if( event.tool === "geolocation" ){
					delGeoLocationGraphic( );
					
					//error occurred so stop watchPosition
					if( navigator.geolocation ){
						navigator.geolocation.clearWatch( geolocWatch );
					}
				}
				
				if( mapClick !== "property" ){
					var selectionLayer = agsServices[ serviceNames.indexOf ( "selection" ) ];
					
					//enable click event of the selected feature
					selectionLayer.enableMouseEvents( );
					mapClick = "property";
				}	
			}
		} ).placeAt( dom.byId ( "toolbox" ) );
		toolbox.startup( );
	} );
}

//Map Events Initialization
function mapEventsInit( ){
	// Take care of map clicks		
	map.on( "click", function( event ){
		if( ( mapClick === "property" ) && !event.graphic ){
			finder( { x: event.mapPoint.x, y: event.mapPoint.y, zoom: false }, "searchresults" );
			lastSearch = "click";
			document.getElementById( "searching" ).classList.remove( "hidden" );
		}else if( mapClick === "identify" ){
			require( [ "dojo/_base/connect", "dojo/request" ], function( connect, request ){
				script.get( config.web_service_local + "v1/ws_geo_projectpoint.php", {
					handleAs: "json",
					query: { 
						x : event.mapPoint.x, 
						y : event.mapPoint.y, 
						fromsrid : 2264
					}
				} ).then( function( projdata ){
					if( projdata.length > 0 ){
						//add click point information		
						var info = {  
							"XY": parseFloat( event.mapPoint.x ).toFixed( 3 ) + ", " + parseFloat( event.mapPoint.y ).toFixed( 3 ), 
							"Lat Lon": parseFloat( projdata[ 0 ].y).toFixed( 5 ) + ", " + parseFloat( projdata[ 0 ].x ).toFixed( 5 ), 
							"USNG": LLtoUSNG( parseFloat( projdata[ 0 ].y ), parseFloat( projdata[ 0 ].x ), 4 )
						};
						
						document.getElementById( "idlayerloccont" ).innerHTML = Format.objectAsTable ( info , "proptbl", true )
							
						//add field information of selected layer in dropdown
						document.getElementById( "idlayerdatacont" ).innerHTML = "";
				
						idLayers( { x: event.mapPoint.x, y: event.mapPoint.y, lyridx : document.getElementById( "idlayerlist" ).value } );
										
						//show idlayer div				
						showDiv( "idlayers" );
										
						//add pointer to map at the clicked location
						connect.publish( "/add/graphics", { 
							graphictype: "location",
							x: event.mapPoint.x, 
							y: event.mapPoint.y, 
							desc: null,
							removegraphics: [ ], 
							zoom: false 
						} );
					}
				} );
			} );		
		}	
	} );
	
	Utils.getDomElements( document.querySelectorAll( "#scrolltodataleft, #scrolltodataright" ) ).forEach( function( ctrl ){ 
		ctrl.addEventListener( "click", function( event ){ document.getElementById( "aside" ).scrollIntoView( ); } );
	} );					
}

//delete location graphic from map
function delLocationGraphic( ){
	if( locationGraphic ){ 
		var selectionLayer = agsServices[ serviceNames.indexOf( "selection" ) ];
		selectionLayer.remove( locationGraphic );
		locationGraphic = null;	
	}
}	

function delGeoLocationGraphic( ){
	if( geolocGraphic ){ 
		var lyr = agsServices[ serviceNames.indexOf( "geoloclayer" ) ];
		lyr.remove( geolocGraphic );
		geolocGraphic = null;	
	}
}	

function delParcelGraphic( ){
	if( parcelGraphic ){
		var selectionLayer = agsServices[ serviceNames.indexOf ( "selection" ) ];
		selectionLayer.remove( parcelGraphic );
		parcelGraphic = null;	
	}
}

function delHelperGraphics( removegraphics ){
	for( var g = helperGraphics.length -1; g > -1; g-- ){ 
		if ( removegraphics.indexOf( helperGraphics[ g ].attributes.type ) > -1 ){
			var selectionLayer = agsServices[ serviceNames.indexOf( "selection" ) ];
				
			selectionLayer.remove( helperGraphics[ g ] );
			helperGraphics.splice( g, 2 );
		}
	}
}

//add graphics to map
function addGraphics( data ){
	require( [ "dojo/request", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", 
		"esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleFillSymbol", 
		"esri/symbols/SimpleLineSymbol", "esri/SpatialReference", "esri/geometry/Point", 
		"dojo/_base/Color" ], function( request, Graphic, SimpleMarkerSymbol, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, SpatialReference, Point, Color ){
		var selectionLayer = agsServices[ serviceNames.indexOf( "selection" ) ];
		
		//remove location graphic
		delLocationGraphic( );	
				
		//remove helper graphics
		if( data.removegraphics.length > 0 ){ 
			delHelperGraphics( data.removegraphics );
		}	
			
		switch( data.graphictype ){
			case "parcelpoly":
				//get parcel gemoetry from gissde02 and add to map
				request.get( config.web_service_local + "v1/ws_attributequery.php", {
					handleAs: "json",
					query: { 
						"table" : "parcels_py", 
						"fields" : "ST_AsText ( shape ) as parcelgeom", 
						"parameters" : "pid='" + data.groundpid + "'",
						"source" : "tax"
					}
				} ).then( function( parceldata ){
					//remove parcel graphic
					delParcelGraphic( );
				
					if( parceldata.length > 0 ){
						//add parcel feature to map
						parcelGraphic = new Graphic( 
							TextToGeom.polygon( parceldata[ 0 ].parcelgeom, 2264 ), 
							new SimpleFillSymbol( 
								SimpleFillSymbol.STYLE_SOLID, 
								new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color( [ 0, 255, 102 ] ), 3 ), 
								new Color( [ 0, 255, 102, 0 ] ) ), 
								{ "title" : "<h5>Selected Property</h5>", "content": "Parcel ID: " + data.taxpid + "<br/>" + data.address } ) ;
						selectionLayer.add( parcelGraphic );
											
						if( data.zoom ){
							var extent  = Utils.getGraphicsExtent( [ parcelGraphic ] );

							if( extent.xmax !== extent.xmax || extent.xmin !== extent.xmin || extent.ymax !== extent.ymax || extent.ymin !== extent.ymin ){
								extent = new Extent( parseFloat( data.x ) - 1, parseFloat( data.y ) - 1, 
									parseFloat( data.x ) + 1, parseFloat( data.y ) + 1, parcelGraphic.geometry.spatialReference );
							} 	
							
							zoom.toExtent( extent );
						}
					}else{					
						zoom.toExtent( Utils.generateExtent( config.initial_extent ) );
					}

					//show property details	
					showDiv( "propdetails" );					
				} );
				break;
			
			case "buffer":
				var bufferGraphic = new Graphic( data.buffergeom, 
					new SimpleFillSymbol( SimpleFillSymbol.STYLE_SOLID, 
					new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color( [ 255, 0, 0, 0.65 ] ), 2 ),
					new Color( [ 255, 0, 0, 0.35 ] ) ),
					{ "type" : "buffer" } );
			
				helperGraphics.push( bufferGraphic );
				selectionLayer.add( bufferGraphic );
			
				//zoom to add feature
				if( data.zoom ){
					zoom.toExtent( Utils.getGraphicsExtent( helperGraphics ) );
				}
				break;
				
			case "road":
				var parameters = "";
				
				for( var key in data ){
					var value = data[ key ];
					switch( key ){
						case "stprefix": 
							parameters += ( value ? ( ( parameters.length > 0 ? " and " : "" ) + "prefixdirection = '" + value + "'" ) : "" );
							break;
						case "stname": 
							parameters += ( value ? ( ( parameters.length > 0 ? " and " : "" ) + "streetname = '" + Format.escapeSingleQuote( value ) + "'" ) : "" );
							break;	
						case "sttype": 
							parameters += ( value ? ( ( parameters.length > 0 ? " and " : "" ) + "streettype = '" + value + "'" ) : "" );
							break;
						case "stsuffix": 
							parameters += ( value ? ( ( parameters.length > 0 ? " and " : "" ) + "suffix = '" + value + "'" ) : "" );
							break;
						case "stmuni": 
							parameters += ( value ? ( ( parameters.length > 0 ? " and " : "" ) + "( l_juris = '" + value + "' or r_juris = '" + value + "' )" ) : "" );
							break;
					}
				}
						
				//get the road segments form gissde02 and add to the map
				request.get( config.web_service_local + "v1/ws_attributequery.php", {
					handleAs: "json",
					query: { 
						"table" : "Streets_ln", 
						"fields" : "ST_AsText ( shape ) as roadgeom", 
						"parameters" : 	parameters,
						"source" : "gis"
					}
				} ).then( function( roaddata ){
					if( roaddata.length > 0 ){
						roaddata.forEach( function( item, i ){
							var roadGraphic = new Graphic ( 
								TextToGeom.polyline( item.roadgeom, 2264, "postgis" ),
								new SimpleLineSymbol( SimpleLineSymbol.STYLE_SOLID, new Color ( [ 0, 255, 102 ] ), 3 ), 
								{ type: "road", title : "<h5>Road</h5>", content: data.wholestname } );
							
							helperGraphics.push( roadGraphic );
							selectionLayer.add( roadGraphic );	
						} );
						
						//zoom to add feature
						if( data.zoom ){
							zoom.toExtent( Utils.getGraphicsExtent( helperGraphics ) );
						}
					}
				} );
				break;	
		
			case "location":
				//add the xy location to the map
				locationGraphic = new Graphic( 
					new Point( data.x, data.y, new SpatialReference( config.initial_extent.spatialReference ) ), 
					new PictureMarkerSymbol( { url: "image/markers/loc.png", width: 25, height: 41, yoffset: 20 } ), 
					{ type: "loc", title : "<h5>Location</h5>", content: data.desc } ) ; 
					
				selectionLayer.add( locationGraphic );	
					
				//zoom to add feature
				if( data.zoom ){
					zoom.toExtent( Utils.getGraphicsExtent( [ locationGraphic ] ) );
				}
				break;
				
			case "geolocation":
				var pt  = new Point( data.x, data.y, new SpatialReference( config.initial_extent.spatialReference ) )
				    lyr = agsServices[ serviceNames.indexOf( "geoloclayer" ) ];
			
				//add the geolocation to the map
				if( !geolocGraphic ){
					geolocGraphic = new Graphic( pt, new SimpleMarkerSymbol( SimpleMarkerSymbol.STYLE_CIRCLE, 12, new SimpleLineSymbol( 
						SimpleLineSymbol.STYLE_SOLID, new Color( [ 210, 105, 30, 0.5 ] ), 8 ), new Color( [ 210, 105, 30, 0.9 ] ) ), 
						{ type: "geoloc" } ); 
					
					lyr.add( geolocGraphic );	
				}else{ // move the graphic if it already exists
					geolocGraphic.setGeometry( pt );
				}
        		break;
		}
	} );		
}

function switchOnOffOverlay( service, id, switchon ){
	var overlay_store = layerListTree.model.store;
	
	overlay_store.fetchItemByIdentity( { identity: id, onItem: function( item ){
		overlay_store.setValue ( item, 'checked', switchon );
		toggleOverlays ( service, switchon, item[ ( service === "overlays_streets" ? "ostreets" : "otrans" ) ] );	
	} } );
}

function toggleOverlays( service, show, input_idx ){
	var lyrs = agsServices[ serviceNames.indexOf( service ) ].visibleLayers;

	input_idx.forEach( function( idx ){
		if( show ){
			if( lyrs.indexOf( idx ) < 0 ){
				lyrs.push( idx );
			} 
		}else{
			if( lyrs.indexOf( idx ) > -1 ){
				lyrs.splice( lyrs.indexOf( idx ), 1 );	
			}
		}
	} );
	
	agsServices[ serviceNames.indexOf( service ) ].setVisibleLayers( lyrs );
	legend.refresh( );
}

function geoLocate( location ){
	require( [ "dojo/_base/connect", "dojo/request" ], function( connect, request ){
		script.get( config.web_service_local + "v1/ws_geo_projectpoint.php", {
			handleAs: "json",
			query: { 
				x: location.coords.longitude, 
				y: location.coords.latitude, 
				fromsrid: 4326,
				tosrid: 2264
			}
		} ).then( function( projdata ){
			if( projdata.length > 0 ){
				finder( { lat: location.coords.latitude, lon: location.coords.longitude, x: projdata [ 0 ].x, y: projdata [ 0 ].y, zoom: true }, "searchresults" );
				lastSearch = "main";
				
				connect.publish( "/add/graphics", { 
					x: projdata [ 0 ].x, 
					y: projdata [ 0 ].y, 
					graphictype: "geolocation", 
					removegraphics: [ ], 
					zoom: false 
				} );
			}
		} );
	} );	
}

function geoLocateError( error ){
	//error occurred so stop watchPosition
    if( navigator.geolocation ){
        navigator.geolocation.clearWatch( geolocWatch );
    }
          
	switch( error.code ){
		case error.PERMISSION_DENIED:
            alert( "Location not provided" );
            break;
        case error.POSITION_UNAVAILABLE:
            alert( "Current location not available" );
            break;
        case error.TIMEOUT:
            alert( "Timeout" );
            break;
        default:
            alert( "Unknown error" );
            break;
 	}
}
			
var zoom = {
	toExtent: function( extent ){
		//done to work properly, when zooming to the extent of a point with a dynamic mapservice as the basemap
		if( extent.xmax - extent.xmin < 100 ){ 
			extent.xmin -= 100 - ( extent.xmax - extent.xmin );
			extent.xmax += 100 + ( extent.xmax - extent.xmin );
		}
		
		if(extent.ymax - extent.ymin < 100){
			extent.ymin -= 100 - ( extent.ymax - extent.ymin );
			extent.ymax += 100 + ( extent.ymax - extent.ymin );	
		}
			
		map.setExtent( extent.expand( 2 ) );
	},
	
	toSelectedParcel: function( ){
		this.toExtent( Utils.getGraphicsExtent( [ parcelGraphic ] ) );
	}
};