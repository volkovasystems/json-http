var jsonHttp = function jsonHttp( namespace ){
	if( namespace && typeof namespace == "string" ){
		if( namespace in jsonHttp.definitions ){
			if( typeof jsonHttp.definitions[ namespace ] == "string" ){
				namespace = jsonHttp.definitions[ namespace ];
			}

			return jsonHttp( )
				.set
		}
	
	}else if( namespace && typeof namespace != "string" ){

	}

	var data = {
		"xmlHttp": new XMLHttpRequest( )
	};

	var methods = { };
	
	var options = { 
		"queries": { },
		"parameters": { },
		"headers": {
			"Content-Type": "application/json;charset=UTF-8"
		},
		"location": "/",
		"method": "HEAD"
	};

	/*:
		These are bindings using Object.defineProperty
			to lock the function as non-writable,
			non-enumerable, and non-configurable.
	*/
	var bind = function bind( method ){
		Object.defineProperty( methods, method.name,
			{
				"enumerable": false,
				"configurable": false,
				"get": function get( ){
					return data.methods[ method.name ] || method;
				},
				"set": function set( ){ }
			} );
	};

	/*:
		Append the queries to the location.

		This will convert the query set to a query string.

		We will assume that the developer has already encoded properly
			the values because this will not be the responsibility of this function.
	*/
	var appendQueries = function appendQueries( location ){
		var queries = options.queries;
		
		var queryString = "";
		
		for( var query in queries ){
			queryString += [ query, queries[ query ] ].join( "=" );
		}
		
		if( /\?/.test( location ) &&
			/\&/.test( location ) )
		{
			return [ location, queryString ].join( "&" );				
			
		}else if( /\?/.test( location ) ){
			return [ location, queryString ].join( "" );
			
		}else{
			return [ location, queryString ].join( "?" );
		}
	};
	
	var addHeaders = function addHeaders( xmlHttp, headers ){
		var xmlHttp = data.xmlHttp;
		
		for( var header in headers ){
			xmlHttp.setRequestHeader( header, headers[ header ] );
		}
	};
	
	/*:
		A simple feature that let's you extend the library.

		Plugin should be a function.

		Call include to be applied on the request.
	*/
	var include = function include( plugin ){
		if( typeof plugin == "function" ){
			plugin.apply( {
				"data": data,
				"methods": methods,
				"options": options
			} );
		}

		return methods;
	};
	
	var define = function define( definitions ){
		if( !jsonHttp.definitions ){
			jsonHttp.definitions = { };
		}

		if( definitions.location in jsonHttp.definitions ||
			definitions.namespace in jsonHttp.definitions )
		{


		}else{
			jsonHttp.definitions[ definitions.location ] = definitions;

			if( "namespace" in definitions ){
				jsonHttp.definitions[ definitions.namesace ] = definitions.location;
			}

			var request = jsonHttp( )
				.setLocation( definitions.location )
				.setMethod( definitions.method );

			definitions.request = request;

			return request;
		}
	};
	
	var setLocation = function setLocation( location ){
		options.location = location;
		
		return methods;
	};
	
	var setMethod = function setMethod( method ){
		options.method = method;
		
		return methods;
	};
	
	var setHeaders = function setHeaders( headers ){
		for( var header in headers ){
			options.headers[ header ] = headers[ header ];		
		}		
		
		options.headers = Object.freeze( options.headers );
		
		return methods;
	};
	
	var setQueries = function setQueries( queries ){
		for( var query in queries ){
			options.queries[ query ] = queries[ query ];		
		}	
		
		options.queries = Object.freeze( options.queries );
		
		return methods;
	};
	
	var setParameters = function setParameters( parameters ){
		for( var parameter in parameters ){
			options.parameters[ parameter ] = parameters[ parameter ];		
		}
		
		options.parameters = Object.freeze( options.parameters );
		
		return methods;
	};

	var get = function get( location ){
		methods.setLocation( location );
		
		methods.setMethod( "GET" );
		
		return methods;
	};

	var post = function post( location ){
		methods.setLocation( location );
		
		methods.setMethod( "POST" );
		
		return methods;
	};
	
	var send = function send( onResponse ){
		var xmlHttp = data.xmlHttp;
		
		xmlHttp.onreadystatechange = function onReadyStateChange( ){
			if( xmlHttp.readyState == 4 &&
				xmlHttp.status == 200 )
			{
				var result = JSON.parse( xmlHttp.responseText );
				
				onResponse( null, result, xmlHttp );

				
				
			}else if( xmlHttp.readyState == 4 ){
				onResponse( new Error( "request failed" ), null, xmlHttp );
			}
		};
		
		var location = appendQueries( options.location );
		
		xmlHttp.open( options.method, location, true );
		
		addHeaders( xmlHttp, options.headers );
		
		try{
			xmlHttp.send( JSON.stringify( options.parameters ) );
			
		}catch( error ){
			onResponse( error, null, xmlHttp );
		}
		
		return methods;
	};
	
	bind( get );

	bind( post );
		
	bind( send );
		
	bind( include );

	bind( define );

	bind( setHeaders );
		
	bind( setParameters );
		
	bind( setQueries );
		
	bind( setMethod );

	return methods;
};