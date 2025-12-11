// tests/medical_crowdfunding_tests.ak
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, invalid_before, invalid_hereafter, mock_pub_key_address,
  mock_pub_key_hash, mock_utxo_ref, mocktail_tx, set_fee, tx_out,
}
// Import from your main validator module
use validators/cf.{
  Active, CampaignStatus, CancelCampaign, Cancelled, ClaimMilestoneFunds,
  CompleteCampaign, Completed, ContributeFunds, CreateCampaign, FundingMilestone,
  MedicalAction, MedicalCampaignDatum, MedicalRedeemer, PauseCampaign, Paused,
  RefundContributor, ResumeCampaign, create_standard_milestones,
  medical_crowdfunding,
}

// =============================================================================
// TEST HELPER FUNCTIONS
// =============================================================================

/// Helper function to create base campaign datum
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

/// Helper function to create transaction with signatories
fn create_tx_with_signatories(
  signatories: List<VerificationKeyHash>,
  outputs_ada: List<Int>,
) -> Transaction {
  let lower_bound = 1_700_000_000_000
  let upper_bound = lower_bound + 10_000
  let mut_tx =
    mocktail_tx()
      |> invalid_before(True, lower_bound)
      |> invalid_hereafter(True, upper_bound)
      |> set_fee(True, 2_000_000)

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

  let final_tx = tx_with_outputs |> complete()

  Transaction { ..final_tx, extra_signatories: signatories }
}

// =============================================================================
// CAMPAIGN CREATION TESTS
// =============================================================================

/// Test: create campaign successfully
test create_campaign_success() {
  let tx =
    create_tx_with_signatories(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      // creator + medical authority
      [50_000_000, 50_000_000],
    )

  // Two outputs with sufficient ADA
  let datum = Some(create_test_campaign_datum(0, Active))
  let redeemer = MedicalRedeemer { campaign_id: 1, action: CreateCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: create campaign fails without creator signature
test create_campaign_fail_no_creator_signature() fail {
  let tx =
    create_tx_with_signatories(
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
    create_tx_with_signatories(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      [50_000_000],
    )

  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  // Non-zero funds
  let redeemer = MedicalRedeemer { campaign_id: 1, action: CreateCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: campaign creation fails with same creator and beneficiary
test create_campaign_fail_same_creator_beneficiary() fail {
  let tx =
    create_tx_with_signatories(
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

/// Test: campaign creation fails with invalid milestone configuration
test create_campaign_fail_invalid_milestones() fail {
  let tx =
    create_tx_with_signatories(
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

/// Test: campaign creation with no verification required (medical authority signature not needed)
test create_campaign_success_no_verification() {
  let tx =
    create_tx_with_signatories(
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

// =============================================================================
// CONTRIBUTION TESTS
// =============================================================================

/// Test: contribute funds successfully
test contribute_funds_success() {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 5_000_000
  // 5 ADA
  let tx =
    create_tx_with_signatories([contributor], [50_000_000, contribution_amount])

  // Output to campaign + contributor tracking
  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: contribute funds fails below minimum contribution
test contribute_funds_fail_below_minimum() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 500_000
  // 0.5 ADA, below 1 ADA minimum
  let tx = create_tx_with_signatories([contributor], [contribution_amount])

  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: contribute funds fails when campaign is paused
test contribute_funds_fail_paused_campaign() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 5_000_000
  let tx = create_tx_with_signatories([contributor], [contribution_amount])

  let datum = Some(create_test_campaign_datum(10_000_000, Paused))
  // Campaign is paused
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: contribute funds fails without contributor signature
test contribute_funds_fail_no_signature() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 5_000_000
  let tx =
    create_tx_with_signatories(
      [mock_pub_key_hash(5)],
      // Wrong signature
      [contribution_amount],
    )

  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: contribution fails when exceeding maximum single contribution
test contribute_funds_fail_exceeds_max_single() fail {
  let contributor = mock_pub_key_hash(4)
  let contribution_amount = 60_000_000
  // 60 ADA, more than 50% of 100 ADA goal
  let tx = create_tx_with_signatories([contributor], [contribution_amount])

  let datum = Some(create_test_campaign_datum(10_000_000, Active))
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ContributeFunds { amount: contribution_amount, contributor },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

// =============================================================================
// MILESTONE CLAIM TESTS
// =============================================================================

/// Test: claim first milestone successfully
test claim_milestone_25_percent_success() {
  let tx =
    create_tx_with_signatories(
      [mock_pub_key_hash(0)],
      // creator signature
      [20_000_000],
    )

  // Payment to beneficiary (25% of 100 ADA = 25 ADA)
  // Campaign with 30 ADA raised (enough for 25% milestone)
  let datum = Some(create_test_campaign_datum(30_000_000, Active))

  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ClaimMilestoneFunds { milestone_percentage: 25 },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: claim milestone fails when threshold not met
test claim_milestone_fail_threshold_not_met() fail {
  let tx = create_tx_with_signatories([mock_pub_key_hash(0)], [10_000_000])

  // Campaign with only 20 ADA raised (not enough for 25% milestone which requires 25 ADA)
  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ClaimMilestoneFunds { milestone_percentage: 25 },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: claim milestone fails without authorization
test claim_milestone_fail_no_authorization() fail {
  let tx =
    create_tx_with_signatories(
      [mock_pub_key_hash(5)],
      // Random signature, not creator or beneficiary
      [25_000_000],
    )

  let datum = Some(create_test_campaign_datum(30_000_000, Active))

  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ClaimMilestoneFunds { milestone_percentage: 25 },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: claim milestone fails when verification required but medical authority doesn't sign
test claim_milestone_fail_no_medical_authority() fail {
  let tx =
    create_tx_with_signatories(
      [mock_pub_key_hash(0)],
      // Only creator, missing medical authority
      [25_000_000],
    )

  let datum = Some(create_test_campaign_datum(30_000_000, Active))

  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: ClaimMilestoneFunds { milestone_percentage: 25 },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

// =============================================================================
// REFUND TESTS
// =============================================================================

/// Test: refund contributor successfully after cancellation
test refund_contributor_success_cancelled() {
  let contributor = mock_pub_key_hash(4)
  let refund_amount = 5_000_000
  let tx = create_tx_with_signatories([contributor], [refund_amount])

  // Payment back to contributor
  let datum = Some(create_test_campaign_datum(20_000_000, Cancelled))

  // Campaign cancelled
  let redeemer =
    MedicalRedeemer {
      campaign_id: 1,
      action: RefundContributor { contributor, amount: refund_amount },
    }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: refund fails when campaign is still active
test refund_contributor_fail_active_campaign() fail {
  let contributor = mock_pub_key_hash(4)
  let refund_amount = 5_000_000
  let tx = create_tx_with_signatories([contributor], [refund_amount])

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
    create_tx_with_signatories(
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

/// Test: pause campaign successfully
test pause_campaign_success() {
  let tx =
    create_tx_with_signatories(
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
    create_tx_with_signatories(
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
    create_tx_with_signatories(
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
    create_tx_with_signatories(
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
    create_tx_with_signatories(
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
  let tx = create_tx_with_signatories([mock_pub_key_hash(0)], [10_000_000])

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  // Not paused
  let redeemer = MedicalRedeemer { campaign_id: 1, action: ResumeCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: cancel campaign successfully
test cancel_campaign_success() {
  let tx =
    create_tx_with_signatories(
      [mock_pub_key_hash(0), mock_pub_key_hash(2)],
      // creator + medical authority
      [10_000_000],
    )

  let datum = Some(create_test_campaign_datum(20_000_000, Active))

  let redeemer = MedicalRedeemer { campaign_id: 1, action: CancelCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}

/// Test: cancel campaign fails without medical authority when verification required
test cancel_campaign_fail_no_medical_authority() fail {
  let tx =
    create_tx_with_signatories(
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
    create_tx_with_signatories(
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
  let tx = create_tx_with_signatories([mock_pub_key_hash(0)], [10_000_000])

  let datum = Some(create_test_campaign_datum(50_000_000, Active))

  // Only 50% funded
  let redeemer = MedicalRedeemer { campaign_id: 1, action: CompleteCampaign }

  medical_crowdfunding.spend(datum, redeemer, mock_utxo_ref(0, 0), tx)
}
