module Potato
  module PotatoJSON
    def set_json(attributes)
      @json_attributes ||= {}
      @json_attributes.merge! attributes
    end
  
    def set_json_header
      yield
      if !@json_attributes.blank?
        response.headers['X-JSON'] = @json_attributes.to_json
      end
    end
  end
end