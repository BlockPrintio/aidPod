use aiken/collection/dict
use aiken/interval.{Finite, Interval, IntervalBound}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{add, from_asset, from_lovelace, zero}
use cardano/transaction.{
  InlineDatum, Input, Mint, NoDatum, Output, OutputReference, Spend, Transaction,
}
use patients.{AssetClass, CampaignDatum, CampaignRedeemer, PatientAuthRedeemer}

// ==============================================================================================
// Mock Data
// ==============================================================================================

const admin_policy = #"aabbcc"

const admin_token_name = "ADMIN"

const hospital_auth_policy = #"ddeeff"

const campaign_token_policy = #"ff0011"

const campaign_token_name = "CAMPAIGN_001"

const hospital_name = "StJohns"

const hospital_token_name = "StJohnsHOSPITAL"

const transaction_id_1 =
  #"0000000000000000000000000000000000000000000000000000000000000001"

const transaction_id_2 =
  #"0000000000000000000000000000000000000000000000000000000000000002"

const transaction_id_3 =
  #"0000000000000000000000000000000000000000000000000000000000000003"

const hospital_credential =
  #"1111111111111111111111111111111111111111111111111111"

const patient_script_credential =
  #"2222222222222222222222222222222222222222222222222222"

const admin_credential = #"3333333333333333333333333333333333333333333333333333"

// ==============================================================================================
// Spend Validator Tests - ClaimByHospital
// ==============================================================================================

type ClaimTestOptions {
  campaign_active: Bool,
  has_hospital_token: Bool,
  hospital_token_matches: Bool,
  hospital_signs: Bool,
  includes_marker: Bool,
  marker_has_campaign_token: Bool,
  hospital_in_wallet: Bool,
}

fn default_claim_options() {
  ClaimTestOptions {
    campaign_active: True,
    has_hospital_token: True,
    hospital_token_matches: True,
    hospital_signs: True,
    includes_marker: True,
    marker_has_campaign_token: True,
    hospital_in_wallet: True,
  }
}

fn claim_by_hospital(options: ClaimTestOptions) -> Bool {
  let min_ada = from_lovelace(2_000_000)
  let admin_token = AssetClass { policy: admin_policy, name: admin_token_name }
  let redeemer = CampaignRedeemer.ClaimByHospital

  let campaign_script_address =
    Address {
      payment_credential: Script(patient_script_credential),
      stake_credential: None,
    }

  let hospital_address =
    if options.hospital_in_wallet {
      Address {
        payment_credential: VerificationKey(hospital_credential),
        stake_credential: None,
      }
    } else {
      Address {
        payment_credential: Script(hospital_credential),
        stake_credential: None,
      }
    }

  // Campaign marker UTxO
  let marker_datum =
    CampaignDatum {
      authorized_hospital: hospital_token_name,
      campaign_active: options.campaign_active,
    }

  let marker_input = {
    let output =
      Output {
        address: campaign_script_address,
        value: if options.marker_has_campaign_token {
          min_ada
            |> add(campaign_token_policy, campaign_token_name, 1)
        } else {
          min_ada
        },
        datum: InlineDatum(marker_datum),
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_1, output_index: 0 }
    Input { output_reference, output }
  }

  // Donation UTxO
  let donation_input = {
    let output =
      Output {
        address: campaign_script_address,
        value: from_lovelace(1_000_000_000),
        datum: NoDatum,
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_2, output_index: 0 }
    Input { output_reference, output }
  }

  // Hospital wallet input
  let hospital_input = {
    let output =
      Output {
        address: hospital_address,
        value: if options.has_hospital_token {
          if options.hospital_token_matches {
            min_ada
              |> add(hospital_auth_policy, hospital_token_name, 1)
          } else {
            min_ada
              |> add(hospital_auth_policy, "WrongToken", 1)
          }
        } else {
          min_ada
        },
        datum: NoDatum,
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_3, output_index: 0 }
    Input { output_reference, output }
  }

  // Hospital receives funds
  let hospital_output =
    Output {
      address: hospital_address,
      value: from_lovelace(1_000_000_000),
      datum: NoDatum,
      reference_script: None,
    }

  let tx =
    Transaction {
      inputs: if options.includes_marker {
        [marker_input, donation_input, hospital_input]
      } else {
        [donation_input, hospital_input]
      },
      reference_inputs: [],
      outputs: [hospital_output],
      fee: 5_000,
      mint: zero,
      certificates: [],
      withdrawals: [],
      validity_range: Interval {
        lower_bound: IntervalBound { bound_type: Finite(0), is_inclusive: True },
        upper_bound: IntervalBound {
          bound_type: Finite(100_000),
          is_inclusive: True,
        },
      },
      extra_signatories: if options.hospital_signs {
        [hospital_credential]
      } else {
        []
      },
      redeemers: [
        Pair(
          Spend(donation_input.output_reference),
          {
            let redeemer_data: Data = redeemer
            redeemer_data
          },
        ),
      ],
      datums: dict.empty,
      id: transaction_id_3,
      votes: [],
      proposal_procedures: [],
      current_treasury_amount: None,
      treasury_donation: None,
    }

  patients.patient_campaign.spend(
    admin_token,
    hospital_auth_policy,
    campaign_token_policy,
    None,
    redeemer,
    donation_input.output_reference,
    tx,
  )
}

test claim_ok() {
  claim_by_hospital(default_claim_options())
}

test claim_inactive_campaign() fail {
  claim_by_hospital(
    ClaimTestOptions { ..default_claim_options(), campaign_active: False },
  )
}

test claim_no_hospital_token() fail {
  claim_by_hospital(
    ClaimTestOptions { ..default_claim_options(), has_hospital_token: False },
  )
}

test claim_wrong_hospital_token() fail {
  claim_by_hospital(
    ClaimTestOptions {
      ..default_claim_options(),
      hospital_token_matches: False,
    },
  )
}

test claim_no_signature() fail {
  claim_by_hospital(
    ClaimTestOptions { ..default_claim_options(), hospital_signs: False },
  )
}

test claim_no_marker() fail {
  claim_by_hospital(
    ClaimTestOptions { ..default_claim_options(), includes_marker: False },
  )
}

test claim_marker_no_token() fail {
  claim_by_hospital(
    ClaimTestOptions {
      ..default_claim_options(),
      marker_has_campaign_token: False,
    },
  )
}

test claim_hospital_not_wallet() fail {
  claim_by_hospital(
    ClaimTestOptions { ..default_claim_options(), hospital_in_wallet: False },
  )
}

// ==============================================================================================
// Multiple UTxO Tests
// ==============================================================================================

fn claim_multiple_donations() -> Bool {
  let min_ada = from_lovelace(2_000_000)
  let admin_token = AssetClass { policy: admin_policy, name: admin_token_name }
  let redeemer = CampaignRedeemer.ClaimByHospital

  let campaign_script_address =
    Address {
      payment_credential: Script(patient_script_credential),
      stake_credential: None,
    }

  let hospital_address =
    Address {
      payment_credential: VerificationKey(hospital_credential),
      stake_credential: None,
    }

  let marker_datum =
    CampaignDatum {
      authorized_hospital: hospital_token_name,
      campaign_active: True,
    }

  let marker_input = {
    let output =
      Output {
        address: campaign_script_address,
        value: min_ada
          |> add(campaign_token_policy, campaign_token_name, 1),
        datum: InlineDatum(marker_datum),
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_1, output_index: 0 }
    Input { output_reference, output }
  }

  let donation_1 = {
    let output =
      Output {
        address: campaign_script_address,
        value: from_lovelace(1_000_000_000),
        datum: NoDatum,
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_2, output_index: 0 }
    Input { output_reference, output }
  }

  let donation_2 = {
    let output =
      Output {
        address: campaign_script_address,
        value: from_lovelace(500_000_000),
        datum: NoDatum,
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_2, output_index: 1 }
    Input { output_reference, output }
  }

  let hospital_input = {
    let output =
      Output {
        address: hospital_address,
        value: min_ada
          |> add(hospital_auth_policy, hospital_token_name, 1),
        datum: NoDatum,
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_3, output_index: 0 }
    Input { output_reference, output }
  }

  let hospital_output =
    Output {
      address: hospital_address,
      value: from_lovelace(1_500_000_000),
      datum: NoDatum,
      reference_script: None,
    }

  let tx =
    Transaction {
      inputs: [marker_input, donation_1, donation_2, hospital_input],
      reference_inputs: [],
      outputs: [hospital_output],
      fee: 5_000,
      mint: zero,
      certificates: [],
      withdrawals: [],
      validity_range: Interval {
        lower_bound: IntervalBound { bound_type: Finite(0), is_inclusive: True },
        upper_bound: IntervalBound {
          bound_type: Finite(100_000),
          is_inclusive: True,
        },
      },
      extra_signatories: [hospital_credential],
      redeemers: [
        Pair(
          Spend(donation_1.output_reference),
          {
            let redeemer_data: Data = redeemer
            redeemer_data
          },
        ),
        Pair(
          Spend(donation_2.output_reference),
          {
            let redeemer_data: Data = redeemer
            redeemer_data
          },
        ),
      ],
      datums: dict.empty,
      id: transaction_id_3,
      votes: [],
      proposal_procedures: [],
      current_treasury_amount: None,
      treasury_donation: None,
    }

  let result1 =
    patients.patient_campaign.spend(
      admin_token,
      hospital_auth_policy,
      campaign_token_policy,
      None,
      redeemer,
      donation_1.output_reference,
      tx,
    )

  let result2 =
    patients.patient_campaign.spend(
      admin_token,
      hospital_auth_policy,
      campaign_token_policy,
      None,
      redeemer,
      donation_2.output_reference,
      tx,
    )

  result1 && result2
}

test claim_multiple_ok() {
  claim_multiple_donations()
}

// ==============================================================================================
// Mint Validator Tests - Hospital Auth Tokens
// ==============================================================================================

type MintTestOptions {
  has_admin_token: Bool,
  admin_in_wallet: Bool,
  correct_token_name: Bool,
  mint_amount: Int,
}

fn default_mint_options() {
  MintTestOptions {
    has_admin_token: True,
    admin_in_wallet: True,
    correct_token_name: True,
    mint_amount: 1,
  }
}

fn mint_hospital_auth(options: MintTestOptions) -> Bool {
  let min_ada = from_lovelace(2_000_000)
  let admin_token = AssetClass { policy: admin_policy, name: admin_token_name }
  let redeemer = PatientAuthRedeemer.MintAuth { patient_name: hospital_name }

  let admin_address =
    if options.admin_in_wallet {
      Address {
        payment_credential: VerificationKey(admin_credential),
        stake_credential: None,
      }
    } else {
      Address {
        payment_credential: Script(admin_credential),
        stake_credential: None,
      }
    }

  let admin_input = {
    let output =
      Output {
        address: admin_address,
        value: if options.has_admin_token {
          min_ada
            |> add(admin_policy, admin_token_name, 1)
        } else {
          min_ada
        },
        datum: NoDatum,
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_1, output_index: 0 }
    Input { output_reference, output }
  }

  let token_name =
    if options.correct_token_name {
      hospital_token_name
    } else {
      "WrongTokenName"
    }

  let mint_value =
    from_asset(hospital_auth_policy, token_name, options.mint_amount)

  let output =
    Output {
      address: admin_address,
      value: min_ada
        |> add(hospital_auth_policy, token_name, options.mint_amount),
      datum: NoDatum,
      reference_script: None,
    }

  let tx =
    Transaction {
      inputs: [admin_input],
      reference_inputs: [],
      outputs: [output],
      fee: 5_000,
      mint: mint_value,
      certificates: [],
      withdrawals: [],
      validity_range: Interval {
        lower_bound: IntervalBound { bound_type: Finite(0), is_inclusive: True },
        upper_bound: IntervalBound {
          bound_type: Finite(100_000),
          is_inclusive: True,
        },
      },
      extra_signatories: [],
      redeemers: [
        Pair(
          Mint(hospital_auth_policy),
          {
            let redeemer_data: Data = redeemer
            redeemer_data
          },
        ),
      ],
      datums: dict.empty,
      id: transaction_id_2,
      votes: [],
      proposal_procedures: [],
      current_treasury_amount: None,
      treasury_donation: None,
    }

  patients.patient_campaign.mint(
    admin_token,
    hospital_auth_policy,
    campaign_token_policy,
    redeemer,
    hospital_auth_policy,
    tx,
  )
}

test mint_ok() {
  mint_hospital_auth(default_mint_options())
}

test mint_no_admin_token() fail {
  mint_hospital_auth(
    MintTestOptions { ..default_mint_options(), has_admin_token: False },
  )
}

test mint_admin_in_script() fail {
  mint_hospital_auth(
    MintTestOptions { ..default_mint_options(), admin_in_wallet: False },
  )
}

test mint_wrong_token_name() fail {
  mint_hospital_auth(
    MintTestOptions { ..default_mint_options(), correct_token_name: False },
  )
}

test mint_zero_amount() fail {
  mint_hospital_auth(
    MintTestOptions { ..default_mint_options(), mint_amount: 0 },
  )
}

test mint_multiple_tokens() fail {
  mint_hospital_auth(
    MintTestOptions { ..default_mint_options(), mint_amount: 2 },
  )
}

// ==============================================================================================
// Burn Tests
// ==============================================================================================

fn burn_hospital_auth() -> Bool {
  let min_ada = from_lovelace(2_000_000)
  let admin_token = AssetClass { policy: admin_policy, name: admin_token_name }
  let redeemer = PatientAuthRedeemer.BurnAuth

  let user_address =
    Address {
      payment_credential: VerificationKey(hospital_credential),
      stake_credential: None,
    }

  let user_input = {
    let output =
      Output {
        address: user_address,
        value: min_ada
          |> add(hospital_auth_policy, hospital_token_name, 1),
        datum: NoDatum,
        reference_script: None,
      }
    let output_reference =
      OutputReference { transaction_id: transaction_id_1, output_index: 0 }
    Input { output_reference, output }
  }

  let burn_value = from_asset(hospital_auth_policy, hospital_token_name, -1)

  let output =
    Output {
      address: user_address,
      value: min_ada,
      datum: NoDatum,
      reference_script: None,
    }

  let tx =
    Transaction {
      inputs: [user_input],
      reference_inputs: [],
      outputs: [output],
      fee: 5_000,
      mint: burn_value,
      certificates: [],
      withdrawals: [],
      validity_range: Interval {
        lower_bound: IntervalBound { bound_type: Finite(0), is_inclusive: True },
        upper_bound: IntervalBound {
          bound_type: Finite(100_000),
          is_inclusive: True,
        },
      },
      extra_signatories: [],
      redeemers: [
        Pair(
          Mint(hospital_auth_policy),
          {
            let redeemer_data: Data = redeemer
            redeemer_data
          },
        ),
      ],
      datums: dict.empty,
      id: transaction_id_2,
      votes: [],
      proposal_procedures: [],
      current_treasury_amount: None,
      treasury_donation: None,
    }

  patients.patient_campaign.mint(
    admin_token,
    hospital_auth_policy,
    campaign_token_policy,
    redeemer,
    hospital_auth_policy,
    tx,
  )
}

test burn_ok() {
  burn_hospital_auth()
}
