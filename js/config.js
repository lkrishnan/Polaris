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
		basemap: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/basemap/MapServer",
		basemap_aerial: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/basemap_aerial/MapServer",
		topo: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/topohillshade/MapServer"
	}, aerial_services: [
		{ layer: "2020", url: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/ProdAerial2020/MapServer" },
		{ layer: "2019", url: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/TESTaerial2019/MapServer" },
		{ layer: "2018", url: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/aerial2018/MapServer" },
		{ layer: "2017", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2017/MapServer" },
		{ layer: "2016", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2016/MapServer" },
		{ layer: "2015", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2015/MapServer" },
		{ layer: "2014", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2014/MapServer" }
	], overlay_services: {
		overlays_trans: { 
			url: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/layers/MapServer",			
			opacity: 0.5, 
			visible: true,
			visiblelyrs: [ -1 ]
		}, overlays_labels: { 
			url: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/labels/MapServer", 
			opacity: 1.0, 			
			visible: true,
			visiblelyrs: [ -1 ]
		}, overlays_streets: { 
			url: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/layers/MapServer",		
			opacity: 1.0, 			
			visible: true,
			visiblelyrs: [ -1 ]
		}
	}, geometry_service: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/Utilities/Geometry/GeometryServer",
	print_task: "https://polaris3g.mecklenburgcountync.gov/polarisv/rest/services/Print/ExportWebMap/GPServer/Export%20Web%20Map",
	print_server_name: "polaris3g.mecklenburgcountync.gov",
	ws: "https://polaris3g.mecklenburgcountync.gov/ws/php/",
	local_json: "data/"
};		