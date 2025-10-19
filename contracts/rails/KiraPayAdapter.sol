// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IPaymentRail} from "../interfaces/IPaymentRail.sol";

/// @notice Offchain rail: simply anchors a KIRAPAY payment reference (bytes) onchain for auditability.
contract KiraPayAdapter is IPaymentRail {
    mapping(address => bool) public isEscrowAllowed;

    error NotAuthorizedEscrow();

    function allowEscrow(address escrow, bool allowed) external {
        isEscrowAllowed[escrow] = allowed;
    }

    function settle(address escrow, address to, uint256 amount, bytes32 ref, bytes calldata extra) external override {
        if (!isEscrowAllowed[msg.sender]) revert NotAuthorizedEscrow();
        // `extra` should carry KIRAPAY offchain reference (e.g., UTF-8 string, invoice id) packed as bytes
        emit RailSettled(escrow, escrow, to, amount, ref, extra);
    }
}
