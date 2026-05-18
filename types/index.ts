export interface UserProfile {
  id: string;
  full_name?: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  updated_at?: string;
  partner?: UserProfile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status?: "sent" | "delivered" | "seen";
  is_read?: boolean;
  created_at?: string;
}
