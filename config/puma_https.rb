# Puma config used by bin/dev-https. Plain `bin/rails server` stays HTTP.
port = ENV.fetch("PORT", 3005).to_i
bind "ssl://0.0.0.0:#{port}?key=#{ENV.fetch('SSL_KEY')}&cert=#{ENV.fetch('SSL_CERT')}"
threads 1, 3
environment ENV.fetch("RAILS_ENV", "development")
