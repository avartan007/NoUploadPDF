class PagesController < ApplicationController
  def home
    @active_view = "home"
  end

  def compare
    @active_view = "compare"
    render :home
  end

  def pricing
    @active_view = "macapp"
  end

  def about
    @active_view = "about"
  end

  def privacy_verify
    render json: {
      app: "NoUploadPDF",
      framework: "Ruby on Rails 8.0 (Hotwire + Stimulus Client Engine)",
      server_storage_bytes: 0,
      active_record_enabled: false,
      active_storage_enabled: false,
      tool_count: ToolCatalog.count,
      policy: "All 28 PDF tools execute locally inside WebAssembly / Canvas / PDF-Lib memory."
    }
  end
end
