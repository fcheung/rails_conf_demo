var Comment = Widget.createSubClass({
  classProperties: {
    base_url: '/comment/comments/',
    observes: $H({'article:focussed': 'articleFocussed',
                'article:unfocussed': 'articleUnfocussed'})
  },
  methods:{
    articleFocussed: function(event){
      this.article_id = event.memo.id
      this.loadBase();
    },

    articleUnfocussed: function(event){
      this.article_id = null;
      this.loadBase();
    },
    
    post: function(){
      this.update(this.container, '/comment/comments', {parameters: $H(this.form().serialize({hash: true})).merge({id: this.article_id})})
    },
    

    base_url: function(){
      if(this.article_id)
        return this.constructor.base_url + 'list/' + this.article_id
      else
        return this.constructor.base_url

    }
  }
  
})