import React from "react";
import { useParams } from "react-router-dom";
import ChannelContent from "./ChannelContent";

export default function ChannelContentPage() {
  const { id } = useParams();
  console.log("ChannelContentPage - channel id:", id);
  return <ChannelContent channelId={Number(id)} />;
}
