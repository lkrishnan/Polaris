define ( 

	[ 
		"dojo/_base/declare", 
		"dijit/_WidgetBase", 
		"dijit/_TemplatedMixin"
	],
	 
	function ( declare, _WidgetBase, _TemplatedMixin ) {

		var Widget = declare ( [ _WidgetBase, _TemplatedMixin ], {
						
			//attributes		
			templateString: 
				"<div class='mojoSearchResult' data-dojo-attach-event='onclick:_onClick'>" +
					"<table class='mojoSRTable'>" +
						"<tr>" + 
							"<th class='idx'><span data-dojo-attach-point='idxNode'></span>.</th>"+
							"<td><span data-dojo-attach-point='displaytextNode'></span></td>"+
						"</tr>" +
					"</table>"+
				"</div>",
			
			idx: 0,			
			
			params: {},
			
			displaytext: "",
			
			//methods
			_setIdxAttr: { node: "idxNode", type: "innerHTML" },			
			
			_setDisplaytextAttr: { node: "displaytextNode", type: "innerHTML" },
			
			_onClick: function ( event ){
				
				return this.onClick ( this.params );
						
			},
					
			onClick: { // nothing here: the extension point!

			}
														
		} );
			
		return Widget;
					
	}	 
	
);


						