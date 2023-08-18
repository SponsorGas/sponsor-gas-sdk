import { Paymaster, UserOperation } from "./model";
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';
import { BASE_API_URL } from "./configuration";

class SponsorGas {
    private challengeWindow: Window | null;
    private isChallengePending: boolean;
    
    constructor() {
        this.challengeWindow = null;
        this.isChallengePending = false;
    }
		private checkIfNFTCriteria(paymaster:Paymaster) {
			return paymaster.PaymasterCriteria?.some(pc => pc.type === 'nft_challenge') ?? false;
		}

    private async fetchAccessToken(paymaster: Paymaster, authCode: string) {
        try {
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
        } catch (error) {
            console.error('An error occurred while fetching access token:', error);
            return false;
        }
				return false
    }

    private async fetchPaymasterAndData(paymaster: Paymaster, _userOperation: Partial<UserOperation>, _chain: string, _entryPointContractAddress: string): Promise<string | null> {
        const url = `${BASE_API_URL}/paymasters/${paymaster.paymasterAddress}/paymasterAndData`;
        const headers = {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${accessToken}`,
        };

        try {
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
                return responseData.userOperation.paymasterAndData;
            } else {
                console.error(`paymasterAndData response: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error('An error occurred while fetching paymaster and data:', error);
            return null;
        }
    }

    private async handleChallengeSubmission(paymaster: Paymaster, _userOperation: Partial<UserOperation>, _chain: string, _entryPointContractAddress: string): Promise<string | null> {
        const paymasterId = paymaster.id;
        const scopeId = this.calculateScopeId(_userOperation.sender!, _userOperation.initCode!, _userOperation.callData!, _chain, _entryPointContractAddress);
        const redirect_url = `${window.location.href}`;

        try {
            const response = await fetch(`${paymaster.paymasterOffchainService}/challenges/nft/submit?paymasterId=${paymasterId}&scope=${scopeId}&redirect_url=${redirect_url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userOperation: _userOperation }),
            });

            console.log(response);

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                const authCode = data.AuthCode;

                const accessToken = await this.fetchAccessToken(paymaster, authCode);
                if (accessToken) {
                    const paymasterAndData = await this.fetchPaymasterAndData(paymaster,  _userOperation, _chain, _entryPointContractAddress);
                    return paymasterAndData;
                } else {
                    console.error('Failed Getting Access Code');
                    return null;
                }
            } else {
                console.error('Challenge submission failed.');
                return null;
            }
        } catch (e) {
            console.error('An error occurred:', e);
            return null;
        }
    }

    private calculateScopeId(sender: string, initCode: string, callData: string, chain: string, entryPointContractAddress: string): string {
        const enc = defaultAbiCoder.encode(['address', 'bytes', 'bytes', 'uint', 'address'], [sender, initCode, callData, chain, entryPointContractAddress]);
        return keccak256(enc);
    }

    private async waitForChallengeWindowToClose() {
        const checkWindowClosed = setInterval(() => {
            if (this.challengeWindow && this.challengeWindow.closed) {
                clearInterval(checkWindowClosed);
                this.isChallengePending = false;
                this.challengeWindow = null;
            }
        }, 1000);
    }

    private async openChallengeWindow(url: string | URL | undefined) {
        this.challengeWindow = window.open(url, '_blank');
        await this.waitForChallengeWindowToClose();
    }

    async getPaymasters (chainId:string,applicationContractAddress:string): Promise<Paymaster[]> {
        const response = await fetch(`${BASE_API_URL}/chains/${chainId}/applications/${applicationContractAddress}/paymasters`)
        if(response.ok){
            const responseJson  =  await response.json()
            return responseJson.paymasters;
        }
        return []
    }

    async getPaymasterAndData(paymaster: Paymaster, _userOperation: Partial<UserOperation>, _chain: string, _entryPointContractAddress: string): Promise<string | null> {
        this.isChallengePending = true;
    
        const scopeId = this.calculateScopeId(_userOperation.sender!, _userOperation.initCode!, _userOperation.callData!, _chain, _entryPointContractAddress);
        const redirect_url = `${window.location.href}`;
        const paymasterId = paymaster.id;

        const isNFTCriteria: boolean = this.checkIfNFTCriteria(paymaster);
        console.log(`isNFTCriteria : ${isNFTCriteria}`);
        console.log(paymaster);

        if (!isNFTCriteria) {
            const newChallengeWindow = window.open(`${paymaster.paymasterOffchainService}?paymasterId=${paymasterId}&scope=${scopeId}&redirect_url=${redirect_url}`, '_blank');
            this.challengeWindow = newChallengeWindow;
            
            const paymasterAndDataPromise = new Promise<string | null>((resolve) => {
                const handleMessage = async (event: MessageEvent) => {
                    if (event.origin === 'http://localhost:8001' && event.data.target === 'sponsor-gas') {
                        const newData = event.data;
                        try {
                            const accessToken = await this.fetchAccessToken(paymaster, newData.data.AuthCode);
                            if (accessToken) {
                                const paymasterAndData = await this.fetchPaymasterAndData(paymaster,  _userOperation, _chain, _entryPointContractAddress);
                                this.isChallengePending = false;
                                resolve(paymasterAndData);
                            } else {
                                console.error('Failed Getting Access Code');
                                resolve(null);
                            }
                        } catch (error) {
                            console.error('An error occurred:', error);
                            resolve(null);
                        } finally {
                            this.isChallengePending = false;
                        }
                    }
                };

                window.addEventListener('message', handleMessage);
                this.waitForChallengeWindowToClose();
            });

            return paymasterAndDataPromise;
        } else {
            const paymasterAndData = await this.handleChallengeSubmission(paymaster, _userOperation, _chain, _entryPointContractAddress);
            this.isChallengePending = false;
            return paymasterAndData;
        }
    }
}

export default SponsorGas;
