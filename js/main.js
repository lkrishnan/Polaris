// main.js
// This file contains all the page related events and functions
// Created by Lak Krishnan
// 07/18/14
// @license     MIT

// Global Variables
var map,                    // the map
	agsServices = [ ],       // ArcGIS Service holder
	serviceNames = [ ],      // ArcGIS Service name holder
	layerListTree,          // overlay layer tree checkbox control        
	legend,                 // legend control 
	selectedAddress = { },   // holder for the selected location
	parcelGraphic = null,   // graphic of the selected parcel
	locationGraphic = null,	// graphic of a selected location
	geolocGraphic = null,	// graphic of a geo location
	helperGraphics = [ ],    // search result locations used in market analysis
	mapExtentInLatLon,      // holds the map extent projected to epsg 4326  	
	mapClick = "property",      // switch that determines if its ok to do a map identify
	printLegend,           // the currently selected basemap, used to pass to print map
	propPhotoGallery,
	lastSearch = null;
	
// Document Ready
require( [ "esri/geometry/Extent", "esri/map", "dojo/domReady!" ], function( Extent, Map ){
	// Initialize the map
	map = new Map( "map", { 
		extent: new Extent( config.initial_extent ), 
		logo: false, 
		minScale: config.min_scale, 
		zoom: 1 
	} );
		
	// Handle hash after layers and Layer Tree Control and Legend are loaded
	map.on( "layers-add-result", layerTreeLegendInit ); 
	// Handle hash after layers are loaded
	map.on( "load", function( ){
		overlaysInit( );
		map.disableKeyboardNavigation( );
	} );
			
	// Initialize Map Layers 
	basemapInit( );
	// Initialize Map Events
	mapEventsInit( );
	// Initialize all Search Controls
	searchInit( );
	// Initialize Report Issue
	issueInit( );
		
	// Initialize PubSub Subscriptions
	require( [ "dojo/_base/connect" ], function( connect ){
		connect.subscribe( "/change/selected", chngSelection ); // Selected record change
		connect.subscribe( "/add/graphics", addGraphics ); // Add graphics
		connect.subscribe( "/set/identity", setIdentity ); // Set selected property identity information
		connect.subscribe( "/set/characteristicsandtaxinfo", setCharacteristicsAndTaxInfo ); // Set selected property identity information abd tax information
		connect.subscribe( "/set/deed", setDeed ); // Set selected property deed and sales price
		connect.subscribe( "/set/locinfo", setLocInfo ); // Set selected property location information
		connect.subscribe( "/set/envinfo", setEnvInfo ); // Set selected property environmental information
		connect.subscribe( "/dojo/hashchange", handleHash );
	} );	
} );

//Initialize report issue controls
function issueInit( ){
	require( [ "dojo/request/xhr" ] , function( xhr ){
		document.getElementById( "issuebtn" ).addEventListener( "click", function( event ){
			var errors = [ ];
			
			document.getElementById( "issueerror" ).innerHTML = "";
		
			if( document.getElementById( "issuename" ).value.length === 0 ){
				errors.push ( "Name required" );
			}
			if( !Validate.isEmail ( document.getElementById( "issueemail" ).value ) ){
				errors.push( "Valid Email required" );
			}
			if( document.getElementById( "issuedesc" ).value.length === 0 ){
				errors.push( "Problem description required" );
			}
			if( errors.length > 0 ){
				errors.forEach( function( item, i ){
					document.getElementById( "issueerror" ).insertAdjacentHTML( "afterend", "<div>" + ( i + 1 ) + ". " + item + "</div>" );	
				} );
			}else{
				var message = "The Polaris 3G issue has been reported by " +  document.getElementById( "issuename" ).value +
					" ( " + document.getElementById( "issueemail" ).value + " ) : " + document.getElementById( "issuedesc" ).value,
					subject = "Polaris 3G Bug reported by " + document.getElementById( "issuename" ).value;
			
				xhr( config.ws + "v1/send_email.php", {
					data: { 
						to: "polaris3g@mecklenburgcountync.gov", 
						subject: subject, 
						message: message,
						success: "The issue was reported successfully.",
						failure: "An error occured. Try again."	
					},
					method: "POST"
				} ).then( function( data ){
					document.getElementById( "issueerror" ).innerHTML = data;
					document.getElementById( "issuename" ).value = " ";
					document.getElementById( "issueemail" ).value = " ";
					document.getElementById( "issuedesc" ).value = " ";
				} );
			}
		} );
			
		document.getElementById( "issueclear" ).addEventListener( "click", function( event ){				
			document.getElementById( "issuename" ).value = " ";
			document.getElementById( "issueemail" ).value = " " ;
			document.getElementById( "issuedesc" ).value = " ";
			document.getElementById( "issueerror" ).innerHTML = "";
		} );
		
		document.getElementById( "issueclose" ).addEventListener( "click", showIssueForm );
	} );
}

//Set hash
function chngSelection( data ){
	if( !selectedAddress.hasOwnProperty( "taxpid" ) ||
		( selectedAddress.matid != data.matid || 
			selectedAddress.taxpid != data.taxpid || 
			selectedAddress.groundpid != data.groundpid ) ){ 
		require( [ "dojo/hash", "dojo/io-query" ], function( Hash, ioQuery ){
			//store selected address
			Utils.mixin( selectedAddress, data );
			//set hash
			Hash( ioQuery.objectToQuery( { mat: ( data.matid === "NA" ? null : data.matid ), pid: data.taxpid, gisid: data.groundpid } ) );
			
			map.infoWindow.hide( );
		} );
	}
}

//Set property information
function setIdentity( data ){
	require( [ "mojo/PhotoGallery", "dojo/request" ] , function( PhotoGallery, request ){
			//add identity information
			document.getElementById( "identity" ).innerHTML = Format.objectAsTable( [ { "Parcel ID": data.taxpid, "GIS ID": data.groundpid } ], "proptbl", false );
			
			//add address information
			if( data.groundpid == data.taxpid ){ //get other address points associated with ground parcel
				request.get( config.ws + "v1/ws_addresses_on_ground.php", {
					handleAs: "json",
					headers: { "X-Requested-With": "" },
					query: {
						pid: data.groundpid
					}
				} ).then( function( matdata ){
					if( matdata.length > 1 ){
						var addrhtml = "";
				
						matdata.forEach( function( item, i ){
							if( item.parcel_id == data.taxpid ){
								addrhtml += "<option value='" + item.matid + "|" + item.address + "' " + ( ( item.matid == data.matid ) ? "selected='selected'" : "" ) + ">" + 
									( ( item.address.trim( ).length > 0 ) ? item.address : "Unavailable" ) + "</option>";
							}
						 } );
						
						if( addrhtml.trim( ).length > 0 ){
							addrhtml = "<select id='matlist' class='max'>" + addrhtml + "</select>";
							
							document.getElementById( "address" ).innerHTML = Format.objectAsTable ( [ { "Addresses located on Property (Postal City)": addrhtml } ], "proptbl", false );							
								
							//on identify layer list change
							document.getElementById( "matlist" ).addEventListener( "change", function( event ){
								var tempArr = event.target.value.split( "|" );
								finder( {
									"matid": tempArr[ 0 ], 
									"address": tempArr[ 1 ], 
									"groundpid": selectedAddress.groundpid, 
									"taxpid": selectedAddress.taxpid, 
									"y": selectedAddress.y, 
									"x": selectedAddress.x,
									"lat": selectedAddress.lat, 
									"lon": selectedAddress.lon
								}, "searchresults" );	
							} );	
						}else{
							document.getElementById( "address" ).innerHTML = Format.objectAsTable ( [ { "Address located on Property (Postal City)": data.address } ], "proptbl", false );
						}	
					}else{ 
						document.getElementById( "address" ).innerHTML = Format.objectAsTable ( [ { "Address located on Property (Postal City)": data.address } ], "proptbl", false );
					}	
				} );
			}else{
				document.getElementById( "address" ).innerHTML = Format.objectAsTable ( [ { "Address located on Property (Postal City)": data.address } ], "proptbl", false );
			}
			
			//add ownership information
			request.get( config.ws + "v1/ws_cama_ownership.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid: data.groundpid, pidtype: "common" }
			} ).then( function( camadata ){
				if( camadata.length > 0 ){
					//format the owner name
					var owners = [ ],
						ownerdata = camadata.filter( function( el ){ return el.parcel_id.trim( ) == data.taxpid; } ).sort( Utils.compareValues( "owner_number", "asc" ) );
					
					ownerdata.forEach( function( item, i ){
						owners.push( { 
							"Owner Name": Format.ownership( [ Format.nullToEmpty( item.last_name ), Format.nullToEmpty( item.first_name ) ] ), 
							"Mailing Address": Format.trimNconcat( [ 
								{ val: Format.nullToEmpty( item.address_1 ), appnd: " " },
								{ val: Format.nullToEmpty( item.address_2 ), appnd: "<br/>" },
								{ val: Format.nullToEmpty( item.city ), appnd:" " },
								{ val: Format.nullToEmpty( item.state ), appnd:" " },
								{ val: Format.nullToEmpty( item.zipcode ), appnd:"" } 
							] ) 
						} );
					} );
					
					document.getElementById( "ownership" ).innerHTML = Format.objectAsTable( owners , "proptbl", false );
				
					//add owners tied to property	
					if( camadata.length > ownerdata.length ){
						document.getElementById( "supplementary" ).innerHTML += Format.objectAsTable( 
							[ 
								{ 
									"Supplementary Information": "<span class='note'>Additional Owners, Leaseholds, Condo Complex Areas may be present on this selected Tax Parcel.</span>" 
								}, { 
									"Supplementary Information": "<a href='javascript:void(0);' onclick='lastSearch = \"tiedowners\";finder ( {groundpid:\"" + data.groundpid + "\"}, \"searchresults\" );'>Other Owners tied to Parcel</a>" 
								} 
							], "proptbl", false );
						
						document.getElementById( "supplementary" ).classList.remove( "hidden" );
					}
				}else{
					document.getElementById( "ownership" ).innerHTML = "";
				}
			} );
			
			document.getElementById( "supplementary" ).innerHTML = "";
			document.getElementById( "supplementary" ).classList.add( "hidden" );
			
			//add note if parcel is not mapped by GIS
			if( data.y === -1 && data.x === - 1 ){
				document.getElementById( "supplementary" ).innerHTML +=	Format.objectAsTable( 
					[ 
						{ 
							"Supplementary Information": "<span class='note'>The Parcel has not been mapped yet by GIS.</span>" 
						} 
					], "proptbl", false );
					
				document.getElementById( "supplementary" ).classList.remove( "hidden" );
			}
			
			//add mail address change
			document.getElementById( "changemailaddr" ).innerHTML = "<span class='note'>Is the mailing address wrong?</span>&nbsp;<a href='https://mecklenburgcountync-563955.workflowcloud.com/forms/52863dfb-3c52-4d91-a1c8-9d97ae2f5a7f' target='_blank' class='greenlink' >Request Change</a>";
			
			//add unselct button
			document.getElementById( "unselectprop" ).innerHTML = "<a href='javascript:void(0);' onclick='unselectProp();' class='btnlink' style='font-size: 1.0em;'>Unselect Property</a>";
									
			//add property photo
			if( propPhotoGallery ){			
				propPhotoGallery.reset( );
			}else{
				propPhotoGallery = new PhotoGallery( ).placeAt( document.getElementById( "photo" ) );
				propPhotoGallery.startup( );
			}			
			
			//get property photos
			request.get( config.ws + "v1/ws_misc_house_photos.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid : data.taxpid, photo_source: "ilookabout" }
			} ).then( function( photos ){
				var hasPhoto = ( photos.length > 0 ? true : false );
						
				if( photos.length > 0 ){
					var item = photos[ 0 ];
					
					if( item.photo_url.trim( ).length > 0 ){
						//if the property photo exisits at the location add it
						var imgdate = item.photo_date;
								
						propPhotoGallery.addPhoto( { 
							url: item.photo_url.trim( ), 
							photo_date: item.photo_date,
							title: "Photo Date: " + imgdate.substring( 4, 6 ) + "/" + imgdate.substring( 6, 8 ) + "/" + imgdate.substring( 0, 4 )
							//title: "Photo Date: " + imgdate.substring( 4, 6 ) + "/" + imgdate.substring( 6, 8 ) + "/" + imgdate.substring( 0, 4 ) + "  Source: " + item.source + " (" + item.attribution + ")" 
						} );
					}
				}
			} );
			
			//set link for property report
			document.getElementById( "clickpropreport" ).setAttribute( "href", config.ws + "v1/propreport.php?mat=" + ( selectedAddress.matid ? selectedAddress.matid : "" ) +
				"&xcoord=" + ( selectedAddress.x ? selectedAddress.x : "" ) +
				"&ycoord=" + ( selectedAddress.y ? selectedAddress.y : "" ) +
				"&pid=" + ( selectedAddress.taxpid ? selectedAddress.taxpid : "" ) + 
				"&gisid=" + ( selectedAddress.groundpid ? selectedAddress.groundpid : "" ) );
											
			//set links
			document.getElementById( "idlinks" ).innerHTML = Format.objectAsTable( [
				{
					"Link To": "<a href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + data.lat + "," + data.lon + "' target='_blank' );>Google Street View</a>"
				}, { 
					"Link To": "<a href='http://maps.co.mecklenburg.nc.us/meckscope/?lat=" + data.lat + "&lon=" + data.lon + "' target='_blank' );>Birdseye View maintained by Mecklenburg County</a>"
				}
			] , "proptbl", false );				
	} );
}

function setCharacteristicsAndTaxInfo( data ){
	require( [ "dojo/promise/all", "dojo/Deferred", "dojo/request" ] , function( all, Deferred, request ){
		all( [
			request.get( config.ws + "v1/ws_cama_legal.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid: data.taxpid }
			} ),
			request.get( config.ws + "v1/ws_cama_landuse.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid: data.taxpid }
			} )
		] ).then( function( results ){
			var legaldata = results[ 0 ],
				landusedata = results[ 1 ],
				landuse_unit = null,
				landuse_type = null,
				landuseArr = [ ],
				info = { },
				links = [ 
					{ 
						"Link To": "<a href='http://taxbill.co.mecklenburg.nc.us/publicwebaccess/BillSearchResults.aspx?ParcelNum=" + data.taxpid + "' target='_blank'>Tax Bill Information</a>"
					}, { 
						"Link To": "<a href='https://www.mecknc.gov/TaxCollections/Pages/Tax-Foreclosure-Properties.aspx' target='_blank'>Tax Foreclosure Properties</a>"
					}
				],
				fillCharacteristics = function( info, links ){
					document.getElementById( "characteristics" ).innerHTML = Format.objectAsTable( info , "proptbl", true );
					document.getElementById( "taxlinks" ).innerHTML = Format.objectAsTable( links , "proptbl", false );
				};
																					
			if( landusedata.length > 0 ){
				landusedata.forEach( function( item, i ){ 
					if( i === 0 ){
						landuseArr.push( item.land_use ); 	
					}else if( item.land_use != landuseArr[ 0 ] ){
						landuseArr.push( item.land_use ); 	
					}
				} );
				
				landuse_unit = landusedata[ 0 ].units;
				landuse_type = landusedata[ 0 ].land_unit_type;
				//set neighboorhood code in the market analysis form
				document.getElementById( "neighborcode" ).value = landusedata[ 0 ].neighborhood_code;
			}else{
				landuseArr.push( "NA" );
				//set neighboorhood code in the market analysis form
				document.getElementById( "neighborcode" ).value = "";
			}	
										
			if( legaldata.length > 0 ){
				info = {
					"Legal Desc": Format.legalDesc( legaldata[ 0 ].legal_description ),
					"Land Area": ( data.sqft ? ( Format.landArea( legaldata[ 0 ].total_acres, legaldata[ 0 ].land_unit_type, ( data.sqft / 43650 ) ) ) : null ),
					"Fire District": Format.ucwords( legaldata[ 0 ].fire_district.toLowerCase( ) ),
					"Special District": ( legaldata[ 0 ].special_district ? Format.ucwords( legaldata[ 0 ].special_district.toLowerCase( ) ) : "NA" ),
					"Account Type": Format.ucwords( legaldata[ 0 ].account_type.toLowerCase( ) ),
					"Municipality": Format.ucwords( legaldata[ 0 ].municipality.toLowerCase( ) ),
					"Land Use": Format.ucwords( Format.arrayToNumList( landuseArr ).toLowerCase( ) )
				};
				links.splice( 0, 0, { "Link To": "<a href='https://property.spatialest.com/nc/mecklenburg/#/property/" + legaldata[ 0 ].account_no + "' target='_blank'>Tax Values & Building Information</a>" } );
			}
			
			if( data.sqft ){ 
				fillCharacteristics( info, links );
			}else{
				request.get( config.ws + "v1/ws_attributequery.php", {
					handleAs: "json",
					headers: { "X-Requested-With": "" },
					query: {
						table: "parcels_py",
						source: "tax",
						fields: "ST_Area ( shape ) As sqft",
						parameters: "pid='" + data.groundpid + "'"
					}
				} ).then( function( parceldata ){
					info[ "Land Area" ] = Format.landArea( legaldata[ 0 ].total_acres, legaldata[ 0 ].land_unit_type, ( parceldata.length > 0 ? ( parceldata[ 0 ].sqft / 43650 ) : null ) );
					fillCharacteristics( info, links );
				} );
			}
		} );	
	} );	
}

function setDeed( data ){
	require( [ "dojo/request" ] , function( request ){
		request.get( config.ws + "v1/ws_cama_saleshistory.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: { pid: data.taxpid }
		} ).then( function( camadata ){
			var info = [ ],
				links = [
					{ "Link To": "<a href='http://meckrod.manatron.com' target='_blank'>Recorded Deeds and Maps (03/01/1990 to Current)</a>" }, 
					{ "Link To": "<a href='http://meckrodhistorical.com' target='_blank'>Recorded Deeds and Maps (02/28/1990 and Prior)</a>" }
				];
	
			if( camadata.length > 0 ){
				for( var i = camadata.length-1; i >= 0; i-- ){ //descending order
					var deed =  Format.nullToEmpty( camadata[i].deed_book ).replace( /  +/g, " " );
						deedArr = deed.split( " " );
						
					info.push( { 
						"Deed": Format.deed( ( deedArr.length === 2 ? deedArr[ 0 ] : "" ), ( deedArr.length === 2 ? deedArr[ 1 ] : "" ), camadata[ i ].sale_date ), 
						"Sale Date":  camadata[ i ].sale_date,
						"Sale Price": Format.money( camadata[i].sale_price ) 
					} );
				}
			}else{
				info.push( { 
					"Deed": "NA", 
					"Sale Date":  "NA",
					"Sale Price": "NA" 
				} );
			}	
			
			document.getElementById( "deed" ).innerHTML = Format.objectAsTable ( info , "proptbl", false );
			document.getElementById( "deedlinks" ).innerHTML = Format.objectAsTable ( links , "proptbl", false );
		} );
	} );
}

function setLocInfo( data ){
	require( [ "dojo/request", "dojo/promise/all", "dojo/Deferred" ] , function( request, all, Deferred ){
		var info = { },
			links = [ ],
			toggles = [ ];
		
		[ "zone",  "sphrinflu", "histdist", "censustracts" ].forEach( function( assoclyr ){ 
			layerListTree.model.store.fetchItemByIdentity( { 
				identity: assoclyr, 
				onItem: function( item ){
					toggles.push( { 
						"Toggle Related Overlays": "<input type='checkbox' id='" + item.id [ 0 ] + "2' onclick= 'switchOnOffOverlay ( \"" + ( item.hasOwnProperty ( "ostreets" ) ? "overlays_streets" : "overlays_trans" ) + "\", \"" + item.id[ 0 ] + "\", this.checked );'" + ( item.checked[ 0 ] ? "checked" : "" ) + " >" + item.name[ 0 ] + "</input>"
					} );		
				}	
			} );		
		} );
							
		all( [
			//find neighborhood code for quality if life dashboard data
			request.get( config.ws + "v1/ws_geo_pointoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					x: data.x,
					y: data.y,
					srid: "2264",
					table: "neighborhoods_py",
					geometryfield: "shape",
					fields: "id as code",
					source: "gis"
				}
			} ),
			//find sphere of influence
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "sphereofinfluence_py", 
					fields: "name",
					parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",
					source: "gis"
				}
			} ),
			//find historic district
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "historic_districts_py", 
					fields: "objectid",
					parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",
					source: "gis"
				}
			} ),
			//find census tract
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "census_tracts_2010_py", 
					fields: "name10",
					parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",		
					source: "gis"
				}
			} ),
			//find if parcel in BIP Opportunity Area
			request.get ( config.ws + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					from_table: "parcels_py",
					to_table: "commercial_70_buffer_py",
					from_geometryfield: "shape",
					to_geometryfield: "shape",
					fields: "t.objectid",
					parameters: "f.pid='" + data.groundpid + "'",
					source: "tax"
				}
			} )
		] ).then( function( results ){
			//add sphere of influence info
			info[ "ETJ Area" ] = ( results[ 1 ].length > 0 ? results[ 1 ][ 0 ].name : "NA" );
			//add historic district info
			info[ "Charlotte Historic District" ] = ( results[ 2 ].length > 0 ? "Yes" : "No" );
			//add census tract info
			info[ "Census Tract No" ] = ( results[ 3 ].length > 0 ? results[ 3 ][ 0 ].name10 : "NA" );
			//add census tract info
			info[ "Inside BIP Opportunity Area" ] = ( results[ 4 ].length > 0 ? "Yes" : "No" );

			//add location links (home schools, voting location, parks)
			if( data.hasOwnProperty( "lat" ) && data.hasOwnProperty( "lon" ) ){
				var lonlat = parseFloat( data.lon ).toFixed( 4 ) + "," + parseFloat( data.lat ).toFixed( 4 );
												
				links.splice( 0, 0, { "Link To": "<a href='https://mcmap.org/geoportal/#" + lonlat + "/schools' target='_blank' );>School Assignment</a>" }, 
					{ "Link To": "<a href='https://mcmap.org/geoportal/#" + lonlat + "/voting' target='_blank' );>Voting Location</a>" },
					{ "Link To": "<a href='https://mcmap.org/geoportal/#" + lonlat + "/parks' target='_blank' );>Parks Nearby</a>" } );
			}

			//add quality of life link
			if( results[ 0 ].length > 0 ){
				links.push( {
					"Link To": "<a href='https://mcmap.org/qol/#1/" + results[ 0 ][ 0 ].code + "' target='_blank' );>Quality of Life Dashboard</a>"
				} );
			}

			//add mecklenburg demographic link
			if( data.taxpid ){
				links.push( {
					"Link To": "<a href='http://maps.co.mecklenburg.nc.us/meckdemo/?pid=" + data.taxpid + "' target='_blank' );>Demographic Analyzer</a>"
				} );	
			}

			if( data.address ){
				//google directions
				links.push( {
					"Link To": "<a href='http://maps.google.com/maps?daddr=" + data.address + "&saddr=+' target='_blank' );>Google Directions</a>"
				} );	
			}
			
			//add zoning designation list
			links.push( {
				"Link To": "<a href='http://polaris3g.mecklenburgcountync.gov/data/ZoningDesignations.pdf' target='_blank' );>Zoning Designations PDF</a>"
			} );
			
			//add toggle, info and links overlays
			document.getElementById( "loctoggles" ).innerHTML = Format.objectAsTable ( toggles , "proptbl", false );
			document.getElementById( "locinfo" ).innerHTML = Format.objectAsTable ( info, "proptbl", true );
			document.getElementById( "loclinks" ).innerHTML = Format.objectAsTable ( links, "proptbl", false );					
		} );	
		
		//add situs address
		request.get( config.ws + "v1/ws_cama_situsaddress.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: { pid: data.taxpid }
		} ).then( function( camadata ){
			if( camadata.length > 0 ){
				var addrs = [ ],
					htmlstr;
				
				camadata.forEach( function( item, i ){
					addrs.push ( 
						Format.ucwords( Format.trimNconcat( [ 
							{ val: Format.nullToEmpty( item.house_number ), appnd: " " },
							{ val: Format.nullToEmpty( item.prefix ), appnd: " " },
							{ val: Format.nullToEmpty( item.street_name ), appnd:" " },
							{ val: Format.nullToEmpty( item.road_type ), appnd:" " },
							{ val: Format.nullToEmpty( item.suffix ), appnd:" " },
							{ val: Format.nullToEmpty( item.unit ), appnd:"" }
						] ).toLowerCase( ) )
					);
				} );

				htmlstr = Format.objectAsTable ( [ 
					{ 
						"Tax Situs Addresses tied to Parcel": Format.arrayToNumList ( addrs ) 
					} 
				], "proptbl", false );
				
				if( camadata.total_rows > 1 ){
					htmlstr += "<div class='note'>Tax Situs Addresses are assigned based on Property Record Cards.</div>";
				}

				document.getElementById( "situsaddress" ).innerHTML = htmlstr;
			} 	
		} );		
	} );	
}

function setEnvInfo( data ){
 	require( [ "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters", "esri/geometry/Point",
		"esri/SpatialReference", "dojo/request", 
		"dojo/promise/all", "dojo/Deferred" ] , function( IdentifyTask, IdentifyParameters, Point, SpatialReference, request, all, Deferred ){
				
		var info = { },
			links = [
				{ 
					"Link To": "<a href='http://meckmap.mecklenburgcountync.gov/3dfz/#taxpid=" + data.taxpid + 
						"' target='_blank' );>Flood Zone Information</a>"
				}, { 
					"Link To": "<a href='http://charmeck.org/stormwater/regulations/Pages/SWIMOrdinances.aspx'" +
						" target='_blank' );>Surface Water Improvement and Management (SWIM) Ordinances</a>"
				}, { 
					"Link To": "<a href='http://charmeck.org/stormwater/regulations/Pages/Post-ConstructionStormWaterOrdinances.aspx'" +
						" target='_blank' );>Post-Construction Storm Water Ordinances</a>"
				},	{ 
					"Link To": "<a href='http://charmeck.org/mecklenburg/county/LUESA/WaterandLandResources/Conservation/Documents/IndextoMapUnits.pdf'" +
						" target='_blank' );>Soil Type Descriptions</a>"
				}
			],
			toggles = [ ],	
			floodzoneIdentifyService =  new IdentifyTask( config.overlay_services.overlays_streets.url ),		
			fidParams = IdentifyParameters( );
			fidParams.tolerance = 0;
			fidParams.returnGeometry = false;
			fidParams.layerIds = [ 44 ];
			fidParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
			fidParams.geometry = new Point( data.x, data.y, new SpatialReference( config.initial_extent.spatialReference ) );
			fidParams.mapExtent = map.extent;
				
		layerListTree.model.store.fetchItemByIdentity( { 
			identity: "envgrp", 
			onItem: function( item ){ 
				item.children.forEach( function( assoclyr ){
					toggles.push( { 
						"Toggle Related Overlays": "<input type='checkbox' id='" + 
							assoclyr.id[ 0 ] + "2' onclick= 'switchOnOffOverlay ( \"" + ( assoclyr.hasOwnProperty( "ostreets" ) ? "overlays_streets" : "overlays_trans" ) + 
							"\", \"" + assoclyr.id[ 0 ] + "\", this.checked );'" + ( assoclyr.checked[ 0 ] ? "checked" : "" ) + " >" + 
							assoclyr.name[ 0 ] + "</input>"
					} );
				} );
			} 
		} );
		
		all( [
			//check if parcel intersects water quality buffer
			request.get( config.ws + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					from_table: "parcels_py",
					to_table: "water_quality_buffers_py",  
					from_geometryfield: "shape",
					to_geometryfield: "shape",
					fields: "t.objectid",
					parameters: "f.pid='" + data.groundpid + "'",
					source: "tax"
				}
			} ),
			//check if parcel intersects fema floodplain
			request.get( config.ws + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					from_table: "parcels_py",
					to_table: "fema_floodplain_changes_py",  
					from_geometryfield: "shape",
					to_geometryfield: "shape",
					fields: "t.objectid",
					parameters: "f.pid='" + data.groundpid + "'",
					source: "tax"
				}
			} ),
			//check if parcel intersects community floodplain	
			request.get( config.ws + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					from_table: "parcels_py",
					to_table: "community_floodplain_changes_py", 
					from_geometryfield: "shape",
					to_geometryfield: "shape",
					fields: "t.objectid",
					parameters: "f.pid='" + data.groundpid + "'",
					source: "tax"
				}
			} ),
			//find fema panel index
			floodzoneIdentifyService.execute( fidParams ),
			//check if parcel x,y intersects post construction district
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "PostConst_Districts_py", 
					fields: "district",
					parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",
					source: "gis"
				}
			} ),
			//check if parcel x,y intersects stream watershed
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "Watershed_Stormwater_py", 
					fields: "name",
					parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",
					source: "gis"
				}
			} ),
			//check if parcel x,y intersects drinking water watershed
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "Watershed_DrinkingWater_py", 
					fields: "name, subarea",
					parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",					
					source: "gis"
				}
			} ),
			//check if parcel x,y intersects drinking water watershed
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "buaparcels", 
					fields: "allowable_bua",
					parameters: "commonpid='" + data.groundpid + "'",					
					source: "tax"
				}
			} ),
			//check if parcel x,y intersects jurisdiction
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					table: "Jurisdiction_py", 
					fields: "nme_juris",
					parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",
					source: "gis"
				}
			} )
		] ).then( function( results ){
			//set Water Quality Buffer information		
			info[ "Inside Water Quality Buffer" ] = ( results[ 0 ].length > 0 ? "Yes" : "No" );
			//set Floodzone info
			info[ "Inside FEMA Flood Zone" ] = ( results[ 1 ].length > 0 ? "<a href='http://meckmap.mecklenburgcountync.gov/3dfz/#taxpid=" + data.taxpid + "' target='_blank' );>Yes</a>" : "No" );
			info[ "Inside Community Flood Zone" ] = ( results[ 2 ].length > 0 ? "<a href='http://meckmap.mecklenburgcountync.gov/3dfz/#taxpid=" + data.taxpid + "' target='_blank' );>Yes</a>" : "No" );
			
			//set FEMA Panel and Date
			if( results[ 3 ].length > 0 ){
				var effdate = results[ 3 ][ 0 ].feature.attributes.EFF_DATE.split( "/" ),
					filename = results[ 3 ][ 0 ].feature.attributes.FIRM_PAN + ( effdate[ 2 ] + Format.leftPad ( effdate[ 0 ], 2 ) + Format.leftPad ( effdate[ 1 ], 2 ) );
				
				info[ "FEMA Panel No" ] = "<a href='https://mecklenburgcounty.exavault.com/p/stormwater/Floodplain%20Mapping/Effective%20Data/FIRM%20Panels/" + filename + ".pdf' target='_blank'>" + results[ 3 ][ 0 ].feature.attributes.FIRM_PAN + "</a>";
				info[ "FEMA Panel Date" ] = Format.leftPad( effdate[ 0 ], 2 ) + "/" + Format.leftPad( effdate[ 1 ], 2 ) + "/" + effdate[ 2 ];
			}else{
				info[ "FEMA Panel No" ] = "NA";
			}
			
			//set Post Construction District
			info[ "Post Construction District" ] = ( results[ 4 ].length > 0 ? Format.ucwords( results[ 4 ][ 0 ].district.toLowerCase() ) : "NA" );
			//set Watershed Info	
			info[ "Stream Watershed Name" ] = ( results[ 5 ].length > 0 ? Format.ucwords ( results[ 5 ][ 0 ].name.toLowerCase() ) : "NA" );
			
			//set Drinking Watershed info
			if( results[ 6 ].length > 0 ){
				info[ "Regulated Drinking Watershed Name" ] = Format.ucwords( results[ 6 ][ 0 ].name.toLowerCase() );
				info[ "Regulated Drinking Watershed Class" ] = results[ 6 ][ 0 ].subarea;
				info[ "Has limit on amount of Built-Upon Area" ] = "<a href='http://charlottenc.gov/StormWater/Regulations/Documents/DeterminingBUA1114.pdf' target='_blank'>Yes</a>";
			}
			
			//set built upon area amount
			if( results[ 7 ].length > 0 ){
				if( results[ 7 ][ 0 ].allowable_bua ){
					info[ "Allowed Built-Upon Area" ] = Format.number( results[ 7 ][ 0 ].allowable_bua, 2 ) + " sq ft";
				}	
			}

			//set coal tar sealant ban
			if( results[ 8 ].length > 0  ){
				info[ "Coal Tar Sealant Ban" ] = ( results[ 8 ][ 0 ].nme_juris == "MATT" ? "<a href='data/Matthews - Surface Water Pollution Control.pdf' target='_blank'>Yes</a>" : "No" );
			}
							
			document.getElementById( "envinfo" ).innerHTML = Format.objectAsTable( info, "proptbl", true );
		} );

		//add toggle overlays
		document.getElementById( "envtoggles" ).innerHTML = Format.objectAsTable( toggles , "proptbl", false );
		
		request.get( config.ws + "v1/lancheck.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" } // This is required to stop the server from rejecting the GET request
		} ).then( function( ipdata ){
			links.push( { 
				"Link To": "<a href='http" + ( Utils.isPrivateIP ( ipdata.ip ) ? "" : "s" ) + "://webpermit.mecklenburgcountync.gov/Default.aspx?PossePresentation=SearchParcelNumber&ParcelNumber=" + data.taxpid.substr ( 0, 8 ) + "'" +
					" target='_blank' );>Check for Address Permit Holds</a>"
			} );
			
			if( data.hasOwnProperty( "lat" ) && data.hasOwnProperty( "lon" ) ){
				var lonlat = parseFloat( data.lon ).toFixed( 4 ) + "," + parseFloat( data.lat ).toFixed( 4 );
				links.push( { 
					"Link To": "<a href='https://mcmap.org/geoportal/#" + lonlat + "/environment' target='_blank' );>Environmental Information</a>"
				} );
			} 
			
			document.getElementById( "envlinks" ).innerHTML = Format.objectAsTable( links , "proptbl", false );
		} );	
	} );			
}

function unselectProp( ){
	require( [ "dojo/hash", "dojo/io-query" ] , function( Hash, ioQuery ){
		//remove helper graphics
		delHelperGraphics( [ "parcelpt", "buffer", "road" ] );
		//remove location graphic
		delLocationGraphic( );
		//remove parcel graphic
		delParcelGraphic( );
		
		//empty selected address object
		selectedAddress = { };
		
		//set hash
		Hash( ioQuery.objectToQuery( { } ) );
		
		map.infoWindow.hide( );
		
		//show layers div
		showDiv( "layers" );
	} );
}

function addLocation( data ){
	require( [ "dojo/_base/connect" ] , function( connect ){
		var info = { 
			Desciption: data.desc, 
			XY: parseFloat( data.x ).toFixed( 3 ) + ", " + parseFloat( data.y ).toFixed( 3 ),    
			"Lat Lon": parseFloat( data.lat ).toFixed( 5 ) + ", " + parseFloat( data.lon ).toFixed( 5 ),
			USNG: LLtoUSNG( parseFloat( data.lat ), parseFloat( data.lon ), 4 )
		};
							
		//add click point information		
		document.getElementById( "poicont" ).innerHTML = Format.objectAsTable( info, "proptbl", true );
		
		//show point of interest div
		showDiv( "poi" );
		showTip( "locsearch" );
												
		connect.publish( "/add/graphics", 
			Utils.mixin( data, { 
				graphictype: "location", 
				removegraphics: [ "buffer", "road", "parcelpt" ], 
				zoom: data.zoom 
			} ) 
		);
	} );		
}

function toggleNav( nav, show ){
	if( show ){
		document.querySelector( "#" + nav ).classList.remove( "hidden" );
	}else{
		document.querySelector( "#" + nav ).classList.add( "hidden" );
	}
}

function showDiv( cont ){
	//show requested div in data main
	Utils.getDomElements( document.querySelectorAll( "#datamain>div" ) ).forEach( function( ctrl ){
		ctrl.classList.add( "hidden" );
	} );
	document.getElementById( cont ).classList.remove( "hidden" );
			
	//Set nav
	toggleNav( "navredoanalysis", ( cont === "searchresults" && lastSearch === "mrktanalysis" ? true : false ) );
	toggleNav( "navredoadvsearch", ( cont === "searchresults" && ( lastSearch === "adv" || lastSearch === "buffer" ) ? true : false ) );
	toggleNav( "navsrchresults", ( cont !== "searchresults" ? true : false ) );
	toggleNav( "navpropdetails", ( cont !== "propdetails" && selectedAddress.hasOwnProperty ( "taxpid" ) ? true: false ) );
	toggleNav( "navpropinforeport", ( cont === "searchresults" && ( lastSearch === "buffer" || lastSearch === "mrktanalysis" ) ? true : false ) );
	toggleNav( "navpropreport", ( cont === "propdetails" && selectedAddress.hasOwnProperty ( "taxpid" ) ? true : false ) );
	toggleNav( "navdeedreport", ( cont === "searchresults" && ( lastSearch === "buffer" || lastSearch === "mrktanalysis" ) ? true : false ) );
	toggleNav( "navdeedcsv", ( cont === "searchresults" && ( lastSearch === "buffer" || lastSearch === "mrktanalysis" ) ? true : false ) );
	toggleNav( "navlayers", ( cont !== "layers" ? true : false ) );
	toggleNav( "navdictionary", ( cont === "layers" ? true : false ) );
	toggleNav( "navlegend", ( cont === "layers" ? true : false ) );
	toggleNav( "navzoomprop", ( cont === "propdetails" && parcelGraphic ? true : false ) );
			
	//hide progress animated gif
	if( cont === "idlayers" || cont === "poi" || cont === "propdetails" || cont === "searchresults" ){
		Utils.getDomElements( document.querySelectorAll( ".spin" ) ).forEach( function( ctrl ){
			ctrl.classList.add( "hidden" );
		} );
		Utils.getDomElements( document.querySelectorAll( ".unspin" ) ).forEach( function( ctrl ){
			ctrl.classList.remove( "hidden" );
		} );
	}	
	
	//scroll aside in mobile devices	
	if( window.innerWidth < 921 && ( cont === "advsearch" || cont === "marketanalysis" || cont === "searchresults" ) ){
		document.getElementById( "aside" ).scrollIntoView( );
	}
}

function showTip( type ){
	switch( type ){
		case "locsearch":
			document.getElementById( "tip" ).innerHTML = "<img src='image/tip.png' />Click or touch the map to select a Property nearby";
			break;
		case "toomanylayers":
			document.getElementById( "tip" ).innerHTML =  "<img src='image/tip.png' />Switching on too many overlays slows down the map";
			break;
	}
	document.querySelector( "#tip" ).classList.remove( "hidden" );
}

function showIssueForm( ){
	document.getElementById( "issueerror" ).innerHTML = "";
	document.querySelector( "#issue" ).classList.toggle( "hidden" );
}

function toggleMrktAnalysis( ){
	Utils.getDomElements( document.querySelectorAll( "#advsearch, #searchhelp" ) ).forEach( function( ctrl ){
		ctrl.classList.add( "hidden" );
	} );
	document.querySelector( "#mrktanlys" ).classList.toggle( "hidden" );
}

function toggleSearchHelp( ){
	document.querySelector( "#searchhelp" ).classList.toggle( "hidden" );
}