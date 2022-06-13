function basemapInit( ){
	require( [ "esri/dijit/Basemap", "esri/dijit/BasemapLayer", "mojo/BasemapSwitch" ], function( Basemap, BasemapLayer, BasemapSwitch ){
		// Initialize basemapswitch control
		var aerial_layers = [ ];
		
		config.aerial_services.forEach( function( layer ){
			aerial_layers.push( new BasemapLayer( { url: layer.url } ) );	
		} );
		var basemapSwitch = new BasemapSwitch( { 	
			selectedBasemap: "streets", 
			basemaps: 
				[
					new Basemap( {	"id": "streets", layers: [ new BasemapLayer( { url: config.basemap_services.basemap } ) ] } ), 
					new Basemap( { "id": "aerials", layers: [ new BasemapLayer( { url: config.aerial_services[ 0 ].url } ) ] } ),
					new Basemap( { "id": "hybrid", layers: [ 
						new BasemapLayer( { url: config.aerial_services[ 0 ].url } ),
						new BasemapLayer( { url: config.basemap_services.basemap_aerial } )
					] } ),
					new Basemap( { "id": "topo", layers: [ 
						new BasemapLayer( { url: config.basemap_services.topo } ),
						new BasemapLayer( { url: config.basemap_services.basemap_aerial } )
					] } )
				],
			aerialsLayers: aerial_layers,
			map: map,
			onLabelChange: function( event ){
				switchOnOffOverlay( "overlays", event.label, event.show );
			},
			onBaseMapChange: function( basemaplyrs ){
				if( basemaplyrs.indexOf( "topohillshade" ) > -1 ){
					document.getElementById( "basemaplegend" ).innerHTML = "<img src='image/legend/topolegend104.png' />";
					printLegend = "topo";
					//_gaq.push( [ '_trackEvent', 'CATEGORY LABEL', 'Action Label' ] );
				}else if( basemaplyrs.indexOf( "basemap_aerial" ) > -1 ){
					document.getElementById( "basemaplegend" ).innerHTML = "<img src='image/legend/hybridlegend104.png' />";
					printLegend = "hybrid";
				}else if( basemaplyrs.indexOf( "basemap" ) > -1 ){
					document.getElementById( "basemaplegend" ).innerHTML = "<img src='image/legend/streetlegend104.png' />";
					printLegend = "street";
				}else{
					document.getElementById( "basemaplegend" ).innerHTML = "No Legend";
					printLegend = null;
				}
			}			
		} ).placeAt( document.getElementById( "basemapswitch" ) );
		basemapSwitch.startup( );
		document.getElementById( "basemaplegend" ).innerHTML = "<img src='image/legend/streetlegend104.png' />";
		printLegend = "street";
	} );
}

function overlaysInit( ){
	require ( [ "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/GraphicsLayer" ], function( ArcGISDynamicMapServiceLayer, GraphicsLayer ){
		var printLegendLayers = [ ];

		// Initialize dynamic map services
		for( var dynamic_service in config.overlay_services ){
			var srvc = new ArcGISDynamicMapServiceLayer( config.overlay_services[ dynamic_service ].url, 
				{ 
					id : dynamic_service, 
					opacity : config.overlay_services[ dynamic_service ].opacity,
					visible: config.overlay_services[ dynamic_service ].visible				
				} 
			);
			
			if( config.overlay_services[ dynamic_service ].visiblelyrs ){
				srvc.setVisibleLayers( config.overlay_services[ dynamic_service ].visiblelyrs );
			}
			
			agsServices.push( srvc );
			serviceNames.push( dynamic_service ); //store dynamic service names ti easily pull an ags service later in the code
			printLegendLayers.push( dynamic_service );
		}
		
		// Initialize graphic layers
		agsServices.push( new GraphicsLayer( ) );
		serviceNames.push( "selection" ); //store dynamic service name for future usage
		
		//Initialize geolocation gtaphic layer
		agsServices.push( new GraphicsLayer( ) );
		serviceNames.push( "geoloclayer" );
		
		// Add all map services to the map
		map.addLayers( agsServices );
		
		// Initialize Toolbox
		toolboxInit( printLegendLayers );
	} );	
}

//Layer Tree Control Initialization
function layerTreeLegendInit( ){
	require( [ 
		"cbtree/models/ForestStoreModel" ,
		"cbtree/Tree",
		"esri/dijit/Legend",
		"dojo/data/ItemFileWriteStore",
		"cbtree/extensions/TreeStyling" ], function( ForestStoreModel, Tree, Legend, ItemFileWriteStore ){
			// Initialize layer tree
			if( !layerListTree ){
				var overlay_store = new ItemFileWriteStore( { url: "data/regular.json?foo=1031" } );
		
				layerListTree = new Tree( { 
					autoExpand: true, 
					checkBoxes: true, 
					model: 
						new ForestStoreModel( { 
							store: overlay_store,
							query: { type: "group", show: true }, 
							rootId: "root", 
							rootLabel: "Overlays List", 
							childrenAttrs: [ "children" ] 
						} ), 
					showRoot: false 
				} );
				
				 // Hide Labels and Icons for the entire tree.
				layerListTree.set( "iconStyle", { display: "none" } );
				layerListTree.on( "checkBoxClick", function( item, nodeWidget, event ){
					if( selectedAddress.hasOwnProperty( "taxpid" ) ){
						switch( item.id[ 0 ] ){
							case "envgrp": case "bndrygrp":
								var cloneChkBoxes = [ "wtrqulbuff", "postconstdist", "fldp", "strmwtrsheds", "drnkwtrsheds", "soils", "zone" ];
								
								overlay_store.fetchItemByIdentity( { identity: item.id[ 0 ], onItem: function( data ){
									for( var child in data.children ){
										if( cloneChkBoxes.indexOf( data.children[ child ].id[ 0 ] ) > -1 ){
											document.getElementById( data.children[ child ].id[ 0 ] + 2 ).setAttribute( "checked", data.children[ child ].checked[ 0 ] );
										}
									}															
								} } );
								break;
							case "wtrqulbuff": case "postconstdist": case "fldp": case "strmwtrsheds": case "drnkwtrsheds": case "soils": 
							case "zone": case "sphrinflu": case "histdist": case "annex": case "censustracts":
								document.getElementById( item.id[ 0 ] + 2 ).setAttribute( "checked", item.checked[ 0 ] );
								break;	
						}
					}
					
					//add and remove layer in the labels map service
					if( item.hasOwnProperty( "olabels" ) ){
						toggleOverlays( "overlays_labels", item.checked[ 0 ], item.olabels );
					}
						
					//add and remove layer in the overlays map service
					if( item.hasOwnProperty( "ostreets" ) ){
						toggleOverlays( "overlays_streets", item.checked[ 0 ], item.ostreets );
					}	
							
					//add and remove layer in the overlays transparent map service
					if( item.hasOwnProperty( "otrans" ) ){
						toggleOverlays( "overlays_trans", item.checked[ 0 ], item.otrans );
					}
				} );
				
				layerListTree.placeAt( document.getElementById( "layerstree" ) );
				layerListTree.startup( );
			}
			
			// handle query string parameters
			handleHash( );
			
			//add legend
			if( !legend ){
				legend = new Legend( { 
					map:map, 
					layerInfos: [  
						{ layer: agsServices[ serviceNames.indexOf( "overlays_labels" ) ], hideLayers: [ 0, 1, 2 ], title: "Opaque Layers" },
						{ layer: agsServices[ serviceNames.indexOf( "overlays_streets" ) ], title: "Opaque Layers" },
						{ layer: agsServices[ serviceNames.indexOf( "overlays_trans" ) ], title: "Transparent Layers" }
					] 
				}, "overlaylegend" );
				legend.startup( );
			}	
	} );		
}