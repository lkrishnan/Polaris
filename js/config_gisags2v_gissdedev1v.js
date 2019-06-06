var config = {
	initial_extent: {
		xmin: 1384251.24585599,
		ymin: 460978.995855999,
		xmax: 1537013.50075424,
		ymax: 660946.333333335,
		spatialReference: { wkid: 2264 }
	}, min_scale: 425000,
	basemap_services: {
		basemap: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/basemap/MapServer",
		basemap_aerial: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/basemap_aerial/MapServer",
		topo: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/topohillshade/MapServer"
	}, aerial_services: [
		{ layer: "2019", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2019/MapServer" },
		{ layer: "2018", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2018/MapServer" },
		{ layer: "2017", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2017/MapServer" },
		{ layer: "2016", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2016/MapServer" },
		{ layer: "2015", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2015/MapServer" },
		{ layer: "2014", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2014/MapServer" },
		{ layer: "2013", url: "http://meckmap.mecklenburgcountync.gov/arcgis/rest/services/aerial2013/MapServer" }
	], overlay_services: {
		overlays_trans: { 
			url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/polaris3g/layers_failover/MapServer",			
			opacity: 0.5, 
			visible: true,
			visiblelyrs: [ -1 ]
		}, overlays_labels: { 
			url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/polaris3g/labels_failover/MapServer", 
			opacity: 1.0, 			
			visible: true,
			visiblelyrs: [ -1 ]
		}, overlays_streets: { 
			url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/polaris3g/layers_failover/MapServer",			
			opacity: 1.0, 			
			visible: true,
			visiblelyrs: [ -1 ]
		}
	}, geometry_service: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/Utilities/Geometry/GeometryServer",
	print_task: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/polaris3g/ExportWebMap/GPServer/Export%20Web%20Map",
	web_service_local: "../ws/php_failover/",
	local_json: "data/"
};		