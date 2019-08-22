var Format = {
	address: function( hnum, prefix, sname, roadtype, suffix, unit, city, state, zip ){
		var addr = "";
		
		if( sname.trim( ).length > 0 ){
			addr += ( ( hnum.trim( ).length > 0 ) ? hnum.trim( ) : "" );
			addr += ( ( prefix.trim( ).length > 0 ) ? ( " " + prefix.trim( ) ) : "" );
			addr += ( ( sname.trim( ).length > 0 ) ? ( " " + sname.trim( ) ) : "" );
			addr += ( ( roadtype.trim( ).length > 0 ) ? ( " " + roadtype.trim( ) ) : "" );
			addr += ( ( suffix.trim( ).length > 0 ) ? ( " " + suffix.trim( ) ) : "" );
			addr += ( ( unit.trim( ).length > 0 ) ? ( " " + unit.trim( ) ) : "" );
			addr += ( ( city.trim( ).length > 0 ) ? ( " " + city.trim( ) ) : "" );
			addr += ( ( state.trim( ).length > 0 ) ? ( " " + state.trim( ) ) : "" );
			addr += ( ( zip.trim( ).length > 0 ) ? ( " " + zip.trim( ) ) : "" );
		}	
		
		return addr;		
	
	},
	
	arrayToNumList: function( arr ){
		var htmlstr = "";
		
		for( var l = arr.length-1; l >= 0; l-- ) {
			if( arr[ l ].trim( ).length === 0 ){
				arr.splice ( l,1 );
			}			
		} 
	
		if( arr.length > 1 ){
			for( i = 0; i < arr.length; i++ ){ 
				htmlstr += ( htmlstr.length > 0 ? "<br/>" : "" ) + 
					parseInt( i + 1, 10 ) + ". " + arr[ i ].trim( );
			}
		}else if( arr.length > 0 ){	
			htmlstr += arr[ 0 ].trim( );
		}
		
		return htmlstr;
	},
	
	deed: function( deedbook, deedpage, saledate, astext ){
		var a = new Date( saledate ),
			b = new Date( "03/01/1990" ),
			msDateA = Date.UTC ( a.getFullYear( ), a.getMonth( ) + 1, a.getDate( ) ),
			msDateB = Date.UTC ( b.getFullYear( ), b.getMonth( ) + 1, b.getDate( ) ),
			deed = "NA";
				
		if( deedbook && deedpage ){
			deedbook = deedbook.trim( );
			deedpage = deedpage.trim( );
			
			if( deedbook.length > 0 & deedpage.length > 0 ){
				if( astext ){
					deed = deedbook + "-" + deedpage;
				}else{ 
					if( ( parseFloat( msDateA ) <= parseFloat( msDateB ) ) && ( ( parseInt( deedbook ) > 1 && parseInt( deedbook )  < 33 ) || ( parseInt( deedbook ) > 33 && parseInt( deedbook )  < 6219 ) ) ){
						var zeroPad = function( num, places ){
							var zero = places - num.toString( ).length + 1;
							return Array( + ( zero > 0 && zero ) ).join( "0" ) + num;
						}
						
						deed = "<a href='http://meckrodhistorical.com/DocumentView.asp?DocumentType=Deed&Instrument=" + 
							zeroPad( parseInt( deedbook ), 4 ) + zeroPad( parseInt( deedpage ), 4 ) + "&Close=True' target='_blank'>" + 
							deedbook + "-" + deedpage + "</a>";
					}else if( parseFloat( msDateA ) > parseFloat( msDateB ) ){
						deed = "<a href='http://meckrod.manatron.com/RealEstate/SearchDetail.aspx?bk=" + deedbook.replace( /^0+/, '' ) + "&pg=" + deedpage.replace( /^0+/, '' ) + 
							"&type=BkPg' target='_blank'>" + deedbook + "-" + deedpage + "</a>";
					}
				}
			} 
		}	
						
		return deed;
	},
	
	escapeSingleQuote: function( str ){
		return str.replace( "'", "''" );
	},
	
	jurisdisplay: function( muni ){
		switch( muni.toUpperCase( ) ){
			case "CHAR":
				return "CHARLOTTE"; 
				break;
			case "CORN":
				return "CORNELIUS"; 
				break;
			case "DAVI":
				return "DAVIDSON"; 
				break;
			case "HUNT":
				return "HUNTERSVILLE"; 
				break;
			case "MATT":
				return "MATTHEWS"; 
				break;
			case "MINT":
				return "MINT HILL"; 
				break;
			case "PINE":
				return "PINEVILLE"; 
				break;
			case "STAL":
				return "STALLINGS"; 
				break;
			case "MECK": case "UNINC":	
				return "MECKLENBURG"; 
				break;	
			
			default:
				return muni; 
				break;
				
		}
	},
	
	juriscama: function( muni ){
		switch( muni.toUpperCase( ) ){
			case "CHAR":
				return "CHARLOTTE"; 
				break;
			case "CORN":
				return "CORNELIUS"; 
				break;
			case "DAVI":
				return "DAVIDSON"; 
				break;
			case "HUNT":
				return "HUNTERSVILLE"; 
				break;
			case "MATT":
				return "MATTHEWS"; 
				break;
			case "MINT":
				return "MINT HILL"; 
				break;
			case "PINE":
				return "PINEVILLE"; 
				break;
			case "STAL":
				return "STALLINGS"; 
				break;
			case "MECK":
				return "UNINC"; 
				break;	
			default:
				return muni; 
				break;
		}
	},
	
	landArea: function( unit, type_landuse, acres, gis_acres ){
		var landarea = "";
		
		unit = ( unit ? parseFloat ( unit ) : null );
		type_landuse = ( type_landuse ? type_landuse.trim( ) : null );
		acres = ( acres ? parseFloat ( acres ) : null );
		
		if( acres ){ //also checks if acres is greater than zero
			landarea = parseFloat( acres ).toFixed( 3 ) + " AC";
		}else{
			if( gis_acres ){
				landarea = parseFloat( gis_acres ).toFixed( 3 ) + " GIS Calc. Acres";
			}
		}					
		
		return landarea;
	},	
	
	latlon: function( val ){
		var temp = val.split( "-" );
		
		return temp[ 0 ] + "\u00B0" + temp[ 1 ] + "\'" + temp[ 2 ] + "\'\'";
	},
	
	leftPad: function( number, targetLength ){
		var output = number + '';
		while( output.length < targetLength ) 
			output = '0' + output;

		return output;
	},
	
	legalDesc: function( desc ){
		desc = desc.trim( );
				
		if( desc.match( /M\d+(-|\s)\d+/ ) ){
			var result = desc.match( /M\d+(-|\s)\d+/ ),
				splitter = ( result.indexOf( "-" ) > -1 ? "-" : " " ),
				bk = result[ 0 ].substring( 1, result[ 0 ].indexOf ( splitter ) ),
				pg = result[ 0 ].substring( result[ 0 ].indexOf ( splitter ) + 1, result[ 0 ].length );
				
			if( Validate.isNumeric( bk ) && Validate.isNumeric( pg ) ){
				bk = parseInt( bk );
				pg = parseInt( pg );
				if( bk > 2 ){
					if( ( bk < 23 ) || ( bk === 23 && pg < 645 ) || ( bk === 230 ) || ( bk === 332 ) || ( bk === 1166 ) ){
						desc = "<a href='http://meckrodhistorical.com/DocumentView.asp?DocumentType=Maps&Instrument=" + Format.leftPad( bk, 4 ) + Format.leftPad( pg, 4 ) + "&Close=True' target='_blank'>" + desc + "</a>"	
					}else{
						desc = "<a href='http://meckrod.manatron.com/RealEstate/SearchDetail.aspx?bk=" + bk + "&pg=" + pg + "&type=BkPg' target='_blank'>" + desc + "</a>";
					}	
				}
			}
		}
		/*else if( desc.match( /U\/F\s*\d+(-|\s)\d+/ ) ){
			console.log( desc.match( /U\/F\s*\d+(-|\s)\d+/ ) );
			var result = desc.match( /U\/F\s*\d+(-|\s)\d+/ ),
				splitter = ( result.indexOf( "-" ) > -1 ? "-" : " " ),
				bk = result[ 0 ].substring( result[ 0 ].indexOf( "U/F" ) + 3, result[ 0 ].indexOf( splitter ) ).trim( ),
				pg = result[ 0 ].substring( result[ 0 ].indexOf ( splitter ) + 1, result[ 0 ].length );
				
			if( Validate.isNumeric( bk ) && Validate.isNumeric( pg ) ){
				bk = parseInt( bk );
				pg = parseInt( pg );
				
				if( bk > 0 && bk < 471 ){
					desc = "<a href='http://meckrodhistorical.com/DocumentView.asp?DocumentType=Maps&Instrument=" + Format.leftPad( bk, 4 ) + Format.leftPad( pg, 4 ) + "&Close=True' target='_blank'>" + desc + "</a>"	
				}else{
					desc = "<a href='http://meckrod.manatron.com/RealEstate/SearchDetail.aspx?bk=" + bk + "&pg=" + pg + "&type=BkPg&act=CONDO' target='_blank'>" + desc + "</a>";
				}	
			}
		}*/
					
		return desc;	
	},
	
	number: function( num, places ){
		num = parseFloat( String( num ).trim( ).replace( /,/g, "" ) );
		
		if( isNaN( num ) ){
			num = "";
		}else{
			num = num.toFixed( places );
		}
		
		return num;	
	},
	
	nullToEmpty: function ( val ) {
		return ( ( !val || ( typeof val === "undefined" ) ) ? "" : val ); 
	},
	
	objectAsTable: function( rows, cls, invert ){
		var htmlstr = "<table class='" + cls + "'>";
		
		if( invert ){
			for( var key in rows ){
				htmlstr += "<tr><th class='invert'>" + key  + "</th><td>" + rows[ key ]  + "</td></tr>";
			}
		}else{
			rows.forEach( function( item, i ){
				if( i === 0 ){ 
					htmlstr += "<tr>";
					
					for( var key in item ){ 	
						htmlstr += "<th>" + key + "</th>";
					}
					
					htmlstr += "</tr>";
				}
				
				htmlstr += "<tr>";
				
				for( var key in item ){ 	
					htmlstr += "<td>" + item[ key ]  + "</td>";
				}
				
				htmlstr += "</tr>";
			} );
		}
		
		htmlstr += "</table>";
		
		return htmlstr;
	},
	
	ownerlist: function( ownerlist ){
		var ownerhtml,
			owners = ownerlist.trim( ).split( "|" );
		
		ownerhtml = "1. " + owners[ 0 ].replace( ";", ", " );
		
		for ( l = 1; l < owners.length; l++ ) { 
			if( owners[ l ].trim( ).length > 0 ){
				ownerhtml += "<br/>" + parseInt ( l + 1, 10 ) + ". " + owners[ l ].replace( ";", ", " );
			}
		}
			
		return ownerhtml;	
	},
	
	ownership: function( oname_arr ){
		var oname = "";
		
		oname_arr[ 1 ] = oname_arr[ 1 ].trim( ); //first name
		oname_arr[ 0 ] = oname_arr[ 0 ].trim( ); //last name
		
		if( oname_arr[ 1 ].length > 0 || oname_arr[ 0 ].length > 0 ){
			if( oname_arr[ 1 ].length > 0 ){ 
				oname += oname_arr[ 1 ];
			}
			
			if( oname_arr[ 0 ].length > 0 ){ 
				oname += " " + oname_arr[ 0 ] ;
			}
		}

		return oname;
	},
	
	readableDate: function( inputDate, dateFormat ){
		var readableDate = "",
			dateFormat = ( dateFormat ? dateFormat.toUpperCase( ) : "MM/DD/YYYY" ),
			m = "" + ( inputDate.getMonth( ) + 1 ),
			mm = ( m.length < 2 ? "0" + m : m ),
			d = "" + inputDate.getDate( ),
			dd = ( d.length < 2 ? "0" + d : d ),
			yyyy = "" + inputDate.getFullYear( ),
			months = { 
				1: { "short": "Jan", "long": "January" },
				2: { "short": "Feb", "long": "February" },
				3: { "short": "Mar", "long": "March" },
				4: { "short": "Apr", "long": "April" },
				5: { "short": "May", "long": "May" },
				6: { "short": "Jun", "long": "June" },
				7: { "short": "Jul", "long": "July" },
				8: { "short": "Aug", "long": "August" },
				9: { "short": "Sep", "long": "September" },
				10: { "short": "Oct", "long": "October" },
				11: { "short": "Nov", "long": "November" },
				12: { "short": "Dec", "long": "December" }
			};	
			
		switch( dateFormat ){
			case "MM/DD/YYYY": case "MM/DD/YY": case "M/D/YYYY": case "M/D/YY":
			case "MM-DD-YYYY": case "MM-DD-YY": case "M-D-YYYY": case "M-D-YY":
				var splitter = "/";
				
				if( dateFormat.indexOf ( "-" ) > -1 ){
					splitter = "-";
				}
									
				var dateFormatArr = dateFormat.split( splitter );
							
				readableDate = [ 
						( dateFormatArr[ 0 ] == "MM" ? mm : m ) , 
						( dateFormatArr[ 1 ] == "DD" ? dd : d ) , 
						( dateFormatArr[ 2 ] == "YYYY" ? yyyy : yyyy.substring(2, 4) ) 
					].join( splitter );
								
				break;
				
				case "YYYY-MM-DD":
					readableDate = [ yyyy, mm, dd ].join ( "-" );
					break;
							
				case "MONTH DD, YYYY": case "MON DD, YYYY":
					var month = months[ m ].short;
				
					if( dateFormat.indexOf ( "MONTH" ) > -1 ){
						month = months[ m ].long;
					}
				
					readableDate = month + " " + dd + ", " + yyyy;
					
					break;
								
		}

		return readableDate; 
	},
	
	money: function( price, date ){
		return "$" + ( price ? parseFloat( price ).toFixed( 2 ).replace(/\d(?=(\d{3})+\.)/g, '$&,') : "0.00" ) + ( date ? " (" + date + ")" : "" );
	},
				
	tagsrchresults: function( item, store ){
		var val = "",
			tag = store.getValue( item, "tag" ),
			displaytext = store.getValue( item, "label" );

		if( tag.trim( ).length > 0 && displaytext.trim( ).length > 0 ){
			val = "<b>" + tag + "</b>: " +  displaytext;
		}else if( displaytext.trim( ).length > 0 ){
			val = displaytext;
		}else{
			val = tag;
		}	
			
		return val;
	},
	
	trimNconcat: function( params ){
		var retval = "";
		
		params.forEach( function( param ){
			if( param.val.trim( ).length > 0 ){
				retval += param.val.trim( ) + param.appnd;
			}else if( param.appnd.trim( ).length > 0 ){
				retval = retval.trim( ) + param.appnd;	
			} 	
		} );
						
		return retval.trim( );
	},
	
	ucwords: function ( str ) {
		//  discuss at: http://phpjs.org/functions/ucwords/
		// original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
		// improved by: Waldo Malqui Silva
		// improved by: Robin
		// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// bugfixed by: Onno Marsman
		//    input by: James (http://www.james-bell.co.uk/)
		//   example 1: ucwords('kevin van  zonneveld');
		//   returns 1: 'Kevin Van  Zonneveld'
		//   example 2: ucwords('HELLO WORLD');
		//   returns 2: 'HELLO WORLD'

		return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
			return $1.toUpperCase();
		} );
	},
	
	XYasLatLon: function( y, x, xyextent, latlonextent ){
		var ratioY = Math.abs( ( latlonextent.ymax - latlonextent.ymin ) / ( xyextent.ymax - xyextent.ymin ) ),
			ratioX = Math.abs( ( latlonextent.xmax - latlonextent.xmin ) / ( xyextent.xmax - xyextent.xmin ) ),
			lat = parseFloat( ( y - xyextent.ymin ) * ratioX + latlonextent.ymin ).toFixed( 5 ),
			lon = parseFloat( ( x - xyextent.xmin ) * ratioX + latlonextent.xmin ).toFixed( 5 );
							
		return { lat: lat, lon: lon };
	}
},

TextToGeom = {
	"polyline": function( geomtxt, epsg ){
		var line;
		
		require( [ "esri/geometry/Polyline", "esri/SpatialReference" ], function( Polyline, SpatialReference ){
			line = new esri.geometry.Polyline ( new SpatialReference ( { "wkid": ( epsg ? 2264 : epsg ) } ) );
			
			var points = geomtxt
						.replace( /multilinestring|linestring|\)|\(/ig, '' )
						.trim( )
						.replace( /,\s|,/g, '!' )
						.replace( /\s/g, ',' )
						.split( '!' );
		
			line.addPath( points.map( function( point ){
				var coords = point.split( "," );
				
				return [ parseFloat( coords[ 0 ].trim( ) ), parseFloat( coords[ 1 ].trim( ) ) ];
			} ) );
		} );
		
		return line;
	},
	
	"polygon": function( geomtxt, epsg ){
		var poly 
		
		require( [ "esri/geometry/Polyline", "esri/SpatialReference" ], function( Polyline, SpatialReference ){
			poly = new esri.geometry.Polygon( new SpatialReference( { "wkid": ( epsg ? 2264 : epsg ) } ) );
				
			var rings = geomtxt
					.replace( /(\d+)(\s+)(\d+)/g, "$1&$3" )
					.replace( / +?/g, "" )
					.replace( "MULTIPOLYGON(((", "" )
					.replace( ")))", "" )
					.replace( /\)\),\(\(/g, "!" )
					.replace( "MULTIPOLYGON(((", "" )
					.replace( ")))", "" )
					.replace( "POLYGON((", "" )
					.replace( "))", "" )
					.replace( /\),\(/g, "!" )
					.split( "!" );
			
			poly.rings = rings.map( function( ring ){
				return ring.split( "," ).map( function( point ){
					var coords = point.split( "&" );
					
					return [ parseFloat( coords[ 0 ].trim( ) ), parseFloat( coords[ 1 ].trim( ) ) ];
				} );
			} );
		} );
				
		return poly;
	}	
},

Utils = {
	compareValues: function( key, order ){
		return function(a, b){
			if( !a.hasOwnProperty( key ) || !b.hasOwnProperty( key ) ){
				return 0; 
			}
    
			var varA = ( typeof a[ key ] === 'string' ) ? a[ key ].toUpperCase( ) : a[ key ];
			var varB = ( typeof b[ key ] === 'string' ) ? b[ key ].toUpperCase( ) : b[ key ];
      
			var comparison = 0;
			
			if( varA > varB ){
				comparison = 1;
			}else if( varA < varB ){
				comparison = -1;
			}
			
			return ( ( order == "desc" ) ? ( comparison * -1 ) : comparison );
		};
	},
	
	generateExtent: function( ext ){
		var extent;
		
		require( [ "esri/geometry/Extent" ] , function( Extent ){
			extent = new Extent( ext );
		} );
		
		return extent;
	},
	
	getBestMatchingAddr: function( address, checkArr ){
		var match_arr = [ ], 
			retval;
		
		for( var i=0; i < checkArr.length; i++ ){
			var match = 0,
				temp = checkArr[ i ].split( "|" );

			for( var j = 0; j < temp.length; j++ ){
				match += address.indexOf( temp[ j ] ) + 1;
			} 
			match_arr.push ( match );
		}
		retval = match_arr.indexOf( Math.max.apply( window, match_arr ) );	
	
		return retval;
	},
	
	getGraphicsExtent: function( graphics ){
		var geometry, extent, ext;

		require( [ "esri/geometry/Point", "esri/geometry/Extent" ] , function( Point, Extent ){
			graphics.forEach ( function ( graphic, i ) {
				geometry = graphic.geometry;
						
				if( geometry instanceof Point ){
					ext = new Extent( parseFloat ( geometry.x ) - 1, parseFloat ( geometry.y ) - 1, 
						parseFloat( geometry.x ) + 1, parseFloat ( geometry.y ) + 1, geometry.spatialReference );
				}else if( geometry instanceof Extent ){ 
					ext = geometry;
				}else{
					ext = geometry.getExtent( );
				}	

				if( extent ){ 
					extent = extent.union( ext );
				}else{ 
					extent = new Extent( ext );
				}	
			} );	
		} );
	
		return extent;
	},
	
	getRangeValues: function( frm, to, precision, errorMsg ){
		var returnArr = [ ];

		if( frm.length > 0 && to.length > 0  ){
			frm = parseFloat( frm );
			to = parseFloat( to );

			if( !isNaN( frm ) && !isNaN( to ) ){
				if( frm <= to ){
					returnArr.push( frm.toFixed( precision ) );
					returnArr.push( to.toFixed( precision ) );
				}else{
					returnArr.push( to.toFixed( precision ) );
					returnArr.push( frm.toFixed( precision ) );
				}  
			}else{
				returnArr.push( errorMsg );
			}
		}

		return returnArr;
	},
	
	//guess the best possible pid that would be used in the master address table
	guessPIDinMAT: function( taxpid, groundpid ){
		var pid;
	
		if( Validate.is8Number( taxpid ) ){
			pid = taxpid;
		}else if( Validate.is8Number( groundpid ) ){	
			pid = groundpid;
		}else{
			pid = taxpid.substr( 0 , 8 );
		}
			
		return pid;
	},
	
	isPrivateIP: function( ip ){
		var parts = ip.split( '.' );
   
		if( parts[ 0 ] === '10' || ( parts[ 0 ] === '172' && ( parseInt ( parts[ 1 ], 10 ) >= 16 && parseInt ( parts[ 1 ], 10 ) <= 31 ) ) || ( parts[ 0 ] === '192' && parts[ 1 ] === 168 ) ){
			return true;
		}
	
		return false;   
	},
	
	mixin: function( dish, ingredient ){
		for( var key in ingredient ){
			dish[ key ] = ingredient[ key ];
		}
		return dish; 
	},
	
	parseLatLon: function( str ){
		var latlonarr = str.split( "," ),
			latlon = { lat: 0, lon: 0 };
			
		latlonarr.forEach( function( coord ){
			if( coord.trim( ).match( /^[+]?(34?(\.9\d+)?|35?(\.[0-5]\d+)?)$/ ) ){
				latlon.lat = parseFloat( coord.trim( ) );
			}else if( coord.trim( ).match( /^[-]?(80?(\.[5-9]\d+)?|81?(\.0\d+)?)$/ ) ) {
				latlon.lon = parseFloat( coord.trim( ) );
			}
		} );
				
		return latlon;	
	},
			
	parseStatePlane: function( str ){
		var coordsarr = str.split( "," ),
			coords = { x: 0, y: 0 };
			
		coordsarr.forEach( function( coord ){
			if( parseInt( coord.trim( ) ) >= 1384251 && parseInt( coord.trim( ) ) <= 1537013 ){
				coords.x = coord.trim( );
			}else if ( parseInt( coord.trim( ) ) >= 460978 && parseInt( coord.trim( ) ) <= 660946 ){
				coords.y = coord.trim( );
			} 
		} );
			
		return coords;		
	},
			
	sendemail: function( to, subject, message ){
		require( [ "dojo/request/xhr" ] , function( xhr ){
			xhr( config.ws + "v1/send_email.php", {
				query: 	{ 
					"to" : to, 
					"subject": subject, 
					"message" : message 
				},
				method: "POST"
			} ).then( function( data ){
						
			} );
		} );
	},
	
	loadJSON: function( callback, filename ){   
		var xobj = new XMLHttpRequest( );
			
		xobj.overrideMimeType( "application/json" );
		xobj.open( "GET", filename, true ); // Replace 'my_data' with the path to your file
		xobj.onreadystatechange = function( ){
          if( xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback( xobj.responseText );
          }
		};
		xobj.send( null );  
	}, getDomElements: function( selection ){
		return [ ].slice.call( selection );

	}
},

Validate = {
	isNumeric: function( str ){
		var validChars = "0123456789.",
			isNumber = ( str.length > 0 ? true : false ),
			chr;
				
		for( i = 0; i < str.length && isNumber == true; i++ ){ 
			chr = str.charAt( i ); 
				
			if( validChars.indexOf( chr ) == -1 ){
				isNumber = false;
			}	
		}
		
		return isNumber;
	},

	isGroundPID: function( str ){
		var retval = false;

		if( str.match( /^[0-2]\d{4}(C|c|[0-9])\d{2}$/ ) ){
			retval = true;
		}	
			
		return retval;	
	},
		
	isTaxPID: function( str ){
		var retval = false;

		if( str.match( /^\d{8}([A-Z]|[a-z])?$/ ) ){
			retval = true;
		}else if( str.match( /^\d{3}-\d{3}-\d{2}([A-Z]|[a-z])?$/ ) ){
			retval = true;
		}			
			
		return retval;	
	},

	isCNumber: function( str ){
		var retval = false;
			
		if( str.match( /^[0-2]\d{4}(C|c)\d{2}$/ ) ){
			retval = true;
		}	

		return retval;	
	},
		

	is8Number: function( str ){
		var retval = false;

		if( str.match( /^\d{8}$/ ) ){
			retval = true;
		}	
				
		return retval;	
	},
		
	isEmail: function( str ){
		var retval = false;

		if( str.match( /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ) ){
			retval = true;
		}
			
		return retval;
	},
		
	// Checks a string to see if it in a valid date format of (D)D/(M)M/(YY)YY and returns true/false
	isDate: function( s ){
		// format D(D)/M(M)/(YY)YY
		var dateFormat = /^\d{1,4}[\.|\/|-]\d{1,2}[\.|\/|-]\d{1,4}$/;

		if( dateFormat.test( s ) ){
			// remove any leading zeros from date values
			s = s.replace( /0*(\d*)/gi, "$1" );
			var dateArray = s.split( /[\.|\/|-]/ );
  
			// correct month value
			dateArray[ 1 ] = dateArray[ 1 ] - 1;

			// correct year value
			if( dateArray[ 2 ].length < 4 ){
				// correct year value
				dateArray[ 2 ] = ( parseInt( dateArray[ 2 ] ) < 50 ) ? 2000 + parseInt( dateArray[ 2 ] ) : 1900 + parseInt( dateArray[ 2 ] );
			}

			var testDate = new Date( dateArray[ 2 ], dateArray[ 1 ], dateArray[ 0 ] );
			
			if( testDate.getDate( ) != dateArray[ 0 ] || testDate.getMonth( ) != dateArray[ 1 ] || testDate.getFullYear( ) != dateArray[ 2 ] ){
				return false;
			}else{
				return true;
			}
			
		}else{
			return false;
		}
	},
		
	isCountyYear: function( yr ){
		var retval = false;
		
		yr = parseInt( yr );
			
		if( !isNaN( yr ) && ( yr >= 0 && yr <= new Date( ).getFullYear( ) ) ){
			retval = true;
		}
		
		return retval
	},
		
	isLatLon: function( str ) {
		//[{"xmin":"-81.0562802910356","ymin":"34.9991000096838"}]
		//[{"xmax":"-80.5567016747919","ymax":"35.5560858870075"}]
			
		var retval = false,
			coords = str.split( "," );
				
		for( var i = 0; i < coords.length; i++ ){
			coords[ i ] = parseFloat( coords [ i ].trim( ) );
		}	
		
		if( ( ( coords[ 0 ] >= -81.0562802910356 && coords[ 0 ] <= -80.5567016747919 ) && ( coords[ 1 ] >= 34.9991000096838 && coords[ 1 ] <= 35.5560858870075 ) ) || 
				( ( coords[ 1 ] >= -81.0562802910356 && coords[ 1 ] <= -80.5567016747919 ) && ( coords[ 0 ] >= 34.9991000096838 && coords[ 0 ] <= 35.5560858870075 ) ) ){
			retval = true;
		}
			
		return retval;
		},
		
	isStatePlane: function( str ){
		//[{"xmin":"1384251.24585599","ymin":"460978.995855999"}]
		//[{"xmax":"1537013.50075424","ymax":"660946.333333335"}]
						
		var retval = false,
			coords = str.split( "," );
				
		for( var i = 0; i < coords.length; i++ ){
			coords[ i ] = parseInt( coords [ i ].trim( ) );
		}	

		if( ( ( coords[ 0 ] >= 1384251 && coords[ 0 ] <= 1537013 ) && ( coords[ 1 ] >= 460978 && coords[ 1 ] <= 660946 ) ) || 
				( ( coords[ 1 ] >= 1384251 && coords[ 1 ] <= 1537013 ) && ( coords[ 0 ] >= 460978 && coords[ 0 ] <= 660946 ) ) ){
			retval = true;
		} 
			
		return retval;
	},
		
	//function to check if an image actually exists at a location. used to check if property photo is at the specified location
	imageExists: function( url, callback ){
		var img = new Image( );
			
		img.onload = function( ){ callback( true ); };
		img.onerror = function( ) { callback( false ); };
		img.src = url;
	}
			
};