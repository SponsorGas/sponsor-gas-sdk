import React, {  createContext, useCallback, useContext, useRef, useState } from 'react';
import { Paymaster, PaymasterCriteria, UserOperation } from '../../model';
import QuestionChallenge from '../../component/QuestionChallenge';
import VideoChallenge from '../../component/VideoChallenge';
import NFTChallenge from '../../component/NFTChallenge';
import IdentityChallenge from '../../component/IdentityChallenge';


interface SponsorGasContextProps {
  getPaymasters:(chainId: string, applicationContractAddress: string) => Promise<Paymaster[]>
  getPaymasterAndData: (_userOperation:UserOperation,_chainId:string, _sponsorGasPaymaster:Paymaster,_entryPointContractAddress:string) =>  Promise<string | null>
}

type SponsorGasProviderProps = {
  children: React.ReactNode;
};

export const SponsorGasContext = createContext<SponsorGasContextProps>({
  getPaymasters:(chainId:string, applicationContractAddress:string) =>{ return Promise.resolve([]) },
  getPaymasterAndData: () => Promise.resolve(null), // Provide a default implementation
});

const BASE_API_URL = process.env.NEXT_PUBLIC_SPONSOR_GAS_BACKEND

export function SponsorGasProvider({ children }: SponsorGasProviderProps) {
  const [challengeCriteria,setChallengeCriteria] = useState<PaymasterCriteria>()
  const [sponsorGasPaymaster, setSponsorGasPaymaster] = useState<Paymaster | null>(null);
  const [userOperation, setUserOperation] = useState<Partial<UserOperation> | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [entryPointContractAddress, setEntryPointContractAddress] = useState<string | null>(null);

  const [isChallengePending,setChallengePending] = useState(false)
  const [isOpen, setOpen] = useState(false);

  const getRandomValue = (arr: { type: string; value: any; }[]) => arr[Math.floor(Math.random() * arr.length)];

  const paymasterAndDataPromiseResolver = useRef<(value: string | PromiseLike<string | null> | null) => void>()
  
  
  async function fetchAccessToken(paymaster: Paymaster, authCode: string) {
    const response = await fetch(`${BASE_API_URL}/paymasters/${paymaster.paymasterAddress}/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_code: authCode }),
        credentials: 'include',
    });

    if (response.ok) {
        return true
    } else {
        console.error('Failed to fetch access token');
        return false;
    }
  }

  async function fetchPaymasterAndData(paymaster: Paymaster, _userOperation: Partial<UserOperation>, _chain: string, _entryPointContractAddress: string): Promise<string | null> {
    const url = `${BASE_API_URL}/paymasters/${paymaster.paymasterAddress}/paymasterAndData`;
    const headers = {
        'Content-Type': 'application/json',
    };
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            _userOperation,
            'entryPoint': _entryPointContractAddress,
            'chainId': _chain,
        }),
        credentials: 'include',
    });

    if (response.ok) {
        const responseData = await response.json();
        console.log(`fetchPaymasterAndData : ${responseData.userOperation}`)
        return responseData.userOperation.paymasterAndData;
    } else {
        console.error(`paymasterAndData response: ${response.status}`);
        return null;
    }
  }

  const handleChallengeClose = async (authCode: string) => {
    if (sponsorGasPaymaster && userOperation && chainId && entryPointContractAddress) {
      const accessToken = await fetchAccessToken(sponsorGasPaymaster, authCode);

      if (accessToken) {
        const paymasterAndData = await fetchPaymasterAndData(
          sponsorGasPaymaster,
          userOperation,
          chainId,
          entryPointContractAddress
        );
        setChallengePending(false);
        console.log(`handleChallengeClose `)
          console.log(`paymasterAndDataResolver is ${paymasterAndDataPromiseResolver.current}`)
          if(paymasterAndDataPromiseResolver.current){
            let resolver = paymasterAndDataPromiseResolver.current
            console.log(resolver)
            resolver(paymasterAndData)
            paymasterAndDataPromiseResolver.current = undefined
            setOpen(false)
          }else{
              paymasterAndDataPromiseResolver.current = undefined
              setOpen(false)
            }
        } else {
        console.error('Failed Getting Access Code');
        setChallengePending(false);
        if(paymasterAndDataPromiseResolver.current){
          let resolver = paymasterAndDataPromiseResolver.current
          console.log(resolver)
          resolver(null)
          paymasterAndDataPromiseResolver.current = undefined
          setOpen(false)
        }
      }
    }
  };

  const submitChallengeResponse = async (challengeType: string, challengeResponse?: any) => {
    try {
      const response = await fetch(`${BASE_API_URL}/challenges/${challengeType}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:  challengeResponse && JSON.stringify(challengeResponse),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Challenge submission failed.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return null;
    }
  };

  const handleSubmit = async (data:any) => {
    let submissionResult :any ;
    try {
      if (challengeCriteria?.type === 'question_challenge'){
        if(data) {
          const challengeResponse = { answer: data };
          submissionResult = await submitChallengeResponse('question',challengeResponse);
        }else{
          console.error('Please select an answer before submitting.');
        }
      } else if(challengeCriteria?.type === 'video_challenge') {
          submissionResult = await submitChallengeResponse('video');
      }else if(challengeCriteria?.type === 'identity_challenge') {
        submissionResult = await submitChallengeResponse('identity',data);
      } else if(challengeCriteria?.type === 'nft_challenge') {
        submissionResult = await submitChallengeResponse('nft');
      } 
      if(submissionResult)
        handleChallengeClose(submissionResult.AuthCode)
      else{
        console.log('Incorrect Response or failed to submit response')
      }
    } catch (error) {
      console.error('Failed to submit challenge:', error);
    }
  };

  const getPaymasterAndData = useCallback((_userOperation: Partial<UserOperation>,_chainId:string, _sponsorGasPaymaster:Paymaster,_entryPointContractAddress: string): Promise<string | null> => {
    console.log(`SPOSNORGAS_PROVIDER: getPaymasterAndData`)
    console.log(`paymaster : ${_sponsorGasPaymaster}`)
    const paymasterAndDataPromise = new Promise<string | null>((resolve) => {
      const paymasterCriterias =  _sponsorGasPaymaster.PaymasterCriteria
      if(paymasterCriterias && paymasterCriterias[0]){

        const randomCriteria = paymasterCriterias[0];
        // Store the resolver function in state
        setChallengeCriteria(randomCriteria)
        paymasterAndDataPromiseResolver.current = paymasterAndDataPromiseResolver.current ?? resolve
        setSponsorGasPaymaster(_sponsorGasPaymaster);
        setUserOperation(_userOperation);
        setChainId(_chainId);
        setEntryPointContractAddress(_entryPointContractAddress);

        setOpen(true); // Open the modal
      }else{
        console.log('no criteria')
      }

    }).then(value =>{
      console.log(value)
      return value;
    } )
    return paymasterAndDataPromise;
  },[])

  const getPaymasters = useCallback(async (chainId:string,applicationContractAddress:string): Promise<Paymaster[]> => {
    const response = await fetch(`${BASE_API_URL}/chains/${chainId}/applications/${applicationContractAddress}/paymasters`)
    if(response.ok){
        const responseJson  =  await response.json()
        return responseJson.paymasters;
    }
    return []
  },[])

  const contextValue = {
    getPaymasters,
    getPaymasterAndData
  };

  return (
    <SponsorGasContext.Provider value={contextValue}>
      {children}
      { (challengeCriteria && challengeCriteria.type === 'question_challenge') && <QuestionChallenge paymaster={sponsorGasPaymaster!} isOpen={isOpen} handleSubmit={handleSubmit} />}
      { (challengeCriteria && challengeCriteria.type === 'video_challenge') && <VideoChallenge paymaster={sponsorGasPaymaster!} isOpen={isOpen} handleSubmit={handleSubmit} setOpen={setOpen} />}
      { (challengeCriteria && challengeCriteria.type === 'nft_challenge') && <NFTChallenge paymaster={sponsorGasPaymaster!} isOpen={isOpen} handleSubmit={handleSubmit} />}
      { (challengeCriteria && challengeCriteria.type === 'identity_challenge') && <IdentityChallenge paymaster={sponsorGasPaymaster!} isOpen={isOpen} handleSubmit={handleSubmit} />}
    </SponsorGasContext.Provider>

  );
}

export const useSponsorGas = () => {
  const context = useContext(SponsorGasContext);
  if (!context) {
    throw new Error('useSponsorGas must be used within a SponsorGasProvider');
  }
  return context;
};

