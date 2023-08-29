import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { Paymaster } from '../../../model';
import { CredentialType, IDKitWidget, ISuccessResult } from '@worldcoin/idkit';

const BASE_API_URL = process.env.NEXT_PUBLIC_SPONSOR_GAS_BACKEND

interface IdentityChallengeProps{
  identityPayload:any
  handleSubmit:(data:any) => Promise<void>;
}

// IdentityChallenge.js
export default function IdentityChallenge ({identityPayload,handleSubmit}:IdentityChallengeProps) {
  
  const onSuccess = ()=>{
    console.log("onSuccess")
  }
  const handleVerify = async(data:ISuccessResult)=>{
      console.log(data)
      const challengeSubmitData = {
        identity_provider : 'worldcoin',
        worldcoin_data : data
      }
      await handleSubmit(challengeSubmitData)
  }

  return (
    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
      <h2 className='text-xl font-semibold'>Identity Challenge</h2>
      <div className="sm:flex sm:items-start">
        <div>
          {identityPayload && (
            <div>
              <h1>Sybil Resistant Identity!</h1>
              <p>Prove you are a human via Worldcoin.</p>
              <IDKitWidget
                app_id={identityPayload.app_id} // obtained from the Developer Portal
                action={identityPayload.action} // this is your action name from the Developer Portal
                onSuccess={onSuccess} // callback when the modal is closed
                handleVerify={handleVerify} // optional callback when the proof is received
                credential_types={identityPayload.credential_types} // optional, defaults to ['orb']
                enableTelemetry // optional, defaults to false
              >
                {({ open }) => <button onClick={open}>Verify with World ID</button>}
              </IDKitWidget>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};