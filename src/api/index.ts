import { Paymaster, UserOperation } from "../model";

const BASE_API_URL = process.env.SPONSOR_GAS_BACKEND || process.env.REACT_APP_SPONSOR_GAS_BACKEND || process.env.NEXT_PUBLIC_SPONSOR_GAS_BACKEND

export async function fetchAccessToken(paymaster: Paymaster, authCode: string) {
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

export async function fetchPaymasterAndData(paymaster: Paymaster, _userOperation: Partial<UserOperation>, _chain: string, _entryPointContractAddress: string): Promise<string | null> {
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

export const fetchChallengeData = async (challengeType: string, paymasterId: string) => {
  try {
    const response = await fetch(`${BASE_API_URL}/challenges/${challengeType}?paymasterId=${paymasterId}`,{
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (response.ok) {
      const data =  JSON.parse((await response.json()).data);
      console.log(data)
      return data;
    } else {
      console.error('Failed to fetch challenge data.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

export const submitChallengeResponse = async (paymasterId:string,challengeType: string, challengeResponse?: any) => {
  try {
    const response = await fetch(`${BASE_API_URL}/challenges/${challengeType}/submit?paymasterId=${paymasterId}`, {
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

export const getPaymasters = async (chainId:string,applicationContractAddress:string): Promise<Paymaster[]> => {
  const response = await fetch(`${BASE_API_URL}/chains/${chainId}/applications/${applicationContractAddress}/paymasters`)
  if(response.ok){
      const responseJson  =  await response.json()
      return responseJson.paymasters;
  }
  return []
}
