define (
	[
		"dojo/_base/declare",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/dom-attr",
		"dojo/dom-class",
		"dojo/dom-construct"
	],
	
	function( declare, _WidgetBase, _TemplatedMixin, domAttr, domClass, domConstruct ){
    	var basePath = require.toUrl( "mojo" );
			basePath = basePath.substring( 0, basePath.indexOf( "?" ) );
		var Widget = declare( [ _WidgetBase, _TemplatedMixin ], {
			templateString: 
				"<div data-dojo-attach-point='_root' class='mojoPhotoGallery hidden'>" +					
					//"<div data-dojo-attach-point='_photoNum'></div>" +
					"<div>" +
						"<a href='javascript:void(0);' data-dojo-attach-event='onclick:_showBigPhoto'><img data-dojo-attach-point='_currPhoto' class='picture' /></a>" +
					"</div>" +
					/*"<div>" +
						"<img src='" + basePath + "/image/blank.png' width='24' class='btn' data-dojo-attach-point='_prevBtn' data-dojo-attach-event='onclick:_toPrev' />" + 
						"<img src='" + basePath + "/image/blank.png' width='24' class='btn' data-dojo-attach-point='_nextBtn' data-dojo-attach-event='onclick:_toNext' />" + 
					"</div>" +*/	
					"<div data-dojo-attach-point='_photoTitle'></div>" +
				"</div>",
			photos: [ ],
			currIdx: -1,
			title: "",
			// start widget. called by user
			startup: function ( ){
				this._init( );
			},
			reset: function( ){
				this.photos.length = 0;
				this.currIdx = -1;
				this.title = "";
				
				//hide prev and next buttons
				//domAttr.set( this._prevBtn, "src", basePath + "/image/blank.png" );
				//domAttr.set( this._nextBtn, "src", basePath + "/image/blank.png" );
				
				//hide gallery control
				domClass.add( this._root, "hidden");
			},
						
			addPhoto: function( photo ){
				this.photos.push ( photo );
								
				if( this.currIdx < 0 ){
					this._showGallery( );
				}else{	
					if( photo.hasOwnProperty( "photo_date" ) ){
						this.photos.sort ( function ( a, b ) {
							if( a.photo_date == b.photo_date ){
								return 0;
							}else if( b.photo_date > a.photo_date ) {
								return 1;
							}else{
								return -1
							}	
						} );
					}	
				}
				
				this._setPhoto ( 0 );
				//this._toggleBtnVisiblity ( );
			},
			_init: function( ){
				if( this.photos.length > 0 ){
					this._setPhoto ( 0 );
					this._showGallery ( );
					//this._toggleBtnVisiblity ( );
				}	
			},
			_showGallery: function( ){
				//show photo gallery
				if( this.photos.length > 0 ){
					domClass.remove( this._root, "hidden");
				}
			},
			_toggleBtnVisiblity: function(  ){
				if( this.photos.length > 1 ){
					var basePath = require.toUrl( "mojo" );
					basePath = basePath.substring( 0, basePath.indexOf( "?" ) );
				
					//hide/show prev button
					domAttr.set ( this._prevBtn, "src", basePath + "/image/" + ( this.currIdx > 0 ? "backward.png" : "blank.png" ) );
					
					//hide/show next button
					domAttr.set ( this._nextBtn, "src", basePath + "/image/" + ( this.currIdx < this.photos.length - 1 ? "forward.png" : "blank.png" ) );
				}
			},
			_setPhoto: function( idx ){
				//set photo
				domAttr.set( this._currPhoto, "src", this.photos[ idx ].url );
				
				//set photo title
				domConstruct.place( "<span>" + this.photos[ idx ].title + "</span>", this._photoTitle, 'only' );	

				//update photo index	
				this.currIdx = idx;
				
				//set photo number
				//this._setPhotoNumber ( );
			},
			_setPhotoNumber: function( ){
				domConstruct.place ( "<i>Photo: " + ( this.currIdx + 1 ) + " / " + this.photos.length + "</i>", this._photoNum, 'only' );	
			},
			_showBigPhoto: function( ){ 
				window.open ( this.photos[ this.currIdx ].url, "Property Photo" );
			},
			_toNext: function( ){
				if( domAttr.get( this._nextBtn, "src" ).indexOf( "forward" ) > -1 ){
					if( this.currIdx + 1 > this.photos.length - 1 ) 
						this._setPhoto( 0 );
					else	
						this._setPhoto( this.currIdx + 1 );
						
					//this._toggleBtnVisiblity ( );	
				}	
			},
			_toPrev: function( ){
				if( domAttr.get( this._prevBtn, "src" ).indexOf( "backward" ) > -1 ){
					if( this.currIdx - 1 < 0 ) 
						this._setPhoto( this.photos.length - 1 );
					else	
						this._setPhoto( this.currIdx - 1 );
						
					//this._toggleBtnVisiblity ( );
				}	
			}
		} );
    return Widget;
} );