import React, {  createContext, useCallback, useContext, useRef, useState } from 'react';
import { Paymaster, PaymasterCriteria, UserOperation } from '../../model';
import { fetchAccessToken, fetchPaymasterAndData, submitChallengeResponse } from '../../api';
import Challenge from '../../components/Challenges';

interface SponsorGasContextProps {
  getPaymasterAndData: (_userOperation:UserOperation,_chainId:string, _sponsorGasPaymaster:Paymaster,_entryPointContractAddress:string) =>  Promise<string | null>
}

type SponsorGasProviderProps = {
  children: React.ReactNode;
};

export const SponsorGasContext = createContext<SponsorGasContextProps>({
  getPaymasterAndData: () => Promise.resolve(null), // Provide a default implementation
});


export function SponsorGasProvider({ children }: SponsorGasProviderProps) {
  const [challengeCriteria,setChallengeCriteria] = useState<PaymasterCriteria>()
  const [sponsorGasPaymaster, setSponsorGasPaymaster] = useState<Paymaster | null>(null);
  const [userOperation, setUserOperation] = useState<Partial<UserOperation> | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [entryPointContractAddress, setEntryPointContractAddress] = useState<string | null>(null);

  const [isChallengePending,setChallengePending] = useState(false)
  const [isOpen, setOpen] = useState(false);

  const paymasterAndDataPromiseResolver = useRef<(value: string | PromiseLike<string | null> | null) => void>()
  
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
  
  const handleSubmit = async (data:any) => {
    let submissionResult :any ;
    const paymasterId = sponsorGasPaymaster!.id
    const forUserOperation = userOperation
      if (challengeCriteria?.type === 'question_challenge'){
        if(data) {
          const challengeResponse = {data: { answer: data }};
          submissionResult = await submitChallengeResponse(paymasterId,'question',challengeResponse);
        }else{
          console.error('Please select an answer before submitting.');
        }
      } else if(challengeCriteria?.type === 'video_challenge') {
          submissionResult = await submitChallengeResponse(paymasterId,'video');
      }else if(challengeCriteria?.type === 'identity_challenge') {
        submissionResult = await submitChallengeResponse(paymasterId,'identity',{data});
      } else if(challengeCriteria?.type === 'nft_challenge') {
        submissionResult = await submitChallengeResponse(paymasterId,'nft');
      } 
      if(submissionResult)
        handleChallengeClose(submissionResult.AuthCode)
      else{
        console.log('Incorrect Response or failed to submit response')
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

  const handleModalClose = () => {
    let resolver = paymasterAndDataPromiseResolver.current
    if(resolver){
      resolver(null)
      paymasterAndDataPromiseResolver.current = undefined
    }
    setOpen(false)
  }

  const contextValue = {
    getPaymasterAndData
  };

  return (
    <SponsorGasContext.Provider value={contextValue}>
      {children}
      {challengeCriteria && <Challenge paymaster={sponsorGasPaymaster!} isOpen={isOpen} handleSubmit={handleSubmit} type={challengeCriteria.type} handleModalClose={handleModalClose} />}
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

