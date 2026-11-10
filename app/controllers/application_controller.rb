class ApplicationController < ActionController::Base
  before_action :set_catalog_globals

  private

  def set_catalog_globals
    @tools = ToolCatalog.all
    @categories = ToolCatalog::CATEGORIES
    @tool_count = ToolCatalog.count
  end
end
