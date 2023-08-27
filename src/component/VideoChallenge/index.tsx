import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Paymaster } from '../../model';
import HorizontalLoading from '../HorizontalLoading';

const BASE_API_URL = process.env.NEXT_PUBLIC_SPONSOR_GAS_BACKEND

interface VideoChallengeProps{
  paymaster?:Paymaster
  handleSubmit: (data:any) => void
  isOpen:boolean
  setOpen:(isOpen:boolean) => void
  // value:{question:string,options:string[],answer:string}
}

// VideoChallenge.js
export default function VideoChallenge ({paymaster,handleSubmit,isOpen,setOpen}:VideoChallengeProps) {

  const [challengeData, setChallengeData] = useState<string | null >(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const fetchChallengeData = useCallback(async (challengeType: string, paymasterId: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/challenges/${challengeType}?paymasterId=${paymasterId}`,{
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data =  (await response.json()).data;
        console.log(data)
        return data;
      } else {
        console.error('Failed to fetch challenge data.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchChallengeData('video',paymaster?.id!);
      setChallengeData(data);
    };

    fetchData();
  }, [fetchChallengeData,paymaster]);
 
  const submitButtonRef = React.useRef<HTMLButtonElement| null>(null);

  const handleVideoEnded = () => {
    // Show the submit button when the video ends
    if(submitButtonRef.current)
      submitButtonRef.current.style.display = 'block';
  };

  const handleSubmitClick = () => {
    handleSubmit(selectedAnswer);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10"  onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              {challengeData === null 
                ?
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg lg:max-w-5xl">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                    <div className='flex flex-col items-center w-full '>
                        <HorizontalLoading />
                        <p>Waiting for challenge data</p>
                    </div>
                    </div>
                  </div>
                </Dialog.Panel>
                :
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg lg:max-w-5xl">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <h2 className='text-xl font-semibold'>Video Challenge</h2>
                    <div className="sm:flex sm:items-center sm:justify-center">
                      <div>
                        {challengeData && (
                          <video id="videoPlayer" controls 
                            controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
                            onEnded={handleVideoEnded}>
                          <source src={challengeData} type="video/mp4"/>
                          Your browser does not support the video tag.
                        </video>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={handleSubmitClick}
                      ref={submitButtonRef}
                      style={{ display: 'none' }}
                    >
                      Submit
                    </button>
                  </div>
                </Dialog.Panel>
              }
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
   
  );
};