import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import VideoUploadForm from "./VideoUploadForm";

export default async function UploadPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#1a1a1a]">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            Upload Video
          </h1>
          <div className="bg-[#2a2a2a] rounded-lg border border-[#333] p-6">
            <VideoUploadForm />
          </div>
        </div>
      </main>
    </div>
  );
} 