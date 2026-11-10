Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :https, :data, "https://fonts.gstatic.com"
    policy.img_src     :self, :data, :blob
    policy.object_src  :none
    policy.script_src  :self, :unsafe_inline, "https://cdnjs.cloudflare.com"
    policy.style_src   :self, :unsafe_inline, "https://fonts.googleapis.com"
    policy.worker_src  :self, :blob
    # Connect-src is restricted to same-origin ActionCable LAN socket only; zero external cloud uploads
    policy.connect_src :self, :ws, :wss
  end
end
