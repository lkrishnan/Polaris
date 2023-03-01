function searchInit( ){
	require( [ "esri/tasks/GeometryService", "esri/tasks/BufferParameters", "dojox/data/QueryReadStore",
		"dijit/form/ComboBox", "dijit/form/DateTextBox", "dijit/registry", "dojo/_base/connect",
		"dojo/data/ItemFileWriteStore", "dojo/request" ], function( GeometryService, BufferParameters, QueryReadStore, ComboBox, DateTextBox, registry, connect, ItemFileWriteStore, request ){
		//local variables
		var mainSearch,
			situsStSrch,
			saledatefrom,
			saledateto,
			buffersrch,
			anlysStSrch;

		///////////////////////////////////////
		// 1. Initialize Main Search control //
		///////////////////////////////////////
		
		//Main search autocomplete combobox initialization
		mainSearch = new ComboBox( {
			id: "mainSearch",
			queryExpr: "${0}",		
			searchAttr: "label",
			searchDelay: 400,
			autoComplete: false,
			hasDownArrow: false,
			style: "width:100%; border: none; background: #ffffff;",
			maxHeight: 300,
			placeHolder: "Enter address / parcel# / owner / landmark",
			labelFunc: Format.tagsrchresults, 
			labelType: "html",
			store: new QueryReadStore( { 
				"url": config.ws + "v1/ws_ubersearch.php?searchtypes=PID,GISID,Address,Owner,Intersection,Library,School,Park,CATS,Wholestname,Business"
			} ),
			onInput: function( event ){
				if( event.keyCode === 13 ){ 
					processSearch( );
				}else{
					document.querySelector( "#searchclear" ).classList.add( "hidden" );
					document.querySelector( "#searchprogress" ).classList.remove( "hidden" );
				}	
			},
			onSearch: function( results, qry ){ 
				if( qry.label.length === 0 || results.total > 0 ){
					document.querySelector( "#searchprogress" ).classList.add( "hidden" );
					document.querySelector( "#searchclear" ).classList.remove( "hidden" );
				}
			},
			onChange: function( event ){ 
				var widget = registry.byId( "mainSearch" );
						
				if( widget.item ){
					processSearch( );
				}
			}	
		} ).placeAt( document.getElementById( "mainsearchcont" ) );
		mainSearch.startup( );
		
		//Main Search go button click event
		document.getElementById( "searchbtn" ).addEventListener( "click", function( event ){ 
			document.querySelector( "#searchprogress" ).classList.add( "hidden" );
			document.querySelector( "#searchclear" ).classList.remove( "hidden" );
			backupSearch( mainSearch.get( "value" ) );	
		} );
						
		//Main Search clear button click event  
		document.getElementById( "searchclear" ).addEventListener( "click", function( event ){
			mainSearch.reset( );
		} );
		
		//Main Search help button click event
		document.getElementById( "searchhelpclose" ).addEventListener( "click", toggleSearchHelp );
		
		////////////////////////////////////////////////
		// 2. Initialize Situs Address Search control //
		////////////////////////////////////////////////
		
		//Situs street autocomplete combobox initialization
		situsStSrch = new ComboBox( {
			id: "situsst",
			queryExpr: "${0}",		
			searchAttr: "label",
			searchDelay: 400,
			autoComplete: false,
			hasDownArrow: false,
			style: "width:100%; border-color: #504A52;",
			maxHeight: 300,
			placeHolder: "Street (Required)",
			store: new QueryReadStore( { 
				"url": config.ws + "v1/ws_ubersearch.php?searchtypes=Road"
			} )
		} ).placeAt( document.getElementById( "situsstCont" ) );
		situsStSrch.startup( );
				
		//Situs Address Search go button click event
		document.getElementById( "situssearchbtn" ).addEventListener( "click", function( event ){
			if( document.getElementById( "situsst" ).value.length > 0 ){
				finder( {
					"staddrno": document.getElementById( "situsaddrno" ).value,
					"stprefix": document.getElementById( "situsprefix" ).value,
					"stname": document.getElementById( "situsst" ).value,
					"sttype": document.getElementById( "situssttype" ).value,
					"stsuffix": document.getElementById( "situssuffix" ).value,
					"stmuni": document.getElementById( "situsmuni" ).value
				}, "searchresults" );
				
				lastSearch = "adv";
				document.querySelector( "#situssearchprogress" ).classList.remove( "hidden" );
				document.getElementById( "situssearcherror" ).innerHTML = "";
			}else{
				document.getElementById( "situssearcherror" ).innerHTML ="Street Name required";
			}	
		} );
		
		//Situs Address Search clear button click event
		document.getElementById( "situssearchclear" ).addEventListener( "click", resetSitusAddressSearch );
			
		//Reset Situs Address Search form
		resetSitusAddressSearch( );
		
		////////////////////////////////////////
		// 3. Initialize Owner Search control //
		////////////////////////////////////////
		
		//Owner Address Search go button click event
		document.getElementById( "onamesearchbtn" ).addEventListener( "click", function( event ){ 
			if( document.getElementById( "lastname" ).value.length > 0 ){
				finder( { lastname: document.getElementById( "lastname" ).value, firstname: document.getElementById( "firstname" ).value }, "searchresults" );
				
				lastSearch = "adv";
				document.querySelector( "#onamesearchprogress" ).classList.remove( "hidden" );
				document.getElementById( "onamesearcherror" ).innerHTML = "";
			}else{
				document.getElementById( "onamesearcherror" ).innerHTML = "Last Name / Business Name required";
			}
		} );
				
		//Owner Search clear button click event
		document.getElementById( "onamesearchclear" ).addEventListener( "click", resetOwnerNameSearch ); 
		
		//Reset Owner Search form
		resetOwnerNameSearch( );
		
		/////////////////////////////////////////
		// 4. Initialize Buffer Search control //
		/////////////////////////////////////////
			
		//Buffer Search go button click event
		document.getElementById( "buffersearchbtn" ).addEventListener( "click", function( event ){ 
			if( document.getElementById( "buffersize" ).value.length > 0 ){
				var buffersize = parseInt( document.getElementById( "buffersize" ).value );
				
				if( !isNaN( buffersize ) && ( buffersize > -1 && buffersize < 5281 ) ){
					//if( selectedAddress.hasOwnProperty( "groundpid" ) && parcelGraphic ){
					if( selectedAddress.hasOwnProperty( "groundpid" ) && parcelGraphics.length > 0 ){
						bufferSearch( buffersize ); 
		
						lastSearch = "buffer";
						document.querySelector( "#buffersearchprogress" ).classList.remove( "hidden" );
						document.getElementById( "buffersearcherror" ).innerHTML = "";
					}else{
						document.getElementById( "buffersearcherror" ).innerHTML = "A property should be selected";
					}
				}else{
					document.getElementById( "buffersearcherror" ).innerHTML = "Buffer should be a number between 0 and 5280";
				}
			}else{
				document.getElementById( "buffersearcherror" ).innerHTML = "Buffer Size required";
			}
		} );
		
		
		//Buffer Search clear button click event
		document.getElementById( "buffersearchclear" ).addEventListener( "click", resetBufferSearch );
		
		//Reset Buffer Search form
		resetBufferSearch( );
		
		///////////////////////////////////////////////////
		// 5. Initialize Preliminary Plan Search control //
		///////////////////////////////////////////////////
		
		//Initialize the Preliminary Plan Search combobox
		/*Utils.loadJSON( function( response ){
			// Parse JSON string into object
			var prelimplans = JSON.parse( response );
			
			if( prelimplans.length > 0 ){
				var htmlstr = "";
				
				prelimplans.forEach( function( item, i ){						
					htmlstr += "<option value='" + item.projname + "'" + ( i === 0 ? " selected" : "" ) + ">" + item.projname + "</option>";
				} );
				
				document.getElementById( "prelimplansearch" ).innerHTML += htmlstr;
			}		
		}, config.local_json + "prelimplans.json" );*/
		
		request.get( config.ws + "v1/ws_attributequery.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: { 
				table: "preliminary_plans_ln", 
				fields: "projname",
				parameters: "projname IS NOT NULL",
				group: "projname",
				order: "projname",
				source: "gis"
			}
		} ).then( function( prelimplans ){
			if( prelimplans.length > 0 ){
				var htmlstr = "";
				
				prelimplans.forEach( function( item, i ){						
					htmlstr += "<option value='" + item.projname + "'" + ( i === 0 ? " selected" : "" ) + ">" + item.projname + "</option>";
				} );
				
				document.getElementById( "prelimplansearch" ).innerHTML += htmlstr;
			
			}
			
		} );
		
		//Preliminary Plan Search go button click event
		document.getElementById( "prelimplansearchbtn" ).addEventListener( "click", function( event ){
			prelimPlanSearch( document.getElementById( "prelimplansearch" ).value );
			lastSearch = "adv";
		} );
				
		///////////////////////////////////////////////////
		// 6. Initialize Engineering Grid Search control //
		///////////////////////////////////////////////////
		
		//Engineering Grid Search go button click event
		document.getElementById( "enggridsearchbtn" ).addEventListener( "click", function( event ){
			engGridSearch( document.getElementById( "enggridsearch" ).value );
			lastSearch = "adv";
		} );
		
		///////////////////////////////////////////
		// 7. Initialize Market Analysis control //
		///////////////////////////////////////////
		
		//Market Analysis Street search autocomplete combobox initialization
		anlysStSrch = new ComboBox( {
			id: "stname",
			queryExpr: "${0}",		
			searchAttr: "label",
			searchDelay: 400,
			autoComplete: false,
			hasDownArrow: false,
			style: "width:100%; border-color: #504A52;",
			maxHeight: 300,
			placeHolder: "Enter Street Name",
			store: new QueryReadStore( { 
				"url": config.ws + "v1/ws_ubersearch.php?searchtypes=Road" 
			} )
		} ).placeAt( document.getElementById( "stnameCont" ) );
		anlysStSrch.startup( );
		
		//Market Analysis date textbox initialization		
		saledatefrom = new DateTextBox( { 
			required: false, 
			type: "text", 
			placeholder: "Min",
			style: "width: 105px; border-color: #504A52;" }, "saledatefrom" );
		
		saledateto = new DateTextBox( { 
			required: false, 
			type: "text", 
			placeholder: "Max",
			style: "width: 105px; border-color: #504A52;" }, "saledateto" );  	
			
		//Primary Search combobox change event	
		document.getElementById( "primarysrchtype" ).addEventListener( "change", function( event ){	
			switch( document.getElementById( "primarysrchtype" ).value ){
				case "0":
					document.getElementById( "jurisdiction" ).value = "";
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(3),tr:nth-child(4),tr:nth-child(5)" ) ).forEach( function( ctrl ){
						ctrl.classList.add( "hidden" );
					} );
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(2)" ) ).forEach( function( ctrl ){
						ctrl.classList.remove( "hidden" );
					} );
					break;
				case "1":
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(2),tr:nth-child(4),tr:nth-child(5)" ) ).forEach( function( ctrl ){
						ctrl.classList.add( "hidden" );
					} );
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(3)" ) ).forEach( function( ctrl ){
						ctrl.classList.remove( "hidden" );
					} );
					break;
				case "2":
					registry.byId( "stname" ).set( "" );
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(2),tr:nth-child(3),tr:nth-child(5)" ) ).forEach( function( ctrl ){
						ctrl.classList.add( "hidden" );
					} );
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(4)" ) ).forEach( function( ctrl ){
						ctrl.classList.remove( "hidden" );
					} );
					break;
				case "3":
					document.getElementById( "anlysbuffsize" ).value = "";
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(2),tr:nth-child(3),tr:nth-child(4)" ) ).forEach( function( ctrl ){
						ctrl.classList.add( "hidden" );
					} );
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(5)" ) ).forEach( function( ctrl ){
						ctrl.classList.remove( "hidden" );
					} );
					break;			
			}
		} );	
		
		//Property use combobox change event
		document.getElementById( "propuse" ).addEventListener( "change", function( event ){		
			switch( document.getElementById( "propuse" ).value ){
				case "Vacant":
					document.getElementById( "bedrooms" ).value = ""; 
					document.getElementById( "bathrooms" ).value = ""; 
					document.getElementById( "exteriorframe" ).value = "";
					document.getElementById( "storytype" ).value = "";
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(13),tr:nth-child(14),tr:nth-child(15),tr:nth-child(16),tr:nth-child(17),tr:nth-child(18)" ) ).forEach( function( ctrl ){
						ctrl.classList.add( "hidden" );
					} );
					break;
				case "Commercial": case "Govt-Inst": case "Hotel/Motel": case "Office": case "StadiumArena": case "Warehouse": case "Warehouse Lg":
					document.getElementById( "bedrooms" ).value = ""; 
					document.getElementById( "bathrooms" ).value = "";
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(15),tr:nth-child(16)" ) ).forEach( function( ctrl ){
						ctrl.classList.add( "hidden" );
					} );
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(13),tr:nth-child(14),tr:nth-child(17),tr:nth-child(18)" ) ).forEach( function( ctrl ){
						ctrl.classList.remove( "hidden" );
					} );
					break;
				default:
					Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(13),tr:nth-child(14),tr:nth-child(15),tr:nth-child(16),tr:nth-child(17),tr:nth-child(18)" ) ).forEach( function( ctrl ){
						ctrl.classList.remove( "hidden" );
					} );
					break;
			}
		} );
		
		//Market Analysis go button click event
		document.getElementById( "mrktanlysbtn" ).addEventListener( "click", function( event ){
			var data = validateMrktAnlysForm( );
			
			if( data.errors.length > 0 ){
				var htmlstr = "";
			
				data.errors.forEach( function ( item, i ){		
					htmlstr += "<div>" + ( i + 1 ) + ". " + item + "</div>";
				} );
				document.getElementById( "mrktanlyserror" ).innerHTML = htmlstr;
			}else{
				var geometryService = new GeometryService( config.geometry_service ),
					bufferParams = new BufferParameters( ),
					params = data.params;
					
				if( params.hasOwnProperty( "pidbuff" ) ){	
					var buffersize = parseInt( params.pidbuff.substr( params.pidbuff.indexOf ( "|" ) + 1, params.pidbuff.length - 1 ) );
				
					if( buffersize > 0 ){ //add buffer graphic if the buffer size is atleast 1 feet
						//add buffer graphic to map
						//simplfy parcel polygon
						var geom_arr = [ ]
						
						for( var i = 0;i < parcelGraphics.length; i++ ){
							geom_arr.push( parcelGraphics[ i ].geometry )
							
						}							
						
						//geometryService.simplify( [ parcelGraphic.geometry ], function( geometries ){
						geometryService.simplify( geom_arr, function( geometries ){
							Utils.mixin( bufferParams, { distances: [ buffersize ], geometries: geometries } );
															
							//buffer parcel polygon
							geometryService.buffer( bufferParams, function( bufferGeometry ) {
								//add buffer graphics
								connect.publish( "/add/graphics", { 
									graphictype: "buffer", 
									buffergeom: bufferGeometry[ 0 ], 
									removegraphics: [ "buffer", "road", "parcelpt" ], 
									zoom: false 
								} );		
							} );	
						} );
						
					}
					
				}	
				
				analyzeTheMarket( params, 1 );

				lastSearch = "mrktanalysis";
				document.querySelector( "#mrktanlysprogress" ).classList.remove( "hidden" );
				document.getElementById( "mrktanlyserror" ).innerHTML = "";
			}
		} );		
		
		//Market Analysis clear button click event
		document.getElementById( "mrktanlysclear" ).addEventListener( "click", resetMarketAnalysis );
		
		//Reset Market Analysis form
		resetMarketAnalysis( );
		
		///////////////////////////////
		// 8. Layer Identify control //
		///////////////////////////////
		
		//Layerlist combobox change event
		document.getElementById( "idlayerlist" ).addEventListener( "change", function( event ){		
			idLayers( { x: locationGraphic.geometry.x, y: locationGraphic.geometry.y, lyridx : document.getElementById( "idlayerlist" ).value } );
		} );
	} );
}

//////////////////////
// Search Functions //
//////////////////////

//process the main search string
function processSearch( ){
	require( [ "dijit/registry" ], function( registry ){
		var widget = registry.byId( "mainSearch" );
		
		if( !widget.item ){
			if( widget.get( "value" ).length > 0 ){
				backupSearch( widget.get( "value" ) );	
			}	
		}else{
			document.querySelector( "#searchclear" ).classList.add( "hidden" );
			document.querySelector( "#searchprogress" ).classList.remove( "hidden" );
			finder( widget.item.i, "searchresults" );	
			lastSearch = "main";
		}
	} );
}

function finder( data, container ){
	console.log( data )
	require( [ "dijit/registry", "dojo/_base/connect", "dojo/request" ] , function( registry, connect, request ){
		//1. Ready to publish 
		if( data.matid && data.taxpid && data.groundpid && data.x && data.y ){
			if( data.matid === -1 )
				data.matid = null;
			
			//publish
			connect.publish( "/change/selected", data );
			connect.publish( "/add/graphics", Utils.mixin( data, { 
				graphictype: "parcelpoly", 
				removegraphics: ( data.hasOwnProperty( "removegraphics" ) ? data.removegraphics : [ "buffer", "road", "parcelpt" ] ),
				zoom: ( data.hasOwnProperty( "zoom" ) ? data.zoom : true ) 					
			} ) );
			connect.publish( "/set/identity", data );
			connect.publish( "/set/characteristicsandtaxinfo", data );
			connect.publish( "/set/deed", data );
			connect.publish( "/set/locinfo", data );
			connect.publish( "/set/envinfo", data );
			
			//scroll data div to top
			document.getElementById( "aside" ).scrollTop = 0 ;
		}
			
		//2. Should have come from querystring find XY and full address of the master address point
		else if( data.matid && data.taxpid && data.groundpid ){
			request.get( config.ws + "v1/ws_attributequery.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					table: "masteraddress_pt",
					source: "tax",
					fields: "full_address as address, ST_Y ( shape ) as y, ST_X ( shape ) as x, ST_y( ST_transform( shape, 4326 ) ) as lat, ST_x( ST_transform( shape, 4326 ) ) as lon",
					parameters: "num_addr='" + data.matid + "'"
				}
			} ).then( function( matdata ){
				if( matdata.length > 0 ){
					Utils.mixin( data, matdata[ 0 ] );
					finder( data, container );
				}	
			} );
		}
			
		//3. Get ground pid from cama	
		else if( data.matid && data.taxpid ){
			request.get( config.ws + "v1/ws_cama_pidswitcher.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					pid : data.taxpid,
					pidtype : "tax"
				}
			} ).then( function( camadata ){
				if( camadata.length > 0 ){ //kick it back to Main Search
					data.groundpid = camadata[ 0 ].common_parcel_id;
					data.taxpid = camadata[ 0 ].parcel_id;					
					finder( data, container );
				}else{ //if parcel isn't mapped and no CAMA data exists but the address point exists
					badSearch( );
					
				}
				//else is not handled because its impossible to have no ground pid for a corresponding tax pid
			} );
		}
			
		//4. Get tax pid from cama
		else if( data.matid && data.groundpid ){
			request.get( config.ws + "v1/ws_cama_situsaddress.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { pid: data.groundpid }
			} ).then ( function( camadata ) {
				if( camadata.length > 0 ){ //the passed groundpid exists in cama
					var idx = 0;
					
					if( camadata.length > 1 ){ //some tax pids have alphabets appended after 3 digit numerals
						var sideaddrs = [ ];
						
						camadata.forEach( function( item, i ){
							sideaddrs.push( item.house_number + "|" + item.street_name );
						} );
						
						//find the best matching tax pid by comparing the master address and situs address
						idx = Utils.getBestMatchingAddr( data.address, sideaddrs );			
					}
					data.taxpid = camadata[ idx ].parcel_id;
					finder( data, container );
				}else{ //ground pid doesn't exist in cama
					badSearch( );
				}	
			} );
		}
			
		//5. Get matid by intersecting parcel layer with master address table 
		else if( data.groundpid && data.taxpid ){
			request.get( config.ws + "v1/ws_addresses_on_ground.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					pid: data.groundpid
				}
			} ).then( function( gisdata ){
				if( gisdata.length > 0 ){
					var idx = 0;
													
					gisdata.forEach( function( item, i ){
						if( item.parcel_id == Utils.guessPIDinMAT( data.taxpid, data.groundpid ) ){
							idx = i;
							return false;
						}	
					} );
					Utils.mixin( data, { 
						matid: gisdata[ idx ].matid, 
						address: gisdata[ idx ].address,  
						y: gisdata[ idx ].y, 
						x: gisdata[ idx ].x,
						lon: gisdata[ 0 ].lon, 
						lat: gisdata[ 0 ].lat,
						sqft: gisdata[ 0 ].sqft
					} );
					finder( data, container );
				}else{
					Utils.mixin( data, { matid: -1, address: "NA" } );
										
					request.get( config.ws + "v1/ws_attributequery.php", {
						handleAs: "json",
						headers: { "X-Requested-With": "" },
						query: {
							table: "parcels_py",
							fields: "ST_Y(ST_PointOnSurface(shape)) as y, ST_X(ST_PointOnSurface(shape)) as x, ST_y( ST_transform( ST_PointOnSurface(shape), 4326 ) ) as lat, ST_x( ST_transform( ST_PointOnSurface(shape), 4326 ) ) as lon, ST_Area( shape ) As sqft",
							parameters: "pid='" + data.groundpid + "'",
							source: "tax"
						}
					} ).then( function( parceldata ){
						if ( parceldata.length > 0 ) {
							Utils.mixin ( data, parceldata[ 0 ] );
						}else{
							Utils.mixin ( data, { y: -1, x: -1, lat: -1, lon: -1 } );
						}
						finder ( data, container );
					} );
				} 
			} );
		}
			
		//7. Probably control came from a master address search, find groundpid by intersecting with parcel layer
		else if( data.matid ){ 
			request.get ( config.ws + "v1/ws_geo_featureoverlay.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					from_table : "masteraddress_pt",
					to_table : "parcels_py",
					source: "tax",
					fields : "f.full_address as address, f.num_parent_parcel as pid_mat, t.pid as groundpid, " +
								"ST_Y( f.shape ) as y, ST_X( f.shape ) as x, ST_y( ST_transform( f.shape, 4326 ) ) as lat, ST_x( ST_transform( f.shape, 4326 ) ) as lon, " +
								"ST_Area( t.shape ) As sqft",
					parameters : "f.num_addr='" + data.matid + "'"			
				}
			} ).then( function( gisdata ){
				if( gisdata.length > 0 ){
					if( Validate.isCNumber( gisdata[ 0 ].groundpid ) ){ //if ground pid has C the pid attached to the MAT point is King
						if( Validate.isCNumber( gisdata[ 0 ].pid_mat ) ){ //the pid attached to MAT has a C so matid is useless, kick it back to Main Search
							finder( { groundpid: gisdata[ 0 ].groundpid, sqft: gisdata[ 0 ].sqft }, container );
						}else{ //kick it back to Main Search - change after new address system goesinto effect
							//data.address = gisdata[ 0 ].address; 
							//data.taxpid = gisdata[ 0 ].pid_mat; 
							//data.groundpid = gisdata[ 0 ].groundpid; 
							//data.y = gisdata[ 0 ].y; 
							//data.x = gisdata[ 0 ].x;
							//data.lon = gisdata[ 0 ].lon; 
							//data.lat = gisdata[ 0 ].lat;
							//finder ( data, container );
							finder( { groundpid: gisdata[ 0 ].groundpid, sqft: gisdata[ 0 ].sqft }, container );
						}		
					}else{ //kick it back to Main Search 
						data.address = gisdata[ 0 ].address; 
						data.groundpid = gisdata[ 0 ].groundpid; 
						data.y = gisdata[ 0 ].y; 
						data.x = gisdata[ 0 ].x;
						data.lon = gisdata[ 0 ].lon; 
						data.lat = gisdata[ 0 ].lat;
						data.sqft = gisdata[ 0 ].sqft;
						finder( data, container );
					}
				}else{ //no parcel intersects mat point
					request.get( config.ws + "v1/ws_attributequery.php", {
						handleAs: "json",
						headers: { "X-Requested-With": "" },
						query: {
							table : "masteraddress_pt",
							source: "tax",
							fields : "full_address as address, num_parent_parcel as pid_mat, ST_Y ( shape ) as y, ST_X ( shape ) as x",
							parameters : "num_addr='" + data.matid + "'"			
						}
					} ).then( function( matdata ){
						if( matdata.length > 0 ){
							//add click point information		
							var info = {
								Desciption: "Address", 			
								Address: matdata[ 0 ].address,							
								XY: parseInt( matdata[ 0 ].x ) + ", " + parseInt( matdata[ 0 ].y )
							};
								
							document.getElementById( "poicont" ).innerHTML = Format.objectAsTable( info , "proptbl", true );
						
							//show point of interest div
							showDiv( "poi" );
																
							connect.publish( "/add/graphics", { 
								x: matdata[ 0 ].x, 
								y: matdata[ 0 ].y, 
								graphictype: "location", 
								removegraphics: [ "buffer", "road", "parcelpt" ], 
								zoom: true 
							} );
						}else{
							badSearch ( );							
						}	
					} );	
				}
			} );
		}
			
		//8. Go to cama and get ground pid
		else if( data.taxpid ){
			request.get( config.ws + "v1/ws_cama_pidswitcher.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					pid : data.taxpid,
					pidtype : "tax"		
				}
			} ).then( function( camadata ){
				if( camadata.length > 0 ){
					if( camadata[ 0 ].common_parcel_id.trim( ).length > 0 ){
						data.groundpid = camadata[ 0 ].common_parcel_id.trim( ); 
						finder( data, container );
					}else{
						badSearch( );	
					}	
				} else { //tax pid is not found in cama. can happen if a bad pid comes from the master address table
					badSearch( );
				}	
			} );
		}
			
		//9. Query cama based on passed parameter(s) 
		else if( data.groundpid || data.lastname || data.stname ){
			request.get( config.ws + "v1/ws_cama_taxparcelinfo.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: {
					compid: ( data.groundpid ? data.groundpid : "" ),
					lastname: ( data.lastname ? data.lastname.trim( ) : "" ),
					firstname: ( data.firstname ? data.firstname.trim( ) : "" ),
					staddrno: ( data.staddrno ? data.staddrno : "" ),
					stprefix: ( data.stprefix ? data.stprefix : "" ),
					stname: ( data.stname ? Format.escapeSingleQuote ( data.stname ) : "" ),
					sttype: ( data.sttype ? data.sttype : "" ),
					stsuffix: ( data.stsuffix ? data.stsuffix : "" ),
					stmuni: ( data.stmuni ? Format.juriscama( data.stmuni ) : "" )	
				}
			} ).then( function( camadata ){
				if( camadata.length == 1 ){	//kick it back to Main Search	
					finder( {
						taxpid: camadata[ 0 ].pid.trim( ), 
						groundpid: camadata[ 0 ].common_pid.trim( ),
						removegraphics: ( data.stname ? [ ] : [ "buffer", "road", "parcelpt" ] ),
						zoom: ( data.hasOwnProperty ( "zoom" ) ? data.zoom : true )	
					}, container );	
									
				}else if( camadata.length > 1 ){ //more taxpids associated with ground pid show results for user to select manually	
					require ( [ "mojo/SearchResultBoxLite" ], 
						function( SearchResultBoxLite ){
							document.getElementById( container ).innerHTML ="<h5><span class = 'note'>Are you looking for?</span></h5>";
						
							camadata.forEach( function ( item, i ){
								var widget = new SearchResultBoxLite( {
									idx: i + 1,
									displaytext : 
										"<div>" + 
											Format.address( Format.nullToEmpty( item.house_number ), 
												Format.nullToEmpty( item.prefix ), 
												Format.nullToEmpty( item.street_name ), 
												Format.nullToEmpty( item.road_type ), 
												Format.nullToEmpty( item.suffix ), 
												Format.nullToEmpty( item.unit ), 
												Format.jurisdisplay ( Format.nullToEmpty( item.municipality ) ), "", "" ) + 
										"</div>" +
										"<div>Parcel ID:&nbsp;" + item.pid + "</div>" + 
										"<div>Ownership:</div>" + 
										"<div>" + Format.ownerlist ( item.owner_names ) + "</div>",
									params: { 
										taxpid: item.pid.trim( ), 
										groundpid: Format.nullToEmpty( item.common_pid ).trim( ),
										removegraphics: [ "buffer", "road", "parcelpt" ],
										zoom: ( data.hasOwnProperty ( "zoom" ) ? data.zoom : true ),
										backtoresults: true		
									},
									onClick: function( boxdata ){
										finder( boxdata, container );
									}
								} ).placeAt( document.getElementById( container ) );	
							} );
							
							//show search results div
							showDiv( "searchresults" );
						} 
					);
				}else{ //no parcel with search criterion exists in cama 
					badSearch( );
				}
			} );
		}
			
		//6. Probably control came form a map click or road search
		else if( data.y && data.x ){
			if( data.hasOwnProperty( "tag" ) ){
				if( data.tag === "Road" ){ //road search
					var item = data.desc.split( "|" );
												
					Utils.mixin( data, {
						stprefix: ( ( item[ 0 ] == "x" ) ?  null : item[ 0 ] ),
						stname: ( ( item[ 1 ] == "x" ) ?  null : item[ 1 ] ),
						sttype: ( ( item[ 2 ] == "x" ) ?  null : item[ 2 ] ), 
						stsuffix: ( ( item[ 3 ] == "x" ) ?  null : item[ 3 ] ),
						stmuni: ( ( item[ 4 ] == "x" ) ?  null : item[ 4 ] ),
						removegraphics: [ "buffer", "road", "parcelpt" ]
					} );
							
					finder( data, container );
					connect.publish( "/add/graphics", Utils.mixin( data, { graphictype: "road", zoom: true } ) );
									
				}else{ //points of interest
					//add location information
					//add pointer to map and identify layer that intersect point
					if( data.hasOwnProperty( "lat" ) && data.hasOwnProperty( "lon" ) ){
						addLocation( { x: data.x, y: data.y, lat: data.lat, lon: data.lon, desc: data.desc, zoom: true } );
					}else{
						request.get( config.ws + "v1/ws_geo_projectpoint.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: { 
								x : data.x, 
								y : data.y, 
								fromsrid : 2264
							}
						} ).then( function( projdata ){
							if( projdata.length > 0 ){
								addLocation( { x: data.x, y: data.y, lat: projdata[ 0 ].y, lon: projdata[ 0 ].x, desc: data.desc, zoom: true } );
							}
						} );							
					}	
				}	
			}else{ //map click
				request.get( config.ws + "v1/ws_geo_pointoverlay.php", {
					handleAs: "json",
					headers: { "X-Requested-With": "" },
					query: { x : data.x, y : data.y, srid: "2264", table: "parcels_py", geometryfield: "shape", fields: "pid as groundpid", source: "tax" }
				} ).then( function( parceldata ){
					if( parceldata.length > 0 ){ //kick it back to Main Search
						finder( { "groundpid": parceldata[ 0 ].groundpid, removegraphics: [ "buffer", "road", "parcelpt" ], zoom: data.zoom }, container );
					}else{ //no parcel intersects identify point
						if( data.hasOwnProperty( "lat" ) && data.hasOwnProperty( "lon" ) ){
							addLocation( { x: data.x, y: data.y, lat: data.lat, lon: data.lon, desc: "Search Location", zoom: data.zoom } );
						}else{
							request.get ( config.ws + "v1/ws_geo_projectpoint.php", {
								handleAs: "json",
								headers: { "X-Requested-With": "" },
								query: { 
									x : data.x, 
									y : data.y, 
									fromsrid : 2264
								}
							} ).then( function( projdata ){
								if( projdata.length > 0 ){
									addLocation( { x: data.x, y: data.y, lat: projdata[ 0 ].y, lon: projdata[ 0 ].x, desc: "Search Location", zoom: data.zoom } );
								}
							} );	
						}
					}
				} );
			}
		} else {
			var widget = registry.byId( "mainSearch" );
			widget.set( "value", "" );	
			
			document.querySelector( "#searchprogress" ).classList.add( "hidden" );
			document.querySelector( "#searchclear" ).classList.remove( "hidden" );
		}
	} );
}

function backupSearch( searchStr ){
	require( [ "dojo/request" ], function( request ){
		if( Validate.isTaxPID( searchStr ) ){
			finder( { "taxpid": searchStr.replace ( /-/g, "" ) }, "searchresults" );	
			lastSearch = "main";
			document.querySelector( "#searchclear" ).classList.add( "hidden" );
			document.querySelector( "#searchprogress" ).classList.remove( "hidden" );
		}else if( Validate.isCNumber( searchStr ) ){
			finder( { "groundpid": searchStr }, "searchresults" );	
			lastSearch = "main";
			document.querySelector( "#searchclear" ).classList.add( "hidden" );
			document.querySelector( "#searchprogress" ).classList.remove( "hidden" );
		}else if( Validate.isLatLon( searchStr ) ){
			var latlon = Utils.parseLatLon( searchStr );
							
			request.get( config.ws + "v1/ws_geo_projectpoint.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: { 
					x: latlon.lon, 
					y: latlon.lat, 
					fromsrid: 4326,
					tosrid: 2264
				}
			} ).then( function( projdata ){
				if( projdata.length > 0 ){
					finder( { tag: "Lat Lon", lat: latlon.lat, lon: latlon.lon, x: projdata[ 0 ].x, y: projdata[ 0 ].y, desc: "Location", zoom: true }, "searchresults" );
					lastSearch = "main";
				}
			} );
		}else if( Validate.isStatePlane( searchStr ) ){
			var coords = Utils.parseStatePlane( searchStr );
			
			finder( { tag: "XY Coordinates", x: coords.x, y: coords.y, desc: "Location", zoom: true }, "searchresults" );
			lastSearch = "main";
		}else{
			var standardizedAddr = getStandardizedAddress ( searchStr ).split( "|" );
		
			if( standardizedAddr[ 2 ].length > 0 ){ //atleast a street name is needed
				standardizedAddrSearch( standardizedAddr, "searchresults" );	
				lastSearch = "main";
				document.querySelector( "#searchclear" ).classList.add( "hidden" );
				document.querySelector( "#searchprogress" ).classList.remove( "hidden" );
			}else{ //search string needs to be validated by uber search
				badSearch( );
			}
		}
	} );
}

function standardizedAddrSearch( standardizedAddr, container ){
	require( [ "dojo/request" ] , function( request ){
		request.get( config.ws + "v1/ws_attributequery.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: {
				"table" : "masteraddress_pt",
				"fields" : "num_addr as matid, full_address as address",
				"parameters" : ( standardizedAddr[ 2 ].length > 0 ? ( standardizedAddr[ 0 ].length > 0 ?  "dmetaphone(nme_street) like dmetaphone('" + standardizedAddr[ 2 ] + "')" : "nme_street like '" + standardizedAddr[ 2 ] + "%'" ) : "" ) +
					( standardizedAddr[ 0 ].length > 0 ? " and txt_street_number = '" + standardizedAddr[ 0 ] + "'" : "" ) +
					( standardizedAddr[ 1 ].length > 0 ? " and cde_street_dir_prfx = '" + standardizedAddr[ 1 ] + "'" : "" ) +
					( standardizedAddr[ 3 ].length > 0 ? " and cde_roadway_type = '" + standardizedAddr[ 3 ] + "'" : "" ) +
					( standardizedAddr[ 4 ].length > 0 ? " and cde_street_dir_suff = '" + standardizedAddr[ 4 ] + "'" : "" ) +
					( standardizedAddr[ 5 ].length > 0 ? " and txt_addr_unit = '" + standardizedAddr[ 5 ] + "'" : "" ) +
					( standardizedAddr[ 6 ].length > 0 ? " and nme_po_city = '" + standardizedAddr[ 6 ] + "'" : "" ) +
					( standardizedAddr[ 8 ].length > 0 ? " and cde_zip1 = '" + standardizedAddr[ 8 ] + "'" : "" ),
				"source" : "tax"
			}
		} ).then( function( matdata ){
			if( matdata.length > 1 ){ //publish search results
				//list results
				document.getElementById( container ).innerHTML = "<h5><span class = 'note'>Did you mean?</span></h5>";
				
				require( [ "mojo/SearchResultBoxLite" ] , function( SearchResultBoxLite ){
					matdata.forEach( function( item, i ){
						var widget = new SearchResultBoxLite( {
							idx: i + 1,
							displaytext: item.address,
							params: { 
								matid: item.matid,
								backtoresults: true								
							}, 
							onClick: function( boxdata ){
								finder( boxdata, "searchresults" );
							}
						} ).placeAt( document.getElementById( container ) );
					} );
				} );
							
				//show search results div
				showDiv( "searchresults" );
			}else if( matdata.length > 0 ){
				finder( { "matid": matdata[ 0 ].matid }, "searchresults" );
			}else{
				badSearch( );
			}
		} );
	} );
}

function bufferSearch( buffersize ){
	require( [ "mojo/SearchResultBoxLite", "esri/tasks/GeometryService", "esri/tasks/BufferParameters", 
	"dojo/_base/connect", "dojo/request" ], function( SearchResultBoxLite, GeometryService, BufferParameters, connect, request ){
		if( buffersize > 0 ){ //add buffer graphic only if buffer is atleast 1 feet
			var geometryService = new GeometryService( config.geometry_service ),
				geom_arr = [ ]
						
			for( var i = 0;i < parcelGraphics.length; i++ ){
				geom_arr.push( parcelGraphics[ i ].geometry )
				
			}							
			
			//simplfy parcel polygon
			//geometryService.simplify( [ parcelGraphic.geometry ], function( geometries ){
			geometryService.simplify( geom_arr, function( geometries ){
				//get buffer shape and add to map
				var bufferParams = new BufferParameters( );
				bufferParams.geometries = geometries;
				bufferParams.distances = [ buffersize ];
				
				geometryService.buffer( bufferParams, function( bufferGeometry ){
					//add buffer graphics
					connect.publish( "/add/graphics", { 
						graphictype: "buffer", 
						buffergeom: bufferGeometry[ 0 ], 
						removegraphics: [ "buffer", "road", "parcelpt" ], 
						zoom: true
					} );		
				} );
				
			} );	
			
		}	
			
		//get deed information parcels from cama for parcels with buffer 	
		request.get( config.ws + "v1/ws_cama_deedinfo.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: { pid: "", gisid: selectedAddress.groundpid, buffer: buffersize }
		} ). then( function( camadata ){
			document.getElementById( "searchresults" ).innerHTML = "<h5><span class = 'note'>Are you looking for?</span></h5>";
																										
			camadata.forEach( function( item, i ){
				var widget = new SearchResultBoxLite( {
					idx: i + 1,
					displaytext : 
						"<table>" +
							"<tr>" +
								"<th class='fixed'>Parcel ID</th>" + 
								"<td>" + item.pid + "</td>" + 
							"</tr>" + 
							
							"<tr>" +
								"<th class='fixed'>Ownership</th>" + 
								"<td>" + Format.ownerlist( item.owner_names ) + "</td>" + 
							"</tr>" +
							"<tr>" +
								"<th class='fixed'>Mailing Address</th>" + 
								"<td>" + Format.trimNconcat( [ 
										{ val: Format.nullToEmpty( item.address_1 ), appnd: " " },
										{ val: Format.nullToEmpty( item.address_2 ), appnd: "<br/>" },
										{ val: Format.nullToEmpty( item.city ), appnd:" " },
										{ val: Format.nullToEmpty( item.state ), appnd:" " },
										{ val: Format.nullToEmpty( item.zipcode ), appnd:"" } 
									] ) +
								"</td>" + 
							"</tr>" +
							"<tr>" +
								"<th class='fixed'>Land Area</th>" + 
								"<td>" + Format.landArea( item.total_acres, item.land_unit_type, item.gis_acres ) +
							"</td>" + 
							"</tr>" +
							"<tr>" +
								"<th class='fixed'>Legal Desc</th>" + 
								"<td>" + item.legal_description + "</td>" + 
							"</tr>" +
							"<tr>" +	
								"<th class='fixed'>Deed</th>" + 
								"<td>" + Format.deed( item.deed_book, item.deed_page, item.sale_date, true ) + "</td>" + 
							"</tr>" +
							
						"</table>",
					params: { 
						taxpid: item.pid.trim( ), 
						groundpid: item.common_pid.trim( ),
						removegraphics: [ ],
						zoom: true,
						backtoresults: true	
					},
					onClick: function( boxdata ){
						finder( boxdata, "searchresults" );
					}	
				} ).placeAt( document.getElementById( "searchresults" ) );
			} );	
			
			//set report links
			updateReportLinks( { pidbuff: selectedAddress.groundpid + "|" + buffersize } );
									
			//show search results div
			showDiv( "searchresults" );		
		} );	
	} );
}

function prelimPlanSearch( prelimplan ){
	require( [ "esri/tasks/query", "esri/tasks/QueryTask" ], function( query, QueryTask ){
		var qry = new query( ),
			prelimplansQueryTask = new QueryTask( config.overlay_services.overlays_streets.url + "/22" );
			
		qry.where = "projname = '" + prelimplan + "'";
		qry.returnGeometry = true;
		qry.outFields = [ "projname" ];
		prelimplansQueryTask.execute( qry, function( results ){ 
			switchOnOffOverlay( "overlays_streets", "prelimplans", true );
			zoom.toExtent( results.features[ 0 ].geometry.getExtent( ) ); 
		} );
	} );
}

function engGridSearch( enggrid ){
	require( [ "esri/tasks/query", "esri/tasks/QueryTask" ], function( query, QueryTask ){
		var qry = new query ( ),
			enggridQueryTask = new QueryTask( config.overlay_services.overlays_streets.url + "/14" );
			
		qry.where = "map_sheet_no = '" + enggrid + "'";
		qry.returnGeometry = true;
		qry.outFields = [ "map_sheet_no" ];
		enggridQueryTask.execute( qry, function( results ){ 
			switchOnOffOverlay( "overlays_streets", "enggrid", true );
			zoom.toExtent( results.features[ 0 ].geometry.getExtent( ) ); 
		} );
	} );
}

function analyzeTheMarket( param, pageno, data ){
	require( [ "dojo/request" ], function( request ){
		if( data ){
			document.getElementById( "searchresults" ).innerHTML = "<h5><span class = 'note'>Are you looking for?</span></h5>" + 
					"<div class='cont textcenter'>" + getPagingHTML( pageno, data ) + "</div>";	
		
			Utils.getDomElements( document.querySelectorAll( ".page" ) ).forEach( function( ctrl ){
				ctrl.addEventListener( "click", function( event ){
					analyzeTheMarket( param, parseInt( event.target.id.replace( "page", "") ), data );	
				} );
			} );
			
			showAnalyzedData( pageno, 
				data.filter( function( item, i ){	
					return ( ( i >= ( pageno * 36 ) - 36 ) && ( i < ( pageno * 36 ) ) );
				} ),
				param
				//reportparams			
			);
		}else{
			request.get( config.ws + "v1/ws_cama_marketanalysis.php", {
				handleAs: "json",
				headers: { "X-Requested-With": "" },
				query: param
			} ).then( function( data ){
				if( data.length > 0 ){
					analyzeTheMarket( param, pageno, data );
				}else{
					badSearch( );
				}
				
				//hide progress animation
				document.getElementById( "mrktanlysprogress" ).classList.add( "hidden" );
			} );	
		}
	} );
}

function showAnalyzedData( pageno, data, reportparams ){
	require( [ "mojo/SearchResultBoxLite", "dojo/_base/connect", "dojo/request" ] , function( SearchResultBoxLite, connect, request ){
		var commonpids = "";
	
		//store unique ground pids
		data.forEach( function( item, i ){
			if( commonpids.indexOf( item.common_pid ) < 0 ){
				commonpids += ( commonpids.length > 0 ? "," : "" ) + "'" + item.common_pid.trim( ) + "'";			
			}
		} );
			
		request.get( config.ws + "v1/ws_attributequery.php", {
			handleAs: "json",
			headers: { "X-Requested-With": "" },
			query: { 
				table: "parcels_py", 
				fields: "pid as common_pid, ST_Y(ST_PointOnSurface(shape)) as y, ST_X(ST_PointOnSurface(shape)) as x, " +
					"ST_Area ( shape ) As sqft",
				parameters: "pid in (" + commonpids + ")",
				source: "tax"
			}
		} ).then( function( parceldata ){
			var parcelPoints = [ ],
				groundpids	= [ ];
			
			data.forEach( function( item, i ){
				//if ( reportparams.srchtype !== "pidbuff" ){
					//append taxpids for deed report
					//reportparams.pid += ( reportparams.pid.length > 0 ? "," : "" ) + item.pid;	
				//}
						
				var tempArr = parceldata.filter( function( parcel ){ return ( parcel.common_pid === item.common_pid.trim( ) ); } );
							
				if( tempArr.length > 0 ){
					Utils.mixin( item, tempArr[ 0 ] );
										
					if( groundpids.indexOf( item.common_pid ) < 0 ){
						parcelPoints.push( { y: item.y, x: item.x } );
						groundpids.push( item.common_pid );
					}	
														
					var widget = new SearchResultBoxLite( {
						idx: groundpids.indexOf( item.common_pid ) + 1,
						displaytext : 
							"<table>" +
								"<tr>" +
									"<th class='fixed'>Parcel ID</th>" + 
									"<td>" + item.pid + "</td>" + 
								"</tr>" + 
								"<tr>" +
									"<th class='fixed'>Address</th>" + 
									"<td>" + 
										Format.address( Format.nullToEmpty( item.house_number ), 
											Format.nullToEmpty( item.prefix ), 
											Format.nullToEmpty( item.street_name ), 
											Format.nullToEmpty( item.road_type ), 
											Format.nullToEmpty( item.suffix ), 
											Format.nullToEmpty( item.unit ), 
											Format.jurisdisplay( Format.nullToEmpty( item.municipality ) ), "", "" ) + 
									"</td>" + 
								"</tr>" +
								"<tr>" +
									"<th class='fixed'>Sale Price</th>" + 
									"<td>" + Format.money( item.sale_price, item.sale_date ) + "</td>" + 
								"</tr>" +
								"<tr>" +
									"<th class='fixed'>Market Value</th>" + 
									"<td>" + Format.money( item.market_value ) + "</td>" + 
								"</tr>" +
								"<tr>" +
									"<th class='fixed'>Land Area</th>" + 
									"<td>" + 
										Format.landArea( item.land_area, item.land_unit_type, ( item.sqft / 43650 ) ) +
									"</td>" + 
								"</tr>" +
								( reportparams.propuse === "Vacant" ? "" :  
									"<tr>" +	
										"<th class='fixed'>Year Built</th>" + 
										"<td>" + Format.nullToEmpty( item.built_year ) + "</td>" + 
									"</tr>" +
									"<tr>" +	
										"<th class='fixed'>Square Feet</th>" + 
										"<td>" + Format.number( item.built_area, 0 ) + "</td>" + 
									"</tr>" +
									"<tr>" +	
										"<th class='fixed'>Bedrooms</th>" + 
										"<td>" + Format.nullToEmpty( item.bedrooms ) + "</td>" + 
									"</tr>" +
									"<tr>" +	
										"<th class='fixed'>Full Baths</th>" + 
										"<td>" + Format.nullToEmpty( item.fullbaths ) + "</td>" + 
									"</tr>" 
								) +
							"</table>",
						params: { 
							taxpid: item.pid.trim( ), 
							groundpid: item.common_pid.trim( ),
							removegraphics: [ ],
							zoom: true,
							backtoresults: true											
						},
						onClick: function( boxdata ){
							finder( boxdata, "searchresults" );
						}	
					} ).placeAt( document.getElementById( "searchresults" ) );
				}	
			} );
			
			//add point graphics
			connect.publish ( "/add/graphics", { 
				graphictype: "parcelpoint", 
				points: parcelPoints, 
				removegraphics: ( reportparams.srchtype == "pidbuff" ? [ "road", "parcelpt" ] : [ "buffer", "road", "parcelpt" ] ), 
				zoom: true 
			} );
			
			//set report links	
			updateReportLinks( reportparams );
		} );
		
		//show search results div
		showDiv( "searchresults" );		
	} );
}	

//layer identify
function idLayers( data ){
	require( [ "esri/tasks/IdentifyTask", "esri/tasks/IdentifyParameters", "esri/geometry/Point",
		"esri/SpatialReference", "dojo/Deferred", "dojo/promise/all", "dojo/request" ], function( IdentifyTask, IdentifyParameters, Point, SpatialReference, Deferred, all, request ){ 
			Utils.getDomElements( document.querySelectorAll( "#idlayerdatacont > div" ) ).forEach( function( ctrl ){
				ctrl.classList.add( "hidden" );
			} );
		
			if( document.getElementById( "idlayerdata" + data.lyridx ) ){
				document.querySelector( "#idlayerdata" + data.lyridx ).classList.remove( "hidden" );
			}else{
				var polyTables = {
						"0": "jurisdiction_py",
						"3": "buildings_py",
						"4": "SphereOfInfluence_py",
						"5": "BOE_Precinct_py",
						"7": "Zipcode_Meck_py",
						"8": 42,
						"9": 43,
						"10": "PostConst_Districts_py",
						"11": "WaterQuality_Buffers_py",
						"12": "Watershed_Stormwater_py",
						"13": "Watershed_DrinkingWater_py",
						"14": "WaterQuality_Buffers_py",
						"15": "Census_Tracts_2010_py", 
						"16": "EngGrid_py",
						"18": 34,
						"19": "Census_Blocks_2010_py",
						"26": 60,
						"27": 61
					}, ptTables = {
						"1": "masteraddress_pt",
						"20": "buildingpermits_pt",
						"21": "buildingpermits_pt",
						"22": "buildingpermits_pt",
						"23": "buildingpermits_pt",
						"24": "buildingpermits_pt",					
						"25": "buildingpermits_pt"
					}, lineTables = {
						"2": "Streets_ln",
						"17": "Preliminary_Plans_ln"
					};
							
				switch( data.lyridx ){
					/* Polygon layers in SDE */
					case "0": //jurisdiction
					case "3": //building footprints
					case "4": //spheres of influence
					case "5": //voter precincts
					case "7": //zipcodes
					case "10": //post const district
					case "11": //post const buffer
					case "12": //stream watersheds
					case "13": //drinking watersheds
					case "14": //water quality buffer buffers
					case "15": //census tract
					case "16": //eng grid
					case "19": //census block groups
						request.get( config.ws + "v1/ws_attributequery.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: { 
								table: polyTables[ data.lyridx ], 
								fields: "*", 
								parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",
								source: "gis"
							}
						} ).then( function( gisdata ){ 
							processIDLayers( ( gisdata.length > 0 ? gisdata [ 0 ] : null ), data.lyridx ); 
						} );
						break;
					
					/* Point layers in SDE */					
					case "1": //master address table
					case "20": //new commercial buildings - in progress
					case "21": //new commercial buildings - completed
					case "22": //new single family buildings - in progress
					case "23": //new single family buildings - completed
					case "24": //new multi family buildings - in progress
					case "25": //new multi family buildings - completed
						var lyrprop = { 
							"1": {
									where: "",
									displayfield: "address"
								},	
							"20": {
									where: " AND issuedate >= ( CURRENT_DATE - 365 ) AND compldate IS NULL AND occupancy NOT LIKE 'R2%' AND occupancy NOT LIKE 'R3%'",
									displayfield: "projname"
								},
							"21": {
									where: " AND compldate >= ( CURRENT_DATE - 365 ) AND occupancy NOT LIKE 'R2%' AND occupancy NOT LIKE '%R3%'",
									displayfield: "projname"
								},
							"22": {
									where: " AND issuedate >= ( CURRENT_DATE - 365 ) AND compldate IS NULL AND occupancy LIKE '%R3%'",
									displayfield: "projname"
								},	
							"23": {
									where: " AND compldate >= ( CURRENT_DATE - 365 ) AND occupancy LIKE '%R3%'",
									displayfield: "projname"
								},	
							"24": {
									where: " AND issuedate >= ( CURRENT_DATE - 365 ) AND compldate IS NULL AND occupancy LIKE '%R2%'",
									displayfield: "projname"
								},
							"25": {
									where: " AND compldate >= ( CURRENT_DATE - 365 ) AND occupancy LIKE '%R2%'",
									displayfield: "projname"
								}		
						};
												
						request.get( config.ws + "v1/ws_attributequery.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: { 
								table: ptTables[ data.lyridx ], 
								fields: "*",
								parameters: "ST_DWithin( shape, ST_GeomFromText( 'POINT(" + data.x + " " + data.y +")', 2264), " + ( data.lyridx === "1" ? "50" : "100" ) + " )" + lyrprop[ data.lyridx ].where,	
								source: "gis"
							}
						} ).then( function( gisdata ){
							processIDLayers( ( gisdata.length > 0 ? gisdata : null ), data.lyridx, lyrprop[ data.lyridx ].displayfield ); 
						} );
						break;
						
					/* Line layers in SDE */	
					case "2": //streets
					case "17": //prelim plan
						request.get( config.ws + "v1/ws_attributequery.php", {
							handleAs: "json",
							headers: { "X-Requested-With": "" },
							query: { 
								table: lineTables[ data.lyridx ], 
								fields: "*",
								parameters: "ST_DWithin( shape, ST_GeomFromText( 'POINT(" + data.x + " " + data.y +")', 2264), 50 )",
								source: "gis"
							}
						} ).then( function( gisdata ) { 
							processIDLayers( ( gisdata.length > 0 ? gisdata [ 0 ] : null ), data.lyridx ); 
						} );
						break;	
					
					/* Special case Polygon Layer*/
					case "6": //Zoning
						all( [
							//charlotte zoning
							request.get( config.ws + "v1/ws_attributequery.php", {
								handleAs: "json",
								headers: { "X-Requested-With": "" },
								query: { 
									table: "Zoning_cityofcharlotte_py", 
									fields: "*", 
									parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",
									source: "gis"
								}
							} ),
							
							//town zoning
							request.get( config.ws + "v1/ws_attributequery.php", {
								handleAs: "json",
								headers: { "X-Requested-With": "" },
								query: { 
									table: "zoning_towns_py", 
									fields: "*", 
										parameters: "ST_Within(ST_GeomFromText( 'POINT(" + data.x + " " + data.y + ")', 2264 ) , shape)",
									source: "gis"
								}
							} )
						] ).then( function( results ){
							if( results[ 0 ].length > 0 ){
								processIDLayers( results[ 0 ][ 0 ], data.lyridx );
							}else if( results[ 1 ].length > 0 ){
								processIDLayers( results[ 1 ][ 0 ], data.lyridx );
							}else{
								processIDLayers( null, data.lyridx );
							}
						} );
						break;			
						
					/* Identifyed using IdentifyTask since data is in Storm Water maintained SQL Server*/	
					case "8": //fema flooplain
					case "9": //community floodplain					
					case "18": //nc geodetic monuments
					case "26": //mpl contominate sites
					case "27": //ncdeq brownfields
						var overlayIdentifyService =  new IdentifyTask( config.overlay_services.overlays_streets.url ),
							idParams = IdentifyParameters( );
							
						Utils.mixin( idParams, {
							tolerance: 3, 
							returnGeometry: false, 
							layerIds: [ polyTables[ data.lyridx ] ], 
							layerOption: IdentifyParameters.LAYER_OPTION_ALL, 
							geometry: new Point( data.x, data.y, new SpatialReference( config.initial_extent.spatialReference ) ),
							mapExtent: map.extent 
						} );	
																						
						overlayIdentifyService.execute( idParams ).then( function( results ){ 
							processIDLayers( ( results.length > 0 ? results[ 0 ].feature.attributes : null ), data.lyridx ); 
						} );
						break;	
				}
			}
	} );
}

//////////////////////
// Helper Functions //
//////////////////////
function handleHash( ){
	require( [ "dojo/hash", "dojo/io-query" ], function ( hash, ioquery ){
		var data = ioquery.queryToObject( hash( ) ),
			params = { };
								
		if( data.mat ){ 				 
			if( Validate.isNumeric( data.mat ) ){ 
				params.matid = data.mat; 
			}	
		}			

		if( data.pid ){
			if( Validate.isTaxPID( data.pid ) ){
				params.taxpid = data.pid; 
			}	
		}else if( hash( ).length > 0 ){
			var tmppid = hash( ).substr( hash( ).indexOf( "/" ) + 1, hash( ).length - 1 );
					
			if( Validate.isTaxPID ( tmppid ) ){
				params.taxpid = tmppid; 
			}	
		}
		
		if( data.gisid ){
			if( Validate.isGroundPID ( data.gisid ) ){
				params.groundpid = data.gisid; 
			}	
		}
		
		if ( ( params.hasOwnProperty("matid") && params.matid !== selectedAddress.matid ) || params.taxpid !== selectedAddress.taxpid || params.groundpid !== selectedAddress.groundpid ){
			finder ( params, "searchresults" );
		}
	} );	
}

function processIDLayers( data, lyridx, namefield ){
	if( data ){
		if( data.constructor === Array ){
			if( data.length > 1 ){
				//create dropdownlist of features
				var ddlhtml = "<div class='contbtm'><select id='" + lyridx + "ddl' class='max'>",
					datahtml = "";
					
				for( var i = 0; i < data.length; i++ ){
					var attribs = { };	
					
					ddlhtml += "<option value='" + i + "' " + ( ( i === 0 ) ? "selected='selected'" : "" ) + ">" + data[ i ][ namefield ].trim( ) + "</option>";
					datahtml += "<div id='idlayerdata" + lyridx + "part" + i + "'" + ( ( i > 0 ) ? " class='hidden'" : "" ) + "'>" + Format.objectAsTable ( getFieldValues ( data[ i ] ), "proptbl", true ) + "</div>";
				}
				
				ddlhtml += "</select></div>";
				
				document.getElementById( "idlayerdatacont" ).innerHTML += "<div id='idlayerdata" + lyridx + "'>" + ddlhtml + datahtml + "</div>";
				
				document.getElementById( lyridx + "ddl" ).addEventListener( "change", function( event ){
					Utils.getDomElements( document.querySelectorAll( "div[id^=idlayerdata" + lyridx + "part]" ) ).forEach( function( ctrl ){
						ctrl.classList.add( "hidden" );
					} );
					document.getElementById( "idlayerdata" + lyridx + "part" + document.getElementById( lyridx + "ddl" ).value ).classList.remove( "hidden" );
				} );
			}else{
				document.getElementById( "idlayerdatacont" ).innerHTML += "<div id='idlayerdata" + lyridx + "'>" + Format.objectAsTable( getFieldValues ( data[ 0 ] ), "proptbl", true ) + "</div>";
			}
		}else{
			document.getElementById( "idlayerdatacont" ).innerHTML += "<div id='idlayerdata" + lyridx + "'>" + Format.objectAsTable( getFieldValues( data ), "proptbl", true ) + "</div>";
		}	
	}else{
		document.getElementById( "idlayerdatacont" ).innerHTML += "<div id='idlayerdata" + lyridx + "'><span class='note'>No data found</span></div>";
	}
}

function getFieldValues( attributes ){
	var attribs = { };
	
	for( var attribute in attributes ){
		if( attribute.toLowerCase( ) !== "shape" && attribute.toLowerCase( ) !== "the_geom" && 
			attribute.toLowerCase( ) !== "geom" ){
			attribs[ attribute.toLowerCase( ) ] =  attributes[ attribute ];
		}	
	}
	
	return attribs;
}

//set reports links in the property detail tab
function updateReportLinks( params ){
	var paramlist = "";
	
	
	//set Property Summary
	/*document.getElementById( "clickpropinforeport" ).setAttribute( "href", config.ws + "v1/propsummary.php?pid=" + data.pid + 
			"&orderby=" + ( data.orderby ? data.orderby : "market_value" ) + "&orderdir=" + ( data.orderdir ? data.orderdir : "desc" ) + 
			"&lottype=" + ( data.lottype ? data.lottype : "" ) + "&propuse=" + ( data.propuse ? data.propuse : "" ) + 
			"&srchtype=" + data.srchtype + "&srchval=" + data.srchval + 
			"&buffer=" + data.buffersize );*/
	
	
	for( var param in params ){
		paramlist += ( paramlist.length > 0 ? "&" : "?" ) + param + "=" + params[ param ];
	}
	
	//set Property Summary
	document.getElementById( "clickpropinforeport" ).setAttribute( "href", config.ws + "v1/report_summary.php" + paramlist );
	//set deed report
	document.getElementById( "clickdeedreport" ).setAttribute( "href", config.ws + "v1/report_deed.php" + paramlist );
	//set deed csv
	document.getElementById( "clickdeedcsv" ).setAttribute( "href", config.ws + "v1/report_deed.php" + paramlist + "&format=csv" );

}

//validate market analysis form
function validateMrktAnlysForm( ){
	var data = { 
		params: { }, 
		errors: [ ] 
	},
	set_cnt = 0;

	require( [ "dijit/registry" ] , function( registry ){
		var temp;

		switch( document.getElementById( "primarysrchtype" ).value ){
			case "0": //jurisdiction	
				data.params.juris = document.getElementById( "jurisdiction" ).value;
				break;
			case "1": //neighborhoodcode
				if( document.getElementById( "neighborcode" ).value.trim( ).length === 0 ){
					data.errors.push( "Enter a valid Neighborhood code." );
				}else{
					data.params.nbc = document.getElementById( "neighborcode" ).value;		
				}
				break;
			case "2": //street name
				if( document.getElementById( "stname" ).value.trim( ).length === 0 ){
					data.errors.push( "Enter a valid Street Name." );
				}else{
					data.params.st = document.getElementById( "stname" ).value;		
				}		
				break;
			case "3": //buffersize
				if( selectedAddress.hasOwnProperty( "groundpid" ) ){	
					if( document.getElementById( "anlysbuffsize" ).value.trim( ).length === 0 ){
						data.errors.push( "Enter a valid buffer size." );
					}else{
						var buffersize = parseInt( document.getElementById( "anlysbuffsize" ).value.trim( ) );
					
						if( !isNaN( buffersize ) && ( buffersize > -1 && buffersize < 5281 ) ){
							data.params.pidbuff = selectedAddress.groundpid + "|" + buffersize;		
						}else{
							data.errors.push( "Enter a valid buffer size." );
						}
					}
				}else{
					data.errors.push( "Select a property to do market analysis using a buffer." );
				}	
				break;
		}
				
		//property use
		data.params.propuse = document.getElementById( "propuse" ).value;
		//assesment info 
		data.params.lottype = document.getElementById( "noacre" ).value;
		
		//acre values	
		temp = Utils.getRangeValues( document.getElementById( "acrefrom" ).value.trim( ), document.getElementById( "acreto" ).value.trim( ), 3, "Enter a valid minimum and maximum Parcel Acreage." );
		if( temp.length > 1 ){
			data.params.minacres = temp[ 0 ];
			data.params.maxacres = temp[ 1 ];
			set_cnt += 1;
		}else if( temp.length > 0 ){
			data.errors.push( temp[ 0 ] );
		}	
			
		//market values
		temp = Utils.getRangeValues( document.getElementById( "mrktvalfrom" ).value.trim( ), document.getElementById( "mrktvalto" ).value.trim( ), 2, "Enter a valid minimum and maximum Market Value." );
		if( temp.length > 1 ){
			data.params.minmktval = temp[ 0 ];
			data.params.maxmktval = temp[ 1 ];
			set_cnt += 1;
		}else if( temp.length > 0 ){
			data.errors.push( temp[ 0 ] );
		}	
		
		//sale price
		temp = Utils.getRangeValues( document.getElementById( "salepricefrom" ).value.trim( ), document.getElementById( "salepriceto" ).value.trim( ), 2, "Enter a valid minimum and maximum Sale Price." );
		if( temp.length > 1 ){
			data.params.minsalesprice = temp[ 0 ];
			data.params.maxsalesprice = temp[ 1 ];
			set_cnt += 1;
		}else if( temp.length > 0 ){
			data.errors.push( temp[ 0 ] );
		}	
					
		//sale date
		if( registry.byId( "saledatefrom" ).get( "state" ) === "Error" || registry.byId( "saledateto" ).get( "state" ) === "Error" ){
			data.errors.push( "Enter a valid Sale Date range" );
		}else{
			var startdate = registry.byId( "saledatefrom" ).get( "value" ), 
				enddate = registry.byId( "saledateto" ).get( "value" );
			
			if( startdate || enddate ){		
				if( startdate && enddate && ( startdate < enddate ) ){
					data.params.startdate = Format.readableDate( startdate );
					data.params.enddate = Format.readableDate( enddate );
					set_cnt += 1;
				}else{
					data.errors.push( "Enter a valid Sale Date range" );
				}	
			} 
		}
		
		//building information
		if( document.getElementById( "propuse" ).value !== "Vacant" ){
			//yr built
			var minyrblt = document.getElementById( "yearbuiltfrom" ).value.trim( ),
				maxyrblt = document.getElementById( "yearbuiltto" ).value.trim( );
				
			if( minyrblt.length > 0 || maxyrblt.length > 0 ){
				if( Validate.isCountyYear( minyrblt ) && Validate.isCountyYear( maxyrblt ) && minyrblt < maxyrblt ){
					data.params.minyrblt = minyrblt;
					data.params.maxyrblt = maxyrblt;
					set_cnt += 1;
				}else{
					data.errors.push( "Enter a valid minimum and maximum Year Built." );
				}	
			} 
			
			//sq ft
			temp = Utils.getRangeValues( document.getElementById( "sqftfrom" ).value.trim( ), document.getElementById( "sqftto" ).value.trim( ), 0, "Enter a valid minimum and maximum Square Feet." );
			if( temp.length > 1 ){
				data.params.minsqft = temp[ 0 ];
				data.params.maxsqft = temp[ 1 ];
				set_cnt += 1;
			}else if( temp.length > 0 ){
				data.errors.push( temp[ 0 ] );
			}	

			//bedrooms and bathrooms
			if( document.getElementById( "propuse" ).value === "Condo/Townhome" || document.getElementById( "propuse" ).value === "Manufactured" ||
				document.getElementById( "propuse" ).value === "Multi-Family" || document.getElementById( "propuse" ).value === "Single-Family" ) {
					if( document.getElementById( "bedrooms" ).value.trim( ).length > 0 ){
						data.params.bdrms = document.getElementById( "bedrooms" ).value;
						set_cnt += 1;
					}
					
					if( document.getElementById( "bathrooms" ).value.trim( ).length > 0 ){
						data.params.btrms = document.getElementById( "bathrooms" ).value;
						set_cnt += 1;
					}
					
			}
			
			//exterior wall and story type
			if( document.getElementById( "exteriorframe" ).value.trim( ).length > 0 ){
				data.params.extwall = document.getElementById( "exteriorframe" ).value;
				set_cnt += 1;
			}
			
			if( document.getElementById( "storytype" ).value.trim( ).length > 0 ){
				data.params.storytype = document.getElementById( "storytype" ).value;
				set_cnt += 1;
			}
			
		}		
							
		//sort 
		var sortby = document.getElementById( "sortby" ).value;
		data.params.orderby = sortby.substr( 0, sortby.indexOf( "|" ) );
		data.params.orderdir = sortby.substr( sortby.indexOf ( "|" ) + 1, sortby.length - 1 );
		
		//check if there is atleast one parameter set when non vacant propuses are searched
		if( set_cnt === 0 ){
			data.errors.push( "Select more paramerers to do a Market Analysis." );
		}
		
	} );
	
	return data;

}

//paging for market analysis
function getPagingHTML( pageno, data ){
	var pages = Math.ceil( data.length / 36 ),
		bpages = 0,
		pghtml = "";
	
	for( i = ( ( pageno - 4 <= 0 ) ? 1 : ( pageno - 4 ) ); i < pageno; i++ ){
		pghtml += "<a id='page" + i + "' class='page' href='javascript:void(0);' >" + i + "</a> ";	
		bpages++;
	}

	pghtml += "<b>" + pageno + "</b> ";	
	
	for( i = pageno + 1; i <= pageno + 4; i++ ){
		if( i <= pages ){ 
			pghtml += "<a id='page" + i + "' class='page' href='javascript:void(0);' >" + i + "</a> ";	
		}	
	}
	
	if( pageno > 1 ){ 
		pghtml = "<a id='page" + ( pageno - 1 ) + "' class='page' href='javascript:void(0);' >&lt;&lt;prev</a> " + pghtml;
	}	
	
	if( pageno < pages ){
		pghtml += "<a id='page" + ( pageno + 1 ) + "' class='page' href='javascript:void(0);' >next&gt;&gt;</a>";
	}	
	
	pghtml += "<br/><span>" + data.length + " results</span>";
		
	return pghtml;
}

//bad search error message
function badSearch( ){
	//show error div
	document.getElementById( "error" ).classList.remove( "hidden" );
	Utils.getDomElements( document.querySelectorAll( ".spin" ) ).forEach( function( ctrl ){
		ctrl.classList.add( "hidden" );
	} );
	Utils.getDomElements( document.querySelectorAll( ".unspin" ) ).forEach( function( ctrl ){
		ctrl.classList.remove( "hidden" );
	} );
}

//standardize addresses
function getStandardizedAddress( address ){	
	var inputAddress = address.replace( /[^a-zA-Z0-9]/g, " " ).trim( ).toUpperCase( ).split ( " " ),
		stdAddress = [ "", "", "", "","", "", "", "", "" ],
		prefixes = [ "NORTH", "N", "EAST", "E", "WEST", "W", "SOUTH", "S" ],
		sttypes = [ "ALLEY", "ALY", "AL", "AVENUE", "AVE", "AV", "BOULEVARD", "BLVD", "BV", "CIRCLE", "CIR", "CR", "CRESCENT", "CRES", 
					"CS", "COURT", "CT", "CT", "COVE", "CV", "CV", "DRIVE", "DR", "DR", "FREEWAY", "FWY", "FR", "HIGHWAY", "HWY", "HY",
					"LANE", "LN", "LN", "LOOP", "LOOP", "LP", "PLACE", "PL", "PL", "PARKWAY", "PKY", "PY", "ROAD", "RD", "RD", 
					"RUN", "RUN", "RN", "ROW", "ROW", "RW", "STREET", "ST", "ST", "TRACE", "TRCE", "TC", "TRAIL", "TRL", "TL", "TERRACE", "TER", "TR", "WAY", "WAY", "WY" ],
		suffixes = [ "N", "NORTH", "E", "EAST", "W", "WEST", "S", "SOUTH", "EX", "EXT" ], 			
		units = [ "APT", "SUITE" ],
		states = [ "ALABAMA", "AL", "ALABAMA", "ALASKA", "AK", "ALASKA", "ARIZONA", "AZ", "ARIZONA", "ARKANSAS", "AR", "ARKANSAS", 
					"CALIFORNIA", "CA", "CALIFORNIA", "COLORADO", "CO", "COLORADO", "CONNECTICUT", "CT", "CONNECTICUT", 
					"DELAWARE", "DE", "DELAWARE", "DISTRICTOFCOLUMBIA", "DC", "DISTRICT OF COLUMBIA", "FLORIDA", "FL", "FLORIDA", 
					"GEORGIA", "GA", "GEORGIA", "HAWAII", "HI", "HAWAII", "IDAHO", "ID", "IDAHO", "ILLINOIS", "IL", "ILLINOIS", "INDIANA", "IN", "INDIANA", "IOWA", "IA", "IOWA", 
					"KANSAS", "KS", "KANSAS", "KENTUCKY", "KY", "KENTUCKY", "LOUISIANA", "LA", "LOUISIANA", 
					"MAINE", "ME", "MAINE", "MARYLAND", "MD", "MARYLAND", "MASSACHUSETTS", "MA", "MASSACHUSETTS", "MICHIGAN", "MI", "MICHIGAN", 
					"MINNESOTA", "MN", "MINNESOTA", "MISSISSIPPI", "MS", "MISSISSIPPI", "MISSOURI", "MO", "MISSOURI", "MONTANA", "MT", "MONTANA", 
					"NEBRASKA", "NE", "NEBRASKA", "NEVADA", "NV", "NEVADA", "NEWHAMPSHIRE", "NH", "NEW HAMPSHIRE", "NEWJERSEY", "NJ", "NEW JERSEY", 
					"NEWMEXICO", "NM", "NEW MEXICO", "NEWYORK", "NY", "NEW YORK", "NORTHCAROLINA", "NC", "NORTH CAROLINA", "NORTHDAKOTA", "ND", "NORTH DAKOTA", 
					"OHIO", "OH", "OHIO", "OKLAHOMA", "OK", "OKLAHOMA", "OREGON", "OR", "OREGON", "PENNSYLVANIA", "PA", "PENNSYLVANIA", "RHODEISLAND", "RI", "RHODE ISLAND",
					"SOUTHCAROLINA", "SC", "SOUTH CAROLINA", "SOUTHDAKOTA", "SD", "SOUTH DAKOTA", "TENNESSEE", "TN", "TENNESSEE", "TEXAS", "TX", "TEXAS", 
					"UTAH", "UT", "UTAH", "VERMONT", "VT", "VERMONT", "VIRGINIA", "VA", "VIRGINIA", "WASHINGTON", "WA", "WESTVIRGINIA", "WV", "WISCONSIN", "WI", "WYOMING", "WY" ],
		notoriousList = {
			"N": [ 
					"NORTH", "NORTH COMMUNITY HOUSE", "NORTH POINT", "NORTH COURSE", "NORTH BEATTIES FORD", "NORTH WIND", "NORTH HILLS", "NORTH HARBOR",
					"NORTH LIBRARY", "NORTH VALLEY", "NORTH FALLS", "NORTH CASTLE", "NORTH KIMBERLY", "NORTH COVE",	"NORTH LYNBROOK", 
					"NORTH CANYON", "NORTH RIDGE", "NORTH PINE HILL", "NORTH SHORE", "NORTH FAULKNER", "NORTH HAMPTON", "NORTH DOWNING" 
					],
			"E": [ 
					"EAST", "EAST BATTERY", "EAST END", "EAST ORCHARD", "EAST TODD", "EAST ROCK", "EAST FORD", "EAST ARBORS", "EAST DOUGLAS PARK",
					"EAST LAKE", "EAST BARDEN", "EAST LANE", "EAST PROVIDENCE" 
					],
			"W": [ 
					"WEST", "WEST KENTON", "WEST TODD", "WEST DOUGLAS PARK", "WEST BANK", "WEST SLOPE", "WEST CATAWBA", "WEST ARBORS",
					"WEST HOLLY VISTA", "WEST POINTE", "N C 73", "S MAIN", "S J LAWRENCE", "W S LEE", "W T HARRIS" 
					],
			"S": [ 
					"SOUTH", "SOUTH BIRKDALE COMMONS", "SOUTH RIDGE", "SOUTH HAMPTON", "SOUTH BANK", "SOUTH LAKES", "SOUTH VILLAGE",	"SOUTH BRENT",
					"SOUTH RENSSELAER", "SOUTH REGAL", "SOUTH HILL", "SOUTH BEND", "SOUTH STREAM", "SOUTH DEVON", "SOUTH LIBRARY",
					"SOUTH POINT", "SOUTH CREEK", "SOUTH DOWNS", "SOUTH WAY", "SOUTH HALL", "SOUTH FAULKNER", "SOUTH HILL VIEW",
					"SOUTH BRIDGE",	"SOUTH FORD", "SOUTH COMMERCE" 
					]		
		},
		prefixToname = { "E": "EAST", "W": "WEST", "S": "SOUTH", "N": "NORTH" },
		j = 0;

	for( var i = 0; i < inputAddress.length; i++ ){
		switch( j ){
			case 0: //house no
				if( Validate.isNumeric( inputAddress[ i ] ) ){
					stdAddress[ j ] = inputAddress[ i ];
				}else{
					i--; 
				}
				j++;
				break;
				
			case 1: //prefix
				if( prefixes.indexOf( inputAddress[ i ] ) > -1 ){
					stdAddress[ j ] = prefixes[ prefixes.indexOf( inputAddress[ i ] ) + ( 1 - ( prefixes.indexOf( inputAddress[ i ] ) % 2) ) ]; //standardize prefix
				}else{ 
					i--; 
				} 
				j++;
				break;
				
			case 2: //street name
				if( sttypes.indexOf( inputAddress[ i ] ) == -1 ){
					if( inputAddress[i].length > 0 ){			
						stdAddress[ j ] += ( stdAddress[ j ].length > 0 ? " " : "" ) + inputAddress[ i ];
					}
				}else{ 
					i--; 
					j++; 
				}
				break;
				
			case 3: //street type
				stdAddress[ j ] = sttypes[ sttypes.indexOf( inputAddress[ i ] ) + ( 2 - ( sttypes.indexOf( inputAddress[ i ] ) % 3 ) ) ]; //standardize street type
				j++;
				break;

			case 4: //suffix
				if( suffixes.indexOf( inputAddress[ i ] ) > -1 ){
					stdAddress[ j ] = suffixes[ suffixes.indexOf( inputAddress[ i ] ) + ( 1 - ( suffixes.indexOf( inputAddress[ i ] ) % 2 ) ) ]; //standardize suffix
				}else{ 
					i--; 
				}	
				
				j++;
				break;
				
			case 5: //unit
				if( units.indexOf( inputAddress[ i ] ) == -1 ){
					if( soundex( inputAddress[ i ] ).substring( 1 ) == "000" ){ //this takes cares of spaces also
						stdAddress[ j ] +=  ( stdAddress[ j ].length > 0 ? " " : "" ) + inputAddress[ i ];  		
					}else{ 
						i--; 
						j++; 
					}
				} 
				break;
								
			case 6: //city and state
				if( !inputAddress[ i ].match( /^\d{5}$/ ) ){
					if( inputAddress[i].length > 0 ){
						stdAddress[ j ] += ( stdAddress[ j ].length > 0 ? " " : "" ) + inputAddress[ i ];  		
					}
				}else{ 
					i--; 
					j += 2; 
				}
				break;	
				
			case 8: //zip
				stdAddress[ j ] = inputAddress[ i ];
				break;
		}
	}
	
	//fix notorious street names	
	if( stdAddress[ 1 ].length > 0 ){
		if( notoriousList[ stdAddress[ 1 ] ].indexOf ( ( stdAddress[ 1 ] + " " + stdAddress[ 2 ] ).trim() ) > -1 ){
			stdAddress[ 2 ] =	notoriousList[ stdAddress[ 1 ] ][notoriousList[ stdAddress[ 1 ] ].indexOf ( ( stdAddress[ 1 ] + " " + stdAddress[ 2 ] ).trim() ) ];
			stdAddress[ 1 ] = "";	
		}else if( notoriousList[ stdAddress[ 1 ] ].indexOf ( ( prefixToname[ stdAddress[ 1 ] ] + " " + stdAddress[ 2 ] ).trim() ) > -1 ) {
			stdAddress[ 2 ] =	notoriousList[ stdAddress[ 1 ] ][notoriousList[ stdAddress[ 1 ] ].indexOf ( ( prefixToname[ stdAddress[ 1 ] ] + " " + stdAddress[ 2 ] ).trim() ) ];
			stdAddress[ 1 ] = "";	
		}
	}
		
	//split city and state
				
	if( stdAddress[ 6 ].length > 0 ){
		var city = stdAddress[ 6 ].split( " " ), temp = [ ];
												
		for( var k = city.length-1; k > -1; k-- ){		
			temp.splice( 0, 0, city[ k ] );

			//look for state names in the city state cell
			if( states.indexOf( temp.join( "" ) ) > -1 ){
				stdAddress[ 7 ] = states[ states.indexOf( temp.join( "" ) ) + ( 1 - ( states.indexOf( temp.join( "" ) ) % 3 ) ) ];
				city.splice( k, temp.length );
				stdAddress[ 6 ] = city.join( " " ); 
				break;
			} 
		}
	}
	
	return stdAddress.join( "|" );
}

function soundex( str ) {
 	//  discuss at: http://phpjs.org/functions/soundex/
	// original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
	// original by: Arnout Kazemier (http://www.3rd-Eden.com)
	// improved by: Jack
	// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// bugfixed by: Onno Marsman
	// bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	//    input by: Brett Zamir (http://brett-zamir.me)
	//  revised by: Rafal Kukawski (http://blog.kukawski.pl)
	//   example 1: soundex('Kevin');
	//   returns 1: 'K150'
	//   example 2: soundex('Ellery');
	//   returns 2: 'E460'
	//   example 3: soundex('Euler');
	//   returns 3: 'E460'
  
	str = ( str + '' ).toUpperCase( );
	if( !str ){
		return '';
	}
	var sdx = [ 0, 0, 0, 0 ],
		m = {
			B : 1,
			F : 1,
			P : 1,
			V : 1,
			C : 2,
			G : 2,
			J : 2,
			K : 2,
			Q : 2,
			S : 2,
			X : 2,
			Z : 2,
			D : 3,
			T : 3,
			L : 4,
			M : 5,
			N : 5,
			R : 6
		},
		i = 0,
		j, s = 0,
		c, p;

	while( ( c = str.charAt( i++ ) ) && s < 4 ){
		if( j == m[ c ] ){
			if( j !== p ){
				sdx[ s++ ] = p = j;
			}
    	}else{
			s += i === 1;
			p = 0;
		}
	}

	sdx[ 0 ] = str.charAt( 0 );
	return sdx.join( '' );
}

//reset search input controls
function resetSitusAddressSearch( ){
	document.getElementById( "situsaddrno" ).value = "";
	document.getElementById( "situsprefix" ).value = "";
	document.getElementById( "situssttype" ).value = "";
	document.getElementById( "situssuffix" ).value = "";
	document.getElementById( "situsmuni" ).value = "";
	document.getElementById( "situssearcherror" ).innerHTML = "";
	require( [ "dijit/registry" ], function( registry ){
		registry.byId ( "situsst" ).reset( );
	} );	
}

function resetOwnerNameSearch( ){
	Utils.getDomElements( document.querySelectorAll( "#lastname, #firstname" ) ).forEach( function( ctrl ){
		ctrl.value = "";
	} );
	document.getElementById( "onamesearcherror" ).innerHTML = "";
}

function resetBufferSearch( ){
	document.getElementById( "buffersize" ).value = "";
	document.getElementById( "buffersearcherror" ).innerHTML = "";
}

function resetMarketAnalysis( ){
	document.getElementById( "primarysrchtype" ).value = 0;
	document.getElementById( "jurisdiction" ).value = 1;
	document.getElementById( "propuse" ).value = "Single-Family";
	document.getElementById( "noacre" ).value = "ALL";
	document.getElementById( "sortby" ).value = "market_value|desc";
	
	Utils.getDomElements( document.querySelectorAll( "#neighborcode, #acrefrom, #acreto, #mrktvalfrom, #mrktvalto, #salepricefrom, #salepriceto, #yearbuiltfrom, #yearbuiltto, #sqftfrom, #sqftto, #bedrooms, #bathrooms, #exteriorframe, #storytype" ) ).forEach( function( ctrl ){
		ctrl.value = "";
	} );
		
	Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(3),tr:nth-child(4)" ) ).forEach( function( ctrl ){
		ctrl.classList.add( "hidden" );
	} );
	Utils.getDomElements( document.querySelectorAll( "#mrktanlysform tr:nth-child(2)" ) ).forEach( function( ctrl ){
		ctrl.classList.remove( "hidden" );
	} );
	
	require( [ "dijit/registry" ], function( registry ){	
		registry.byId( "saledatefrom" ).reset( );
		registry.byId( "saledateto" ).reset( );
		registry.byId( "stname" ).reset( );
	} );	
}