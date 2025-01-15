'use client'

export default function VideoChat() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 flex">
        {/* Local video */}
        <div className="w-1/2 p-4">
          <div className="relative h-full">
            {/* Video element will go here */}
            <div className="absolute bottom-4 left-4 space-x-2">
              <button className="bg-gray-200 p-2 rounded-full">Mute</button>
              <button className="bg-gray-200 p-2 rounded-full">Stop Video</button>
              <button className="bg-blue-500 text-white p-2 rounded-full">Next Person</button>
            </div>
          </div>
        </div>
        
        {/* Partner video */}
        <div className="w-1/2 p-4">
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Waiting for partner...</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex justify-center space-x-4">
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg">NEXT PERSON</button>
        <button className="bg-red-500 text-white px-6 py-2 rounded-lg">LEAVE CHAT</button>
      </div>
    </div>
  )
} 