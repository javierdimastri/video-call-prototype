// src/components/Header.js
import Image from "next/image";
import VideoIcon from "../../public/assets/video-call-icon.svg"; // Adjust the path as needed
import { roboto } from "@/ui/fonts";

export default function Header() {
  return (
    <div className={`w-full absolute top-0 left-0 flex items-center p-4 pl-11 bg-customBlue ${roboto.className}`}>
      <Image src={VideoIcon} alt="Video Call Icon" className="h-10 w-10 mr-2" />
      <h1 className=" text-2xl font-bold pl-4">Video Call Dashboard</h1>
    </div>
  );
}
