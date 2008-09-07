require 'test/unit'
require File.expand_path(File.dirname(__FILE__) + "/../lib/potato/potato_helper")
require 'rubygems'
require 'active_support'
require 'action_controller'
require 'action_view'

#Fake this up rather than loading whole of actionview
# module ActionView
#   class Base
#     def self.debug_rjs
#       false
#     end
#   end
# end
class PotatoHelperTest < Test::Unit::TestCase
  
  class ViewClass
    include ActionView::Helpers::TagHelper
    include ActionView::Helpers::JavaScriptHelper
    include Potato::PotatoHelper
    def url_for(options)
      options.to_s  
    end
  end
  
  def test_widget_link_to    
    instance = ViewClass.new
    output  = instance.widget_link_to('Click Me', '/some_url')
    assert_equal '<a href="#" onclick="Widget.forElement(this).navigateTo(&quot;/some_url&quot;); return false;">Click Me</a>', output
  end
  
  def test_link_to_widget_function
    instance = ViewClass.new
    output  = instance.link_to_widget_function('Click Me', 'categorise', 3, "banana")
    assert_equal '<a href="#" onclick="Widget.forElement(this).categorise(3, &quot;banana&quot;); return false;">Click Me</a>', output
  end
  
  def test_widget_function_with_js
    instance = ViewClass.new
    output  = instance.link_to_widget_function('Click Me', 'categorise', 3, :with => '$F("foo")')
    assert_equal '<a href="#" onclick="Widget.forElement(this).categorise(3, $F(&quot;foo&quot;)); return false;">Click Me</a>', output    

    output  = instance.link_to_widget_function('Click Me', 'categorise', 3, :with => ['$F("foo")', '$("bar")'])
    assert_equal '<a href="#" onclick="Widget.forElement(this).categorise(3, $F(&quot;foo&quot;), $(&quot;bar&quot;)); return false;">Click Me</a>', output    
    
  end
end
