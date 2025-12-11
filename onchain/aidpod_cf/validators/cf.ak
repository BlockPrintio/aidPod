use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/interval.{Finite}
use cardano/address
use cardano/assets.{from_lovelace, lovelace_of}
use cardano/transaction.{Output, OutputReference, Transaction}
use mocktail.{
  complete, invalid_before, invalid_hereafter, mock_pub_key_address,
  mock_pub_key_hash, mock_utxo_ref, mocktail_tx, set_fee, tx_out,
}

/// Campaign Status
pub type CampaignStatus {
  Active
  Paused
  Completed
  Cancelled
}

/// Funding milestone with percentage thresholds
pub type FundingMilestone {
  percentage: Int,
  claimed: Bool,
  claim_date: Int,
  amount_claimed: Int,
}

/// Medical Campaign Datum - focused on percentage-based milestones
pub type MedicalCampaignDatum {
  campaign_id: Int,
  title: ByteArray,
  description: ByteArray,
  total_goal: Int,
  creator: VerificationKeyHash,
  beneficiary: VerificationKeyHash,
  medical_authority: VerificationKeyHash,
  current_funds: Int,
  total_claimed: Int,
  deadline: Int,
  status: CampaignStatus,
  milestones: List<FundingMilestone>,
  min_contribution: Int,
  verification_required: Bool,
  emergency_contact: VerificationKeyHash,
  created_at: Int,
  last_updated: Int,
}

/// Action types for the medical crowdfunding
pub type MedicalAction {
  CreateCampaign
  ContributeFunds { amount: Int, contributor: VerificationKeyHash }
  ClaimMilestoneFunds { milestone_percentage: Int }
  RefundContributor { contributor: VerificationKeyHash, amount: Int }
  PauseCampaign
  ResumeCampaign
  CancelCampaign
  CompleteCampaign
}

pub type MedicalRedeemer {
  campaign_id: Int,
  action: MedicalAction,
}

/// Individual contribution tracking
pub type ContributionDatum {
  campaign_id: Int,
  contributor: VerificationKeyHash,
  amount: Int,
  contribution_date: Int,
  refunded: Bool,
}

validator medical_crowdfunding {
  spend(
    datum: Option<MedicalCampaignDatum>,
    redeemer: MedicalRedeemer,
    _utxo_ref: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(datum) = datum
    // Basic validation
    expect datum.campaign_id == redeemer.campaign_id
    when redeemer.action is {
      CreateCampaign -> validate_campaign_creation(datum, transaction)
      ContributeFunds { amount, contributor } ->
        validate_contribution(datum, amount, contributor, transaction)
      ClaimMilestoneFunds { milestone_percentage } ->
        validate_milestone_claim(datum, milestone_percentage, transaction)
      RefundContributor { contributor, amount } ->
        validate_refund(datum, contributor, amount, transaction)
      PauseCampaign -> validate_pause_campaign(datum, transaction)
      ResumeCampaign -> validate_resume_campaign(datum, transaction)
      CancelCampaign -> validate_campaign_cancellation(datum, transaction)
      CompleteCampaign -> validate_campaign_completion(datum, transaction)
    }
  }

  else(_) {
    fail @"Invalid script purpose"
  }
}

/// Validate campaign creation with comprehensive checks
fn validate_campaign_creation(
  datum: MedicalCampaignDatum,
  transaction: Transaction,
) -> Bool {
  let current_time = get_current_time(transaction)
  // Basic validations
  datum.status == Active && datum.current_funds == 0 && datum.total_claimed == 0 && datum.deadline > current_time && datum.total_goal > 0 && datum.min_contribution > 0 && datum.created_at <= current_time && // Enhanced validations
  validate_campaign_parameters(datum) && validate_milestone_configuration(
    datum.milestones,
  ) && validate_deadline_bounds(datum.deadline, current_time) && validate_goal_limits(
    datum.total_goal,
    datum.min_contribution,
  ) && // Signature validations
  must_be_signed_by(datum.creator, transaction.extra_signatories) && (
    !datum.verification_required || must_be_signed_by(
      datum.medical_authority,
      transaction.extra_signatories,
    )
  ) && // Output validation
  validate_campaign_output_creation(transaction) && // Ensure unique parties
  validate_unique_parties(datum)
}

/// Validate campaign parameters are reasonable
fn validate_campaign_parameters(datum: MedicalCampaignDatum) -> Bool {
  // Title and description must not be empty
  !is_empty_bytearray(datum.title) && !is_empty_bytearray(datum.description) && // Campaign ID must be positive
  datum.campaign_id > 0
}

/// Validate that all key parties are different
fn validate_unique_parties(datum: MedicalCampaignDatum) -> Bool {
  datum.creator != datum.beneficiary && datum.creator != datum.medical_authority && datum.creator != datum.emergency_contact && datum.beneficiary != datum.medical_authority && (
    !datum.verification_required || datum.beneficiary != datum.emergency_contact && datum.medical_authority != datum.emergency_contact
  )
}

/// Validate campaign output creation
fn validate_campaign_output_creation(transaction: Transaction) -> Bool {
  // Check that there's at least one output with minimum Ada value
  list.any(
    transaction.outputs,
    fn(output) {
      let min_ada_lovelace = 2_000_000
      // 2 ADA minimum
      lovelace_of(output.value) >= min_ada_lovelace
    },
  )
}

/// Enhanced fund contribution validation
fn validate_contribution(
  datum: MedicalCampaignDatum,
  amount: Int,
  contributor: VerificationKeyHash,
  transaction: Transaction,
) -> Bool {
  let current_time = get_current_time(transaction)
  // Basic validations
  datum.status == Active && current_time < datum.deadline && amount >= datum.min_contribution && amount > 0 && must_be_signed_by(
    contributor,
    transaction.extra_signatories,
  ) && // Enhanced validations
  validate_contribution_limits(amount, datum) && validate_transaction_value_increase(
    transaction,
    amount,
  ) && validate_contribution_output_creation(transaction, contributor)
}

/// Validate contribution amount limits
fn validate_contribution_limits(
  amount: Int,
  datum: MedicalCampaignDatum,
) -> Bool {
  let max_single_contribution = datum.total_goal / 2
  // Max 50% of goal in one contribution
  amount <= max_single_contribution && datum.current_funds + amount <= datum.total_goal * 11 / 10
  // Allow 110% funding
}

/// Validate transaction value increases correctly
fn validate_transaction_value_increase(
  transaction: Transaction,
  expected_increase: Int,
) -> Bool {
  let total_inputs =
    list.foldr(
      transaction.inputs,
      0,
      fn(i, acc) { acc + lovelace_of(i.output.value) },
    )

  let total_outputs =
    list.foldr(
      transaction.outputs,
      0,
      fn(o, acc) { acc + lovelace_of(o.value) },
    )

  total_outputs >= total_inputs + expected_increase
}

/// Validate contribution tracking output is created
fn validate_contribution_output_creation(
  transaction: Transaction,
  contributor: VerificationKeyHash,
) -> Bool {
  list.any(
    transaction.outputs,
    fn(output) {
      let pays_to_contributor =
        when output.address.payment_credential is {
          address.VerificationKey(vkh) -> vkh == contributor
          _ -> False
        }
      let has_min_ada = lovelace_of(output.value) >= 2_000_000
      pays_to_contributor && has_min_ada
    },
  )
}

/// Enhanced milestone claim validation
fn validate_milestone_claim(
  datum: MedicalCampaignDatum,
  milestone_percentage: Int,
  transaction: Transaction,
) -> Bool {
  let current_time = get_current_time(transaction)
  expect Some(milestone) =
    find_milestone(datum.milestones, milestone_percentage)
  let milestone_threshold = datum.total_goal * milestone_percentage / 100
  let claimable_amount = calculate_claimable_amount(datum, milestone_percentage)
  // Core validations
  datum.status == Active && !milestone.claimed && datum.current_funds >= milestone_threshold && claimable_amount > 0 && // Authorization checks
  (
    must_be_signed_by(datum.creator, transaction.extra_signatories) || must_be_signed_by(
      datum.beneficiary,
      transaction.extra_signatories,
    )
  ) && (
    !datum.verification_required || must_be_signed_by(
      datum.medical_authority,
      transaction.extra_signatories,
    )
  ) && // Validate milestone order and timing
  validate_milestone_order(datum.milestones, milestone_percentage) && validate_milestone_claim_timing(
    datum,
    current_time,
  ) && // Validate payment to beneficiary
  validate_payment_to_beneficiary(
    transaction,
    datum.beneficiary,
    claimable_amount,
  ) && // Validate transaction value changes
  validate_transaction_value_decrease(transaction, claimable_amount)
}

/// Validate milestone claim timing
fn validate_milestone_claim_timing(
  datum: MedicalCampaignDatum,
  current_time: Int,
) -> Bool {
  let min_claim_interval = 7 * 24 * 60 * 60 * 1000
  // 7 days between claims
  let last_claim_time = get_last_milestone_claim_time(datum.milestones)
  current_time >= last_claim_time + min_claim_interval
}

/// Get the timestamp of the last milestone claim
fn get_last_milestone_claim_time(milestones: List<FundingMilestone>) -> Int {
  list.foldr(
    milestones,
    0,
    fn(milestone, acc) {
      if milestone.claimed && milestone.claim_date > acc {
        milestone.claim_date
      } else {
        acc
      }
    },
  )
}

/// Validate transaction value decreases correctly
fn validate_transaction_value_decrease(
  transaction: Transaction,
  expected_decrease: Int,
) -> Bool {
  let total_inputs =
    list.foldr(
      transaction.inputs,
      0,
      fn(i, acc) { acc + lovelace_of(i.output.value) },
    )

  let total_outputs =
    list.foldr(
      transaction.outputs,
      0,
      fn(o, acc) { acc + lovelace_of(o.value) },
    )

  total_outputs == total_inputs - expected_decrease
}

/// Enhanced refund validation
fn validate_refund(
  datum: MedicalCampaignDatum,
  contributor: VerificationKeyHash,
  amount: Int,
  transaction: Transaction,
) -> Bool {
  let current_time = get_current_time(transaction)
  let refundable_amount = datum.current_funds - datum.total_claimed
  // Refund eligibility check
  let is_refundable = validate_refund_eligibility(datum, current_time)
  is_refundable && amount > 0 && amount <= refundable_amount && must_be_signed_by(
    contributor,
    transaction.extra_signatories,
  ) && // Validate payment to contributor
  validate_payment_to_address(transaction, contributor, amount)
  //    && // Validate transaction value changes
  //   validate_transaction_value_decrease(transaction, amount)
}

/// Validate refund eligibility
fn validate_refund_eligibility(
  datum: MedicalCampaignDatum,
  current_time: Int,
) -> Bool {
  let grace_period = 30 * 24 * 60 * 60 * 1000
  // 30 days in milliseconds
  datum.status == Cancelled || current_time > datum.deadline + grace_period && datum.current_funds < datum.total_goal
}

/// Campaign status change validations
fn validate_pause_campaign(
  datum: MedicalCampaignDatum,
  transaction: Transaction,
) -> Bool {
  datum.status == Active && // Authorization: creator, medical authority, or emergency contact
  (
    must_be_signed_by(datum.creator, transaction.extra_signatories) || must_be_signed_by(
      datum.medical_authority,
      transaction.extra_signatories,
    ) || must_be_signed_by(
      datum.emergency_contact,
      transaction.extra_signatories,
    )
  ) && // Validate output exists (status change transaction)
  validate_status_change_output(transaction)
}

fn validate_resume_campaign(
  datum: MedicalCampaignDatum,
  transaction: Transaction,
) -> Bool {
  let current_time = get_current_time(transaction)
  datum.status == Paused && current_time < datum.deadline && must_be_signed_by(
    datum.creator,
    transaction.extra_signatories,
  ) && validate_status_change_output(transaction)
}

fn validate_campaign_cancellation(
  datum: MedicalCampaignDatum,
  transaction: Transaction,
) -> Bool {
  ( datum.status == Active || datum.status == Paused ) && // Requires creator + medical authority (if verification required)
  must_be_signed_by(datum.creator, transaction.extra_signatories) && (
    !datum.verification_required || must_be_signed_by(
      datum.medical_authority,
      transaction.extra_signatories,
    )
  ) && validate_status_change_output(transaction)
}

fn validate_campaign_completion(
  datum: MedicalCampaignDatum,
  transaction: Transaction,
) -> Bool {
  datum.status == Active && datum.current_funds >= datum.total_goal && all_milestones_claimed(
    datum.milestones,
  ) && must_be_signed_by(datum.creator, transaction.extra_signatories) && validate_status_change_output(
    transaction,
  )
}

/// Validate status change transaction has proper output
fn validate_status_change_output(transaction: Transaction) -> Bool {
  list.length(transaction.outputs) >= 1 && list.any(
    transaction.outputs,
    fn(output) { lovelace_of(output.value) >= 2_000_000 },
  )
  // Minimum ADA
}

/// Get current time from transaction validity range
fn get_current_time(transaction: Transaction) -> Int {
  when transaction.validity_range.lower_bound.bound_type is {
    Finite(time) -> time
    _ -> fail @"Invalid transaction validity range"
  }
}

/// Enhanced payment validation
fn validate_payment_to_beneficiary(
  transaction: Transaction,
  beneficiary: VerificationKeyHash,
  amount: Int,
) -> Bool {
  list.any(
    transaction.outputs,
    fn(output) {
      let pays_to_beneficiary =
        when output.address.payment_credential is {
          address.VerificationKey(vkh) -> vkh == beneficiary
          _ -> False
        }
      let has_sufficient_value = lovelace_of(output.value) >= amount
      pays_to_beneficiary && has_sufficient_value
    },
  )
}

fn validate_payment_to_address(
  transaction: Transaction,
  recipient: VerificationKeyHash,
  amount: Int,
) -> Bool {
  validate_payment_to_beneficiary(transaction, recipient, amount)
}

/// Enhanced validation utilities
fn validate_deadline_bounds(deadline: Int, current_time: Int) -> Bool {
  let min_duration = 7 * 24 * 60 * 60 * 1000
  // 1 week minimum
  let max_duration = 365 * 24 * 60 * 60 * 1000
  // 1 year maximum
  deadline > current_time + min_duration && deadline <= current_time + max_duration
}

fn validate_goal_limits(total_goal: Int, min_contribution: Int) -> Bool {
  let min_goal = 10_000_000
  // 10 ADA minimum
  let max_goal = 1_000_000_000_000
  // 1 million ADA maximum
  let min_contrib_limit = 1_000_000
  // 1 ADA minimum
  total_goal >= min_goal && total_goal <= max_goal && min_contribution >= min_contrib_limit && min_contribution <= total_goal / 10
  // Min contribution at most 10% of goal
}

fn is_empty_bytearray(ba: ByteArray) -> Bool {
  ba == #""
}

// MILESTONE LOGIC

fn validate_milestone_configuration(milestones: List<FundingMilestone>) -> Bool {
  let milestone_count = list.length(milestones)
  let sorted_percentages = list.map(milestones, fn(m) { m.percentage })
  let all_valid_percentages =
    list.all(sorted_percentages, fn(p) { p > 0 && p <= 100 })
  let properly_sorted = is_sorted_ascending(sorted_percentages)
  let all_unclaimed = list.all(milestones, fn(m) { !m.claimed })
  let has_100_percent = list.any(milestones, fn(m) { m.percentage == 100 })
  let unique_percentages = list.unique(sorted_percentages)
  let no_duplicates = list.length(unique_percentages) == milestone_count
  milestone_count > 0 && milestone_count <= 10 && all_valid_percentages && properly_sorted && all_unclaimed && has_100_percent && no_duplicates && validate_milestone_gaps(
    sorted_percentages,
  )
}

fn validate_milestone_gaps(percentages: List<Int>) -> Bool {
  when percentages is {
    [] -> True
    [_] -> True
    [first, second, ..rest] -> {
      let gap = second - first
      gap >= 5 && gap <= 50 && validate_milestone_gaps([second, ..rest])
    }
  }
}

fn is_sorted_ascending(numbers: List<Int>) -> Bool {
  when numbers is {
    [] -> True
    [_] -> True
    [first, second, ..rest] ->
      if first < second {
        is_sorted_ascending([second, ..rest])
      } else {
        False
      }
  }
}

fn find_milestone(
  milestones: List<FundingMilestone>,
  percentage: Int,
) -> Option<FundingMilestone> {
  list.find(milestones, fn(m) { m.percentage == percentage })
}

fn validate_milestone_order(
  milestones: List<FundingMilestone>,
  current_percentage: Int,
) -> Bool {
  let eligible_milestones =
    list.filter(milestones, fn(m) { m.percentage < current_percentage })
  list.all(eligible_milestones, fn(m) { m.claimed })
}

fn all_milestones_claimed(milestones: List<FundingMilestone>) -> Bool {
  list.all(milestones, fn(m) { m.claimed })
}

fn calculate_claimable_amount(
  datum: MedicalCampaignDatum,
  milestone_percentage: Int,
) -> Int {
  let milestone_threshold = datum.total_goal * milestone_percentage / 100
  let max_claimable = min(datum.current_funds, milestone_threshold)
  let previously_claimable =
    calculate_previous_claims_allowed(datum, milestone_percentage)
  max_claimable - previously_claimable
}

fn calculate_previous_claims_allowed(
  datum: MedicalCampaignDatum,
  current_milestone: Int,
) -> Int {
  list.foldr(
    datum.milestones,
    0,
    fn(milestone, acc) {
      if milestone.percentage < current_milestone && milestone.claimed {
        acc + milestone.amount_claimed
      } else {
        acc
      }
    },
  )
}

fn must_be_signed_by(
  signer: VerificationKeyHash,
  signatories: List<VerificationKeyHash>,
) -> Bool {
  list.has(signatories, signer)
}

fn min(a: Int, b: Int) -> Int {
  if a < b {
    a
  } else {
    b
  }
}

// Milestone creation functions
pub fn create_standard_milestones() -> List<FundingMilestone> {
  [
    FundingMilestone {
      percentage: 25,
      claimed: False,
      claim_date: 0,
      amount_claimed: 0,
    },
    FundingMilestone {
      percentage: 50,
      claimed: False,
      claim_date: 0,
      amount_claimed: 0,
    },
    FundingMilestone {
      percentage: 75,
      claimed: False,
      claim_date: 0,
      amount_claimed: 0,
    },
    FundingMilestone {
      percentage: 100,
      claimed: False,
      claim_date: 0,
      amount_claimed: 0,
    },
  ]
}

pub fn create_emergency_milestones() -> List<FundingMilestone> {
  [
    FundingMilestone {
      percentage: 50,
      claimed: False,
      claim_date: 0,
      amount_claimed: 0,
    },
    FundingMilestone {
      percentage: 100,
      claimed: False,
      claim_date: 0,
      amount_claimed: 0,
    },
  ]
}

/// Dummy transaction for testing campaign creation
fn create_campaign_success_tx() -> Transaction {
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000

  mocktail_tx()
    // Output to the campaign creator
    |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(50_000_000))
    // Output to the beneficiary
    |> tx_out(True, mock_pub_key_address(1, None), from_lovelace(50_000_000))
    // Set validity range for the transaction
    |> invalid_before(True, lower_bound)
    |> invalid_hereafter(True, upper_bound)
    |> complete()
    |> set_fee(True, 2_000_000)
}

/// Test: create campaign successfully
test create_campaign_success() {
  let tx = create_campaign_success_tx()
  // Create a transaction with the required signatories
  let tx_with_signatories =
    Transaction {
      ..tx,
      extra_signatories: [
        // creator signature
        mock_pub_key_hash(0),
        // medical authority signature (required when verification_required = True)
        mock_pub_key_hash(2),
      ],
    }

  let datum =
    Some(
      MedicalCampaignDatum {
        campaign_id: 1,
        title: "Test Campaign",
        description: "Testing campaign creation",
        total_goal: 100_000_000,
        creator: mock_pub_key_hash(0),
        beneficiary: mock_pub_key_hash(1),
        medical_authority: mock_pub_key_hash(2),
        current_funds: 0,
        total_claimed: 0,
        deadline: get_current_time(tx_with_signatories) + 30 * 24 * 60 * 60 * 1000,
        // 30 days from now
        status: Active,
        milestones: create_standard_milestones(),
        min_contribution: 1_000_000,
        verification_required: True,
        emergency_contact: mock_pub_key_hash(3),
        created_at: get_current_time(tx_with_signatories),
        last_updated: get_current_time(tx_with_signatories),
      },
    )

  let redeemer = MedicalRedeemer { campaign_id: 1, action: CreateCampaign }

  // Check that the validator accepts this transaction
  medical_crowdfunding.spend(
    datum,
    redeemer,
    mock_utxo_ref(0, 0),
    tx_with_signatories,
  )
}

// =============================================================================
// ADDITIONAL COMPREHENSIVE TESTS - ADD TO YOUR cf.ak FILE
// =============================================================================

// Helper function to create base campaign datum
fn create_test_campaign_datum(
  current_funds: Int,
  status: CampaignStatus,
) -> MedicalCampaignDatum {
  let current_time = 1_700_000_000_000
  MedicalCampaignDatum {
    campaign_id: 1,
    title: "Test Medical Campaign",
    description: "A test campaign for medical expenses",
    total_goal: 100_000_000,
    // 100 ADA
    creator: mock_pub_key_hash(0),
    beneficiary: mock_pub_key_hash(1),
    medical_authority: mock_pub_key_hash(2),
    current_funds,
    total_claimed: 0,
    deadline: current_time + 30 * 24 * 60 * 60 * 1000,
    // 30 days from now
    status,
    milestones: create_standard_milestones(),
    min_contribution: 1_000_000,
    // 1 ADA
    verification_required: True,
    emergency_contact: mock_pub_key_hash(3),
    created_at: current_time,
    last_updated: current_time,
  }
}

// Helper function to create transaction with signatories and outputs

fn create_tx_with_signatories_and_outputs(
  signatories: List<VerificationKeyHash>,
  outputs_ada: List<Int>,
) -> Transaction {
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000

  let mut_tx =
    mocktail_tx()
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)

  let tx_with_outputs =
    list.foldr(
      outputs_ada,
      mut_tx,
      fn(ada_amount, tx_acc) {
        tx_acc
          |> tx_out(
              True,
              mock_pub_key_address(0, None),
              from_lovelace(ada_amount),
            )
      },
    )

  let completed_tx = tx_with_outputs |> complete()
  let tx_with_fee = completed_tx |> set_fee(True, 2_000_000)

  Transaction { ..tx_with_fee, extra_signatories: signatories }
}

// =============================================================================
// CAMPAIGN CREATION TESTS
// =============================================================================

/// Test: create campaign fails without creator signature
test create_campaign_fail_no_creator_signature() fail {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(2)],
      // only medical authority, missing creator
      [50_000_000],
    )

  let datum = Some(create_test_campaign_datum(0, Active))
  let redeemer = MedicalRedeemer { campaign_id: 1, action: CreateCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: create campaign fails with non-zero current funds
test create_campaign_fail_non_zero_funds() fail {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      [50_000_000],
    )

  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  // Non-zero funds
  let redeemer = MedicalRedeemer { campaign_id: 1, action: CreateCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: create campaign fails with same creator and beneficiary
test create_campaign_fail_same_creator_beneficiary() fail {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      [50_000_000],
    )

  let mut_datum = create_test_campaign_datum(0, Active)
  let invalid_datum =
    MedicalCampaignDatum { ..mut_datum, beneficiary: mock_pub_key_hash(0) }

  // Same as creator
  let redeemer = MedicalRedeemer { campaign_id: 1, action: CreateCampaign }

  medical_crowdfunding.spend(
    Some(invalid_datum),
    redeemer,
    mock_utxo_ref(0, 0),
    tx,
  )
}

/// Test: create campaign with no verification required
test create_campaign_success_no_verification() {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0)],
      // Only creator signature needed
      [50_000_000],
    )

  let mut_datum = create_test_campaign_datum(0, Active)
  let datum_no_verification =
    MedicalCampaignDatum { ..mut_datum, verification_required: False }

  let redeemer = MedicalRedeemer { campaign_id: 1, action: CreateCampaign }

  medical_crowdfunding.spend(
    Some(datum_no_verification),
    redeemer,
    mock_utxo_ref(0, 0),
    tx,
  )
}

/// Test: create campaign fails with invalid milestone configuration
test create_campaign_fail_invalid_milestones() fail {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      [50_000_000],
    )

  let invalid_milestones =
    [
      FundingMilestone {
        percentage: 50,
        claimed: False,
        claim_date: 0,
        amount_claimed: 0,
      },
      FundingMilestone {
        percentage: 25,
        claimed: False,
        claim_date: 0,
        amount_claimed: 0,
      },
    ]

  // Wrong order
  let mut_datum = create_test_campaign_datum(0, Active)
  let invalid_datum =
    MedicalCampaignDatum { ..mut_datum, milestones: invalid_milestones }

  let redeemer = MedicalRedeemer { campaign_id: 1, action: CreateCampaign }

  medical_crowdfunding.spend(
    Some(invalid_datum),
    redeemer,
    mock_utxo_ref(0, 0),
    tx,
  )
}

// =============================================================================
// CONTRIBUTION TESTS
// =============================================================================

// REPLACE your existing contribution tests with these corrected versions:

/// Test: contribute funds successfully
/// Test: contribute funds successfully
test contribute_funds_success() {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 5_000_000
  // 5 ADA
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000
  let tx =
    mocktail_tx()
      |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(100_000_000))
      // Campaign output
      |> tx_out(True, mock_pub_key_address(4, None), from_lovelace(10_000_000))
      // Contributor output
      |> tx_out(True, mock_pub_key_address(1, None), from_lovelace(50_000_000))
      // Extra output
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)
      |> complete()
      |> set_fee(True, 2_000_000)

  let tx_with_signatories =
    Transaction { ..tx, extra_signatories: [contributor] }

  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(
    datum,
    redeemer,
    mock_utxo_ref(0, 0),
    tx_with_signatories,
  )
}

/// Test: contribute funds fails below minimum contribution
test contribute_funds_fail_below_minimum() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 500_000
  // 0.5 ADA, below 1 ADA minimum
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000
  let tx =
    mocktail_tx()
      |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(50_000_000))
      |> tx_out(True, mock_pub_key_address(4, None), from_lovelace(5_000_000))
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)
      |> complete()
      |> set_fee(True, 2_000_000)

  let tx_with_signatories =
    Transaction { ..tx, extra_signatories: [contributor] }

  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(
    datum,
    redeemer,
    mock_utxo_ref(0, 0),
    tx_with_signatories,
  )
}

/// Test: contribute funds fails when campaign is paused
test contribute_funds_fail_paused_campaign() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 5_000_000
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000
  let tx =
    mocktail_tx()
      |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(50_000_000))
      |> tx_out(True, mock_pub_key_address(4, None), from_lovelace(10_000_000))
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)
      |> complete()
      |> set_fee(True, 2_000_000)

  let tx_with_signatories =
    Transaction { ..tx, extra_signatories: [contributor] }

  let datum = Some(create_test_campaign_datum(10_000_000, Paused))
  // Campaign is paused
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(
    datum,
    redeemer,
    mock_utxo_ref(0, 0),
    tx_with_signatories,
  )
}

/// Test: contribute funds fails without contributor signature
test contribute_funds_fail_no_signature() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 5_000_000
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000
  let tx =
    mocktail_tx()
      |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(50_000_000))
      |> tx_out(True, mock_pub_key_address(4, None), from_lovelace(10_000_000))
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)
      |> complete()
      |> set_fee(True, 2_000_000)

  let tx_with_signatories =
    Transaction { ..tx, extra_signatories: [mock_pub_key_hash(5)] }

  // Wrong signature
  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(
    datum,
    redeemer,
    mock_utxo_ref(0, 0),
    tx_with_signatories,
  )
}

/// Test: contribution fails when exceeding maximum single contribution
test contribute_funds_fail_exceeds_max_single() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 60_000_000
  // 60 ADA, more than 50% of 100 ADA goal
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000
  let tx =
    mocktail_tx()
      |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(100_000_000))
      |> tx_out(True, mock_pub_key_address(4, None), from_lovelace(10_000_000))
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)
      |> complete()
      |> set_fee(True, 2_000_000)

  let tx_with_signatories =
    Transaction { ..tx, extra_signatories: [contributor] }

  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(
    datum,
    redeemer,
    mock_utxo_ref(0, 0),
    tx_with_signatories,
  )
}

/// Test: contribute funds when campaign is cancelled (should fail)
test contribute_funds_fail_cancelled_campaign() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 5_000_000
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000
  let tx =
    mocktail_tx()
      |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(50_000_000))
      |> tx_out(True, mock_pub_key_address(4, None), from_lovelace(10_000_000))
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)
      |> complete()
      |> set_fee(True, 2_000_000)

  let tx_with_signatories =
    Transaction { ..tx, extra_signatories: [contributor] }

  let datum = Some(create_test_campaign_datum(10_000_000, Cancelled))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(
    datum,
    redeemer,
    mock_utxo_ref(0, 0),
    tx_with_signatories,
  )
}

// =============================================================================
// REFUND TESTS
// =============================================================================

// DEBUGGING APPROACH: Let's create a minimal refund test to isolate the issue

// ALTERNATIVE: If you want to keep the full validation, try this approach
test refund_contributor_success_cancelled() {
  let contributor = mock_pub_key_hash(4)
  let refund_amount = 5_000_000
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000
  let tx =
    mocktail_tx()
      |> tx_out(
          True,
          mock_pub_key_address(4, None),
          from_lovelace(refund_amount),
        )
      |> tx_out(True, mock_pub_key_address(0, None), from_lovelace(15_000_000))
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)
      |> complete()
      |> set_fee(True, 2_000_000)

  let tx_with_signatories =
    Transaction { ..tx, extra_signatories: [contributor] }

  let datum = Some(create_test_campaign_datum(20_000_000, Cancelled))

  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: RefundContributor { contributor, amount: refund_amount },
    }

  medical_crowdfunding.spend(
    datum,
    redeemer,
    mock_utxo_ref(0, 0),
    tx_with_signatories,
  )
}

/// Test: refund fails when campaign is still active
test refund_contributor_fail_active_campaign() fail {
  let contributor = mock_pub_key_hash(4)
  let refund_amount = 5_000_000
  let tx =
    create_tx_with_signatories_and_outputs([contributor], [refund_amount])

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  // Still active
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: RefundContributor { contributor, amount: refund_amount },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: refund fails without contributor signature
test refund_contributor_fail_no_signature() fail {
  let contributor = mock_pub_key_hash(4)
  let refund_amount = 5_000_000
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(5)],
      // Wrong signature
      [refund_amount],
    )

  let datum = Some(create_test_campaign_datum(20_000_000, Cancelled))

  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: RefundContributor { contributor, amount: refund_amount },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

// =============================================================================
// CAMPAIGN STATUS CHANGE TESTS
// =============================================================================

/// Test: pause campaign successfully by creator
test pause_campaign_success_creator() {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0)],
      // creator signature
      [10_000_000],
    )

  // Status change output
  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  let redeemer = MedicalRedeemer { campaign_id: 1, action: PauseCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: pause campaign successfully by medical authority
test pause_campaign_success_medical_authority() {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(2)],
      // medical authority signature
      [10_000_000],
    )

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  let redeemer = MedicalRedeemer { campaign_id: 1, action: PauseCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: pause campaign successfully by emergency contact
test pause_campaign_success_emergency_contact() {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(3)],
      // emergency contact signature
      [10_000_000],
    )

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  let redeemer = MedicalRedeemer { campaign_id: 1, action: PauseCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: pause campaign fails with unauthorized signature
test pause_campaign_fail_unauthorized() fail {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(5)],
      // unauthorized signature
      [10_000_000],
    )

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  let redeemer = MedicalRedeemer { campaign_id: 1, action: PauseCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: resume campaign successfully
test resume_campaign_success() {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0)],
      // creator signature
      [10_000_000],
    )

  let datum = Some(create_test_campaign_datum(20_000_000, Paused))

  let redeemer = MedicalRedeemer { campaign_id: 1, action: ResumeCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: resume campaign fails when not paused
test resume_campaign_fail_not_paused() fail {
  let tx =
    create_tx_with_signatories_and_outputs([mock_pub_key_hash(0)], [10_000_000])

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  // Not paused
  let redeemer = MedicalRedeemer { campaign_id: 1, action: ResumeCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: cancel campaign successfully
test cancel_campaign_success() {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      // creator + medical authority
      [10_000_000],
    )

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  let redeemer = MedicalRedeemer { campaign_id: 1, action: CancelCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: cancel campaign fails without medical authority
test cancel_campaign_fail_no_medical_authority() fail {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0)],
      // Only creator, missing medical authority
      [10_000_000],
    )

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  let redeemer = MedicalRedeemer { campaign_id: 1, action: CancelCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: complete campaign successfully
test complete_campaign_success() {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0)],
      // creator signature
      [10_000_000],
    )

  // Create campaign with goal reached and all milestones claimed
  let claimed_milestones =
    [
      FundingMilestone {
        percentage: 25,
        claimed: True,
        claim_date: 1700000000000,
        amount_claimed: 25_000_000,
      },
      FundingMilestone {
        percentage: 50,
        claimed: True,
        claim_date: 1700000000000,
        amount_claimed: 25_000_000,
      },
      FundingMilestone {
        percentage: 75,
        claimed: True,
        claim_date: 1700000000000,
        amount_claimed: 25_000_000,
      },
      FundingMilestone {
        percentage: 100,
        claimed: True,
        claim_date: 1700000000000,
        amount_claimed: 25_000_000,
      },
    ]
  let mut_datum = create_test_campaign_datum(100_000_000, Active)
  // Goal reached
  let final_datum =
    MedicalCampaignDatum { ..mut_datum, milestones: claimed_milestones }

  let redeemer = MedicalRedeemer { campaign_id: 1, action: CompleteCampaign }

  medical_crowdfunding.spend(
    Some(final_datum),
    redeemer,
    mock_utxo_ref(0, 0),
    tx,
  )
}

/// Test: complete campaign fails when goal not reached
test complete_campaign_fail_goal_not_reached() fail {
  let tx =
    create_tx_with_signatories_and_outputs([mock_pub_key_hash(0)], [10_000_000])

  let datum = Some(create_test_campaign_datum(50_000_000, Active))

  // Only 50% funded
  let redeemer = MedicalRedeemer { campaign_id: 1, action: CompleteCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

// =============================================================================
// EDGE CASE AND VALIDATION TESTS
// =============================================================================

// test contribute_funds_fail_cancelled_campaign() fail {
//   let contributor = mock_pub_key_hash(4)
//   let contribution_amount = 5_000_000
//   let tx =
//     create_tx_with_signatories_and_outputs([contributor], [contribution_amount])

//   let datum = Some(create_test_campaign_datum(10_000_000, Cancelled))
//   let redeemer =
//     MedicalRedeemer {
//       campaign_id: 1,
//       action: ContributeFunds { amount: contribution_amount, contributor },
//     }

//   medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
// }

/// Test: contribute funds when campaign is cancelled (should fail)
/// Test: claim milestone when campaign is paused (should fail)
test claim_milestone_fail_paused_campaign() fail {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      [25_000_000],
    )

  let datum = Some(create_test_campaign_datum(30_000_000, Paused))

  // Campaign paused
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ClaimMilestoneFunds { milestone_percentage: 25 },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: wrong campaign ID in redeemer (should fail)
test wrong_campaign_id_fail() fail {
  let tx =
    create_tx_with_signatories_and_outputs(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      [50_000_000],
    )

  let datum = Some(create_test_campaign_datum(0, Active))
  let wrong_redeemer =
    MedicalRedeemer { campaign_id: 2, action: CreateCampaign }

  // Wrong ID
  medical_crowdfunding.spend(datum, wrong_redeemer, mock_utxo_ref(0, 0), tx)
}
