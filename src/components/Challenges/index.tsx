import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { Paymaster } from '../../model';
import HorizontalLoading from '../HorizontalLoading';
import { fetchChallengeData } from '../../api';
import QuestionChallenge from './QuestionChallenge';
import VideoChallenge from './VideoChallenge';
import IdentityChallenge from './IdentityChallenge';
import NFTChallenge from './NFTChallenge';


interface ChallengeProps{
  type:string
  paymaster?:Paymaster
  handleSubmit: (data:any) => Promise<void>
  isOpen:boolean
  handleModalClose:() => void
}

// Challenge.js
export default function Challenge ({type,handleModalClose,paymaster,handleSubmit,isOpen}:ChallengeProps) {

  const [challengeData, setChallengeData] = useState<any>();

  useEffect(() => {
    const fetchData = async (paymasterCriteriaType:string) => {
      let _type: string = '';
      if (paymasterCriteriaType === 'question_challenge') {
        _type = 'question';
      } else if (paymasterCriteriaType === 'video_challenge') {
        _type = 'video';
      } else if (paymasterCriteriaType === 'nft_challenge') {
        _type = 'nft';
      } else if (paymasterCriteriaType === 'identity_challenge') {
        _type = 'identity';
      }

      const data = await fetchChallengeData(_type,paymaster?.id!);
      console.log(data);
      setChallengeData(data);
    };

    fetchData(type);
  }, [fetchChallengeData,paymaster,type]);
 
  return (
    <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10"  onClose={() => handleModalClose()}>
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
                ?<Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg lg:max-w-5xl">
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
                  
                  {challengeData && (
                    type == 'question_challenge' && (<QuestionChallenge question={challengeData.question} options={challengeData.options} handleSubmit={handleSubmit} />)
                  )}
                  {challengeData && (
                    type == 'video_challenge' && (<VideoChallenge videoUrl={challengeData.videoUrl} handleSubmit={handleSubmit} />)
                  )}
                  {challengeData && (
                    type == 'identity_challenge' && (<IdentityChallenge identityPayload={challengeData}  handleSubmit={handleSubmit} />)
                  )}
                  {challengeData && (
                    type == 'nft_challenge' && (<NFTChallenge  handleSubmit={handleSubmit} />)
                  )}
                </Dialog.Panel>}
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
   
  );
};