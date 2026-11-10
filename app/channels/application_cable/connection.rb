module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :peer_session_id

    def connect
      self.peer_session_id = SecureRandom.uuid
    end
  end
end
