import React, { useState } from 'react';

interface VideoChallengeProps{
  videoUrl:string
  handleSubmit:(data:any) => Promise<void>
}

// VideoChallenge.js
export default function VideoChallenge ({videoUrl,handleSubmit}:VideoChallengeProps) {

  const [displaySubmitButton, setDisplaySubmitButton] = useState(false);

  const handleVideoEnded = () => {
    setDisplaySubmitButton(true);
  };

  return (
   <>
   <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
      <h2 className='text-xl font-semibold'>Video Challenge</h2>
      <div className="sm:flex sm:items-center  sm:justify-center">
      <div className=''>
          {videoUrl && (
            <video id="videoPlayer" controls 
                controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
                onEnded={handleVideoEnded}>
              <source src={videoUrl} type="video/mp4"/>
              Your browser does not support the video tag.
            </video>
            )}
        </div>
      </div>
    </div>
    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
      {displaySubmitButton && (
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
          onClick={async () => await handleSubmit('completed')}
        >
          Submit
        </button>
      )}
    </div>
   </> 
  );
};