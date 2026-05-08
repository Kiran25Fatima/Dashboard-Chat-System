"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar({ onSelectUser }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("")

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()

      const userId = userData.user?.id

      if (!userId) return

      setCurrentUserId(userId)

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", userId)

      if (data) setUsers(data)
    }

    init()
  }, [])

  return (
    <div className="w-80  p-4 bg-white">

      <h2 className="font-semibold text-lg mb-4">
        Chats
      </h2>

      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-sm text-gray-400">
            No users found
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-orange-400 text-white flex items-center justify-center text-sm">
  {user.full_name?.charAt(0)}
</div>

              <span className="text-sm font-medium">
                {user.full_name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}