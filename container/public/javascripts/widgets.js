
var EventHandlerRegistration = Class.create({
  initialize: function(element, event, handler){
		this.element = element;
		this.event = event;
		this.handler = handler;
	},
	
	remove: function(){
	  this.element.stopObserving(this.event, this.handler)	
	}
	
});

var Widget = Class.create({
	
	initialize: function(parent_element){
		this.container= parent_element;
		this.container.addClassName('widget')
		this.container.widget = this;
		this.requests = [];
		this.requestIndex = 0;
					
		this.observers = []
		if(this.constructor.observes)
			this.constructor.observes.each(function(pair){
				this.observe(document, pair.key,this[pair.value])
				},this);
		
		if(this.constructor.load_on_create)
			this.loadBase();
		this.constructor.instance = this;
		return this;
	},
	

  setTitleElement: function(element){
    this.titleElement = element;	
  },
	
	remove: function(){
		this.observers.invoke('remove')
		this.observers = []
		this.container.fire('widget:removed');
		this.container.stopObserving();
		if(Object.isFunction(this.stopUpdating))
		  this.stopUpdating();
		this.removeDomElement();
		if(this==this.constructor.instance) //don't let multiple instance mess things up
		  this.constructor.instance = null;
	},
	
	//Override if you want all of the normal remove goodness but don't actually want to remove it from the DOM
	removeDomElement: function(){
		if(this.container.parentNode)
		{
				this.container.remove();
		}	  
	},
		
	//convenience function for changing the whole view
	navigateTo: function(url, options){
		return this.update(this.container, url, Object.extend(options || {},{method: 'get'}))
	},
	
	update: function(element, url, options){
		if(!options)
			 options = {}
		var updater = new Ajax.Updater({success: $(element), failure: 'dont_insert'}, url, this.makeOptions(options));
		updater.requestIndex = this.requestIndex
    //This is because (by default) prototype considers an aborted request to have succeeded, so aborting a request updates
		//the element with the responseText (ie blank)
		//ditto for requests that timeout
		//we also check _load_aborted because if the request was aborted half way through the status code will be set
		updater.success = function(){
		  var status = this.getStatus();
      return (status >= 200 && status < 300 && !this._load_aborted);
  	}
	  this.requests.push(updater)
	  updater.watchdog = new Watchdog(updater)
		
	  return updater;
	},
	
	//this sets up the options for an ajax request with callbacks that do the common stuff
	makeOptions: function(options){		
		if(!options.evalScripts)
		  options.evalScripts = true;
	  if(!options.method)
	    options.method = 'post';
    
		this.requestIndex += 1
		
		options.parameters = options.parameters || {}
		if(Object.isString(options.parameters))
		  options.parameters += "&requestIndex=" + this.requestIndex
		else
		  options.parameters.requestIndex = this.requestIndex
		
		var onSuccess = options.onSuccess
		options.onSuccess = (function(response, json) {
		  if(!(json && json.invalid_lock)) {
        if(response.status >= 200 && response.status < 300){
			    this.setTitleFromResponseJSON(json);
          if (Object.isFunction(onSuccess)) onSuccess(response, json);
        }
      }
    }).bind(this);
		
		var onFailure = options.onFailure
		options.onFailure = (function(response, json) {
		  if(!response.request._load_aborted){
			  if(Object.isFunction(this.stopUpdating))
			      this.stopUpdating()
			  if (Object.isFunction(onFailure)) onFailure(response, json);
      }
    }).bind(this);

    
		var onComplete = options.onComplete
		options.onComplete = (function(response, json) {
		  response.request.watchdog.kill()
    	if(response.status ==0 && !response.request._retried && !response.request._load_aborted)
    	{  
    	  response.request._retried = true
    	  response.request.retry()
    	  response.request.watchdog = new Watchdog(response.request)
    	  return;
    	}
    	
    	this.requests = this.requests.without(response.request)

      //aborted, errored requests can have 0 as their status
      //if they were partially loaded they will have the appropriate status, so we check the flag we set when we cancel
      //if the request errored out we could conceivably check the content length header, we don't currently do that
      if(response.status >= 200 && response.status < 550  && !response.request._load_aborted){
        if (Object.isFunction(onComplete)) onComplete(response, json);
      }
    	
		}).bind(this);    

		return options;
	},
	
	makeRequest: function(url, options) {
		if(!options)
			 options = {}
		var request = new Ajax.Request(url, this.makeOptions(options));
	  request.requestIndex = this.requestIndex
  	//This is because (by default) prototype considers an aborted request to have succeeded, so aborting a request updates
		//the element with the responseText (ie blank)
		//ditto for requests that timeout
		//we also check _load_aborted because if the request was aborted half way through the status code will be set
		request.success = function(){
		  var status = this.getStatus();
      return (status >= 200 && status < 300 && !this._load_aborted);
  	}
		request.watchdog = new Watchdog(request)
	  this.requests.push(request)
	  return request;
	},
	
	
	base_url: function(){
		return this.constructor.base_url;
	},
	
	getWindow: function(){
		return window;
	},
		
	abortLoad: function(){
	  var loadingRequest = this.loading()
	  if(loadingRequest)
		{
		  loadingRequest._load_aborted = true
		  loadingRequest.transport.abort();
		}
	},
	
	//is a loadBase request ongoing ?
	// we make a (slightly) artificial distinction between the requests produced by loadBase which replace the entire content of the request
	// and other requests. abortLoad, loading, etc... refer to this particular request (of which there is only ever 1)
	
	loading: function(){
	  return this.requests.find(function(request){ return request.isLoadBaseRequest && !request._complete})
	},
	
	loadBase: function(force, parameters){
		if(this.loading())
		{
			if(!force)
			  return;
			this.abortLoad()
		}
		var request = this.navigateTo(this.base_url(), {
			parameters: parameters,
			onFailure: this.boundCallBack('baseFailedCallback'),
			onSuccess: this.boundCallBack('baseLoadedCallback'),
			onComplete: this.boundCallBack('baseCompletedCallback'),
			})
		request.isLoadBaseRequest = true;
		
	},
	
	boundCallBack: function(name){
		if(Object.isFunction(this[name]))
		  return this[name].bind(this)
		return null;
	},
	
	notifyUpdated: function(event_name, memo){
		this.container.fire(event_name, memo);
	},
	
	inspect: function(){
		return 'Widget div:' + this.container.id; 
	},
	
	setTitleFromResponseJSON: function(responseJSON){
		if(responseJSON && responseJSON.setTitle && this.titleElement)
	    this.titleElement.down('.titleContent').innerHTML = responseJSON.setTitle
	},
	
	form: function(){
		return this.container.down('form')
	},
	
	//because we have a very long lived page, we need to be careful about unregistering event handlers
	//if you register your event handler via this then you don't have to write bindAsEventListener
	//and we will unregister for you when the widget is removed
	//If you are yourself a long lived widget then you should manage this yourself: call unregisterAll to clear out your event listeners (apart from
	// the ones setup on document (because typically these will always last the lifetime of the widget))
	//
	//arguments: element, event, handler and any other arguments to pass to bindAsEventListener
	observe: function()
	{
		var argumentsArray = $A(arguments)
		var element = argumentsArray.shift()
		var event = argumentsArray.shift()
		
		// We have to wrap the handler in order to catch errors because window.onerror is unreliable
		// (it doesn't report errors in handlers installed via addEventListener)
		var unwrappedHandler = argumentsArray.shift()
		var handler = function() {
			try {
      	return unwrappedHandler.apply(this, $A(arguments));
			} catch(e) {
				ErrorMessageWidget.displayError({exception: e})
			}
    }
		
		argumentsArray.unshift(this)
		var boundHandler = handler.bindAsEventListener.apply(handler, argumentsArray)
		element.observe(event, boundHandler)
		this.observers.push(new EventHandlerRegistration(element, event, boundHandler))
	},
	
	unregisterAllObservers: function()
	{
		this.observers = this.observers.reject(function(handler){
			if(handler.element == document)
				return false;
			handler.remove()
			return true
		})
	},
	
	maximise: function(){
		if(Widget.Maximiser)
			Widget.Maximiser.maximise(this.container)
	},
	
	restore: function(){
		if(Widget.Maximiser)
			Widget.Maximiser.restore(this.container)
	},
  
});

Object.extend(Widget, {
  forElement: function(element){
		var element = $(element)
		if(element.hasClassName('widget'))
		  return element.widget;
		return element.up('.widget').widget;
	},
	
	//The entire reason for the existance of this is that we need some degree of inheritance of class methods / properties
	//
	createSubClass: function(options){
		var args = [this, options.methods].concat(options.modules||[])
		
		var kl = Class.create.apply(this, args);
		Object.extend(kl, WidgetClassMethods);
		Object.extend(kl, {createSubClass: this.createSubClass})
    //we stash class properties away so that it's easy to copy them over to the child class
    //
    Object.extend(kl, this.classProperties || {})
		Object.extend(kl, options.classProperties);
		kl.classProperties = Object.extend(this.classProperties || {}, options.classProperties)
		return kl;
	},
	
	
});

var WidgetClassMethods= {
	load_on_create: true,
	allows_multiple_instances: false,
	create: function(){
		if(!this.allows_multiple_instances && this.instance)
		  return this.instance;
/*
This bit of magic is so that we can call create with any arguments we want and have them all passed 
into the initialize
*/
//we stash these as when new invokes our stub constructor, it will have its own this, arguments that would shadow these
		var ctor = this
		var constructor_arguments = arguments
		return new function(){
			this.__proto__ = ctor.prototype;
			ctor.apply(this, constructor_arguments); 
		};
	},	
}

var Refresher = {
  refreshInterval: 12,

  startUpdating: function(){
		if(this.timer == null){
			this.timer = new PeriodicalExecuter(function(pe){
			  if(Object.isFunction(this.onRefresh)){
			    this.onRefresh();
		    }
			  else {
			    this.loadBase();
		    }
			}.bindAsEventListener(this), this.constructor.refreshInterval || this.refreshInterval);
		}
	},
	
	stopUpdating: function(){
		if(this.timer != null)
		{
			this.timer.stop();
			this.timer = null;
		}
	},

	remove: function($super){
		if(this.timer){this.timer.stop();}
		$super();
	},
	
}

var ErrorMessageWidget = Widget.createSubClass({
	classProperties: {
		load_on_create: false,
		allows_multiple_instances: true,

		formatException: function(exception) {
			return exception.name.escapeHTML() + ' at ' +
				exception.fileName.escapeHTML() +'(' + exception.lineNumber +'):<br/>' +
				exception.message.escapeHTML() + '<br/>' +
				exception.stack.escapeHTML()
		},
		
		displayError: function (options){
			var errorDiv = new Element('div', {'id': 'error_dialog_wrapper'})
			$$('body').first().insert(errorDiv);
			ErrorMessageWidget.create(errorDiv)

			var url_desc = ''
			if(options['url'])
				url_desc = 'We were trying to load ' + options['url'].escapeHTML() + " when this happened. "

			errorDiv.update('<div id="error_dialog" class="dialog_wrapper"><div class="dialog"><img class="close_button" src="/ui/images/close.png" onclick="Widget.forElement(this).remove()" alt="X"/><h1 class="dialog_title">Oh noes! An error occurred</h1><div class="error_container"><div class="error_header"><h2>' + 
							 url_desc + 'The error message was:</h2></div><div class="error_body"></div></div></div></div>')
			
			var body = ''
			if(options['exception'])
				body = this.formatException(options['exception'])
			else
				body = options['body']

			errorDiv.down('.error_body').update(body)
		}
	}
})

var Watchdog = Class.create({
  
  initialize: function(request){
    this.request = request
    this.timer = new PeriodicalExecuter(this.timeout.bind(this), 30)
  },
  
  kill: function(){
    this.timer.stop()
  },
  
  timeout: function(){
    if([1,2,3].include(this.request.transport.readyState)){
      this.timer.stop()
      this.request._timedOut = true
      this.request.transport.abort()
      
    }
  }
})


Ajax.Request.addMethods({
  doRetry: function(rq){
    rq.transport = Ajax.getTransport();
    if(!rq.options.parameters)
      rq.options.parameters = {}
    rq.options.parameters.retryingRequest = '1'
    rq.request(rq.url)
  },
  retry: function(){
    this._complete = false
    this._timedOut = false
    this.doRetry.defer(this);
  }
})
