var Content = Widget.createSubClass({
  classProperties:{
    base_url: '/content/articles/'
  },
  methods :{
    show:function(id){
      this.update(this.container, this.base_url()+id,
                  {method: 'get', onSuccess: this.submitCallback.bind(this)})
    },
    
    submitCallback: function(response, responseJSON){
      document.fire('article:focussed', {id: responseJSON.article_id})
    },
    
    baseLoadedCallback: function(){
      document.fire('article:unfocussed')
    },
    
    create: function(){
      this.update(this.container, this.base_url() + 'new', {
        onComplete: this.newCallback.bind(this),
        method: 'get'
      })
    },

    newCallback: function(response){
      var editor = new ContentEditor(this.container.down('.editor'))
      editor.owner = this
      return editor;
    },

    
  }
})


var ContentEditor = Widget.createSubClass({
  classProperties:{
    load_on_create: false,
    base_url: '/content/articles/'
  },
  
  methods:{
    submit: function(){
      this.makeRequest(this.base_url(), {parameters: this.form().serialize(), onSuccess:this.submitCallback.bind(this)})
    },

    submitCallback: function(response, responseJSON){
      if(responseJSON.successful)
        this.back();
      else
      this.container.down('.errors').update(responseJSON.messages.join('; '))
    },
    
    back: function(){
      this.owner.loadBase();
      this.remove()
    }
  }
})
