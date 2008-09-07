# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  around_filter :set_json_header
  protect_from_forgery
  protected
end
