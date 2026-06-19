import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { socketURL } from "utils/Utilities";

const useSocket = () => {
  const socketRef = useRef();

  const url = socketURL;

  useEffect(() => {
    socketRef.current = io(url, {
      autoConnect: true,
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [url]);

  return socketRef.current;
};

export default useSocket;
