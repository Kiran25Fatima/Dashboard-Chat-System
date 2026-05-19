"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const PRESENCE_CHANNEL = "online-users";

type OnlineMap = Record<string, true>;
type LastSeenMap = Record<string, string | null>;

type Listener = (state: OnlineMap) => void;

let presenceChannel: any = null;
let currentUserId: string | null = null;
let onlineMap: OnlineMap = {};
let listeners = new Set<Listener>();

const buildOnlineMap = () => {
  const state = presenceChannel?.presenceState();
  const map: OnlineMap = {};

  if (!state) return map;

  Object.values(state)
    .flat()
    .forEach((presence: any) => {
      if (presence?.user_id) {
        map[presence.user_id] = true;
      }
    });

  return map;
};

const emitOnlineMap = () => {
  listeners.forEach((listener) => listener(onlineMap));
};

const updatePresenceState = () => {
  onlineMap = buildOnlineMap();
  emitOnlineMap();
};

const updateLastSeen = async (userId: string) => {
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", userId);
};

const stopPresence = () => {
  if (presenceChannel) {
    supabase.removeChannel(presenceChannel);
    presenceChannel = null;
  }

  onlineMap = {};
  currentUserId = null;
  emitOnlineMap();
};

const startPresence = async (userId: string) => {
  if (!userId || presenceChannel) return;

  currentUserId = userId;

  presenceChannel = supabase.channel(PRESENCE_CHANNEL);

  presenceChannel.on("presence", { event: "sync" }, () => {
    updatePresenceState();
  });

  presenceChannel.on("presence", { event: "leave" }, () => {
    updateLastSeen(userId);
    updatePresenceState();
  });

  await presenceChannel.subscribe(async (status: string) => {
    if (status === "SUBSCRIBED") {
      await presenceChannel.track({ user_id: userId, online_at: new Date().toISOString() });
      updatePresenceState();
    }
  });
};

const subscribeToPresence = (userId: string | null, listener: Listener) => {
  listeners.add(listener);
  listener(onlineMap);

  if (userId) {
    if (!presenceChannel || currentUserId !== userId) {
      stopPresence();
      startPresence(userId).catch(() => {
        /* ignore startup errors */
      });
    }
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      stopPresence();
    }
  };
};

const fetchLastSeenForIds = async (ids: string[]) => {
  if (ids.length === 0) return {} as LastSeenMap;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, last_seen")
    .in("id", ids.length > 0 ? ids : [""]);

  if (!profileData) return {} as LastSeenMap;

  return Object.fromEntries(
    profileData.map((profile: any) => [profile.id, profile.last_seen || null])
  ) as LastSeenMap;
};

export default function usePresence(user: any, watchIds: string[] = []) {
  const [state, setState] = useState<OnlineMap>(onlineMap);
  const [lastSeenMap, setLastSeenMap] = useState<LastSeenMap>({});
  const watchedIds = Array.from(new Set((watchIds || []).filter(Boolean)));
  const watchedIdsKey = JSON.stringify(watchedIds);
  const prevOnlineMapRef = useRef<OnlineMap>({});

  useEffect(() => {
    const unsubscribe = subscribeToPresence(user?.id ?? null, setState);
    return unsubscribe;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || watchedIds.length === 0) {
      setLastSeenMap({});
      return;
    }

    let active = true;

    const load = async () => {
      const data = await fetchLastSeenForIds(watchedIds);
      if (!active) return;
      setLastSeenMap(data);
    };

    load();

    return () => {
      active = false;
    };
  }, [user?.id, watchedIdsKey]);

  useEffect(() => {
    if (watchedIds.length === 0) {
      prevOnlineMapRef.current = state;
      return;
    }

    const wentOfflineIds = watchedIds.filter(
      (id) => prevOnlineMapRef.current[id] && !state[id]
    );

    prevOnlineMapRef.current = state;

    if (wentOfflineIds.length === 0) return;

    let active = true;

    const load = async () => {
      const data = await fetchLastSeenForIds(wentOfflineIds);
      if (!active) return;
      setLastSeenMap((prev) => ({ ...prev, ...data }));
    };

    load();

    return () => {
      active = false;
    };
  }, [state, watchedIdsKey]);

  return { onlineMap: state, lastSeenMap };
}
