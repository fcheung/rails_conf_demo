# PotatoHelper
module Potato
  module PotatoHelper
    def widget_link_to label, url_for_options
      url = url_for url_for_options
      link_to_widget_function label, 'navigateTo', url
    end
    
    def widget_form_tag url_for_options, onSuccess=nil, &block
      url = url_for url_for_options
      if onSuccess
        onSuccess = "function(request){#{onSuccess}}"
      end
      form_tag url_for_options, :onsubmit => "Widget.forElement(this).submitTo(this, '#{escape_javascript url}'#{onSuccess ? ',' + onSuccess: ''}); return false;", &block
    end
    
    def widget_function widget_function_name, *args
      if args.last.is_a? Hash
        options = args.pop
        js_params = [options[:with]].flatten
      else
        js_params = nil
      end
      update_page do |page|
        if js_params
          args += js_params.map {|js| page.literal js}
        end
        page.call( 'Widget.forElement(this).'+widget_function_name, *args)
      end.chomp(';')
    end
    
    def link_to_widget_function label, widget_function_name, *args
      link_to_function label, widget_function(widget_function_name, *args)
    end    
  end
end