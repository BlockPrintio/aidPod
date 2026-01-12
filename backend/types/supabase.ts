export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            Hospital: {
                Row: {
                    id: number
                    name: string
                    email: string
                    licenseNumber: string
                    verificationDoc: string | null
                    walletAddress: string | null
                    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
                    nftMinted: boolean
                    nftTokenId: string | null
                    nftMintedAt: string | null
                    createdAt: string
                    updatedAt: string
                }
                Insert: {
                    id?: number
                    name: string
                    email: string
                    licenseNumber: string
                    verificationDoc?: string | null
                    walletAddress?: string | null
                    status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
                    nftMinted?: boolean
                    nftTokenId?: string | null
                    nftMintedAt?: string | null
                    createdAt?: string
                    updatedAt?: string
                }
                Update: {
                    id?: number
                    name?: string
                    email?: string
                    licenseNumber?: string
                    verificationDoc?: string | null
                    walletAddress?: string | null
                    status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
                    nftMinted?: boolean
                    nftTokenId?: string | null
                    nftMintedAt?: string | null
                    createdAt?: string
                    updatedAt?: string
                }
            }
            Patient: {
                Row: {
                    id: number
                    firstname: string
                    lastname: string
                    email: string | null
                    age: number | null
                    walletAddress: string | null
                    nftMinted: boolean
                    nftTokenId: string | null
                    nftMintedAt: string | null
                    createdAt: string
                    updatedAt: string
                    hospitalId: number | null
                }
                Insert: {
                    id?: number
                    firstname: string
                    lastname: string
                    email?: string | null
                    age?: number | null
                    walletAddress?: string | null
                    nftMinted?: boolean
                    nftTokenId?: string | null
                    nftMintedAt?: string | null
                    createdAt?: string
                    updatedAt?: string
                    hospitalId?: number | null
                }
                Update: {
                    id?: number
                    firstname?: string
                    lastname?: string
                    email?: string | null
                    age?: number | null
                    walletAddress?: string | null
                    nftMinted?: boolean
                    nftTokenId?: string | null
                    nftMintedAt?: string | null
                    createdAt?: string
                    updatedAt?: string
                    hospitalId?: number | null
                }
            }
            Campaign: {
                Row: {
                    id: number
                    title: string
                    conditionImage: string | null
                    amountNeeded: number
                    amountRaised: number
                    duration: number
                    story: string
                    hospitalName: string
                    escrowAddress: string | null
                    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FUNDING' | 'COMPLETED'
                    createdAt: string
                    updatedAt: string
                    patientId: number
                    hospitalId: number
                }
                Insert: {
                    id?: number
                    title: string
                    conditionImage?: string | null
                    amountNeeded: number
                    amountRaised: number
                    duration: number
                    story: string
                    hospitalName: string
                    escrowAddress?: string | null
                    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FUNDING' | 'COMPLETED'
                    createdAt?: string
                    updatedAt?: string
                    patientId: number
                    hospitalId: number
                }
                Update: {
                    id?: number
                    title?: string
                    conditionImage?: string | null
                    amountNeeded?: number
                    amountRaised?: number
                    duration?: number
                    story?: string
                    hospitalName?: string
                    escrowAddress?: string | null
                    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FUNDING' | 'COMPLETED'
                    createdAt?: string
                    updatedAt?: string
                    patientId?: number
                    hospitalId?: number
                }
            }
            Donation: {
                Row: {
                    id: number
                    donorAddress: string
                    amount: number
                    txHash: string | null
                    createdAt: string
                    campaignId: number
                }
                Insert: {
                    id?: number
                    donorAddress: string
                    amount: number
                    txHash?: string | null
                    createdAt?: string
                    campaignId: number
                }
                Update: {
                    id?: number
                    donorAddress?: string
                    amount?: number
                    txHash?: string | null
                    createdAt?: string
                    campaignId?: number
                }
            }
            Document: {
                Row: {
                    id: number
                    type: 'HOSPITAL_VERIFICATION' | 'PATIENT_ID' | 'MEDICAL_BILL' | 'MEDICAL_REPORT' | 'CAMPAIGN_PROOF'
                    url: string
                    createdAt: string
                    hospitalId: number | null
                    patientId: number | null
                    campaignId: number | null
                }
                Insert: {
                    id?: number
                    type: 'HOSPITAL_VERIFICATION' | 'PATIENT_ID' | 'MEDICAL_BILL' | 'MEDICAL_REPORT' | 'CAMPAIGN_PROOF'
                    url: string
                    createdAt?: string
                    hospitalId?: number | null
                    patientId?: number | null
                    campaignId?: number | null
                }
                Update: {
                    id?: number
                    type?: 'HOSPITAL_VERIFICATION' | 'PATIENT_ID' | 'MEDICAL_BILL' | 'MEDICAL_REPORT' | 'CAMPAIGN_PROOF'
                    url?: string
                    createdAt?: string
                    hospitalId?: number | null
                    patientId?: number | null
                    campaignId?: number | null
                }
            }
        }
        Views: {
            [_: string]: {
                Row: {
                    [key: string]: Json
                }
            }
        }
        Functions: {
            [_: string]: {
                Args: {
                    [key: string]: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_: string]: string
        }
    }
}
