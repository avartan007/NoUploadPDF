module ApplicationHelper
  def tool_count_badge
    "#{ToolCatalog.count} Local Tools"
  end
end
