Effect.HorizontalSlide = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      side: 'right',
      hideAfterFinish: false,
      constantSize: false,
      start: 50,
      target: 0,
    }, arguments[1] || {})
    this.start(options);
  },
  setup: function() {
    if(this.options.constantSize){
      this.originalWidth = this.element.style['width']
      this.element.setStyle({width: this.options.startingWidth || this.element.getWidth()+'px'})
    }
    this.element.show()
   },
  update: function(position) {
    var percentage = this.options.start * (1-position) + position * this.options.target
   	var style={}
    style[this.options.side]=percentage + '%'
 		this.element.setStyle(style)
  },
  
  finish: function(){
    if(this.options.hideAfterFinish)
    {
      this.element.hide();
    }
    if(this.originalWidth){
      this.element.setStyle({width: ''})
    }
  }
 
});

Effect.GhostTo = function(element, options){
	var clone = element.cloneNode(true);
	clone.id = 'ghost'
	$$('body').first().insert(clone)
	clone.absolutize()
	clone.clonePosition(element)
	clone.setOpacity(0.75)

	clone.makePositioned().makeClipping()
	return new Effect.Parallel(
	  [ new Effect.Scale(clone, 30, { sync: true}),
	    new Effect.Move(clone, { x: options.x , y: options.y, sync: true, mode: 'absolute' })
	  ], {afterFinish: function(){clone.remove()}, duration: options.duration})
	
}

Effect.MenuOpenUp = function(element, options) {
  Effect.MenuBase(element, 0, 100, options)
}

Effect.MenuCloseDown = function(element, options) {
  Effect.MenuBase(element, 100, 0, options)
}

Effect.MenuBase = function(element, from, to, options) {
  var element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, to, Object.extend({ 
    scaleContent: false, 
    scaleX: false,
    scaleFrom: from,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: false,
    afterSetup: function(effect) {
      effect.element.makeClipping()
      if(to == 100)
        effect.element.setStyle({height: '0px'}).show(); 
    },  
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
      if(to == 0)
        effect.element.hide()
    }
  }, options || { }));
};

//morph the top, left, right, bottom properties to the specified values (if a value is not given, that property is not set)
Effect.PinTo = function(element, positions, options){
	var sides = ['top', 'left', 'bottom', 'right']
	
	//if width is specified, unset it if both left & right set (similar for height)
	if(element.style.width && positions['right'] && positions['left']){
	  element.setStyle({left: element.getStyle('left'), right: element.getStyle('right'), width: null})
	}
	if(element.style.height && positions['top'] && positions['bottom']){
	  element.setStyle({top: element.getStyle('top'), bottom: element.getStyle('bottom'), height: null})
	}
	
	new Effect.Parallel(
	  sides.map(function(side){
	  if(positions[side])
	    return new Effect.Tween(element, parseInt(element.getStyle(side)), positions[side], function(position){
	      var style={};
	      style[side] = position + 'px'
	      this.setStyle(style)});
	  else
	    return null;
	}).compact(), options || {})
}
