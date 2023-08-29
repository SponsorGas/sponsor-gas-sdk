import React, { useEffect } from 'react';

const BASE_API_URL = process.env.NEXT_PUBLIC_SPONSOR_GAS_BACKEND

interface NFTChallengeProps{
  handleSubmit: (data:any) => Promise<void>
}

// NFTChallenge.js
export default function NFTChallenge ({handleSubmit}:NFTChallengeProps) {

  useEffect(() => {
    handleSubmit('verifyNFT')
  },[])

  return (
    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
      <h2 className='text-xl font-semibold'>NFT Challenge</h2>
      <div className="sm:flex sm:items-start">
        <div>
          <p>Verifying the NFT ownership... </p>
        </div>
      </div>
    </div>
  );
};