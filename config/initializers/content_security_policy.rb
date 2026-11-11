Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src     :self
    policy.font_src        :self, :https, :data, "https://fonts.gstatic.com"
    policy.img_src         :self, :data, :blob
    policy.media_src       :self, :blob
    policy.object_src      :none
    policy.base_uri        :self
    policy.frame_ancestors :none
    policy.form_action     :self
    policy.script_src      :self, :unsafe_inline, "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://unpkg.com"
    policy.style_src       :self, :unsafe_inline, "https://fonts.googleapis.com"
    policy.worker_src      :self, :blob, "https://cdnjs.cloudflare.com"
    # Connect-src restricted to same-origin socket & disclosed WebRTC PeerJS signaling host only; zero external cloud uploads
    policy.connect_src     :self, :ws, :wss, "https://*.peerjs.com", "wss://*.peerjs.com"
  end
end
