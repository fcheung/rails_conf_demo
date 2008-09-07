# Include hook code here
ActionView::Base.send(:include, Potato::PotatoHelper)
ActionController::Base.send(:include, Potato::PotatoJSON)