/******************************/
/* Polaris3G Workflow Manager */
/******************************/

/* Load Modules */
var gulp = require( "gulp" ),
	less = require( "gulp-less" ),
    autoprefixer = require( "gulp-autoprefixer" ),
	cssclean = require( "gulp-clean-css" ),
    uglify = require( "gulp-uglify" ),
	concat = require( "gulp-concat" ),
	imagemin = require( "gulp-imagemin" ),
	replace = require( "gulp-replace" ),
	del = require( "del" );

/************************************************/	
	
/* File Paths */	
var web_dir = ".",
	paths = {
		styles: [
			web_dir + "/less/frame.less",
			web_dir + "/less/main.less"
		], scripts: [
			web_dir + "/js/cachedmap.js",
			web_dir + "/js/config.js",
			web_dir + "/js/main.js",
			web_dir + "/js/map.js",
			web_dir + "/js/search.js",
			web_dir + "/js/usng.js",
			web_dir + "/js/utility.js"
		], scripts_ags: [
			web_dir + "/js/cachedmap.js",
			web_dir + "/js/config_gisags2v.js",
			web_dir + "/js/main.js",
			web_dir + "/js/map.js",
			web_dir + "/js/search.js",
			web_dir + "/js/usng.js",
			web_dir + "/js/utility.js"
		], scripts_sde: [
			web_dir + "/js/cachedmap.js",
			web_dir + "/js/config_gissdedev1v.js",
			web_dir + "/js/main.js",
			web_dir + "/js/map.js",
			web_dir + "/js/search.js",
			web_dir + "/js/usng.js",
			web_dir + "/js/utility.js"
		], scripts_ags_sde: [
			web_dir + "/js/cachedmap.js",
			web_dir + "/js/config_gisags2v_gissdedev1v.js",
			web_dir + "/js/main.js",
			web_dir + "/js/map.js",
			web_dir + "/js/search.js",
			web_dir + "/js/usng.js",
			web_dir + "/js/utility.js"
		], scripts_dev: [
			web_dir + "/js/cachedmap.js",
			web_dir + "/js/config_dev.js",
			web_dir + "/js/main.js",
			web_dir + "/js/map.js",
			web_dir + "/js/search.js",
			web_dir + "/js/usng.js",
			web_dir + "/js/utility.js"
		], htmls: [
			web_dir + "/index.html",
			web_dir + "/failover_ags.html",
			web_dir + "/failover_sde.html",
			web_dir + "/failover_ags_sde.html",
			web_dir + "/dev.html",
			web_dir + "/error.html",
			web_dir + "/maplayers_dictionary.html"
		], cbtreejs: [
			web_dir + "/js/vendor/cbtree/CheckBox.js",
			web_dir + "/js/vendor/cbtree/Tree.js",
			web_dir + "/js/vendor/cbtree/errors/createError.js",
			web_dir + "/js/vendor/cbtree/extensions/TreeStyling.js",
			web_dir + "/js/vendor/cbtree/models/ForestStoreModel.js",
			web_dir + "/js/vendor/cbtree/models/ItemWriteStoreEX.js",
			web_dir + "/js/vendor/cbtree/models/TreeStoreModel.js",
			web_dir + "/js/vendor/cbtree/util/IE8_Event.js",
		]
	}, 
	dest = "build";

/************************************************/	
/* Development workflow */

//less preprocessing with autoprefixer and minify
gulp.task( "lesstocss", function( ){
    return gulp.src( paths.styles )
        .pipe( less( ) )
		.pipe( autoprefixer( "last 2 version", "safari 5", "ie 9", "opera 12.1", "ios 6", "android 4" ) )
        .pipe( cssclean( ) )
        .pipe( gulp.dest( web_dir + "/css" ) );
} );

//push main script to build after minify
gulp.task( "jstobuild", function( ){
    return gulp.src( paths.scripts )
		.pipe( replace( /foo=[0-9]*/g, "foo=" + Math.floor( ( Math.random( ) * 100000 ) + 1 ) ) )
		.pipe( uglify( ) )
		.pipe( concat( "p3g.js" ) )
		.pipe( gulp.dest( dest + "/js" ) );
} );
gulp.task( "agsjstobuild", function( ){
    return gulp.src( paths.scripts_ags )
		.pipe( replace( /foo=[0-9]*/g, "foo=" + Math.floor( ( Math.random( ) * 100000 ) + 1 ) ) )
		.pipe( uglify( ) )
		.pipe( concat( "p3g_ags.js" ) )
		.pipe( gulp.dest( dest + "/js" ) );
} );
gulp.task( "sdejstobuild", function( ){
    return gulp.src( paths.scripts_sde )
		.pipe( replace( /foo=[0-9]*/g, "foo=" + Math.floor( ( Math.random( ) * 100000 ) + 1 ) ) )
		.pipe( uglify( ) )
		.pipe( concat( "p3g_sde.js" ) )
		.pipe( gulp.dest( dest + "/js" ) );
} );
gulp.task( "ags_sdejstobuild", function( ){
    return gulp.src( paths.scripts_ags_sde )
		.pipe( replace( /foo=[0-9]*/g, "foo=" + Math.floor( ( Math.random( ) * 100000 ) + 1 ) ) )
		.pipe( uglify( ) )
		.pipe( concat( "p3g_ags_sde.js" ) )
		.pipe( gulp.dest( dest + "/js" ) );
} );
gulp.task( "devjstobuild", function( ){
    return gulp.src( paths.scripts_dev )
		.pipe( replace( /foo=[0-9]*/g, "foo=" + Math.floor( ( Math.random( ) * 100000 ) + 1 ) ) )
		.pipe( uglify( ) )
		.pipe( concat( "p3g_dev.js" ) )
		.pipe( gulp.dest( dest + "/js" ) );
} );


/************************************************/

/* Default workflow */

//push other js to build
gulp.task( "mojojstobuild", function( ){
	return gulp.src( web_dir + "/js/vendor/mojo/*.js" )
		.pipe( uglify( ) )
		.pipe( gulp.dest (dest + "/js/vendor/mojo" ) );
} );

//push images to build after processing
gulp.task( "images", function( ){
 return gulp.src( web_dir + "/image/**/*" )
    // Pass in options to the task
    .pipe( imagemin( { optimizationLevel: 3, progressive: true, interlaced: true } ) )
    .pipe( gulp.dest( dest + "/image" ) );
} );
gulp.task( "mojoimagetobuild", function( ){
	return gulp.src( web_dir + "/js/vendor/mojo/image/*.*" )
		.pipe( gulp.dest( dest + "/js/vendor/mojo/image" ) );
} );

//push css files to build after processing
gulp.task( "csstobuild", function( ){
	return gulp.src( [ web_dir + "/css/main.css" ] )
        .pipe( gulp.dest( dest + "/css/" ) );
} );

//push data files to build after processing
gulp.task( "datatobuild", function( ){
	return gulp.src( web_dir + "/data/*.*" )
        .pipe( gulp.dest( dest + "/data/" ) );
} );

//push root files to build
gulp.task( "rootfilestobuild", function( ){
	return gulp.src( [ web_dir + "/*.*", "!" + web_dir + "/*.html", "!" + web_dir + "/*.js", "!" + web_dir + "/*.json" ] )
        .pipe( gulp.dest( dest + "/" ) );
} );
gulp.task( "cbtreetobuild", function( ){
	return gulp.src( [ web_dir + "/js/vendor/cbtree/**/*.*" ] )
        .pipe( gulp.dest( dest + "/js/vendor/cbtree" ) );
} );

//push html files to build after processing
gulp.task( "htmltobuild", function( ){
    return gulp.src( paths.htmls )
		.pipe( replace( /<script src="js\/search.js"><\/script><script src="js\/config.js"><\/script><script src="js\/cachedmap.js"><\/script><script src="js\/map.js"><\/script><script src="js\/main.js"><\/script><script src="js\/usng.js"><\/script><script src="js\/utility.js"><\/script>/g, "<script src=\"js/p3g.js?foo=99999\"></script>" ) )
		.pipe( replace( /<script src="js\/search.js"><\/script><script src="js\/config_gisags2v.js"><\/script><script src="js\/cachedmap.js"><\/script><script src="js\/map.js"><\/script><script src="js\/main.js"><\/script><script src="js\/usng.js"><\/script><script src="js\/utility.js"><\/script>/g, "<script src=\"js/p3g_ags.js?foo=99999\"></script>" ) )
		.pipe( replace( /<script src="js\/search.js"><\/script><script src="js\/config_gissdedev1v.js"><\/script><script src="js\/cachedmap.js"><\/script><script src="js\/map.js"><\/script><script src="js\/main.js"><\/script><script src="js\/usng.js"><\/script><script src="js\/utility.js"><\/script>/g, "<script src=\"js/p3g_sde.js?foo=99999\"></script>" ) )
		.pipe( replace( /<script src="js\/search.js"><\/script><script src="js\/config_gisags2v_gissdedev1v.js"><\/script><script src="js\/cachedmap.js"><\/script><script src="js\/map.js"><\/script><script src="js\/main.js"><\/script><script src="js\/usng.js"><\/script><script src="js\/utility.js"><\/script>/g, "<script src=\"js/p3g_ags_sde.js?foo=99999\"></script>" ) )
		.pipe( replace( /<script src="js\/search.js"><\/script><script src="js\/config_dev.js"><\/script><script src="js\/cachedmap.js"><\/script><script src="js\/map.js"><\/script><script src="js\/main.js"><\/script><script src="js\/usng.js"><\/script><script src="js\/utility.js"><\/script>/g, "<script src=\"js/p3g_dev.js?foo=99999\"></script>" ) )
		.pipe( replace( /foo=[0-9]*/g, "foo=" + Math.floor( ( Math.random( ) * 100000 ) + 1 ) ) )
		.pipe( gulp.dest( dest + "/" ) );
} );


//rerun the task when less files change
gulp.task( "watch", function( ){ 
	gulp.watch( paths.styles, gulp.series( "lesstocss" ) ); 
} );

//run in the background while css is modified
gulp.task( "develop", gulp.series( "lesstocss", "watch" ) );

//package js and css
gulp.task( "default", gulp.series( "lesstocss", "jstobuild", "agsjstobuild", "sdejstobuild", "ags_sdejstobuild", "devjstobuild", "mojojstobuild", "images", "mojoimagetobuild", "csstobuild", "datatobuild", "rootfilestobuild", "htmltobuild", "cbtreetobuild" ) );

//publish tasks
gulp.task( "publish_prod", function( ){
	return gulp.src( "build/**/*.*" )
		.pipe( gulp.dest ( "//gispolaris1v/c$/inetpub/wwwroot" ) );
} );
gulp.task( "publish_dev", function( ){
	return gulp.src( "build/**/*.*" )
		.pipe( gulp.dest ( "//gispolarisdev1v/d$/www" ) );
} );
gulp.task( "publish", gulp.series( "publish_prod", "publish_dev" ) );

