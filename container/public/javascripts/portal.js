document.observe('dom:loaded', function(){
  var comment = Comment.create($('comment'))
  comment.setTitleElement($('comment_title'))
  var content = Content.create($('content'))
  content.setTitleElement($('content_title'))
})