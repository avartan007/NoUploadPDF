require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "action_controller/railtie"
require "action_view/railtie"
require "action_cable/engine"
require "rails/test_unit/railtie"

# Notice: ActiveRecord and ActiveStorage are intentionally omitted.
# NoUploadPDF never stores, logs, or persists user documents on the server.
Bundler.require(*Rails.groups)

require_relative "../app/middleware/no_upload_guard_middleware"

module NoUploadPdf
  class Application < Rails::Application
    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[assets tasks])
    config.middleware.insert_before 0, NoUploadPdf::NoUploadGuardMiddleware
    config.x.zero_upload_guaranteed = true
    config.x.tool_count = 28
  end
end
