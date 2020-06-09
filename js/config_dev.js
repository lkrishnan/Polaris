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
		basemap: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/basemap/MapServer",
		basemap_aerial: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/basemap_aerial/MapServer",
		topo: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/topohillshade/MapServer"
	}, aerial_services: [
		{ layer: "2020", url: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/ProdAerial2020/MapServer" },
		{ layer: "2019", url: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/TESTaerial2019/MapServer" },
		{ layer: "2018", url: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/aerial2018/MapServer" },
		{ layer: "2017", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2017/MapServer" },
		{ layer: "2016", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2016/MapServer" },
		{ layer: "2015", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2015/MapServer" },
		{ layer: "2014", url: "https://maps.mecklenburgcountync.gov/agsadaptor/rest/services/aerial2014/MapServer" }
	], overlay_services: {
		overlays_trans: { 
			url: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/layers/MapServer",			
			opacity: 0.5, 
			visible: true,
			visiblelyrs: [ -1 ]
		}, overlays_labels: { 
			url: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/labels/MapServer", 
			opacity: 1.0, 			
			visible: true,
			visiblelyrs: [ -1 ]
		}, overlays_streets: { 
			url: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/layers/MapServer",		
			opacity: 1.0, 			
			visible: true,
			visiblelyrs: [ -1 ]
		}
	}, geometry_service: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer",
	print_task: "https://meckgisdev.mecklenburgcountync.gov/arcgis/rest/services/Print/ExportWebMap/GPServer/Export%20Web%20Map",
	ws: "https://meckgisdev.mecklenburgcountync.gov/ws/php/",
	local_json: "data/"
};		