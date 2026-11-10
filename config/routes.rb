Rails.application.routes.draw do
  root "pages#home"

  get "/studio",        to: "pages#home",    as: :studio
  get "/privacy-proof", to: "pages#home",    as: :privacy_proof
  get "/faq",           to: "pages#about",   as: :faq
  resources :tools, only: %i[index show], param: :id
  get "/scanner",       to: "scanner#index", as: :scanner_bridge
  get "/scan/:room_code", to: "scanner#phone", as: :scanner_phone
  get "/mac-pro",       to: "pages#pricing", as: :mac_pro
  get "/about",         to: "pages#about",   as: :about
  get "/privacy-verify", to: "pages#privacy_verify", as: :privacy_verify

  # High-intent organic search use-case landing pages
  get "/compress-pdf-to-200kb", to: "pages#home", defaults: { use_case: "compress_200kb" }
  get "/merge-pdf-for-visa",    to: "pages#home", defaults: { use_case: "merge_visa" }
  get "/redact-private-pdf",    to: "pages#home", defaults: { use_case: "redact_private" }

  mount ActionCable.server => "/cable"
  get "up" => "rails/health#show", as: :rails_health_check
end
