"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar({ onSelectUser }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [onlineMap, setOnlineMap] = useState<any>({});

  const loadUsers = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData.user?.id;

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .neq("id", currentUserId);

    if (data) setUsers(data);
  };

  useEffect(() => {
    loadUsers();

    const channel = supabase.channel("online-users");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();

        const onlineUsers: any = {};

        Object.keys(state).forEach((key) => {
          state[key].forEach((p: any) => {
            onlineUsers[p.user_id] = true;
          });
        });

        setOnlineMap(onlineUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data } = await supabase.auth.getUser();

          if (data.user) {
            await channel.track({
              user_id: data.user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {users.map((user) => {
          const isOnline = onlineMap[user.id];

          return (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium">
                  {user.full_name?.charAt(0)}
                </div>

                <div>
                  <div className="text-sm font-medium">{user.full_name}</div>

                  <div className="text-xs">
                    {isOnline ? (
                      <span className="text-green-600 font-medium">
                        online
                      </span>
                    ) : (
                      <span className="text-gray-400">offline</span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}