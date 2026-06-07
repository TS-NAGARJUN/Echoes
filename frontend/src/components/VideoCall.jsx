import { useParams } from "react-router-dom";
import { JitsiMeeting } from "@jitsi/react-sdk";

export default function VideoCall() {
  const { roomId } = useParams();

  return (
    <div style={{ height: "100vh" }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomId}
        getIFrameRef={(iframe) => {
          iframe.style.height = "100vh";
          iframe.style.width = "100%";
        }}
      />
    </div>
  );
}