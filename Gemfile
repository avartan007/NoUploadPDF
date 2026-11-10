source "https://rubygems.org"

ruby ">= 3.2.0"

# Lightweight Ruby on Rails 8.0 stack — Zero database/disk file persistence by design
gem "rails", "~> 8.0.0"
gem "propshaft"
gem "puma", ">= 6.4"
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "jbuilder"
# Rails 8.0 still passes the `quirks_mode` keyword to the JSON generator,
# which json 3.x removed. Keep the 2.x line until the app moves to Rails 8.1+.
gem "json", ">= 2.3", "< 3.0"

group :development, :test do
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
end
