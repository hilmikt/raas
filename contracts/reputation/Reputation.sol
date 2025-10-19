// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Append-only, verifiable reputation registry keyed by actor.
///         Escrow posts a proof when a milestone is settled (onchain PYUSD or offchain KIRAPAY anchored).

contract Reputation is AccessControl {
    bytes32 public constant ESCROW_ROLE = keccak256("ESCROW_ROLE");

    struct Proof {
        address client;
        address worker;
        uint256 amount;      // token units
        bytes32 ref;         // opaque milestone reference
        bool    onchain;     // true if ERC20 moved onchain, false if offchain rail anchored
        uint64  ts;          // block timestamp at record
    }

    mapping(address => uint256) public score;          // simple additive score
    mapping(bytes32  => bool)    public seenRef;       // prevent duplicate refs
    Proof[] public proofs;

    event ReputationMinted(uint256 indexed proofId, address indexed client, address indexed worker, uint256 amount, bytes32 ref, bool onchain);

    constructor(address escrow) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        if (escrow != address(0)) _grantRole(ESCROW_ROLE, escrow);
    }

    function addEscrow(address escrow) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ESCROW_ROLE, escrow);
    }

    /// @notice Called by Escrow after settlement.
    function recordSettlement(address client, address worker, uint256 amount, bytes32 ref, bool onchain) external onlyRole(ESCROW_ROLE) {
        require(!seenRef[ref], "dup ref");
        seenRef[ref] = true;

        // naive scoring: +1 per milestone, +amount/1e18 bonus if onchain
        score[worker] += 1 + (onchain ? amount / 1e18 : 0);
        score[client] += 1;

        proofs.push(Proof({
            client: client,
            worker: worker,
            amount: amount,
            ref: ref,
            onchain: onchain,
            ts: uint64(block.timestamp)
        }));

        emit ReputationMinted(proofs.length - 1, client, worker, amount, ref, onchain);
    }

    function proofsCount() external view returns (uint256) { return proofs.length; }
}
