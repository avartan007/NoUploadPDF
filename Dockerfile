FROM ruby:3.3-slim
WORKDIR /app
COPY Gemfile ./
RUN bundle install
COPY . .
EXPOSE 3000
ENV RAILS_ENV=development
CMD ["./bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
