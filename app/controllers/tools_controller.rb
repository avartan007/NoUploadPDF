class ToolsController < ApplicationController
  def index
    @category = params[:category] || "All"
    @filtered_tools = ToolCatalog.by_category(@category)
    @active_view = "home"
    render "pages/home"
  end

  def show
    @current_tool = ToolCatalog.find(params[:id])
    @active_view = "tool"
    render "pages/home"
  end
end
