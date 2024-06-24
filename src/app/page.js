import { roboto } from '@/ui/fonts'; // Using the alias
import JoinRoom from "@/components/JoinRoom";
import Header from "@/components/Header";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 dashboard-background">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center w-full">
          <Header />
          <h1 className={`text-4xl mb-2 ${roboto.className}`}>Welcome to the Video Call Dashboard</h1>
          <p className={`${roboto.className} text-lg mb-6`}>Start or join a video call with ease</p>
          <JoinRoom />
        </div>
      </div>
    </main>
  );
}
