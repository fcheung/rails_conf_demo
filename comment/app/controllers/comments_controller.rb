class CommentsController < ApplicationController
  def index
    set_json :setTitle => 'Comments'
  end
  
  def list
    @comments = Comment.find_all_by_article_id params[:id]
    set_json :setTitle => "Listing comments for #{params[:id]}"
  end
  
  def create
    Comment.create :article_id => params[:id],
                    :body => params[:comment]
                    
    list
    render :action => 'list'
  end
end
