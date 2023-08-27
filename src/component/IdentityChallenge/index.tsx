import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Paymaster } from '../../model';
import { CredentialType, IDKitWidget, ISuccessResult } from '@worldcoin/idkit';

const BASE_API_URL = process.env.NEXT_PUBLIC_SPONSOR_GAS_BACKEND

interface IdentityChallengeProps{
  paymaster?:Paymaster
  handleSubmit: (data:any) => void
  isOpen:boolean
}

// IdentityChallenge.js
export default function IdentityChallenge ({paymaster,handleSubmit,isOpen}:IdentityChallengeProps) {

  const [challengeData, setChallengeData] = useState<{app_id:string,identity_provider:string,action:string,credential_types:CredentialType[]} | null >(null);
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
      const data = await fetchChallengeData('identity',paymaster?.id!);
      setChallengeData(data);
    };

    fetchData();
  }, [fetchChallengeData,paymaster]);


  const onSuccess = ()=>{
    console.log("onSuccess")
  }


  const handleVerify = async(data:ISuccessResult)=>{
      console.log(data)
      const challengeSubmitData = {
        identity_provider : 'worldcoin',
        worldcoin_data : data
      }
      handleSubmit(challengeSubmitData)
  }

  return (
      <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10"  onClose={() => {}}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg lg:max-w-5xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h2 className='text-xl font-semibold'>Question Challenge</h2>
                  <div className="sm:flex sm:items-start">
                    <div>
                      {challengeData && (
                        <div>
                          <h1>Sybil Resistant Identity!</h1>
                          <p>Prove you are a human via Worldcoin.</p>
                          <IDKitWidget
                            app_id={challengeData.app_id} // obtained from the Developer Portal
                            action={challengeData.action} // this is your action name from the Developer Portal
                            onSuccess={onSuccess} // callback when the modal is closed
                            handleVerify={handleVerify} // optional callback when the proof is received
                            credential_types={challengeData.credential_types} // optional, defaults to ['orb']
                            enableTelemetry // optional, defaults to false
                          >
                            {({ open }) => <button onClick={open}>Verify with World ID</button>}
                          </IDKitWidget>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                  >
                    Submit
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
   
   
  );
};