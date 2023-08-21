export interface Chain {
	id: number;
	chainId: string;
	name: string;
	rpcUrl?: string;
	paymasters?: Paymaster[];
	applications?: Application[];
}

export interface UserOperation {
	sender: string;
	nonce: string;
	initCode: string;
	callData: string;
	callGasLimit: string;
	verificationGasLimit: string;
	preVerificationGas: string;
	maxFeePerGas: string;
	maxPriorityFeePerGas: string;
	paymasterAndData: string;
	signature: string;
  }
export interface Paymaster {
	id: string;
	name: string;
	description: string;
	image?: string;
	type: string;
	published: boolean;
	applications?: Application[];
	createdAt: Date;
	PaymasterCriteria?: PaymasterCriteria[];
	owner?: User | null;
	ownerId: string | null;
	chain?: Chain;
	chainId: string;
	paymasterAddress:string;
	paymasterOffchainService:string;
}

export interface PaymasterCriteria {
	id: string;
	isMandatory: boolean;
	type: string;
	video: string | null;
	questionBook: any | null; // You can replace 'any' with a more specific type if needed
	nftCollection: string | null;
	identityProvider: string | null;
	paymaster?: Paymaster;
	paymasterId: string;
	createdAt: Date;
}

export interface Application {
	id: string;
	value: string;
	name: string;
	paymasters?: Paymaster[];
	registerer?: User | null;
	registererId: string | null;
	chain?: Chain;
	chainId: string;
}

export interface Account {
	id: string;
	userId: string;
	type: string;
	provider: string;
	providerAccountId: string;
	refresh_token: string | null;
	access_token: string | null;
	expires_at: number | null;
	token_type: string | null;
	scope: string | null;
	id_token: string | null;
	session_state: string | null;
	oauth_token_secret: string | null;
	oauth_token: string | null;
	user: User;
}

export interface Session {
	id: string;
	sessionToken: string;
	userId: string;
	expires: Date;
	user: User;
}

export interface User {
	id: string;
	name: string | null;
	email: string | null;
	emailVerified?: Date | null;
	image?: string | null;
	paymasters?: Paymaster[];
	accounts?: Account[];
	sessions?: Session[];
	applications?: Application[];
}