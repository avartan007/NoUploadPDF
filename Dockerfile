# syntax=docker/dockerfile:1
FROM ruby:3.3-slim

WORKDIR /app

# Install build dependencies required for native gem extensions (bigdecimal, racc, nio4r, json, etc.)
RUN apt-get update -qq &&     apt-get install --no-install-recommends -y       build-essential       pkg-config       git &&     rm -rf /var/lib/apt/lists/*

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000
ENV RAILS_ENV=production
CMD ["./bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
