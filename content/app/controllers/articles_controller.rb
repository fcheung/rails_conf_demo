class ArticlesController < ApplicationController
  def index
    @articles = Article.find :all
    set_json :setTitle => 'Listing articles'
  end
  
  def show
    @article = Article.find params[:id]
    set_json :setTitle => "Listing articles #{@article.id}",
              :article_id => @article.id
  end
  
  def new
    @article = Article.new
  end
  
  def create
    @article = Article.new params[:article]
    if @article.save
      set_json :successful => true
    else
      set_json :successful => false, :messages => @article.errors.full_messages
    end
    render :nothing => true
  end
end
