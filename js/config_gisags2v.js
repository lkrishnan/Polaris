var config = {
	initial_extent: {
		xmin: 1384251.24585599,
		ymin: 460978.995855999,
		xmax: 1537013.50075424,
		ymax: 660946.333333335,
		spatialReference: { wkid: 2264 }
	}, 
	min_scale: 425000,
	basemap_services: {
		basemap: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/basemap/MapServer",
		basemap_aerial: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/basemap_aerial/MapServer",
		topo: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/topohillshade/MapServer"
	}, aerial_services: [
		{ layer: "2023", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2023/MapServer" },
		{ layer: "2022", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2022/MapServer" },
		{ layer: "2021", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2021/MapServer" },
		{ layer: "2020", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2020/MapServer" },
		{ layer: "2019", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2019/MapServer" },
		{ layer: "2018", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2018/MapServer" },
		{ layer: "2017", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2017/MapServer" }
	], overlay_services: {
		overlays_trans: { 
			url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/polaris3g/layers/MapServer",			
			opacity: 0.5, 
			visible: true,
			visiblelyrs: [ -1 ]
		}, overlays_labels: { 
			url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/polaris3g/labels/MapServer", 
			opacity: 1.0, 			
			visible: true,
			visiblelyrs: [ -1 ]
		}, overlays_streets: { 
			url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/polaris3g/layers/MapServer",			
			opacity: 1.0, 			
			visible: true,
			visiblelyrs: [ -1 ]
		}
	}, geometry_service: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/Utilities/Geometry/GeometryServer",
	print_task: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/polaris3g/ExportWebMap/GPServer/Export%20Web%20Map",
	print_server_name: "maps.mecklenburgcountync.gov",	
	ws: "https://maps.mecklenburgcountync.gov/ws/php/",
	local_json: "data/"
};		