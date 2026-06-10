"use client";

import { useRef, useState } from "react";

const MAX_DURATION_S = 120;

function getSupportedMimeType() {
  const types = ["audio/webm", "audio/mp4", "audio/ogg"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export default function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0); 
  const discardRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    // Guard: don't start if already recording
    if (mediaRecorderRef.current?.state === "recording") return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // User denied mic permission or no device available
      return;
    }

    streamRef.current = stream;

    const mimeType = getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    durationRef.current = 0;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
  stopStream();
  mediaRecorderRef.current = null;

  //  discard path
  if (discardRef.current) {
    discardRef.current = false;
    chunksRef.current = [];
    setAudioBlob(null);
    return;
  }

  //  normal save path
  const blob = new Blob(chunksRef.current, {
    type: mimeType || "audio/webm",
  });

  setAudioBlob(blob);
  setDuration(durationRef.current);
};

    mediaRecorder.start();
    setDuration(0);
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      if (!mediaRecorderRef.current) return
      durationRef.current += 1;
      setDuration(durationRef.current);

      if (durationRef.current >= MAX_DURATION_S) {
        stopRecording();
      }
    }, 1000);
  };

  const stopRecording = () => {
    clearTimer();
    // Only call stop() if recorder is actively recording
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop(); // triggers onstop → sets blob
    }
    setIsRecording(false);
  };

  // Discards in-progress recording without saving the blob
 const abortRecording = () => {
  discardRef.current = true;

  clearTimer();
  stopStream();

  if (mediaRecorderRef.current?.state === "recording") {
    mediaRecorderRef.current.stop();
  }

  mediaRecorderRef.current = null;
  chunksRef.current = [];
  durationRef.current = 0;

  setIsRecording(false);
  setDuration(0);
};

  const resetRecording = () => {
    setAudioBlob(null);
    setDuration(0);
    durationRef.current = 0;
  };

  return {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    abortRecording, // use this for the discard (×) button while recording
    resetRecording, // use this for the trash button on the preview
  };
}